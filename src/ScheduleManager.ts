import { i18n } from "./utils";

import { createApp } from "vue";
import naive from "naive-ui";
import App from "./App.vue";

export class ScheduleManager {
    app : any;
    
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
    }
}