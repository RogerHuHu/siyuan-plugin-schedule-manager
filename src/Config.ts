// 第三方日历的信息
export interface TPCalendarInfo {
    nane: string;
    img: string;
    url: string;
    realUrl: string;
    username: string;
    password: string;
}

export interface Config {
    archiveTime: number;
    showArchivedSchedule: boolean;
    firstDayOfWeek: number;
    showLunarCalendar: boolean;
    userLocale: string;
    tpCalendars: TPCalendarInfo[];
}