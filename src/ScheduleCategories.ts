import { ScheduleCategory } from "./ScheduleCategory";
import { Schedule } from "./Schedule";
import { fcApi, globalData, i18n } from "./utils/utils";
import EventAggregator from "./utils/EventAggregator";
import { reactive } from "vue";
import moment from "moment";
import { CalDavClient } from "./ThirdPartyCalendars/CalDav";
import ICAL from "ical.js";
import { showMessage } from "siyuan";

export class ScheduleCategories {
    categories: ScheduleCategory[];
    private documents: any[];
    private isInit = false;

    constructor() {
        this.categories = reactive([]);
        EventAggregator.on('readCategories', () => {
            this.readScheduleCategories();
        });
        // 本地日程变更时，同步到远端（仅对订阅分类生效）
        EventAggregator.on('addSchedule', (p: any) => {
            this.syncAddScheduleToRemote(p);
        });
        EventAggregator.on('deleteSchedule', (p: any) => {
            this.syncDeleteScheduleToRemote(p);
        });
        EventAggregator.on('updateSchedule', (p: any) => {
            this.syncUpdateScheduleToRemote(p.new);
        });
    }

    init(documents: any[]): void {
        this.documents = documents;
        this.isInit = true;
    }

    readScheduleCategories(): void {
        if(this.isInit === true) {
            this.readScheduleCategoriesFromDocuments();
        } else {
            this.refreshScheduleCategories();
        }

        this.refreshSubscribedCategories();

        this.isInit = false;
    }

    readScheduleCategoriesFromDocuments() : void {
        this.categories.splice(0, this.categories.length);
        this.clearEventSources();
        for(let elementC of this.documents) {
            let category = new ScheduleCategory(elementC.name, elementC.color, elementC.checked);
            this.addCategory(category);
            for(let elementS of elementC.schedules) {
                if(elementS.content === "") {
                  continue;
                }
                let content = JSON.parse(elementS.content);

                // 判断是否显示已归档日程
                if(globalData.schedConfig.showArchivedSchedule == false && content.status == 4) {
                    continue;
                }

                let schedule = null;

                let isAllDay = (content.isAllDay === undefined || content.isAllDay === null) ? false : content.isAllDay;

                if(content.isRecurringSchedule !== null && content.isRecurringSchedule === true) {
                    schedule = new Schedule(content.id, content.title, isAllDay,
                                            true, content.calendarType, content.frequency, content.weekdays, content.monthdays, content.yeardays,
                                            content.interval, content.start, content.end,
                                            content.category, content.refBlockId, content.content, content.status);
                    schedule.setDoneTime(content.doneTime);
                } else {
                    schedule = new Schedule(content.id, content.title, isAllDay,
                                            false, '', '', [], [], [], 1,                   
                                            content.start, content.end,
                                            content.category, content.refBlockId, content.content, content.status);
                    schedule.setDoneTime(content.doneTime);
                }
                
                this.addSchedule(schedule);
            }
        }
    }

    refreshScheduleCategories() : void {
        this.clearEventSources();
        for(let category of this.categories) {
            if(category.checked === false) continue;
            this.addEventSource(category);
            for(let schedule of category.schedules) {
                fcApi.addEvent(this.createEvent(schedule), fcApi.getEventSourceById(schedule.category));
            }
        }
    }

    async refreshSubscribedCategories() {
        for(let subsCalendar of globalData.schedConfig.subsCalendars) {
            // 手动同步模式的订阅不在启动时自动拉取
            if (subsCalendar.autoSync === false) continue;
            let pastDays = subsCalendar.syncPastDays || 90;
            let futureDays = subsCalendar.syncFutureDays || 30;
            let calDavClient = new CalDavClient(subsCalendar.realUrl, subsCalendar.username, subsCalendar.password);
            await calDavClient.login();
            const calendars = await calDavClient.fetchCalendars();
            let remoteCategoryNames: string[] = [];
            for (let calendar of calendars) {
                if (!this.supportsVEvent(calendar)) continue;
                let displayName = (calendar.displayName as string) || (calendar.url as string) || i18n.unnamedCalendar;
                let categoryName = displayName + "-" + subsCalendar.name;
                remoteCategoryNames.push(categoryName);
                // 未勾选的分类不从远端同步
                let existingCat = this.categories.find(c => c.name === categoryName);
                if (existingCat && !existingCat.checked) continue;
                let eventSource = this.addSubscribeEventSource(calendar, subsCalendar.name);
                await this.diffSyncCategory(calDavClient, calendar, eventSource, pastDays, futureDays);
            }
            this.removeStaleSubscribedCategories(subsCalendar.name, remoteCategoryNames);
        }
    }

