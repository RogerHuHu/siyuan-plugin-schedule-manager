<template>
  <n-loading-bar-provider>
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <n-tabs type="line" animated justify-content="space-evenly">
            <n-tab-pane name="calendar" v-model:tab="calendarText">
              <n-grid x-gap="5" :cols="6">
                <n-gi>
                  <scheduleCategory/>
                </n-gi>
                <n-gi span="5">
                  <calendar/>
                </n-gi>
              </n-grid>
            </n-tab-pane>
            <n-tab-pane name="kanban" v-model:tab="kanbanText">
              <kanban/>
            </n-tab-pane>
          </n-tabs>
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-loading-bar-provider>
</template>

<style scoped lang="scss">
  .n-tabs {
    margin: 0px;
  }
</style>

<script>
import { i18n } from "./utils/utils";
  import { defineComponent, ref } from "vue";
  import ScheduleCategory from "./components/ScheduleCategory.vue";
  import Calendar from "./components/Calendar.vue";
  import Kanban from "./components/Kanban.vue";

  export default defineComponent({
    components: {
      ScheduleCategory,
      Calendar,
      Kanban
    },

    setup() {
      return {
        calendarText: i18n.calendar,
        kanbanText: i18n.kanban
      }
    }
  });
</script>