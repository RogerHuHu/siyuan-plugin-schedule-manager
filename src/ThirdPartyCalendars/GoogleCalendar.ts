import { DAVClient } from "tsdav";

export class GoogleCalendar {
    serverUrl: string;
    tokenUrl: string;
    username: string;
    refreshToken: string;
    clientId: string;
    clientSecret: string;

    client: DAVClient;

    constructor(serverUrl: string, tokenUrl: string, username: string,
                refreshToken: string, clientId: string, clientSecret: string) {
        this.serverUrl = serverUrl;
        this.tokenUrl = tokenUrl;
        this.username = username;
        this.refreshToken = refreshToken;
        this.clientId = clientId;
        this.clientSecret = clientSecret;

        this.client = new DAVClient({
            serverUrl: this.serverUrl,
            credentials: {
                tokenUrl: this.tokenUrl,
                username: this.username,
                refreshToken: this.refreshToken,
                clientId: this.clientId,
                clientSecret: this.clientSecret,
            },
            authMethod: 'Oauth',
            defaultAccountType: 'caldav'
        });
    }

    async login() {
        await this.client.login();
    }
}