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
}