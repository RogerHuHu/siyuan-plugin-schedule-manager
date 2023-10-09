<template>
  <n-card>
    <FullCalendar :options="calendarOptions" ref="fullCalendar"/>
  </n-card>

  <n-modal
    v-model:show="showModal"
    preset="dialog"
    v-model:title="addScheduleText"
    style="width:600px"
    :closable="modalClosable"
    :showIcon="modalShowIcon"
  >
    <n-grid :cols="4" y-gap="5">
      <n-gi>
        <div>{{ selectScheduleCategoryText }}</div>
      </n-gi>
      <n-gi :span="3">
        <n-select v-model:value="selectedCategory" label-field="name" value-field="name"
                  :options="globalData.scheduleCategories.categories" @update:value="handleUpdateSelectedCategory" />
      </n-gi>

      <n-gi>
        <div>{{ selectScheduleRangeText }}</div>
      </n-gi>
      <n-gi :span="3">
        <n-date-picker v-model:value="scheduleRange" type="datetimerange" clearable />
      </n-gi>

      <n-gi>
        <div>{{ scheduleNameText }}</div>
      </n-gi>
      <n-gi :span="3">
        <n-input v-model:value="scheduleName" type="text" v-model:placeholder="inputScheduleNameText" />
      </n-gi>

      <n-gi>
        <div>{{ scheduleContentText }}</div>
      </n-gi>
      <n-gi :span="3">
        <n-input
          v-model:value="scheduleContent"
          type="textarea"
          placeholder=""
        />
      </n-gi>

      <n-gi>
        <div>{{ statusText }}</div>
      </n-gi>
      <n-gi :span="3">
        <n-radio-group v-model:value="selectedScheduleStatus" name="radiogroup">
          <n-space>
            <n-radio v-for="scheduleStatus in scheduleStatusList" :key="scheduleStatus.value" :value="scheduleStatus.value">
              {{ scheduleStatus.label }}
            </n-radio>
          </n-space>
        </n-radio-group>
      </n-gi>

      <n-gi :span="4">
        <n-space justify="end">
          <n-button type="info" @click="handleCancelClick">
            {{ cancelText }}
          </n-button>
          <n-button type="error" v-if="isUpdateButtonVisible" @click="handleDeleteClick">
            {{ removeScheduleText }}
          </n-button>
          <n-button type="success" v-if="isUpdateButtonVisible" @click="handleUpdateClick">
            {{ updateText }}
          </n-button>
          <n-button type="success" v-if="isSubmitButtonVisible" @click="handleSubmitClick">
            {{ confirmText }}
          </n-button>
        </n-space>
      </n-gi>
    </n-grid>             
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
  .n-card {
    border-radius: 10px;
  }
</style>

<style lang="scss">
  .fc .fc-toolbar.fc-header-toolbar {
    //background-color: #D0FBE1;
    margin-bottom: 0px;
  }

  .fc .fc-button-primary {
    background-color: #daf0e4;
    border: none;
    color: #2a2a2a;
  }

  .fc .fc-button-group > .fc-button:hover {
    background-color: #42C7AB;
    border: none;
    color: #2a2a2a;
  }

  .fc .fc-button-primary:disabled {
    background-color: #daf0e4;
    border: none;
    color: #2a2a2a;
  }

  .fc .fc-button-primary:not(:disabled).fc-button-active {
    background-color: #42C7AB;
    border: none;
    color: #2a2a2a;
  }
</style>

