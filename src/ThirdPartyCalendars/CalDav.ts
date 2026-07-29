import { DAVClient, DAVCalendar, DAVCalendarObject } from "tsdav";
import { format, parseISO, getTime } from 'date-fns';
import { i18n } from "../utils/utils";

export class CalDavClient {
    serverUrl: string;
    username: string;
    password: string;

    client: DAVClient;

    constructor(serverUrl: string, username: string, password: string) {
        this.serverUrl = serverUrl;
        this.username = username;
        this.password = password;

        this.client = new DAVClient({
            serverUrl: this.serverUrl,
            credentials: {
                username: this.username,
                password: this.password
                //clientId: "c1",
                //clientSecret: this.password,
                //authorizationCode: this.password,
            },
            authMethod: 'Basic',
            defaultAccountType: 'caldav'
        });
    }

    async login() {
        await this.client.login();
    }

    async fetchCalendars(): Promise<any[]> {
        let calendars = await this.client.fetchCalendars();
        return calendars;
    }

    async fetchCalendarObjects(calendar: DAVCalendar, pastDays: number = 90, futureDays: number = 30): Promise<DAVCalendarObject[]> {
        const calendarObjects = await this.client.fetchCalendarObjects({
            calendar: calendar,
            filters: [
                {
                    "comp-filter": {
                        _attributes: {
                            name: "VCALENDAR",
                        },
                        "comp-filter": {
                            _attributes: {
                                name: "VEVENT"
                            },
                            "time-range": {
                                _attributes: {
                                    start: format(Date.now() - pastDays*86400*1000, "yyyy-MM-dd'T'HH:mm:ss'Z'").replace(/[-:.]/g, ''),
                                    end: format(Date.now() + futureDays*86400*1000, "yyyy-MM-dd'T'HH:mm:ss'Z'").replace(/[-:.]/g, ''),
                                },
                            }
                        }
                    }
                }
            ],
        });

        return calendarObjects;
    }

    /**
     * 在远端创建新日历
     * @param name 日历显示名称
     * @param color 日历颜色（如 #18A058）
     */
    async makeCalendar(name: string, color: string): Promise<void> {
        let account = (this.client as any).account;
        let homeUrl: string = account?.homeUrl || '';
        if (!homeUrl) {
            // 回退：从已有日历 URL 推导父路径
            let calendars = await this.fetchCalendars();
            if (calendars.length > 0) {
                let url = calendars[0].url;
                homeUrl = url.substring(0, url.lastIndexOf('/', url.length - 2) + 1);
            }
        }
        if (!homeUrl) throw new Error(i18n.cannotGetCalendarHome);

        // 生成安全的日历路径名
        let safeName = encodeURIComponent(name);
        let calendarUrl = homeUrl.replace(/\/$/, '') + '/' + safeName + '/';

        await this.client.makeCalendar({
            url: calendarUrl,
            props: {
                displayname: name,
                'calendar-color': color,
                'supported-calendar-component-set': {
                    'comp': {
                        _attributes: { name: 'VEVENT' }
                    }
                }
            }
        });
    }

    /**
     * 删除远端日历（按 displayName 匹配）
     * @param name 日历显示名称
     */
    async deleteRemoteCalendar(name: string): Promise<void> {
        let calendars = await this.fetchCalendars();
        let target = calendars.find((c: any) => {
            let dn = c.displayName;
            return typeof dn === 'string' ? dn === name : false;
        });
        if (!target) {
            throw new Error(i18n.remoteCalendarNotFound.replace('{0}', name));
        }
        let resp = await this.client.deleteObject({ url: target.url });
        if (!resp.ok) {
            throw new Error(i18n.deleteRemoteCalendarFailed.replace('{0}', String(resp.status)));
        }
    }

    /**
     * 在指定日历上创建日程
     * @param calendar 目标日历对象
     * @param icsData iCalendar 字符串
     * @param filename 文件名（通常为 uid.ics）
     */
    async createEventOnCalendar(calendar: DAVCalendar, icsData: string, filename: string): Promise<void> {
        let resp = await this.client.createCalendarObject({
            calendar: calendar,
            iCalString: icsData,
            filename: filename
        });
        if (!resp.ok) {
            throw new Error(i18n.createRemoteEventFailed.replace('{0}', String(resp.status)));
        }
    }

    /**
     * 按 UID 删除远端日程（直接拼接 URL 删除，兼容性更好）
     * @param calendar 目标日历对象
     * @param uid 日程 UID
     */
    async deleteEventByUid(calendar: DAVCalendar, uid: string): Promise<void> {
        let objectUrl = calendar.url.replace(/\/$/, '') + '/' + encodeURIComponent(uid) + '.ics';
        let resp = await this.client.deleteObject({ url: objectUrl });
        if (!resp.ok) {
            throw new Error(i18n.deleteRemoteEventFailed.replace('{0}', String(resp.status)));
        }
    }

    /**
     * 按 UID 更新远端日程
     * @param calendar 目标日历对象
     * @param uid 日程 UID
     * @param icsData 新的 iCalendar 字符串
     */
    async updateEventByUid(calendar: DAVCalendar, uid: string, icsData: string): Promise<void> {
        let objectUrl = calendar.url.replace(/\/$/, '') + '/' + encodeURIComponent(uid) + '.ics';
        // 先获取 etag
        let objects = await this.client.fetchCalendarObjects({
            calendar: calendar,
            objectUrls: [objectUrl]
        });
        if (objects.length === 0) {
            throw new Error(i18n.remoteEventNotFound.replace('{0}', uid));
        }
        let resp = await this.client.updateCalendarObject({
            calendarObject: {
                url: objects[0].url,
                etag: objects[0].etag,
                data: icsData
            }
        });
        if (!resp.ok) {
            throw new Error(i18n.updateRemoteEventFailed.replace('{0}', String(resp.status)));
        }
    }

    /**
     * 将日程数据转换为 iCalendar 格式
     */
    static scheduleToIcs(uid: string, title: string, start: string, end: string, description: string): string {
        // 本地时间直接作为浮动时间写入，不追加 Z（Z 表示 UTC，会导致远端多偏移时区差）
        let dtStart = start.replace(/[-:]/g, '').replace(' ', 'T');
        let dtEnd = end.replace(/[-:]/g, '').replace(' ', 'T');
        let now = format(Date.now(), "yyyy-MM-dd'T'HH:mm:ss'Z'").replace(/[-:.]/g, '');
        // 转义 ICS 特殊字符
        let escapedTitle = title.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
        let escapedDesc = description.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

        return [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//SiYuan//ScheduleManager//CN',
            'BEGIN:VEVENT',
            'UID:' + uid,
            'DTSTART:' + dtStart,
            'DTEND:' + dtEnd,
            'DTSTAMP:' + now,
            'SUMMARY:' + escapedTitle,
            'DESCRIPTION:' + escapedDesc,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');
    }
}