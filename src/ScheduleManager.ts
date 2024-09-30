import { createApp, initCustomFormatter } from "vue";
import naive from "naive-ui";
import App from "./App.vue";

import { fetchPost, fetchSyncPost } from "siyuan";
import EventAggregator from "./utils/EventAggregator";
import { Schedule } from "./Schedule";
import { globalData } from "./utils/utils";
import { TPCalendarInfo, Config } from "./Config";
import { tr } from "date-fns/locale";

export class ScheduleManager {
    app : any;
    private noteBookId : string;
    private docId : string;
    private documents: any[];
    private configDocId: string;
    private configBlockId: string;
    
    // 构造函数
    constructor() {
        this.listenEvents();
        //globalData.scheduleCategories = new ScheduleCategories();
    }

    init(): void {
        //this.readScheduleCategory();
        this.updateDocumentVersion();
    }

    async show() {
        await this.readScheduleCategory();
        this.app = createApp(App);
        this.app.use(naive);
    }

    mount(el: HTMLElement) : void {
        this.app.mount(el);
    }

    updateNotebookId(id: string) : void {
        this.noteBookId = id;
    }

    updateDocId(id: string) : void {
        this.docId = id;
    }

    async readScheduleCategory() {
        this.documents = [];

        await this.getDocuments(this.noteBookId);
        await this.getDocumentsName();
        await this.loadConfig();
        await this.getSchedules();
       
        globalData.scheduleCategories.init(this.documents);
    }

