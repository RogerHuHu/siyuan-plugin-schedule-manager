import { Plugin, getFrontend, IModel, openTab, fetchPost } from "siyuan";
import { setI18n, setPlugin, getScheduleManagerLoaded, setScheduleManagerLoaded, mountScheduleManager } from "./utils/utils";
import { ScheduleManager } from "./ScheduleManager";

import "./index.scss";

const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";

export default class PluginScheduleManager extends Plugin {
    private isLoaded: boolean = false;
    private scheduleNotebookId: string = "";
    private scheduleDocId: string = "";
    private customTab: () => IModel;
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
                // Avoiding duplicate loading of schedules
                if(getScheduleManagerLoaded() == false) {
                    setScheduleManagerLoaded(true);
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
        // 获取笔记本列表
        fetchPost("/api/notebook/lsNotebooks", {}, (response) => {
            // 若笔记本不存在，则新建
            if(this.isNotebookExists(response.data.notebooks, this.i18n.scheduleManagerNotebook) == false) {
                this.createNotebook(this.i18n.scheduleManagerNotebook);
            }
            this.scheduleManager.updateNotebookId(this.scheduleNotebookId);
            this.scheduleManager.init();
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

    async showCalendar() {
        let scheduleManagerDiv = document.createElement('div');
        scheduleManagerDiv.setAttribute("class", "schedule-app");
        let sm = this.scheduleManager;
        await this.scheduleManager.show();
        this.customTab = this.addTab({
            type: TAB_TYPE,
            init() {
                this.element.appendChild(scheduleManagerDiv);
                mountScheduleManager(sm, scheduleManagerDiv);
            },

            beforeDestroy() {
                //console.log("before destroy tab:", TAB_TYPE);
            },

            destroy() {
                //console.log("destroy tab:", TAB_TYPE);
                setScheduleManagerLoaded(false);
            }
        });
        console.log("showCalendar2");

        const tab = openTab({
            app: this.app,
            custom: {
                icon: "iconCalendar",
                title: this.i18n.scheduleManager,
                data: {
                    text: "This is my custom tab",
                },
                id: this.name + TAB_TYPE
            },
        });

        //this.scheduleManager.mount(scheduleManagerDiv);
    }
}
