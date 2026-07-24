import { DAVClient, DAVCalendar, DAVCalendarObject } from "tsdav";
import { format, parseISO, getTime } from 'date-fns';

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

    async fetchCalendarObjects(calendar: DAVCalendar): Promise<DAVCalendarObject[]> {
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
                                    start: format(Date.now() - 90*86400*1000, "yyyy-MM-dd'T'HH:mm:ss'Z'").replace(/[-:.]/g, ''), // 当前时间减90天
                                    end: format(Date.now(), "yyyy-MM-dd'T'HH:mm:ss'Z'").replace(/[-:.]/g, ''), // 当前时间减90天
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
        if (!homeUrl) throw new Error("无法获取日历主目录");

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
            throw new Error("远端未找到日历: " + name);
        }
        let resp = await this.client.deleteObject({ url: target.url });
        if (!resp.ok) {
            throw new Error("删除远端日历失败: HTTP " + resp.status);
        }
    }
}