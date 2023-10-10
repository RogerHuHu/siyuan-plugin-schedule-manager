import { Schedule } from "Schedule";

export class ScheduleCategory {
    checked: boolean;
    name: string;
    color: string;
    textColor: string;
    schedules: Schedule[];

    constructor(name: string, color: string, checked: boolean, schedules?: Schedule[]) {
        this.checked = true;
        this.name = name;
        this.color = color;
        this.textColor = this.calculateFrontColor(color);
        this.checked = checked;

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

    calculateFrontColor(hexColor: string): string {
        // 去掉颜色值前面的井号符号
        hexColor = hexColor.replace("#", "");
        // 将十六进制颜色值转换为 RGB 格式
        const red = parseInt(hexColor.substring(0, 2), 16);
        const green = parseInt(hexColor.substring(2, 4), 16);
        const blue = parseInt(hexColor.substring(4, 6), 16);

        // 计算颜色的相对亮度
        const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

        // 根据相对亮度决定使用黑色或白色字体
        return brightness > 128 ? "#000000" : "#FFFFFF";
    }
}