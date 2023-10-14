<template>
  <n-modal v-model:show="showEditModal">
    <n-card style="width: 280px; border-radius: 10px" :bordered="false" size="small" aria-modal="true">
      <n-grid :cols="8" y-gap="2">
        <n-gi :span="2" style="display: flex; justify-content:right;">
          <div class="sm-schedule-item-header">{{ scheduleCategoryText }}</div>
        </n-gi>
        <n-gi :span="6">
          <n-select v-model:value="selectedCategory" size="tiny" label-field="name" value-field="name"
            :options="globalData.scheduleCategories.categories" />
        </n-gi>
  
        <n-gi :span="2" style="display: flex; justify-content:right;">
          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ scheduleNameText }}</div>
        </n-gi>
        <n-gi :span="6">
          <n-input v-model:value="scheduleName" size="small" type="text" v-model:placeholder="inputScheduleNameText" />
        </n-gi>

        <n-gi :span="2" style="display: flex; justify-content:right;">
          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ startTimeText }}</div>
        </n-gi>
        <n-gi :span="6">
          <n-date-picker v-model:value="startTime" size="small" type="datetime" format="yyy-MM-dd HH:mm" clearable />
        </n-gi>

        <n-gi :span="2" style="display: flex; justify-content:right;">
          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ endTimeText }}</div>
        </n-gi>
        <n-gi :span="6">
          <n-date-picker v-model:value="endTime" size="small" type="datetime" format="yyy-MM-dd HH:mm" clearable />
        </n-gi>

        <n-gi :span="2" style="display: flex; justify-content:right;">
          <div class="sm-schedule-item-header" style="margin-top: 3.5px;">{{ scheduleContentText }}</div>
        </n-gi>
        <n-gi :span="6">
          <n-input v-model:value="scheduleContent" type="textarea" placeholder="" :autosize="{ maxRows: 7 }" size="small" />
        </n-gi>

        <n-gi :span="2" style="display: flex; justify-content:right;">
          <div class="sm-schedule-item-header">{{ statusText }}</div>
        </n-gi>
        <n-gi :span="6">
          <!--div style="font-size: 14px; margin-left: 10px;">{{ scheduleStatus }}</div-->
          <n-select v-model:value="selectedScheduleStatus" size="tiny" :options="scheduleStatusList" />
        </n-gi>
        <n-gi :span="8">
          <n-space justify="end" size="small">
            <n-button quaternary circle size="small" @click="handleSubmitSchedule()">
              <template #icon>
                <n-icon :component="CheckOutlined" color="#18a058" />
              </template>
            </n-button>
            <n-button quaternary circle size="small" @click="handleClearInfo()">
              <template #icon>
                <n-icon :component="ClearOutlined" color="#D60D0D" />
              </template>
            </n-button>
            <n-button quaternary circle size="small" v-if="isDeleteButtonVisible" @click="handleDeleteSchedule()">
              <template #icon>
                <n-icon :component="DeleteOutlined" color="#D60D0D" />
              </template>
            </n-button>
          </n-space>
        </n-gi>
      </n-grid>
    </n-card>
  </n-modal>

  <n-modal
    v-model:show="showDeleteScheduleConfirmModal"
    preset="dialog"
    type="warning"
    v-model:title="confirmText"
    v-model:content="confirmRemoveScheduleText"
    style="width:600px"
    :closable="modalClosable"
    v-model:positive-text="confirmText"
    v-model:negative-text="cancelText"
    @positive-click="submitDeleteSchedule"
  />
</template>

<style scoped lang="scss">
::v-deep .n-input .n-input__border, .n-input .n-input__state-border {
  border-radius: 0px;
  border: none;
  padding: 0px;
}

.sm-schedule-item-header {
  font-size: 14px;
  font-weight: bold;
  margin-right: 5px;
}
</style>

<script>
  import { defineComponent, ref } from 'vue';
  import { i18n, globalData, smColor, setFCApi } from "../utils/utils";
  import { DeleteOutlined, EditOutlined, CheckOutlined, ClearOutlined } from '@vicons/antd'
  import EventAggregator from "../utils/EventAggregator";
  import * as moment from "moment";
  import { format, parseISO, getTime } from 'date-fns';
  import { showMessage } from "siyuan";
  import { Schedule } from "../Schedule";

