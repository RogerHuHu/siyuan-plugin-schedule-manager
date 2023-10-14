import PluginScheduleManager from "../index";
import { ScheduleCategories } from "../ScheduleCategories";
import { ScheduleManager } from "../ScheduleManager";

// i18n 全局实例
export let i18n: any;
export function setI18n(_i18n: any) {
    i18n = _i18n;
}

export let plugin: PluginScheduleManager;
export function setPlugin(_plugin: any) {
    plugin = _plugin;
}

let isScheduleManagerLoaded: boolean = false;
export function getScheduleManagerLoaded(): boolean {
    return isScheduleManagerLoaded;
}

export function setScheduleManagerLoaded(isLoaded: boolean) {
    isScheduleManagerLoaded = isLoaded;
}

export async function mountScheduleManager(sm: ScheduleManager, el: HTMLElement) {
    sm.mount(el);
}

export const globalData = {
    scheduleCategories: new ScheduleCategories(),
    scheduleStatusLogo: ['☕', '🏃‍♂️', '✅', '📦']
}

export enum smColor {
    TODO_COLOR = "#61C1F4",
    DOING_COLOR = "#F8E496",
    DONE_COLOR = "#96F896",
    ARCHIVE_COLOR = "#C1C4C1",
}

export let fcApi: any;
export function setFCApi(_fcApi: any) {
    fcApi = _fcApi;
}