<script>
  import { i18n, globalData, smColor, setFCApi } from "../utils/utils";
  import { defineComponent, ref } from 'vue';
  import { CalendarOptions, EventApi, DateSelectArg, EventClickArg } from '@fullcalendar/core';
  import FullCalendar from "@fullcalendar/vue3";
  import interactionPlugin from '@fullcalendar/interaction';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import timeGridPlugin from '@fullcalendar/timegrid';
  import listPlugin from '@fullcalendar/list';

  import * as moment from "moment";
  import EventAggregator from "../utils/EventAggregator";
  import { format, parseISO, getTime } from 'date-fns';
  import { showMessage } from "siyuan";
  import { Schedule } from "../Schedule";

  export default defineComponent({
    components: {
      FullCalendar
    },

    setup() {
      return {
        addScheduleText: i18n.addSchedule,
        selectScheduleCategoryText: i18n.selectScheduleCategory,
        selectScheduleRangeText: i18n.selectScheduleRange,
        scheduleNameText: i18n.scheduleName,
        inputScheduleNameText: i18n.inputScheduleName,
        scheduleContentText: i18n.scheduleContent,
        statusText: i18n.status,
        cancelText: i18n.cancel,
        removeScheduleText: i18n.removeSchedule,
        updateText: i18n.update,
        confirmText: i18n.confirm,
        confirmRemoveScheduleText: i18n.confirmRemoveSchedule,
        selectedDate: "",
        modalClosable: false,
        modalShowIcon: false,
        isUpdateButtonVisible: false,
        isSubmitButtonVisible: true,
        selectedCategoryColor: ref(null),
        selectedCategory: ref(null),
        scheduleRange: ref(null),
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
        showModal: false,
        showDeleteScheduleConfirmModal: false,
        calendarCategories: [],

        calendarOptions: {
          plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin],
          initialView: 'dayGridMonth', // 默认为哪个视图（月： dayGridMonth，周：timeGridWeek，日：timeGridDay）
          firstDay: 1, // 设置一周中显示的第一天是哪天，周日是 0，周一是 1， 类推
          locale: 'zh-cn', // 切换语言，当前为中文
          eventColor: '#3BB2E3', // 全部日历日程背景色
          initialDate: moment().format('YYYY-MM-DD'), // 自定义设置背景颜色时，一定要初始化日期时间
          //aspectRatio: 1.65, // 设置日历单元格宽度与高度的比例
          //eventLimit: true, // 设置月日程，与 all-day slot 的最大显示数量，超过的通过弹窗显示
          
          headerToolbar: { // 日历头部按钮的位置
            left: 'prevYear,prev,next,nextYear today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          },
          buttonText: {
            today: i18n.today,
            month: i18n.month,
            week: i18n.week,
            day: i18n.day,
            list: i18n.list
          },
          slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false // 设置时间为24小时
          },
          
          // 事件
          select: this.handleDateSelect, // 选中日历格事件
          eventClick: this.handleEventClick, // 点击日历日程事件
          //eventsSet: this.handleEvents,
          //eventDrop: this.eventDrop, // 拖动日历日程事件
          //eventResize: this.eventResize, // 修改日历日程大小事件
          //eventDidMount: this.eventDidMount, // 安装提示事件
          // loading: this.loadingEvent, // 视图数据加载中、加载完成触发（用于配合显示/隐藏加载指示器。）
          // selectAllow: this.selectAllow, //编程控制用户可以选择的地方，返回true则表示可选择，false表示不可选择
          //eventMouseEnter: this.eventMouseEnter, // 鼠标滑过
          editable: true, // 是否可以进行（拖动、缩放）修改
          eventStartEditable: false, // Event日程开始时间可以改变，默认true，如果是false其实就是指日程块不能随意拖动，只能上下拉伸改变他的endTime
          eventDurationEditable: false, // Event日程的开始结束时间距离是否可以改变，默认true，如果是false则表示开始结束时间范围不能拉伸，只能拖拽
          selectable: true, // 是否可以选中日历格
          selectMirror: true,
          selectMinDistance: 0, // 选中日历格的最小距离
          dayMaxEvents: true,
          weekends: true,
          navLinks: true, // 天链接
          slotEventOverlap: false // 相同时间段的多个日程视觉上是否允许重叠，默认true允许
        }
      }
    },

    mounted() {
      setFCApi(this.$refs.fullCalendar.getApi());
      EventAggregator.emit('readCategories');
      /*
      for(let category of this.globalData.schedules.categories) {
        for(let schedule of category.schedules) {
          let newEvent = this.createEventStartEnd(
            schedule.id, schedule.title, schedule.start, schedule.end,
            schedule.backgroundColor, schedule.category,
            schedule.content, schedule.status);
            this.$refs.fullCalendar.getApi().addEvent(newEvent);
        }
      }
      */
    },

    methods: {
      handleUpdateSelectedCategory(value, option) {
        //this.selectedCategory = option;
      },

      handleCancelClick() {
        this.showModal = false;
        this.clearEventInfo();
      },

      handleDeleteClick() {
        this.showModal = false;
        this.showDeleteScheduleConfirmModal = true;
      },

      submitDeleteSchedule() {
        let event = this.selectedEvent;
        this.selectedEvent.remove();
        let schedule = new Schedule(event.id, event.title, event.start, event.end,
                                    event.extendedProps.category, event.extendedProps.content,
                                    event.extendedProps.status);
        this.globalData.scheduleCategories.removeSchedule(schedule);
        EventAggregator.emit('deleteSchedule', schedule);
        this.clearEventInfo();
      },

      handleSubmitClick() {
        this.showModal = false;
        if(this.scheduleRange[0] == this.scheduleRange[1]) {
          showMessage(i18n.scheduleRangeError, 6000, "error");
        } else {
          if(this.selectedCategory == null) {
            //this.selectedCategory = this.findSelectedCategoryByColor(this.globalData.schedules.categories, 
            //                                                         this.selectedCategoryColor);
          }

          /*
          let newEvent = this.createEventRange(new Date().getTime().toString(), this.scheduleName,
                                               this.scheduleRange, this.selectedCategoryColor,
                                               this.selectedCategory.name, this.scheduleContent,
                                               this.selectedScheduleStatus);
          this.$refs.fullCalendar.getApi().addEvent(newEvent);
          

          let schedule = new Schedule(newEvent.id, newEvent.title, newEvent.start, newEvent.end,
                                      newEvent.backgroundColor, newEvent.borderColor,
                                      newEvent.extendedProps.category, newEvent.extendedProps.content,
                                      newEvent.extendedProps.status)
          */

          let schedule = new Schedule(
            new Date().getTime().toString(), this.scheduleName,
            format(this.scheduleRange[0], 'yyyy-MM-dd') + ' ' + format(this.scheduleRange[0], 'HH:mm:ss'),
            format(this.scheduleRange[1], 'yyyy-MM-dd') + ' ' + format(this.scheduleRange[1], 'HH:mm:ss'),
            this.selectedCategory, this.scheduleContent, this.selectedScheduleStatus
          );
          this.globalData.scheduleCategories.addSchedule(schedule);
          EventAggregator.emit('addSchedule', schedule);
          this.clearEventInfo();
        }
      }, 

      handleUpdateClick() {
        this.showModal = false;

        if(this.scheduleRange[0] == this.scheduleRange[1]) {
          showMessage(i18n.scheduleRangeError, 6000, "error");
        } else {
          let oldCategory = this.selectedEvent.extendedProps.category;
          this.selectedEvent.remove();
          /*
          this.selectedEvent.setProp("title", this.scheduleName);
          let tmp = this.findSelectedCategoryByColor(this.globalData.schedules.categories, this.selectedCategoryColor);
          this.selectedEvent.setExtendedProp("category", tmp.name);
          this.selectedEvent.setExtendedProp("content", this.scheduleContent);
          this.selectedEvent.setExtendedProp("status", this.selectedScheduleStatus);
          this.selectedEvent.setDates(new Date(this.scheduleRange[0]), new Date(this.scheduleRange[1]));
          */

          /*
          let newEvent = this.createEventRange(this.selectedEvent.id, this.scheduleName,
                                               this.scheduleRange, this.selectedCategoryColor,
                                               tmp.name, this.scheduleContent,
                                               this.selectedScheduleStatus);
          
          let schedule = new Schedule(newEvent.id, newEvent.title, newEvent.start, newEvent.end,
                           newEvent.backgroundColor, newEvent.borderColor,
                           newEvent.extendedProps.category, newEvent.extendedProps.content,
                           newEvent.extendedProps.status);
          */
          let schedule = new Schedule(
            this.selectedEvent.id, this.scheduleName,
            format(this.scheduleRange[0], 'yyyy-MM-dd') + ' ' + format(this.scheduleRange[0], 'HH:mm:ss'),
            format(this.scheduleRange[1], 'yyyy-MM-dd') + ' ' + format(this.scheduleRange[1], 'HH:mm:ss'),
            this.selectedCategory, this.scheduleContent, this.selectedScheduleStatus
          );

          this.globalData.scheduleCategories.updateSchedule(oldCategory, schedule);
          EventAggregator.emit('updateSchedule', {
            old: oldCategory,
            new: schedule });
          this.clearEventInfo();
        }
      },

      handleWeekendsToggle() {
        this.calendarOptions.weekends = !this.calendarOptions.weekends // update a property
      },

      handleDateSelect(selectInfo) {
        if(this.selectedDate !== "" && this.selectedDate === selectInfo.startStr) {
          this.selectedDate = "";
          this.isUpdateButtonVisible = false;
          this.isSubmitButtonVisible = true;
          this.showModal = true;
        } else {
          this.selectedDate = selectInfo.startStr;
        }
      },

      handleEventClick(clickInfo) {
        this.isUpdateButtonVisible = true;
        this.isSubmitButtonVisible = false;
        //this.selectedCategoryColor = clickInfo.event.backgroundColor;
        this.selectedCategory = clickInfo.event.extendedProps.category;
        this.scheduleName = clickInfo.event.title.substring(clickInfo.event.title.indexOf(' ') + 1);
        if(this.scheduleRange == null) {
          this.scheduleRange = [Date.now(), Date.now() + 1];
        }
        let date = parseISO(clickInfo.event.startStr);
        this.scheduleRange[0] = getTime(date);
        date = parseISO(clickInfo.event.endStr);
        this.scheduleRange[1] = getTime(date);
        this.scheduleContent = clickInfo.event.extendedProps.content;
        this.selectedScheduleStatus = clickInfo.event.extendedProps.status;
        this.selectedEvent = clickInfo.event;
        this.showModal = true;
      },

      handleEvents(events) {
        this.currentEvents = events
      },

      createEventRange(eventId, name, range, color, eventCategory, eventContent, eventStatus) {
         let newEvent = this.createEventStartEnd(eventId, name,
                                                 format(range[0], 'yyyy-MM-dd') + ' ' + format(range[0], 'HH:mm:ss'),
                                                 format(range[1], 'yyyy-MM-dd') + ' ' + format(range[1], 'HH:mm:ss'),
                                                 color, eventCategory, eventContent, eventStatus);
          return newEvent;
      },

      createEventStartEnd(eventId, name, eventStart, eventEnd, color, eventCategory, eventContent, eventStatus) {
        let newEvent = {
            id: eventId,
            title: this.getEventName(name, eventStatus),
            start: eventStart,
            end: eventEnd,
            backgroundColor: color,
            borderColor: color,
            display: 'block',
            extendedProps: {
              category: eventCategory,
              content: eventContent,
              status: eventStatus // 日程状态
            }
          };
          return newEvent;
      },

      clearEventInfo() {
        this.selectedCategoryColor = "";
        this.scheduleRange = null;
        this.scheduleName = null;
        this.scheduleContent = null;
        this.selectedScheduleStatus = null;
      },

      findSelectedCategoryByColor(categories, color) {
        return categories.find(u => u.color === color);
      },

      getEventName(name, status) {
        let result = "";
        switch(status) {
          case 1:
            result = '☕ ' + name;
            break;
          case 2:
            result = '🏃‍♂️ ' + name;
            break;
          case 3:
            result = '✅ ' + name;
            break;
          case 4:
            result = '📦 ' + name;
            break;
          default:
            result = name;
            break;
        }
        return result;
      }
    }
  });
</script>