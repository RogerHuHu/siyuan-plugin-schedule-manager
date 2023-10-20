
export class Schedule {
    id: string;
    title: string;
    isRecurringSchedule: boolean; // 是否为重复性日程
    frequency: string; // 重复频率（日、周、月、年）
    weekdays: string[]; // 如果重复频率为周，则可以选择周几重复
    interval: number; // 重复间隔，单位视重复频率
    start: string;
    end: string;
    category: string;
    refBlockId: string;
    content: string;
    status: number;
    doneTime: number;

    constructor(id?: string, title?: string,
                isRecurringSchedule?: boolean, frequency?: string, weekdays?: string[], interval?: number,
                start?: string, end?: string, 
                category?: string, refBlockId?:string, content?: string, status?: number) {
        this.id = id;
        this.title = title;
        this.isRecurringSchedule = isRecurringSchedule;
        this.frequency = frequency;
        this.weekdays = weekdays;
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