<template>
  <n-config-provider :theme="selectedTheme" :theme-overrides="selectedTheme === lightTheme ? lightThemeOverrides : darkThemeOverrides">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-notification-provider>
          <n-dialog-provider>
            <n-tabs type="segment" animated style="margin-left:5px; margin-right:5px;">
              <n-tab-pane name="calendar" v-bind:tab="calendarText">
                <n-layout has-sider>
                  <n-layout-sider collapse-mode="width" :collapsed-width="20" :width="240" show-trigger="arrow-circle"
                    content-style="padding: 5px;" bordered :show-collapsed-content="false"
                    @update:collapsed="scheduleCategoryCollapseChanged">
                    <scheduleCategory />
                  </n-layout-sider>
                  <n-layout-content content-style="padding: 5px;">
                    <calendar />
                  </n-layout-content>
                </n-layout>
              </n-tab-pane>
              <n-tab-pane name="kanban" v-bind:tab="kanbanText">
                <kanban />
              </n-tab-pane>
              <n-tab-pane name="setting" v-bind:tab="settingText">
                <n-space justify="start">
                  <settings />
                </n-space>
              </n-tab-pane>
              <n-tab-pane name="thirdPartyCalendars" v-bind:tab="subscribeCalendarsText">
                <n-space justify="start">
                  <ThirdPartyCalendars />
                </n-space>
              </n-tab-pane>
            </n-tabs>
          </n-dialog-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<style lang="scss">
  .n-tabs .n-tabs-rail {
    width: 50%;
    margin-left: auto;
    margin-right: auto;
    margin-top: 5px;
  }

  .n-tabs .n-tabs-rail .n-tabs-tab-wrapper .n-tabs-tab {
    background-color: #ffffff;
  }

  .n-tabs .n-tabs-rail .n-tabs-tab-wrapper .n-tabs-tab.n-tabs-tab--active {
    background-color: var(--spsm-color-green11);
  }
</style>

<script>
  import { i18n, globalData } from "./utils/utils";
  import { defineComponent, ref } from "vue";
  import ScheduleCategory from "./components/ScheduleCategory.vue";
  import Calendar from "./components/Calendar.vue";
  import Kanban from "./components/Kanban.vue";
  import Settings from "./components/Settings.vue";
  import ThirdPartyCalendars from "./components/ThirdPartyCalendars.vue";
  import EventAggregator from "./utils/EventAggregator";
  import "./index.scss"
  import { darkTheme, lightTheme, NConfigProvider } from "naive-ui";

  const lightThemeOverrides = {
    common: {
      primaryColor: '#16a34a',
      primaryColorHover: '#15803d',
      primaryColorPressed: '#166534',
      primaryColorSuppl: '#bbf7d0'
    }
  };

  const darkThemeOverrides = {
    common: {
      primaryColor: '#86efac',
      primaryColorHover: '#4ade80',
      primaryColorPressed: '#22c55e',
      primaryColorSuppl: '#14532d'
    }
  };

  export default defineComponent({
    components: {
      ScheduleCategory,
      Calendar,
      Kanban,
      Settings,
      ThirdPartyCalendars
    },

    setup() {
      return {
        calendarText: i18n.calendar,
        kanbanText: i18n.kanban,
        settingText: i18n.setting,
        subscribeCalendarsText: i18n.subscribeCalendars,
        selectedTheme: globalData.schedConfig.themeMode === 'Light' ? lightTheme : darkTheme,
      }
    },

    methods: {
      scheduleCategoryCollapseChanged(value) {
        EventAggregator.emit("resize")
      }
    }
  });
</script>