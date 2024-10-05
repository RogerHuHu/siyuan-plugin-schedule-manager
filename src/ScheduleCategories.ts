import { ScheduleCategory } from "./ScheduleCategory";
import { Schedule } from "./Schedule";
import { fcApi, globalData } from "./utils/utils";
import EventAggregator from "./utils/EventAggregator";
import { reactive } from "vue";
import moment from "moment";
import { CalDavClient } from "./ThirdPartyCalendars/CalDav";
import ICAL from "ical.js";

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
            for (let calendar of calendars) {
                if (calendar.displayName == "好友生日") continue;
                let eventSource = this.addSubscribeEventSource(calendar);
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
        }
    }

    addSubscribeEventSource(calendar: any): any {
        let category = new ScheduleCategory(calendar.display + "Subs", calendar.calendarColor, true);
        let eventSource = {
            events: [] as any[],
            id: category.name,
            display: 'block',
            color: category.color,
            textColor: category.textColor
        };

        fcApi.addEventSource(eventSource);
        return eventSource;
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