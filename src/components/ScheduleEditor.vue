<template>
  <n-modal v-model:show="showEditModal">
    <n-card style="width: 280px; border-radius: 10px" :bordered="false" size="small" aria-modal="true">
      <n-grid :cols="4" y-gap="2">
        <n-gi :span="1" style="display: flex; justify-content:right;">
          <div class="sm-schedule-item-header">{{ scheduleCategoryText }}</div>
        </n-gi>
        <n-gi :span="3">
          <n-select v-model:value="selectedCategory" size="tiny" label-field="name" value-field="name"
            :options="globalData.scheduleCategories.categories" />
        </n-gi>
  
        <n-gi :span="1" style="display: flex; justify-content:right;">
          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ scheduleNameText }}</div>
        </n-gi>
        <n-gi :span="3">
          <n-input v-model:value="scheduleName" size="small" type="text" v-model:placeholder="inputScheduleNameText" />
        </n-gi>

        <n-gi :span="1" style="display: flex; justify-content:right;">
          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ recurringText }}</div>
        </n-gi>
        <n-gi :span="3">
          <n-switch v-model:value="isRecurringSchedule" size="small"/>
        </n-gi>

        <!--周期性日程参数-->
        <n-gi :span="1" style="display: flex; justify-content:right;" v-if="isRecurringSchedule">
          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ cycleText }}</div>
        </n-gi>
        <n-gi :span="3" v-if="isRecurringSchedule">
          <n-select v-model:value="selectedFreq" size="tiny" :options="freqs" />
        </n-gi>
        <n-gi :span="4" v-if="isRecurringSchedule">
          <n-select v-model:value="selectedWeekday" multiple :options="weekdays" size="tiny" :disabled="selectedFreq != 'weekly'"/>
        </n-gi>

        <n-gi :span="1" style="display: flex; justify-content:right;" v-if="isRecurringSchedule">
          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ intervalText }}</div>
        </n-gi>
        <n-gi :span="3" v-if="isRecurringSchedule">
          <n-input-number v-model:value="scheduleInterval" size="small"/>
        </n-gi>

        <n-gi :span="1" style="display: flex; justify-content:right;" v-if="isRecurringSchedule">
          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ startTimeText }}</div>
        </n-gi>
        <n-gi :span="3" v-if="isRecurringSchedule">
          <n-date-picker v-model:value="startTime" size="small" type="datetime" format="yyy-MM-dd HH:mm" clearable />
        </n-gi>

        <n-gi :span="1" style="display: flex; justify-content:right;" v-if="isRecurringSchedule">
          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ endTimeText }}</div>
        </n-gi>
        <n-gi :span="3" v-if="isRecurringSchedule">
          <n-date-picker v-model:value="endTime" size="small" type="datetime" format="yyy-MM-dd" clearable />
        </n-gi>

        <!--非周期性日程参数-->
        <n-gi :span="1" style="display: flex; justify-content:right;" v-if="!isRecurringSchedule">
          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ startTimeText }}</div>
        </n-gi>
        <n-gi :span="3" v-if="!isRecurringSchedule">
          <n-date-picker v-model:value="startTime" size="small" type="datetime" format="yyy-MM-dd HH:mm" clearable />
        </n-gi>

        <n-gi :span="1" style="display: flex; justify-content:right;" v-if="!isRecurringSchedule">
          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ endTimeText }}</div>
        </n-gi>
        <n-gi :span="3" v-if="!isRecurringSchedule">
          <n-date-picker v-model:value="endTime" size="small" type="datetime" format="yyy-MM-dd HH:mm" clearable />
        </n-gi>

        <n-gi :span="1" style="display: flex; justify-content:right;">
          <div class="sm-schedule-item-header" style="margin-top: 3.5px;">{{ scheduleContentText }}</div>
        </n-gi>
        <n-gi :span="2">
          <n-input v-model:value="scheduleContentBlockId" type="text" placeholder="" size="small" />
        </n-gi>
        <n-gi>
          <n-button quaternary circle size="small" @click="handleJumpToBlock()">
              <template #icon>
                <n-icon :component="ArrowRightOutlined" color="#18a058" />
              </template>
            </n-button>
        </n-gi>
        <n-gi :offset="1" :span="3">
          <n-input v-model:value="scheduleContent" type="textarea" placeholder="" :autosize="{ maxRows: 7 }" size="small" />
        </n-gi>

        <n-gi :span="1" style="display: flex; justify-content:right;">
          <div class="sm-schedule-item-header">{{ statusText }}</div>
        </n-gi>
        <n-gi :span="3">
          <n-select v-model:value="selectedScheduleStatus" size="tiny" :options="scheduleStatusList" />
        </n-gi>
        <n-gi :span="4">
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
  import { DeleteOutlined, EditOutlined, CheckOutlined, ClearOutlined, ArrowRightOutlined } from '@vicons/antd'
  import EventAggregator from "../utils/EventAggregator";
  import * as moment from "moment";
  import { format, parseISO, getTime } from 'date-fns';
  import { showMessage } from "siyuan";
  import { Schedule } from "../Schedule";

