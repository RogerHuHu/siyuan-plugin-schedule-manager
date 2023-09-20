import { Plugin, getFrontend, IModel, openTab, fetchPost } from "siyuan";
import { setI18n, setPlugin } from "./utils";
//import { showCalendar } from "./showcalendarview";
//import { ScheduleManager } from "./schedule-manager";
import { ScheduleManager } from "./ScheduleManager";

import "./index.scss";

const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";

export default class PluginScheduleManager extends Plugin {
    private foundNotebook: boolean = false;
    private scheduleNotebookId: string = "";
    private scheduleDocId: string = "";
    private customTab: () => IModel;
    //private scheduleManager = new ScheduleManager(this.app, this.i18n);
    private scheduleManager = new ScheduleManager();

    public isMobile: boolean;

    onload() {
        this.data[STORAGE_NAME] = {readonlyText: "Readonly"};
        const frontend = getFrontend();
        this.isMobile = frontend === "mobile" || frontend === "browser-mobile";

        console.log("Schedule Manager onload");
        setI18n(this.i18n);
        setPlugin(this);
        this.scheduleNotebookInit();

        const topBarElement = this.addTopBar({
            icon: "iconCalendar",
            title: this.i18n.openCalendar,
            position: "right",
            callback: () => {
                if (this.isMobile) {
                    this.showCalendar();
                } else {
                    let rect = topBarElement.getBoundingClientRect();
                    // 如果被隐藏，则使用更多按钮
                    if (rect.width === 0) {
                        rect = document.querySelector("#barMore").getBoundingClientRect();
                    }
                    if (rect.width === 0) {
                        rect = document.querySelector("#barPlugins").getBoundingClientRect();
                    }
                    this.showCalendar();
                }
            }
        });

        const statusIconTemp = document.createElement("template");
        statusIconTemp.innerHTML = `<div class="toolbar__item b3-tooltips b3-tooltips__w" aria-label="Remove plugin-sample Data">
            <svg>
                <use xlink:href="#iconTrashcan"></use>
            </svg>
        </div>`;

        this.addStatusBar({
            element: statusIconTemp.content.firstElementChild as HTMLElement,
        });

        //监听块菜单事件
        //this.eventBus.on("click-blockicon", showCalendar);
    }

    onunload() {
        console.log("Schedule Manager unonload");
    }

    scheduleNotebookInit() {
        this.foundNotebook = false;
        // 获取笔记本列表
        fetchPost("/api/notebook/lsNotebooks", {}, (response) => {
            // 若笔记本不存在，则新建
            if(this.isNotebookExists(response.data.notebooks, "日程管理笔记本") == false) {
                this.createNotebook("日程管理笔记本");
            }
            this.scheduleManager.updateNotebookId(this.scheduleNotebookId);
            //this.createDocument(this.scheduleNotebookId, "/日程管理文档");  
        });
    }

    isNotebookExists(notebooks: any, name: string) :boolean {
        for (let notebook of notebooks) {
            if(notebook.name === name) {
                this.scheduleNotebookId = notebook.id;
                return true;
            }
        }
        return false;
    }

    createNotebook(name: string) {
        fetchPost("/api/notebook/createNotebook", {"name": name}, (response) => {
            this.scheduleNotebookId = response.data.notebook.id;
            this.scheduleManager.updateNotebookId(this.scheduleNotebookId);
        });
    }

    createDocument(notebookId: string, path: string) {
        fetchPost("/api/filetree/createDocWithMd", {
            "notebook": notebookId,
            "path": path,
            "markdown": ""
        }, (response) => {
            this.scheduleDocId = response.data;
            this.scheduleManager.updateDocId(this.scheduleDocId);
        });
    }

    showCalendar() {
        let scheduleManagerDiv = document.createElement('div');
        scheduleManagerDiv.setAttribute("class", "schedule-app");
        this.scheduleManager.show(scheduleManagerDiv);

        this.customTab = this.addTab({
            type: TAB_TYPE,
            init() {
                this.element.appendChild(scheduleManagerDiv);
                console.log(this.element);
            },

            beforeDestroy() {
                console.log("before destroy tab:", TAB_TYPE);
            },
            destroy() {
                console.log("destroy tab:", TAB_TYPE);
            }
        });

        const tab = openTab({
            app: this.app,
            custom: {
                icon: "iconCalendar",
                title: this.i18n.scheduleManager,
                data: {
                    text: "This is my custom tab",
                },
                fn: this.customTab
            },
        });

        console.log(tab);

        this.scheduleManager.mount(scheduleManagerDiv);
    }
}
