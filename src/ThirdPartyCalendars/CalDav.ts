import { DAVClient } from "tsdav";

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
        /*
        await this.client.makeCalendar({
            url: 'https://calendar.dingtalk.com/dav/u_oslxrjui/primary/',
            props: {
                displayname: '工作',
                description: ''
            }
        });
        */
        const calendars = await this.client.fetchCalendars();
        console.log("=========================calendars===========================");
        console.log(calendars);
        const calendarObjects = await this.client.fetchCalendarObjects({
            calendar: calendars[0],
          });
        console.log(calendarObjects);
    }
}