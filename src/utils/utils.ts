import PluginScheduleManager from ".";
import { Schedules } from "../Schedules";
import { reactive } from "vue"

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

export const globalData = reactive({
    schedules: Schedules
})