export default defineComponent({
  components: {
    DeleteOutlined,
    EditOutlined,
    CheckOutlined,
    ClearOutlined,
  },

  setup() {
    return {
      DeleteOutlined,
      EditOutlined,
      CheckOutlined,
      ClearOutlined,
      scheduleCategoryText: i18n.scheduleCategory,
      selectScheduleCategoryText: i18n.selectScheduleCategory,
      selectScheduleRangeText: i18n.selectScheduleRange,
      scheduleNameText: i18n.scheduleName,
      inputScheduleNameText: i18n.inputScheduleName,
      scheduleContentText: i18n.scheduleContent,
      statusText: i18n.status,
      cancelText: i18n.cancel,
      confirmText: i18n.confirm,
      confirmRemoveScheduleText: i18n.confirmRemoveSchedule,
      startTimeText: i18n.startTime,
      endTimeText: i18n.endTime,
      selectedDate: "",
      modalClosable: false,
      modalShowIcon: false,
      isDeleteButtonVisible: false,
      selectedCategory: ref(null),
      startTime: ref(null),
      endTime: ref(null),
      scheduleStartTime: ref(null),
      scheduleEndTime: ref(null),
      scheduleName: ref(null),
      scheduleContent: ref(null),
      selectedScheduleStatus: ref(null),
      scheduleStatusList: [
        {
          value: 1,
          label: '☕ ' + i18n.todo
        },
        {
          value: 2,
          label: '🏃‍♂️ ' + i18n.doing
        },
        {
          value: 3,
          label: '✅ ' + i18n.done
        },
        {
          value: 4,
          label: '📦 ' + i18n.archive
        }
      ],
      selectedEvent: null,
    };
  },

  data() {
      return {
        globalData,
        showEditModal: false,
        isDeleteButtonVisible: false,
        showDeleteScheduleConfirmModal: false
      }
    },

  methods: {
    newSchedule(param) {
      if(this.selectedDate !== "" && this.selectedDate === param.startStr) {
          this.selectedDate = "";
          this.selectedScheduleStatus = this.scheduleStatusList[0].value;
          this.isDeleteButtonVisible = false;
          this.showEditModal = true;
        } else {
          this.selectedDate = param.startStr;
        }
    },

    updateSchedule(param) {
      this.updateScheduleInternal(param.id, param.extendedProps.category, param.title.substring(param.title.indexOf(' ') + 1),
                                  param.startStr, param.endStr, param.extendedProps.content,
                                  param.extendedProps.status);
    },

    updateScheduleKanban(cindex, sindex) {
      this.cindex = cindex;
      this.sindex = sindex;
      let schedule = this.globalData.scheduleCategories.categories[cindex].schedules[sindex];
      this.updateScheduleInternal(schedule.id, schedule.category, schedule.title, schedule.start, schedule.end,
                                  schedule.content, schedule.status);
    },

    updateScheduleInternal(id, category, title, startTime, endTime, content, status) {
      this.isDeleteButtonVisible = true;
      this.selectedCategory = category;
      this.scheduleName = title;
      if (this.startTime == null)
        this.startTime = Date.now();

      if (this.endTime == null)
        this.endTime = this.startTime + 1;

      let date = parseISO(startTime);
      this.startTime = getTime(date);
      date = parseISO(endTime);
      this.endTime = getTime(date);
      this.scheduleContent = content;
      this.selectedScheduleStatus = status;

      this.category = this.globalData.scheduleCategories.getCategoryByName(this.selectedCategory);
      this.scheduleStartTime = format(this.startTime, 'yyyy-MM-dd HH:mm:ss');
      this.scheduleEndTime = format(this.endTime, 'yyyy-MM-dd HH:mm:ss'),
      this.scheduleStatus = this.scheduleStatusList[this.selectedScheduleStatus - 1].label;

      this.selectedSchedule = new Schedule(id, title, startTime, endTime, category, content, status);

      this.showEditModal = true;
    },

    handleSubmitSchedule() {
        this.showEditModal = false;
        if(this.startTime >= this.endTime) {
          showMessage(i18n.scheduleRangeError, 6000, "error");
        } else {
          if(this.isDeleteButtonVisible === false) {
            let schedule = new Schedule(
              new Date().getTime().toString(), this.scheduleName,
              format(this.startTime, 'yyyy-MM-dd HH:mm:ss'),
              format(this.endTime, 'yyyy-MM-dd HH:mm:ss'),
              this.selectedCategory, this.scheduleContent, this.selectedScheduleStatus
            );
            this.globalData.scheduleCategories.addSchedule(schedule);
            EventAggregator.emit('addSchedule', schedule);
          } else {
            let oldCategory = this.selectedSchedule.category;
            let schedule = new Schedule(
              this.selectedSchedule.id, this.scheduleName,
              format(this.startTime, 'yyyy-MM-dd HH:mm:ss'),
              format(this.endTime, 'yyyy-MM-dd HH:mm:ss'),
              this.selectedCategory, this.scheduleContent, this.selectedScheduleStatus
            );

            this.globalData.scheduleCategories.updateSchedule(oldCategory, schedule);
            EventAggregator.emit('updateSchedule', {
              old: oldCategory,
              new: schedule });
          }
          
          this.clearEventInfo();
        }
      },

      handleClearInfo() {
        this.clearEventInfo();
      },

      handleDeleteSchedule() {
        this.showEditModal = false;
        this.showDeleteScheduleConfirmModal = true;
      },

      submitDeleteSchedule() {
        this.globalData.scheduleCategories.removeSchedule(this.selectedSchedule);
        EventAggregator.emit('deleteSchedule', this.selectedSchedule);
        this.clearEventInfo();
      },

      clearEventInfo() {
        this.selectedCategory = "";
        this.startTime = null;
        this.endTime = null;
        this.scheduleName = null;
        this.scheduleContent = null;
        this.selectedScheduleStatus = null;
      },
  }
})
</script>