<template>
  <n-loading-bar-provider>
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <n-grid x-gap="5" :cols="4">
            <n-gi>
              <scheduleCategory/>
            </n-gi>
            <n-gi span="3">
              <calendar/>
            </n-gi>
          </n-grid>
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-loading-bar-provider>
</template>

<script>
  import { defineComponent, ref } from "vue";
  import ScheduleCategory from "./components/ScheduleCategory.vue";
  import Calendar from "./components/Calendar.vue";

  export default defineComponent({
    components: {
      ScheduleCategory,
      Calendar
    }
  });
</script>