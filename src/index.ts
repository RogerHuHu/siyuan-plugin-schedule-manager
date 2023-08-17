import { Plugin, getFrontend } from "siyuan";
import { setI18n, setPlugin } from "./utils";
import { showCalendar } from "./showcalendarview";

import "./index.scss";

const STORAGE_NAME = "menu-config";

export default class PluginScheduleManager extends Plugin {
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
                    showCalendar();
                } else {
                    let rect = topBarElement.getBoundingClientRect();
                    // 如果被隐藏，则使用更多按钮
                    if (rect.width === 0) {
                        rect = document.querySelector("#barMore").getBoundingClientRect();
                    }
                    if (rect.width === 0) {
                        rect = document.querySelector("#barPlugins").getBoundingClientRect();
                    }
                    showCalendar();
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
}
