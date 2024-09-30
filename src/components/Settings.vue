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
      <n-gi :span="6">
        <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ showArchivedScheduleText }}</div>
      </n-gi>
      <n-gi>
        <n-switch v-model:value="isShowArchivedSchedule" @update:value="handleUpdateShowArchivedSchedule"/>
      </n-gi>
      <n-gi :span="8">
        <n-divider />
      </n-gi>
      <n-gi>
        <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ firstDayOfWeekText }}</div>
      </n-gi>
      <n-gi :span="6">
        <n-select v-model:value="selectedDay" size="tiny" :options="firstDaysOfWeek" />
      </n-gi>
      <n-gi>
        <n-button quaternary circle size="small" @click="handleUpdateFirstDayOfWeek()">
          <template #icon>
            <n-icon :component="CheckOutlined" color="#18a058" />
          </template>
        </n-button>
      </n-gi>
      <n-gi :span="8">
        <n-divider />
      </n-gi>
      <n-gi :span="6">
        <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ showLunarCalendarText }}</div>
      </n-gi>
      <n-gi>
        <n-switch v-model:value="isShowLunarCalendar" @update:value="handleUpdateShowLunarCalendar"/>
      </n-gi>
      <n-gi :span="2">
        <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ selectLocaleText }}</div>
      </n-gi>
      <n-gi :span="5">
        <n-select :options="localeOptions" size="tiny" v-model:value="selectedLocale" />
      </n-gi>
      <n-gi>
        <n-button quaternary circle size="small" @click="handleUpdateLocale()">
          <template #icon>
            <n-icon :component="CheckOutlined" color="#18a058" />
          </template>
        </n-button>
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
      firstDayOfWeekText: i18n.firstDayOfWeek,
      dayText: i18n.day,
      archiveText: i18n.archive,
      showArchivedScheduleText: i18n.showArchivedSchedule,
      showLunarCalendarText: i18n.showLunarCalendar,
      selectLocaleText: i18n.selectLocale,
      archiveTime: ref(7),
      selectedDay: ref(1),
      selectedLocale: ref("zh-cn"),

      firstDaysOfWeek: [
        {
          value: 0,
          label: i18n.sunday
        },
        {
          value: 1,
          label: i18n.monday
        }
      ],

      localeOptions: [
        {
          label: "简体中文",
          value: "zh-cn"
        },
        {
          label: "English(US)",
          value: "en-us"
        }
      ],
      
      isShowArchivedSchedule: ref(true),
      isShowLunarCalendar: ref(true)
    };  
  },

  data() {
    return {
      globalData
    }
  },

  mounted() {
    this.archiveTime = globalData.schedConfig.archiveTime;
    this.isShowArchivedSchedule = globalData.schedConfig.showArchivedSchedule;
    this.isShowLunarCalendar = globalData.schedConfig.showLunarCalendar;
    this.selectedLocale = globalData.schedConfig.userLocale;
  },

  methods: {
    handleUpdate() {
      EventAggregator.emit('updateArchiveTime', this.archiveTime);
      showMessage(i18n.hasUpdated, 6000, "info");
    },

    handleUpdateFirstDayOfWeek() {
      EventAggregator.emit('updateFirstDayOfWeek', this.selectedDay);
      showMessage(i18n.hasUpdated, 6000, "info");
    },

    handleArchive() {
      this.globalData.scheduleCategories.archiveSchedules(this.archiveTime);
    },

    handleUpdateShowArchivedSchedule() {
      EventAggregator.emit('updateShowArchivedSchedule', this.isShowArchivedSchedule);
      showMessage(i18n.hasUpdated, 6000, "info");
    },

    handleUpdateShowLunarCalendar() {
      EventAggregator.emit('updateShowLunarCalendar', this.isShowLunarCalendar);
      showMessage(i18n.hasUpdated, 6000, "info");
    },
    handleUpdateLocale() {
      EventAggregator.emit('updateLocale', this.selectedLocale);
      showMessage(i18n.hasUpdated, 6000, "info");
    },
  }
})
</script>