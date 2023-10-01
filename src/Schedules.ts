import { Category } from "./Category";
import { Schedule } from "./Schedule";
import EventAggregator from "./utils/EventAggregator";

export class Schedules {
    categories: Category[];

    constructor() {
    }

    init(scheduleCategories: any): void {
        this.categories = [];
        for(let elementC of scheduleCategories) {
            let category = new Category(elementC.name, elementC.color);
            this.categories.push(category);

            for(let elementS of elementC.schedules) {
                if(elementS.content === "") {
                  continue;
                }

                let content = JSON.parse(elementS.content);
                let schedule = new Schedule(content.id, content.title, content.start, content.end, "#" + content.backgroundColor,
                                            "#" + content.borderColor, content.extendedProps.category, content.extendedProps.content,
                                            content.extendedProps.status);
                category.schedules.push(schedule);
            }
        }
    }

    addSchedule(schedule: Schedule) : void {
        console.log("addSchedule", JSON.stringify(schedule));
        let categoty = this.categories.find(c => c.name === schedule.category);
        if(categoty !== null) {
            categoty.schedules.push(schedule);
        }
    }

    removeSchedule(schedule: Schedule) :void {
      let category = this.categories.find(c => c.name === schedule.category);
      if(category === null) return;
      category.schedules = category.schedules.filter(c => c.id !== schedule.id);
    }

    updateSchedule(oldCategoryName: string, schedule: Schedule) :void {
        let category = this.categories.find(c => c.name === oldCategoryName);
        if(category === null) return;
        category.schedules = category.schedules.filter(c => c.id !== schedule.id);
        category.schedules.push(schedule);
    }
}