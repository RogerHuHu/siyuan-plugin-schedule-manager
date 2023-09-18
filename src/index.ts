import { Plugin, getFrontend, IModel, openTab } from "siyuan";
import { setI18n, setPlugin } from "./utils";
//import { showCalendar } from "./showcalendarview";
//import { ScheduleManager } from "./schedule-manager";
import { ScheduleManager } from "./ScheduleManager";

import "./index.scss";

const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";

export default class PluginScheduleManager extends Plugin {
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
