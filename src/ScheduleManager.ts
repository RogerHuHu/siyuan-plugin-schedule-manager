import { i18n } from "./utils";

import { createApp } from "vue";
import naive from "naive-ui";
import App from "./App.vue";

import { fetchPost, fetchSyncPost } from "siyuan";
import EventAggregator from "./EventAggregator";

export class ScheduleManager {
    app : any;
    private noteBookId : string;
    private docId : string;
    private documents: any[];
    
    // 构造函数
    constructor() {
    }

    show(el: HTMLElement) : void {
        this.app = createApp(App);
        this.app.use(naive).use(i18n);
    }

    showCatagory(el: HTMLElement) {
        let categoryDiv = document.createElement('div');
        categoryDiv.setAttribute('style', "width:20%;float:left;height:100%;");
        el.appendChild(categoryDiv);

        let button:HTMLButtonElement = document.createElement('button');
        button.textContent = 'Catagory';
        button.setAttribute('class', "btn btn-green");
        categoryDiv.appendChild(button);
    }

    // 日期点击事件
    handleDateClick(selectInfo) {
        if(confirm('您是否要在【' + selectInfo.dateStr + '】添加一个新的事件？')) {
        }
    }

    mount(el: HTMLElement) : void {
        this.app.mount(el);
        this.readScheduleCategory();
        this.listenEvents();
    }

    updateNotebookId(id: string) : void {
        this.noteBookId = id;
    }

    updateDocId(id: string) : void {
        this.docId = id;
    }

    async readScheduleCategory() {
        /*
        fetchPost("/api/block/getChildBlocks", {"id":this.docId}, (response) => {
            for (let block of response.data) {
                let query = "SELECT content FROM blocks WHERE id =\'" + block.id + "\'";
                fetchPost("/api/query/sql", {"stmt":query}, (response) => {
                    let prop = response.data[0];
                    if(prop.content !== "") {
                        
                    }
                });
            }
        });
        */
        this.documents = [];
        await this.getDocuments(this.noteBookId);
        await this.getDocumentsName();
       
        EventAggregator.emit('initScheduleCategory', this.documents);
    }

    listenEvents() : void {
        EventAggregator.on('addCategorty', (p) => {
            /*
            fetchPost("/api/block/appendBlock", {
                "data": JSON.stringify(p),
                "dataType": "markdown",
                "parentID": this.docId
            }, (response) => {
                console.log(JSON.stringify(response));
            });
            */
            this.createDocument(this.noteBookId, p);
        });

        EventAggregator.on('deleteCategorty', (p) => {
            this.deleteDocument(this.noteBookId, this.getDocumentIdByName(p.name));
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
                color: docProp.color
            }
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
                "custom-color": color
            }
        }, (response) => {
            
        });
    }

    async getDocuments(notebookId: string) {
        let query = "SELECT root_id FROM blocks WHERE box =\'" + notebookId + "\'";
        console.log(query);
        await fetchSyncPost("/api/query/sql", {"stmt":query}).then(response => {
            console.log(JSON.stringify(response));
            let count = 0;
                for(let id of response.data) {
                    if(count == 1) {
                        count = 0;
                        continue;
                    }
                    let document = {
                        id: id.root_id,
                        name: "",
                        checked: "",
                        color: ""
                    }
                    this.documents.push(document);
                    count++;
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

    getDocumentIdByName(name: string) : string {
        for(let doc of this.documents) {
            if(doc.name === name) {
                return doc.id;
            }
        }
    }
}