export default defineComponent({
  components: {
    
  },

  setup() {
    return {
      DeleteOutlined,
      EditOutlined,
      CheckOutlined,
      ClearOutlined,
      ArrowRightOutlined,
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
      recurringText: i18n.recurring,
      cycleText: i18n.cycle,
      intervalText: i18n.interval,
      onlyAllowNumberText: i18n.onlyAllowNumber,
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
      scheduleContentBlockId: ref(null),
      scheduleContent: ref(null),
      selectedScheduleStatus: ref(null),
      isRecurringSchedule: ref(null),
      scheduleInterval: ref(1),
      selectedWeekday: ref([]),
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
      freqs: [
        {
          value: 'daily',
          label: i18n.day
        },
        {
          value: 'weekly',
          label: i18n.week
        },
        {
          value: 'monthly',
          label: i18n.month
        },
        {
          value: 'yearly',
          label: i18n.year
        }
      ],
      weekdays: [
        {
          value: 'mo',
          label: i18n.monday
        },
        {
          value: 'tu',
          label: i18n.tuesday
        },
        {
          value: 'we',
          label: i18n.wednesday
        },
        {
          value: 'th',
          label: i18n.thursday
        },
        {
          value: 'fr',
          label: i18n.friday
        },
        {
          value: 'sa',
          label: i18n.saturday
        },
        {
          value: 'su',
          label: i18n.sunday
        }
      ],
      selectedFreq: ref(null),
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
      if(param.extendedProps.rrule === undefined) {
        this.updateScheduleInternal(param.id, param.extendedProps.category, param.title.substring(param.title.indexOf(' ') + 1),
                                    false, '', [], 1,
                                    param.startStr, param.endStr, param.extendedProps.refBlockId, param.extendedProps.content,
                                    param.extendedProps.status);
      } else {
        this.updateScheduleInternal(param.id, param.extendedProps.category, param.title.substring(param.title.indexOf(' ') + 1),
                                    true, param.extendedProps.rrule.freq, param.extendedProps.rrule.byweekday, param.extendedProps.rrule.interval,
                                    param.extendedProps.rrule.dtstart, param.extendedProps.rrule.until, param.extendedProps.refBlockId,
                                    param.extendedProps.content, param.extendedProps.status);
      }
      
    },

    updateScheduleKanban(cindex, sindex) {
      this.cindex = cindex;
      this.sindex = sindex;
      let schedule = this.globalData.scheduleCategories.categories[cindex].schedules[sindex];
      this.updateScheduleInternal(schedule.id, schedule.category, schedule.title,
                                  schedule.isRecurringSchedule, schedule.frequency, schedule.weekdays, schedule.interval,
                                  schedule.start, schedule.end,
                                  schedule.refBlockId, schedule.content, schedule.status);
    },

    updateScheduleInternal(id, category, title,
                           isRecurringSchedule, frequency, weekdays, interval,
                           startTime, endTime, refBlockId, content, status) {
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
      this.scheduleContentBlockId = refBlockId;
      this.scheduleContent = content;
      this.selectedScheduleStatus = status;

      this.category = this.globalData.scheduleCategories.getCategoryByName(this.selectedCategory);
      //this.scheduleStartTime = format(this.startTime, 'yyyy-MM-dd HH:mm:ss');
      //this.scheduleEndTime = format(this.endTime, 'yyyy-MM-dd HH:mm:ss'),
      this.scheduleStatus = this.scheduleStatusList[this.selectedScheduleStatus - 1].label;
      
      this.isRecurringSchedule = isRecurringSchedule;
      this.selectedFreq = frequency;
      this.selectedWeekday = weekdays;
      this.scheduleInterval = interval;

      this.selectedSchedule = new Schedule(id, '', isRecurringSchedule, frequency, weekdays, interval, '', '', category, '', '', 1);

      this.showEditModal = true;
    },

    handleSubmitSchedule() {
        this.showEditModal = false;
        if(this.startTime >= this.endTime) {
          showMessage(i18n.scheduleRangeError, 6000, "error");
        } else {
          if(this.isDeleteButtonVisible === false) {
            // 提交新日程
            let schedule = this.createNewSchedule();
            this.globalData.scheduleCategories.addSchedule(schedule);
            EventAggregator.emit('addSchedule', schedule);
          } else {
            // 更新已有日程
            let oldCategory = this.selectedSchedule.category;
            let schedule = this.createUpdateSchedule();
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

      createNewSchedule() {
        return this.createSchedule(new Date().getTime().toString());
      },

      createUpdateSchedule() {
        return this.createSchedule(this.selectedSchedule.id);
      },

      createSchedule(id) {
        let start = "", end = "";
        
        if(this.isRecurringSchedule) {
          start = format(this.startTime, "yyyy-MM-dd'T'HH:mm:ss");
          end = format(this.endTime, 'yyyy-MM-dd');
        } else {
          start = format(this.startTime, 'yyyy-MM-dd HH:mm:ss');
          end = format(this.endTime, 'yyyy-MM-dd HH:mm:ss');
        }
        
        let newSchedule = new Schedule(id, this.scheduleName,
                            this.isRecurringSchedule, this.selectedFreq, this.selectedWeekday, this.scheduleInterval,
                            start, end,
                            this.selectedCategory, this.scheduleContentBlockId, this.scheduleContent, this.selectedScheduleStatus
                           );
        if(this.selectedScheduleStatus == 3)
          newSchedule.setDoneTime(moment().valueOf());
        return newSchedule;
      },

      clearEventInfo() {
        this.selectedCategory = "";
        this.startTime = null;
        this.endTime = null;
        this.scheduleName = null;
        this.scheduleContent = null;
        this.selectedScheduleStatus = null;
      },

      handleJumpToBlock() {
        this.showEditModal = false;
        if(this.scheduleContentBlockId !== null && this.scheduleContentBlockId !== undefined) {
          EventAggregator.emit('openBlockFloatLayer', this.scheduleContentBlockId);
        }
      }
  }
})
</script>