    /**
     * 手动同步单个订阅日历
     */
    async syncSingleSubscribedCalendar(index: number) {
        let subsCalendar = globalData.schedConfig.subsCalendars[index];
        if (!subsCalendar) {
            EventAggregator.emit('caldavSyncDone');
            return;
        }

        try {
            let calDavClient = new CalDavClient(subsCalendar.realUrl, subsCalendar.username, subsCalendar.password);
            await calDavClient.login();
            const calendars = await calDavClient.fetchCalendars();
            let remoteCategoryNames: string[] = [];
            let changeCount = 0;
            let pastDays = subsCalendar.syncPastDays || 90;
            let futureDays = subsCalendar.syncFutureDays || 30;

            for (let calendar of calendars) {
                if (!this.supportsVEvent(calendar)) continue;
                let displayName = (calendar.displayName as string) || (calendar.url as string) || i18n.unnamedCalendar;
                let categoryName = displayName + "-" + subsCalendar.name;
                remoteCategoryNames.push(categoryName);
                // 未勾选的分类不从远端同步
                let existingCat = this.categories.find(c => c.name === categoryName);
                if (existingCat && !existingCat.checked) continue;
                let eventSource = this.addSubscribeEventSource(calendar, subsCalendar.name);
                changeCount += await this.diffSyncCategory(calDavClient, calendar, eventSource, pastDays, futureDays);
            }

            this.removeStaleSubscribedCategories(subsCalendar.name, remoteCategoryNames);

            showMessage(i18n.syncCompleteChanges.replace('{0}', String(changeCount)), 5000, "info");
        } catch (error) {
            console.error("同步订阅日历失败:", error);
            showMessage(i18n.syncFailed.replace('{0}', error.message), 6000, "error");
        } finally {
            EventAggregator.emit('caldavSyncDone');
        }
    }

