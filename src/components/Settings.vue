<template>
  <n-card style="border-radius: 10px;" size="small">
    <n-grid :cols="8" x-gap="5" y-gap="5">
      <n-gi>
        <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ archiveTimeText }}</div>
      </n-gi>
      <n-gi :span="7">
        <n-space>
          <n-input-number v-model:value="archiveTime" size="small"/>
          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ dayText }}</div>
          <n-button quaternary circle size="small" @click="handleUpdate()">
            <template #icon>
              <n-icon :component="CheckOutlined" color="#18a058" />
            </template>
          </n-button>
          <n-button strong secondary round type="info" @click="handleArchive()">
            {{ archiveText }}
          </n-button>
        </n-space>
      </n-gi>
      <n-gi :span="8">
        <n-divider />
      </n-gi>
    </n-grid>
  </n-card>
</template>

<style scoped lang="scss">
.sm-schedule-item-header {
  font-size: 14px;
  font-weight: bold;
}
</style>

<script>
  import { defineComponent, ref } from 'vue';
  import { i18n, globalData } from "../utils/utils";
  import { CheckOutlined } from '@vicons/antd'
  import EventAggregator from "../utils/EventAggregator";
  import { showMessage } from "siyuan";

export default defineComponent({
  components: {
    
  },

  setup() {
    return {
      CheckOutlined,
      archiveTimeText: i18n.archiveTime,
      dayText: i18n.day,
      archiveText: i18n.archive,
      archiveTime: ref(7),
    };
  },

  data() {
    return {
      globalData
    }
  },

  mounted() {
    this.archiveTime = globalData.archiveTime;
  },

  methods: {
    handleUpdate() {
      EventAggregator.emit('updateArchiveTime', this.archiveTime);
      showMessage(i18n.hasUpdated, 6000, "info");
    },

    handleArchive() {
      this.globalData.scheduleCategories.archiveSchedules(this.archiveTime);
    },
  }
})
</script>