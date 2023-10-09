import { Schedule } from "Schedule";

export class ScheduleCategory {
    checked: boolean;
    name: string;
    color: string;
    schedules: Schedule[];

    constructor(name: string, color: string, schedules?: Schedule[]) {
        this.checked = true;
        this.name = name;
        this.color = color;

        if(schedules != null)
            this.schedules = schedules;
        else
            this.schedules = [];
    }

    addSchedule(schedule: Schedule) : void {
        this.schedules.push(schedule);
    }

    removeSchedule(schedule: Schedule) :void {
        this.schedules = this.schedules.filter(c => c.id !== schedule.id);
    }

    updateSchedule(schedule: Schedule) :void {
        this.schedules = this.schedules.filter(c => c.id !== schedule.id);
        this.schedules.push(schedule);
    }
}