    /**
     * 增量对比同步单个远端日历到本地
     * 只新增/更新/删除有变化的日程，避免全量重写
     * @returns 变更数量
     */
    private async diffSyncCategory(calDavClient: CalDavClient, calendar: any, eventSource: any, pastDays: number, futureDays: number): Promise<number> {
        let categoryName = eventSource.id;
        let category = this.categories.find(c => c.name === categoryName);
        if (!category) return 0;

        // 拉取远端事件并解析为 Schedule
        let remoteObjects = await calDavClient.fetchCalendarObjects(calendar, pastDays, futureDays);
        let remoteMap: { [uid: string]: Schedule } = {};
        for (let obj of remoteObjects) {
            let vCalData = ICAL.parse(obj.data);
            let comp = new ICAL.Component(vCalData);
            let vevent = comp.getFirstSubcomponent("vevent");
            if (!vevent) continue;
            let uid = vevent.getFirstPropertyValue("uid") as string;
            let dtstart = vevent.getFirstPropertyValue("dtstart") as ICAL.Time;
            let dtend = vevent.getFirstPropertyValue("dtend") as ICAL.Time;
            // UTC 时间需转本地；浮动时间/带 TZID 的直接取原始值
            let startStr = dtstart.zone === ICAL.Timezone.utcTimezone
                ? moment(dtstart.toJSDate()).format('YYYY-MM-DDTHH:mm:ss')
                : dtstart.toString().slice(0, 19);
            let endStr = dtend.zone === ICAL.Timezone.utcTimezone
                ? moment(dtend.toJSDate()).format('YYYY-MM-DDTHH:mm:ss')
                : dtend.toString().slice(0, 19);
            let desc = (vevent.getFirstPropertyValue("description") as string) || '';
            let summary = (vevent.getFirstPropertyValue("summary") as string) || '';
            remoteMap[uid] = new Schedule(uid, summary, false, false, '', '', [], [], [], 1,
                                          startStr, endStr, categoryName, '', desc, 2);
        }

        // 构建本地 UID 索引
        let localMap: { [uid: string]: Schedule } = {};
        for (let s of category.schedules) {
            localMap[s.id] = s;
        }

        let changeCount = 0;

        // 新增 & 更新：遍历远端
        for (let uid of Object.keys(remoteMap)) {
            let remote = remoteMap[uid];
            let local = localMap[uid];
            if (!local) {
                // 新增
                fcApi.addEvent(this.createEvent(remote), eventSource);
                category.addSchedule(remote);
                EventAggregator.emit('addScheduleFromRemote', remote);
                changeCount++;
            } else if (local.title !== remote.title || local.start !== remote.start ||
                       local.end !== remote.end || local.content !== remote.content) {
                // 更新
                let fcEvent = fcApi.getEventById(uid);
                if (fcEvent) fcEvent.remove();
                fcApi.addEvent(this.createEvent(remote), eventSource);
                category.removeSchedule(local);
                category.addSchedule(remote);
                EventAggregator.emit('updateScheduleFromRemote', { old: categoryName, new: remote });
                changeCount++;
            }
        }

        // 删除：本地有但远端没有
        for (let uid of Object.keys(localMap)) {
            if (!remoteMap[uid]) {
                let local = localMap[uid];
                let fcEvent = fcApi.getEventById(uid);
                if (fcEvent) fcEvent.remove();
                category.removeSchedule(local);
                EventAggregator.emit('deleteScheduleFromRemote', local);
                changeCount++;
            }
        }

        return changeCount;
    }

    /**
     * 判断日历是否支持 VEVENT（排除 VTODO/Tasks 等）
     */
    private supportsVEvent(calendar: any): boolean {
        let compSet = calendar.supportedCalendarComponentSet;
        if (!compSet) return true; // 没有该属性时默认包含
        // supportedCalendarComponentSet 可能是字符串或对象
        let compStr = typeof compSet === 'string' ? compSet : JSON.stringify(compSet);
        return compStr.indexOf('VEVENT') !== -1;
    }

    /**
     * 删除远端已不存在的订阅分类
     * @param subsCalendarName 订阅日历名称（用于匹配分类后缀）
     * @param remoteCategoryNames 远端当前存在的分类名列表
     */
    private removeStaleSubscribedCategories(subsCalendarName: string, remoteCategoryNames: string[]): void {
        let suffix = "-" + subsCalendarName;
        // 倒序遍历，避免 splice 时索引错乱
        for (let i = this.categories.length - 1; i >= 0; i--) {
            let cat = this.categories[i];
            // 只处理属于当前订阅的分类（以 -订阅名 结尾）
            if (cat.name.indexOf(suffix) !== cat.name.length - suffix.length) continue;
            // 远端仍存在则跳过
            if (remoteCategoryNames.indexOf(cat.name) !== -1) continue;
            // 远端已删除，同步删除本地
            let eventSource = fcApi.getEventSourceById(cat.name);
            if (eventSource) eventSource.remove();
            this.categories.splice(i, 1);
            EventAggregator.emit('deleteCategorty', { name: cat.name });
        }
    }

