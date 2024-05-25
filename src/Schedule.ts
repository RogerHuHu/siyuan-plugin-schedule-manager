
export class Schedule {
    id: string;
    title: string;
    isAllDay: boolean; // 是否为全天日程
    isRecurringSchedule: boolean; // 是否为重复性日程
    calendarType: string; // 公历还是农历
    frequency: string; // 重复频率（日、周、月、年）
    weekdays: string[]; // 如果重复频率为周，则可以选择周几重复
    monthdays: string[]; // 如果重复频率为月，则可以选择当月的哪一天重复
    yeardays: string[];  // 如果重复频率为年，则可以选择当年的哪一天重复
    interval: number; // 重复间隔，单位视重复频率
    start: string;
    end: string;
    category: string;
    refBlockId: string;
    content: string;
    status: number;
    doneTime: number;

    constructor(id?: string, title?: string, isAllDay?: boolean,
                isRecurringSchedule?: boolean, calendarType?:string, frequency?: string,
                weekdays?: string[], monthdays?:string[], yeardays?:string[],
                interval?: number, start?: string, end?: string, 
                category?: string, refBlockId?:string, content?: string, status?: number) {
        this.id = id;
        this.title = title;
        this.isAllDay = isAllDay;
        this.isRecurringSchedule = isRecurringSchedule;
        this.calendarType = calendarType;
        this.frequency = frequency;
        this.weekdays = weekdays;
        this.monthdays = monthdays;
        this.yeardays = yeardays;
        this.interval = interval;
        this.start = start;
        this.end = end;
        this.category = category;
        this.refBlockId = refBlockId;
        this.content = content;
        this.status = status;
        this.doneTime = 0;
    }

    setDoneTime(doneTime?: number) {
        this.doneTime = doneTime === undefined ? 0 : doneTime;
    }
}