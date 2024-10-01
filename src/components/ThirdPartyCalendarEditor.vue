<template>
    <n-modal v-model:show="showEditModal">
      <n-card style="width: 320px; border-radius: 10px" :bordered="false" size="small" aria-modal="true">
        <n-grid :cols="4" y-gap="2">
          <n-gi :span="4" style="display: flex; justify-content:center;">
            <div class="sm-schedule-item-header">{{ calendarType }}</div>
          </n-gi>

          <n-gi :span="1" style="display: flex; justify-content:left;">
            <div class="sm-schedule-item-header">{{ calendarNameText }}</div>
            </n-gi>
          <n-gi :span="3">
            <n-input v-model:value="calendarName" size="small" type="text" />
          </n-gi>

          <n-gi :span="1" style="display: flex; justify-content:left;">
            <div class="sm-schedule-item-header">url</div>
            </n-gi>
          <n-gi :span="3">
            <n-input v-model:value="calendarUrl" size="small" type="text" />
          </n-gi>

          <n-gi :span="1" style="display: flex; justify-content:left;">
            <div class="sm-schedule-item-header">{{ usernameText }}</div>
            </n-gi>
          <n-gi :span="3">
            <n-input v-model:value="username" size="small" type="text" />
          </n-gi>

          <n-gi :span="1" style="display: flex; justify-content:left;">
            <div class="sm-schedule-item-header">{{ passwordText }}</div>
            </n-gi>
          <n-gi :span="3">
            <n-input v-model:value="password" size="small" type="text" />
          </n-gi>

          <n-gi :span="1" style="display: flex; justify-content:left;">
            <div class="sm-schedule-item-header">{{ rangeText }}</div>
            </n-gi>
          <n-gi :span="3">
            <div class="sm-schedule-item-body">{{ last3MonthText }}</div>
          </n-gi>
          <n-gi :span="4">
            <n-space justify="end" size="small">
              <n-button quaternary circle size="small" @click="handleSubmitCalendar()">
                <template #icon>
                  <n-icon :component="CheckOutlined" color="#18a058" />
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
      v-model:content="confirmRemoveCalendarText"
      style="width:600px"
      :closable="modalClosable"
      v-model:positive-text="confirmText"
      v-model:negative-text="cancelText"
      @positive-click="submitDeleteCalendar"
    />
  </template>
  
  <style scoped lang="scss">
  :deep(.n-input .n-input__border, .n-input .n-input__state-border) {
    border-radius: 0px;
    border: none;
    padding: 0px;
  }
  
  .sm-schedule-item-header {
    font-size: 14px;
    font-weight: bold;
    margin-right: 5px;
  }

  .sm-schedule-item-body {
    font-size: 14px;
    font-weight: normal;
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

        calendarNameText: i18n.calendarName,
        usernameText: i18n.username,
        passwordText: i18n.password,
        rangeText: i18n.range,
        last3MonthText: i18n.last3Month,
        cancelText: i18n.cancel,
        confirmText: i18n.confirm,
        confirmRemoveCalendarText: i18n.confirmRemoveCalendar,

        modalClosable: false,

        calendarName: ref(""),
        calendarType: ref(""),
        imgPath: ref(""),
        calendarUrl: ref(""),
        username: ref(""),
        password: ref(""),
      };
    },
  
    data() {
        return {
            globalData,
            showEditModal: false,
            isDeleteButtonVisible: false,
            showDeleteScheduleConfirmModal: false,
            inNewCalendarMode: true,
            currentCalendarIndex: 0
        }
      },
  
    methods: {
      newCalendar(calendarType, imgPath) {
        this.calendarType = calendarType;
        this.imgPath = imgPath;
        this.showEditModal = true;
        this.inNewCalendarMode = true;
      },

      editCalendar(index) {
        this.calendarName = globalData.schedConfig.tpCalendars[index].name;
        this.calendarUrl = globalData.schedConfig.tpCalendars[index].url;
        this.username = globalData.schedConfig.tpCalendars[index].username;
        this.password = globalData.schedConfig.tpCalendars[index].password;
        this.showEditModal = true;
        this.inNewCalendarMode = false;
        this.currentCalendarIndex = index;
      },

      deleteCalendar(index) {
        this.showDeleteScheduleConfirmModal = true;
        this.currentCalendarIndex = index;
      },

      handleSubmitCalendar() {
        this.showEditModal = false;

        let tpCalendar = {
            name: this.calendarName,
            img: this.imgPath,
            url: this.calendarUrl,
            realUrl: "https://" + this.calendarUrl + "/.well-known/caldav",
            username: this.username,
            password: this.password
        };

        if(this.inNewCalendarMode) {
          EventAggregator.emit('addThirdPartyCalendar', tpCalendar);
        } else {
          EventAggregator.emit('updateThirdPartyCalendar', {
            index: this.currentCalendarIndex,
            tpCal: tpCalendar
          });
        }
        this.inNewCalendarMode = false;
        showMessage(i18n.hasUpdated, 6000, "info");
      },

      submitDeleteCalendar() {
        EventAggregator.emit('deleteThirdPartyCalendar', this.currentCalendarIndex);
        this.showDeleteScheduleConfirmModal = false;
        this.clearCalendarInfo();
      },
        
      clearCalendarInfo() {
        this.calendarName = "";
        this.calendarUrl = "";
        this.username = "";
        this.password = "";
      },
  
      updateScheduleInternal(id, category, title, isAllDay,
                             isRecurringSchedule, calendarType, frequency, weekdays, monthdays, yeardays, interval,
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
        this.endTime = isAllDay === true ? getTime(date) - 86400000 : getTime(date);
        this.scheduleContentBlockId = refBlockId;
        this.scheduleContent = content;
        this.selectedScheduleStatus = status;
  
        this.category = this.globalData.scheduleCategories.getCategoryByName(this.selectedCategory);
        this.scheduleStatus = this.scheduleStatusList[this.selectedScheduleStatus - 1].label;
        
        this.isAllDaySchedule = isAllDay;
        this.isRecurringSchedule = isRecurringSchedule;
        this.selectedFreq = frequency;
        this.selectedWeekday = weekdays;
        this.selectedMonthday = monthdays;
        this.selectedYearday = yeardays;
        this.scheduleInterval = interval;
        
        this.selectedSchedule = new Schedule(id, '', isAllDay, isRecurringSchedule, calendarType, frequency, weekdays, monthdays, yeardays, interval, '', '', category, '', '', 1);
  
        this.showEditModal = true;
      },
  
      createSchedule(id) {
          let start = "", end = "";
  
          if(this.isAllDaySchedule) {
            start = format(this.startTime, "yyyy-MM-dd");
            end = format(this.endTime + 86400000, 'yyyy-MM-dd');
          } else {
            start = format(this.startTime, "yyyy-MM-dd'T'HH:mm:ss");
            end = format(this.endTime, "yyyy-MM-dd'T'HH:mm:ss");
          }
  
          if(this.selectedFreq === 'weekly') {
            this.selectedMonthday = [];
            this.selectedYearday = [];
          }
          else if(this.selectedFreq === 'monthly') {
            this.selectedWeekday = [];
            this.selectedYearday = [];
          }
          else if(this.selectedFreq === 'yearly') {
            this.selectedMonthday = [];
            this.selectedWeekday = [];
          }
  
          let newSchedule = new Schedule(id, this.scheduleName, this.isAllDaySchedule,
                              this.isRecurringSchedule, this.calendarTypeCheckedValue, this.selectedFreq, this.selectedWeekday, this.selectedMonthday, this.selectedYearday,
                              this.scheduleInterval, start, end,
                              this.selectedCategory, this.scheduleContentBlockId, this.scheduleContent, this.selectedScheduleStatus
                             );
          if(this.selectedScheduleStatus == 3)
            newSchedule.setDoneTime(moment().valueOf());
          return newSchedule;
        }
    }
  })
  </script>