    addSubscribeEventSource(calendar: any, subsCalendarName: string): any {
        let displayName = (calendar.displayName as string) || (calendar.url as string) || i18n.unnamedCalendar;
        let categoryName = displayName + "-" + subsCalendarName;
        let color = (calendar.calendarColor as string) || "#3BB2E3";

        // 如果分类已存在则复用，否则创建新分类并持久化到本地文档
        let existing = this.categories.find(c => c.name === categoryName);
        if (!existing) {
            let category = new ScheduleCategory(categoryName, color, true);
            this.categories.push(category);
            // 通知 ScheduleManager 创建对应的思源文档，实现离线可用
            EventAggregator.emit('addCategorty', {
                name: categoryName,
                checked: true,
                color: color
            });
        }

        // 创建或复用 FullCalendar 事件源
        let existingSource = fcApi.getEventSourceById(categoryName);
        if (existingSource) {
            return existingSource;
        }

        let eventSource = {
            events: [] as any[],
            id: categoryName,
            display: 'block',
            color: color,
            textColor: "#ffffff"
        };

        fcApi.addEventSource(eventSource);
        return fcApi.getEventSourceById(categoryName);
    }

    /**
     * 将本地分类推送到远端订阅日历，创建对应的远程日历
     * @param categoryName 分类名称（不含后缀）
     * @param color 分类颜色
     * @param subsIndex 目标订阅日历的索引
     */
    async pushCategoryToRemote(categoryName: string, color: string, subsIndex: number): Promise<boolean> {
        let subsCalendar = globalData.schedConfig.subsCalendars[subsIndex];
        if (!subsCalendar) return false;

        try {
            let calDavClient = new CalDavClient(subsCalendar.realUrl, subsCalendar.username, subsCalendar.password);
            await calDavClient.login();
            await calDavClient.makeCalendar(categoryName, color);
            showMessage(i18n.pushedToRemote.replace('{0}', categoryName), 5000, "info");
            return true;
        } catch (error) {
            console.error("推送分类到远端失败:", error);
            showMessage(i18n.pushFailed.replace('{0}', error.message), 6000, "error");
            return false;
        }
    }

    /**
     * 删除本地分类时，同步删除远端对应的日历
     * 通过匹配分类名后缀 -订阅名 来定位远端日历
     * @param categoryName 本地分类名
     */
    async deleteCategoryFromRemote(categoryName: string): Promise<void> {
        let subsCalendars = globalData.schedConfig.subsCalendars || [];
        for (let subsCalendar of subsCalendars) {
            let suffix = "-" + subsCalendar.name;
            if (categoryName.indexOf(suffix) !== categoryName.length - suffix.length) continue;
            // 匹配到订阅，提取远端日历名
            let remoteName = categoryName.substring(0, categoryName.length - suffix.length);
            try {
                let calDavClient = new CalDavClient(subsCalendar.realUrl, subsCalendar.username, subsCalendar.password);
                await calDavClient.login();
                await calDavClient.deleteRemoteCalendar(remoteName);
                showMessage(i18n.deletedRemote.replace('{0}', remoteName), 5000, "info");
            } catch (error) {
                console.error("同步删除远端日历失败:", error);
                showMessage(i18n.deleteRemoteFailed.replace('{0}', error.message), 6000, "error");
            }
            break;
        }
    }

    /**
     * 解析分类名，判断是否为订阅分类，返回订阅配置和远端日历名
     */
    private findSubscribedCalendar(categoryName: string): { subsCalendar: any, remoteCalendarName: string } | null {
        let subsCalendars = globalData.schedConfig.subsCalendars || [];
        for (let subsCalendar of subsCalendars) {
            let suffix = "-" + subsCalendar.name;
            if (categoryName.indexOf(suffix) !== categoryName.length - suffix.length) continue;
            let remoteName = categoryName.substring(0, categoryName.length - suffix.length);
            return { subsCalendar: subsCalendar, remoteCalendarName: remoteName };
        }
        return null;
    }

