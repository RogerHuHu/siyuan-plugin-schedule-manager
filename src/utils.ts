import PluginScheduleManager from "."

// i18n 全局实例
export let i18n: any;
export function setI18n(_i18n: any) {
    i18n = _i18n;
}

export let plugin: PluginScheduleManager;
export function setPlugin(_plugin: any) {
    plugin = _plugin;
}