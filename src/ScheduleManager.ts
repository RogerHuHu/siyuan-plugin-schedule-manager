import { i18n } from "./utils/utils";

import { createApp } from "vue";
import naive from "naive-ui";
import App from "./App.vue";

import { fetchPost, fetchSyncPost } from "siyuan";
import EventAggregator from "./utils/EventAggregator";

export class ScheduleManager {
    app : any;
    private noteBookId : string;
    private docId : string;
    private documents: any[];
    
    // 构造函数
    constructor() {
        this.listenEvents();
    }

    show(el: HTMLElement) : void {
        this.app = createApp(App);
        this.app.use(naive);
    }

    mount(el: HTMLElement) : void {
        this.app.mount(el);
        this.readScheduleCategory();
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
       
        EventAggregator.emit('initScheduleCategory', this.documents);
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
                "parentID": this.getDocumentIdByName(p.extendedProps.category)
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
                "custom-version": "1.0.0"
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
        let query = "SELECT id FROM blocks WHERE content like \'%" + schedule.id + "%\' AND parent_id =\'" + this.getDocumentIdByName(schedule.extendedProps.category) + "\'";
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
            "parentID": this.getDocumentIdByName(schedule.new.extendedProps.category)
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
}