    /**
     * 将本地新增的日程同步到远端
     */
    async syncAddScheduleToRemote(schedule: Schedule): Promise<void> {
        let info = this.findSubscribedCalendar(schedule.category);
        if (!info) return; // 不是订阅分类，跳过

        try {
            let calDavClient = new CalDavClient(info.subsCalendar.realUrl, info.subsCalendar.username, info.subsCalendar.password);
            await calDavClient.login();
            let calendars = await calDavClient.fetchCalendars();
            let targetCalendar = calendars.find((c: any) => c.displayName === info.remoteCalendarName);
            if (!targetCalendar) {
                showMessage(i18n.remoteCalendarNotFound.replace('{0}', info.remoteCalendarName), 6000, "error");
                return;
            }
            let icsData = CalDavClient.scheduleToIcs(schedule.id, schedule.title, schedule.start, schedule.end, schedule.content || '');
            await calDavClient.createEventOnCalendar(targetCalendar, icsData, schedule.id + '.ics');
        } catch (error) {
            console.error("同步新增日程到远端失败:", error);
            showMessage(i18n.syncRemoteFailed.replace('{0}', error.message), 6000, "error");
        }
    }

    /**
     * 将本地删除的日程同步到远端
     */
    async syncDeleteScheduleToRemote(schedule: Schedule): Promise<void> {
        let info = this.findSubscribedCalendar(schedule.category);
        if (!info) return;

        try {
            let calDavClient = new CalDavClient(info.subsCalendar.realUrl, info.subsCalendar.username, info.subsCalendar.password);
            await calDavClient.login();
            let calendars = await calDavClient.fetchCalendars();
            let targetCalendar = calendars.find((c: any) => c.displayName === info.remoteCalendarName);
            if (!targetCalendar) return; // 远端日历不存在，跳过
            await calDavClient.deleteEventByUid(targetCalendar, schedule.id);
        } catch (error) {
            console.error("同步删除日程到远端失败:", error);
            showMessage(i18n.syncRemoteFailed.replace('{0}', error.message), 6000, "error");
        }
    }

    /**
     * 将本地更新的日程同步到远端
     */
    async syncUpdateScheduleToRemote(schedule: Schedule): Promise<void> {
        let info = this.findSubscribedCalendar(schedule.category);
        if (!info) return;

        try {
            let calDavClient = new CalDavClient(info.subsCalendar.realUrl, info.subsCalendar.username, info.subsCalendar.password);
            await calDavClient.login();
            let calendars = await calDavClient.fetchCalendars();
            let targetCalendar = calendars.find((c: any) => c.displayName === info.remoteCalendarName);
            if (!targetCalendar) {
                showMessage(i18n.remoteCalendarNotFound.replace('{0}', info.remoteCalendarName), 6000, "error");
                return;
            }
            let icsData = CalDavClient.scheduleToIcs(schedule.id, schedule.title, schedule.start, schedule.end, schedule.content || '');
            await calDavClient.updateEventByUid(targetCalendar, schedule.id, icsData);
        } catch (error) {
            console.error("同步更新日程到远端失败:", error);
            showMessage(i18n.syncRemoteFailed.replace('{0}', error.message), 6000, "error");
        }
    }

    addCategory(category: ScheduleCategory): boolean {
        // 日程分类的名称和颜色不能重复
        let find1 = this.categories.find(c => c.name === category.name);
        let find2 = this.categories.find(c => c.color === category.color);
        if(find1 !== undefined || find2 !== undefined) return false;
        this.categories.push(category);
        if(category.checked === true)
            this.addEventSource(category);
        return true;
    }

    getCategory(index: number): ScheduleCategory {
        return this.categories[index];
    }

    updateCategory(index: number, color: string): boolean {
        let find = this.categories.find(c => c.color == color);
        if(find !== undefined) return false;
        this.categories[index].color = color;
        return true;
    }

    getCategoryByName(name: string): ScheduleCategory {
        return this.categories.find(c => c.name === name);
    }

    removeCategory(index: number): void {
        this.removeEventSource(this.categories[index]);
        this.categories.splice(index, 1);
    }

    addEventSource(category: ScheduleCategory):void {
        let eventSource = {
            events: [] as any[],
            id: category.name,
            display: 'block',
            color: category.color,
            textColor: category.textColor
        };
        fcApi.addEventSource(eventSource);
    }

    removeEventSource(category: ScheduleCategory):void {
        fcApi.getEventSourceById(category.name).remove();
    }

