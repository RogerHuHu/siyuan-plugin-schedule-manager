import { ScheduleCategory } from "./ScheduleCategory";
import { Schedule } from "./Schedule";
import { el, tr } from "date-fns/locale";
import { fcApi } from "./utils/utils";
import EventAggregator from "./utils/EventAggregator";
import { reactive } from "vue"

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
        this.isInit = false;
    }

    readScheduleCategoriesFromDocuments() : void {
        this.categories.splice(0, this.categories.length);
        this.clearEventSources();
        for(let elementC of this.documents) {
            if(elementC.checked === false) continue;
            let category = new ScheduleCategory(elementC.name, elementC.color);
            this.addCategory(category);

            for(let elementS of elementC.schedules) {
                if(elementS.content === "") {
                  continue;
                }
                let content = JSON.parse(elementS.content);
                let schedule = new Schedule(content.id, content.title, content.start, content.end,
                                            content.category, content.content, content.status);
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

    addCategory(category: ScheduleCategory): boolean {
        // 日程分类的名称和颜色不能重复
        let find1 = this.categories.find(c => c.name === category.name);
        let find2 = this.categories.find(c => c.color === category.color);
        if(find1 !== undefined || find2 !== undefined) return false;
        this.categories.push(category);
        this.addEventSource(category);
        return true;
    }

    getCategory(index: number): ScheduleCategory {
        return this.categories[index];
    }

    removeCategory(index: number): void {
        this.removeEventSource(this.categories[index]);
        this.categories.splice(index, 1);
    }

    addEventSource(category: ScheduleCategory):void {
        let eventSource = {
            events: [],
            id: category.name,
            display: 'block',
            color: category.color
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
        let newEvent = {
            id: schedule.id,
            title: this.getEventName(schedule.title, schedule.status),
            start: schedule.start,
            end: schedule.end,
            extendedProps: {
              category: schedule.category,
              content: schedule.content,
              status: schedule.status // 日程状态
            }
        };
        return newEvent;
    }

    getEventName(name: string, status: number): string {
        let result = "";
        switch(status) {
          case 1:
            result = '☕ ' + name;
            break;
          case 2:
            result = '🏃‍♂️ ' + name;
            break;
          case 3:
            result = '✅ ' + name;
            break;
          case 4:
            result = '📦 ' + name;
            break;
          default:
            result = name;
            break;
        }
        return result;
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
        }
    }
}