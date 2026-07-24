import { ScheduleCategory } from "./ScheduleCategory";
import { Schedule } from "./Schedule";
import { fcApi, globalData } from "./utils/utils";
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
            let calDavClient = new CalDavClient(subsCalendar.realUrl, subsCalendar.username, subsCalendar.password);
            await calDavClient.login();
            const calendars = await calDavClient.fetchCalendars();
            let remoteCategoryNames: string[] = [];
            for (let calendar of calendars) {
                // 跳过不支持 VEVENT 的日历（如 Tasks/VTODO）
                if (!this.supportsVEvent(calendar)) continue;
                let eventSource = this.addSubscribeEventSource(calendar, subsCalendar.name);
                remoteCategoryNames.push(eventSource.id);
                const schedules = await calDavClient.fetchCalendarObjects(calendar);
                for (let sched of schedules) {
                    let vCalData = ICAL.parse(sched.data);
                    let comp = new ICAL.Component(vCalData);
                    // let timezoneComp = comp.getFirstSubcomponent("vtimezone");
                    // let tzid = timezoneComp.getFirstPropertyValue('tzid');
                    // let timezone = new ICAL.Timezone({component: timezoneComp, tzid});
                    let vevent = comp.getFirstSubcomponent("vevent");
                    let dtstart = vevent.getFirstPropertyValue("dtstart") as ICAL.Time;
                    let dtend = vevent.getFirstPropertyValue("dtend") as ICAL.Time;
                    // 校正时区，TODO 根据实际的时区自动调整
                    let newdtstart = dtstart.adjust(0, 8, 0, 0);
                    let newdtend = dtend.adjust(0, 8, 0, 0);

                    let schedule = new Schedule(vevent.getFirstPropertyValue("uid") as string,
                                                vevent.getFirstPropertyValue("summary") as string,
                                                false, false, '', '', [], [], [], 1,
                                                newdtstart.toString().slice(0, 19),
                                                newdtend.toString().slice(0, 19),
                                                eventSource.id, '',
                                                vevent.getFirstPropertyValue("description") as string,
                                                2);
                    fcApi.addEvent(this.createEvent(schedule), fcApi.getEventSourceById(eventSource.id));
                }
            }
            // 清理远端已删除的分类
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
            let eventCount = 0;

            for (let calendar of calendars) {
                // 跳过不支持 VEVENT 的日历（如 Tasks/VTODO）
                if (!this.supportsVEvent(calendar)) continue;
                let eventSource = this.addSubscribeEventSource(calendar, subsCalendar.name);
                remoteCategoryNames.push(eventSource.id);
                const schedules = await calDavClient.fetchCalendarObjects(calendar);
                for (let sched of schedules) {
                    let vCalData = ICAL.parse(sched.data);
                    let comp = new ICAL.Component(vCalData);
                    let vevent = comp.getFirstSubcomponent("vevent");
                    let dtstart = vevent.getFirstPropertyValue("dtstart") as ICAL.Time;
                    let dtend = vevent.getFirstPropertyValue("dtend") as ICAL.Time;
                    let newdtstart = dtstart.adjust(0, 8, 0, 0);
                    let newdtend = dtend.adjust(0, 8, 0, 0);

                    let schedule = new Schedule(vevent.getFirstPropertyValue("uid") as string,
                                                vevent.getFirstPropertyValue("summary") as string,
                                                false, false, '', '', [], [], [], 1,
                                                newdtstart.toString().slice(0, 19),
                                                newdtend.toString().slice(0, 19),
                                                eventSource.id, '',
                                                vevent.getFirstPropertyValue("description") as string,
                                                2);
                    fcApi.addEvent(this.createEvent(schedule), fcApi.getEventSourceById(eventSource.id));
                    eventCount++;
                }
            }

            // 清理远端已删除的分类
            this.removeStaleSubscribedCategories(subsCalendar.name, remoteCategoryNames);

            showMessage("同步完成，共 " + eventCount + " 个事件", 5000, "info");
        } catch (error) {
            console.error("同步订阅日历失败:", error);
            showMessage("同步失败: " + error.message, 6000, "error");
        } finally {
            EventAggregator.emit('caldavSyncDone');
        }
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
        let displayName = (calendar.displayName as string) || (calendar.url as string) || "未命名日历";
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
        return eventSource;
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
            showMessage("已推送到远端: " + categoryName, 5000, "info");
            return true;
        } catch (error) {
            console.error("推送分类到远端失败:", error);
            showMessage("推送失败: " + error.message, 6000, "error");
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
                showMessage("已同步删除远端: " + remoteName, 5000, "info");
            } catch (error) {
                console.error("同步删除远端日历失败:", error);
                showMessage("删除远端失败: " + error.message, 6000, "error");
            }
            break;
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