    clearEventSources():void {
        let eventSources = fcApi.getEventSources();
        for (let eventSource of eventSources) {
            eventSource.remove();
        }
    }

    addSchedule(schedule: Schedule) : void {
        let category = this.categories.find(c => c.name === schedule.category);
        category?.addSchedule(schedule);
        
        if(category.checked === false) return;
        let eventSource = fcApi.getEventSourceById(schedule.category);
        if(eventSource !== null) {
            fcApi.addEvent(this.createEvent(schedule), eventSource);
        }
    }

    removeSchedule(schedule: Schedule) :void {
        fcApi.getEventById(schedule.id).remove();
        let category = this.categories.find(c => c.name === schedule.category);
        category?.removeSchedule(schedule);
    }

    updateSchedule(oldCategoryName: string, schedule: Schedule) :void {
        let category = this.categories.find(c => c.name === oldCategoryName);
        category?.removeSchedule(schedule);
        category = this.categories.find(c => c.name === schedule.category);
        category?.addSchedule(schedule);
        fcApi.getEventById(schedule.id).remove();

        let eventSource = fcApi.getEventSourceById(schedule.category);
        if(eventSource !== null) {
            fcApi.addEvent(this.createEvent(schedule), eventSource);
        }   
    }

    createEvent(schedule: Schedule) {
        let newEvent = null;

        if(schedule.isRecurringSchedule) {
            //console.log("Schedule byyearday: ", schedule.yeardays);
            newEvent = {
                id: schedule.id,
                title: this.getEventName(schedule.title, schedule.status),
                allDay: schedule.isAllDay,
                rrule: {
                    freq: schedule.frequency,
                    interval: schedule.interval,
                    byweekday: schedule.weekdays,
                    bymonthday: schedule.monthdays,
                    byyearday: schedule.yeardays,
                    dtstart: schedule.start,
                    until: schedule.end
                },
                extendedProps: {
                    category: schedule.category,
                    refBlockId: schedule.refBlockId,
                    content: schedule.content,
                    status: schedule.status, // 日程状态
                    rrule: {
                        freq: schedule.frequency,
                        interval: schedule.interval,
                        byweekday: schedule.weekdays,
                        bymonthday: schedule.monthdays,
                        byyearday: schedule.yeardays,
                        dtstart: schedule.start,
                        until: schedule.end
                    }
                }
            };
        } else {
            newEvent = {
                id: schedule.id,
                title: this.getEventName(schedule.title, schedule.status),
                allDay: schedule.isAllDay,
                start: schedule.start,
                end: schedule.end,
                extendedProps: {
                  category: schedule.category,
                  refBlockId: schedule.refBlockId,
                  content: schedule.content,
                  status: schedule.status // 日程状态
                }
            };
        }
        
        return newEvent;
    }

    getEventName(name: string, status: number): string {
        return globalData.scheduleStatusLogo[status - 1] + ' ' + name;
    }

    updateSelection(): void {
        for(let category of this.categories) {
            if(category.checked) {
                let eventSource = fcApi.getEventSourceById(category.name);
                if(eventSource === null) {
                    this.addEventSource(category);
                    for(let schedule of category.schedules) {
                        fcApi.addEvent(this.createEvent(schedule), fcApi.getEventSourceById(schedule.category));
                    }
                }
            } else {
                let eventSource = fcApi.getEventSourceById(category.name);
                eventSource?.remove();
            }

            EventAggregator.emit('updateCategortySelection', {
                "name": category.name,
                "checked": category.checked,
            });
        }
    }

    archiveSchedules(archiveTime: number): void {
        for(let category of this.categories) {
            for(let schedule of category.schedules) {
                if(schedule.status === 3 && moment().valueOf() >= (schedule.doneTime + archiveTime * 86400000)) {
                    schedule.status = 4;
                    this.updateSchedule(schedule.category, schedule);
                    EventAggregator.emit('updateSchedule', {
                        old: schedule.category,
                        new: schedule });
                }
            }
        }
    }
}