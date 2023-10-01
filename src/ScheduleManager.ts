import { createApp, initCustomFormatter } from "vue";
import naive from "naive-ui";
import App from "./App.vue";

import { fetchPost, fetchSyncPost } from "siyuan";
import EventAggregator from "./utils/EventAggregator";
import { Schedules } from "./Schedules";
import { Schedule } from "./Schedule";
import { globalData } from "./utils/utils";

export class ScheduleManager {
    app : any;
    private noteBookId : string;
    private docId : string;
    private documents: any[];
    
    // 构造函数
    constructor() {
        this.listenEvents();
        globalData.schedules = new Schedules();
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
        await this.getSchedules();
       
        globalData.schedules.init(this.documents);
        EventAggregator.emit('initScheduleCategory');
    }

    listenEvents() : void {
        EventAggregator.on('addCategorty', (p) => {
            this.createDocument(this.noteBookId, p);
        });

        EventAggregator.on('deleteCategorty', (p) => {
            this.deleteDocument(this.noteBookId, this.getDocumentIdByName(p.name));
        });

        EventAggregator.on('addSchedule', (p) => {
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
    }

    createDocument(notebookId: string, docProp: any) : void {
        fetchPost("/api/filetree/createDocWithMd", {
            "notebook": notebookId,
            "path": "/" + docProp.name,
            "markdown": ""
        }, (response) => {
            let docId = response.data;
            this.setDocumentProperty(docId, docProp.checked, docProp.color);

            let document = {
                id: docId,
                name: docProp.name,
                checked: docProp.checked,
                color: docProp.color,
                schedules: []
            };
            this.documents.push(document);
        });
    }

    deleteDocument(notebookId: string, docId: string) : void {
        fetchPost("/api/filetree/removeDoc", {
            "notebook": notebookId,
            "path": "/" + docId + ".sy",
        }, (response) => {
        });
    }

    setDocumentProperty(docId: string, checked: boolean, color: string) : void {
        fetchPost("/api/attr/setBlockAttrs", {
            "id": docId,
            "attrs": {
                "custom-checked": checked ? "true" : "false",
                "custom-color": color,
                "custom-version": "1.1.0"
            }
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
                    schedules: []
                }
                this.documents.push(document);
            }
        });
    }

    async getDocumentsName() {
        for(let doc of this.documents) {
            await fetchSyncPost("/api/attr/getBlockAttrs", {"id":doc.id}).then(response => {
                doc.name = response.data.title;
                doc.checked = response.data["custom-checked"] === "true" ? true : false;
                doc.color = response.data["custom-color"];
            })
        }
    }

    async getSchedules() {
        //console.log("**************getSchedules***************");
        for(let doc of this.documents) {
            let query = "SELECT content FROM blocks WHERE parent_id =\'" + doc.id + "\'";
            //console.log(query);
            await fetchSyncPost("/api/query/sql", {"stmt":query}).then(response => {
                //console.log(response);
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
            //console.log(doc);
            if(doc.version === "1.0.0") {
                //console.log("version 1.0.0");
                await this.updateSchedules1(doc.id, documents);
                this.setDocumentProperty1(doc.id, doc.checked, doc.color);
            }
        }
    }

    async getDocuments1(): Promise<any[]> {
        let documents = [];
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
                "custom-version": "1.1.0"
            }
        }, (response) => {
            
        });
    }

    async updateSchedules1(docId: string, documents: any[]) {
        let query = "SELECT content FROM blocks WHERE parent_id =\'" + docId + "\'";
        let schedules = [];
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

            let newSchedule = new Schedule(content.id, content.title, content.start, content.end, content.backgroundColor,
                                           content.borderColor, content.extendedProps.category, content.extendedProps.content,
                                           content.extendedProps.status);
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