    listenEvents() : void {
        EventAggregator.on('addCategorty', (p) => {
            //this.createDocument(this.noteBookId, p);
            this.createDocumentAndSetAttributes(this.noteBookId, p);
        });

        EventAggregator.on('deleteCategorty', (p: any) => {
            this.deleteDocument(this.noteBookId, this.getDocumentIdByName(p.name));
        });

        EventAggregator.on('addSchedule', (p: any) => {
            fetchPost("/api/block/appendBlock", {
                "data": JSON.stringify(p).replace(/#/g,""),
                "dataType": "markdown",
                "parentID": this.getDocumentIdByName(p.category)
            }, (response) => {

            });
        });

        EventAggregator.on('updateSchedule', (p) => {
            this.updateSchedule(p);
        });

        EventAggregator.on('deleteSchedule', (p) => {
            this.deleteSchedule(p);
        });

        EventAggregator.on('updateCategortySelection', (p: any) => {
            this.setDocumentCheckedProperty(p.name, p.checked);
        });

        EventAggregator.on('updateArchiveTime', (p: any) => {
            this.setArchiveTime(p);
        });

        EventAggregator.on('updateShowArchivedSchedule', (p: any) => {
            this.setShowArchivedSchedule(p);
        });

        EventAggregator.on('updateFirstDayOfWeek', (p: any) => {
            this.setFirstDayOfWeek(p);
        });

        EventAggregator.on('updateShowLunarCalendar', (p:any) => {
            this.setShowLunarCalendar(p);
        })

        EventAggregator.on('updateLocale', (p:any) => {
            this.setUserLocale(p);
        });

        EventAggregator.on('updateThirdPartyCalendar', (p:any) => {
            this.setThirdPartyCalendar(p);
        });
    }

    async createDocumentAndSetAttributes(notebookId: string, docProp: any) {
        await this.createDocument(notebookId, docProp);
        await this.setDocumentProperty(this.docId, docProp.checked, docProp.color);
        let document = {
            id: this.docId,
            name: docProp.name,
            checked: docProp.checked,
            color: docProp.color,
            schedules: [] as any[]
        };
        this.documents.push(document);
    }

    async createDocument(notebookId: string, docProp: any) {
        await fetchSyncPost("/api/filetree/createDocWithMd", {
            "notebook": notebookId,
            "path": "/" + docProp.name,
            "markdown": ""
        }).then(response => {
            this.docId = response.data;
        });
    }

    deleteDocument(notebookId: string, docId: string) : void {
        fetchPost("/api/filetree/removeDoc", {
            "notebook": notebookId,
            "path": "/" + docId + ".sy",
        }, (response) => {
        });
    }

    async setDocumentProperty(docId: string, checked: boolean, color: string) {
        await fetchSyncPost("/api/attr/setBlockAttrs", {
            "id": docId,
            "attrs": {
                "custom-checked": checked ? "true" : "false",
                "custom-color": color,
                "custom-version": "1.1.0"
            }
        }).then(response => {

        });
    }

    setDocumentCheckedProperty(name: string, checked: boolean) : void {
        fetchPost("/api/attr/setBlockAttrs", {
            "id": this.getDocumentIdByName(name),
            "attrs": {
                "custom-checked": checked ? "true" : "false"
            }
        }, (response) => {
            
        });
    }

    async setArchiveTime(archiveTime: number) {
        globalData.schedConfig.archiveTime = archiveTime;

        fetchPost("/api/block/updateBlock", {
            "data": JSON.stringify(globalData.schedConfig, null, 2).replace(/#/g,""),
            "dataType": "markdown",
            "id": this.configBlockId
        }, (response) => {

        });
    }

    async setShowArchivedSchedule(showArchivedSchedule: boolean) {
        globalData.schedConfig.showArchivedSchedule = showArchivedSchedule;

        fetchPost("/api/block/updateBlock", {
            "data": JSON.stringify(globalData.schedConfig, null, 2).replace(/#/g,""),
            "dataType": "markdown",
            "id": this.configBlockId
        }, (response) => {

        });
    }

    async setFirstDayOfWeek(firstDay: number) {
        globalData.schedConfig.firstDayOfWeek = firstDay;

        fetchPost("/api/block/updateBlock", {
            "data": JSON.stringify(globalData.schedConfig, null, 2).replace(/#/g,""),
            "dataType": "markdown",
            "id": this.configBlockId
        }, (response) => {

        });
    }

    async setUserLocale(locale: string) {
        globalData.schedConfig.userLocale = locale;

        fetchPost("/api/block/updateBlock", {
            "data": JSON.stringify(globalData.schedConfig, null, 2).replace(/#/g,""),
            "dataType": "markdown",
            "id": this.configBlockId
        }, (response) => {

        });
    }

    async setShowLunarCalendar(showLunarCalendar: boolean) {
        globalData.schedConfig.showLunarCalendar = showLunarCalendar;

        fetchPost("/api/block/updateBlock", {
            "data": JSON.stringify(globalData.schedConfig, null, 2).replace(/#/g,""),
            "dataType": "markdown",
            "id": this.configBlockId
        }, (response) => {

        });
    }

    async setThirdPartyCalendar(calendar: TPCalendarInfo) {
        globalData.schedConfig.tpCalendars.push(calendar);

        fetchPost("/api/block/updateBlock", {
            "data": JSON.stringify(globalData.schedConfig, null, 2).replace(/#/g,""),
            "dataType": "markdown",
            "id": this.configBlockId
        }, (response) => {

        });
    }

    async getDocuments(notebookId: string) {
        let query = "SELECT id FROM blocks WHERE type = \'d\' AND box =\'" + notebookId + "\'";
        await fetchSyncPost("/api/query/sql", {"stmt":query}).then(response => {
            for(let id of response.data) {
                let document = {
                    id: id.id,
                    name: "",
                    checked: "",
                    color: "",
                    archiveTime: "",
                    schedules: [] as any[]
                }
                this.documents.push(document);
            }
        });
    }

    async getDocumentsName() {
        let configExsits = false;
        for(let doc of this.documents) {
            await fetchSyncPost("/api/attr/getBlockAttrs", {"id":doc.id}).then(response => {
                if(response.data.title != undefined) {
                    doc.name = response.data.title;

                    // 判断配置文档是否存在
                    if (this.isConfigDocumentExists("schedconfig", doc.name)) {
                        configExsits = true;
                        this.configDocId = doc.id;
                    } else {
                        doc.checked = response.data["custom-checked"] === "true" ? true : false;
                        doc.color = response.data["custom-color"];
                        doc.archiveTime = response.data['custom-archiveTime'];
                        doc.showArchivedSchedule = response.data['custom-showArchivedSchedule'] == "true" ? true : false;
                        doc.firstDayOfWeek = response.data["custom-firstDayOfWeek"];
                        doc.showLunarCalendar = response.data["custom-showLunarCalendar"] == "true" ? true : false;
                        doc.userLocale = response.data["custom-userLocale"];
                        globalData.archiveTime = doc.archiveTime === undefined ? 7 : parseInt(doc.archiveTime, 10);
                        globalData.showArchivedSchedule = doc.showArchivedSchedule;
                        globalData.selectedFirstDayOfWeek = doc.firstDayOfWeek === undefined ? 0 : doc.firstDayOfWeek;
                        globalData.showLunarCalendar = doc.showLunarCalendar;
                        globalData.userLocale = doc.userLocale === undefined ? "zh-cn" : doc.userLocale;    
                    }
                }
            })
        }

        if (configExsits) {
            this.documents = this.documents.filter(doc => doc.id !== this.configDocId)
        } else {
            // 若配置文档不存在，则新建配置文档
           await this.createConfigDocument();
        }
    }

    isConfigDocumentExists(nameWanted:string, name: string) :boolean{
        return nameWanted == name;
    }

    async createConfigDocument() {
        await this.createDocument(this.noteBookId, {"name": "schedconfig"})
        this.configDocId = this.docId;

        let config: Config = {
            archiveTime: 7,
            showArchivedSchedule: true,
            firstDayOfWeek: 1,
            showLunarCalendar: true,
            userLocale: "zh-cn",
            tpCalendars: []
        };

        if (this.documents.length > 0) {
            let doc = this.documents[0];
            config.archiveTime = globalData.archiveTime;
            config.showArchivedSchedule = globalData.showArchivedSchedule;
            config.firstDayOfWeek = globalData.selectedFirstDayOfWeek;
            config.showLunarCalendar = globalData.showLunarCalendar;
            config.userLocale = globalData.userLocale;
        }

        fetchPost("/api/block/appendBlock", {
            "data": JSON.stringify(config, null, 2).replace(/#/g,""),
            "dataType": "markdown",
            "parentID": this.configDocId
        }, (response) => {

        });
    }

    async loadConfig() {
        let query = "SELECT id,content FROM blocks WHERE parent_id =\'" + this.configDocId + "\'";
        await fetchSyncPost("/api/query/sql", {"stmt":query}).then(response => {
            let res = "";
            for(let data of response.data) {
                if(data.content != "") {
                    res = data.content;
                    this.configBlockId = data.id;
                    break;
                }
            }

            let config: Config = JSON.parse(res);
            globalData.schedConfig = config;
        })
    }

    async getSchedules() {
        for(let doc of this.documents) {
            let query = "SELECT content FROM blocks WHERE parent_id =\'" + doc.id + "\'";
            await fetchSyncPost("/api/query/sql", {"stmt":query}).then(response => {
                doc.schedules = response.data;
            })
        }
    }

    async deleteSchedule(schedule: any) {
        let id;

        // 先查询得到日程的 id
        let query = "SELECT id FROM blocks WHERE content like \'%" + schedule.id + "%\' AND parent_id =\'" + this.getDocumentIdByName(schedule.category) + "\'";
        await fetchSyncPost("/api/query/sql", {"stmt":query}).then(response => {
            id = response.data[0].id;
        })

        await fetchSyncPost("/api/block/deleteBlock", {
            "id": id
        }).then(response => {
        })
    }

    async updateSchedule(schedule: any) {
        let id;

        // 先查询得到日程的 id
        let query = "SELECT id FROM blocks WHERE content like \'%" + schedule.new.id + "%\' AND parent_id =\'" + this.getDocumentIdByName(schedule.old) + "\'";
        await fetchSyncPost("/api/query/sql", {"stmt":query}).then(response => {
            id = response.data[0].id;
        })

        await fetchSyncPost("/api/block/deleteBlock", {
            "id": id
        }).then(response => {
        })

        await fetchSyncPost("/api/block/appendBlock", {
            "data": JSON.stringify(schedule.new).replace(/#/g,""),
            "dataType": "markdown",
            "parentID": this.getDocumentIdByName(schedule.new.category)
        }).then(response => {

        })
    }

    getDocumentIdByName(name: string) : string {
        for(let doc of this.documents) {
            if(doc.name === name) {
                return doc.id;
            }
        }
    }

    async updateDocumentVersion() {
        let documents = await this.getDocuments1();

        for(let doc of documents) {
            await fetchSyncPost("/api/attr/getBlockAttrs", {"id":doc.id}).then(response => {
                doc.name = response.data.title;
                doc.checked = response.data["custom-checked"] === "true" ? true : false;
                doc.color = response.data["custom-color"];
                doc.version = response.data["custom-version"];
            })
        }

        for(let doc of documents) {
            if(doc.version === "1.0.0") {
                await this.updateSchedules1(doc.id, documents);
                this.setDocumentProperty1(doc.id, doc.checked, doc.color);
            }
        }
    }

    async getDocuments1(): Promise<any[]> {
        let documents = [] as any;
        let query = "SELECT id FROM blocks WHERE type = \'d\' AND box =\'" + this.noteBookId + "\'";
        await fetchSyncPost("/api/query/sql", {"stmt":query}).then(response => {
            for(let id of response.data) {
                let document = {
                    id: id.id,
                    name: "",
                    checked: "",
                    color: "",
                    version: ""
                }
                documents.push(document);
            }
        });

        return documents;
    }

    setDocumentProperty1(docId: string, checked: boolean, color: string) : void {
        fetchPost("/api/attr/setBlockAttrs", {
            "id": docId,
            "attrs": {
                "custom-checked": checked ? "true" : "false",
                "custom-color": color,
                "custom-version": "1.1.0",
            }
        }, (response) => {
            
        });
    }

    async updateSchedules1(docId: string, documents: any[]) {
        let query = "SELECT content FROM blocks WHERE parent_id =\'" + docId + "\'";
        let schedules = [] as any[];
        await fetchSyncPost("/api/query/sql", {"stmt":query}).then(response => {
            schedules = response.data;
        });

        //console.log(schedules);
        for(let schedule of schedules) {
            await this.updateSchedule1(schedule, documents);
        }
        //console.log("update schedules successfully");
    }

    async updateSchedule1(schedule: any, documents: any[]) {
        let id;

        if(schedule.content !== "") {
            let content = JSON.parse(schedule.content);
            // 先查询得到日程的 id
            let query = "SELECT id FROM blocks WHERE content like \'%" + content.id + "%\' AND parent_id =\'" +
                this.getDocumentIdByName1(content.extendedProps.category, documents) + "\'";
            await fetchSyncPost("/api/query/sql", {"stmt":query}).then(response => {
                id = response.data[0].id;
            })

            await fetchSyncPost("/api/block/deleteBlock", {
                "id": id
            }).then(response => {
            })

            let newSchedule = new Schedule(content.id, content.title, content.isAllDay,
                                           content.isRecurringSchedule, content.calendarType, content.frequency, content.weekdays, content.monthdays, content.yeardays,
                                           content.interval, content.start, content.end,
                                           content.extendedProps.category, content.extendedProps.refBlockId,
                                           content.extendedProps.content, content.extendedProps.status);
            //console.log(newSchedule);
            await fetchSyncPost("/api/block/appendBlock", {
                "data": JSON.stringify(newSchedule),
                "dataType": "markdown",
                "parentID": this.getDocumentIdByName1(newSchedule.category, documents)
            }).then(response => {

            })
        }
    }

    getDocumentIdByName1(name: string, documents: any[]) : string {
        for(let doc of documents) {
            if(doc.name === name) {
                return doc.id;
            }
        }
    }
}