import { Schedule } from "Schedule"

export class Category {
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
}