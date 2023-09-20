<template>
  <n-loading-bar-provider>
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <div class="schedule-app-container">
            <div class="schedule-app-sidebar">
              <demo ref="scheduleCategoryRef"/>      
            </div>
            <div class="schedule-app-main">
              <FullCalendar :options="calendarOptions" ref="FullCalendar"/>
              <n-modal
                v-model:show="showModal"
                preset="dialog"
                title="新建日程"
                positive-text="确认"
                negative-text="算了"
                @positive-click="submitCallback"
                @negative-click="cancelCallback"
                style="width:600px"
              >
                <n-grid :cols="4" y-gap="5">
                  <n-gi>
                    <div>选择日程分类</div>
                  </n-gi>
                  <n-gi :span="3">
                    <n-select v-model:value="selectedCategory" :options="calendarCategories" />
                  </n-gi>

                  <n-gi>
                    <div>选择日程时间</div>
                  </n-gi>
                  <n-gi :span="3">
                    <n-date-picker v-model:value="scheduleRange" type="datetimerange" clearable />
                  </n-gi>

                  <n-gi>
                    <div>日程名</div>
                  </n-gi>
                  <n-gi :span="3">
                    <n-input v-model:value="scheduleName" type="text" placeholder="基本的 Input" />
                  </n-gi>

                  <n-gi>
                    <div>日程内容</div>
                  </n-gi>
                  <n-gi :span="3">
                    <n-input
                      v-model:value="scheduleContent"
                      type="textarea"
                      placeholder="基本的 Textarea"
                    />
                  </n-gi>

                  <n-gi>
                    <div>状态</div>
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
                    <n-button type="error" :disabled="isDeleteButtonDisabled">
                      删除日程
                    </n-button>
                  </n-gi>
                </n-grid>             
              </n-modal>
            </div>
          </div>
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-loading-bar-provider>
</template>

<style lang='scss'>
h2 {
  margin: 0;
  font-size: 16px;
}

ul {
  margin: 0;
  padding: 0 0 0 1.5em;
}

li {
  margin: 1.5em 0;
  padding: 0;
}

b { /* used for event dates/times */
  margin-right: 3px;
}

.schedule-app {
  min-height: 100%;
}

.schedule-app-container {
  min-height: 100%;
  width: 100%;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
  display: flex;
  margin: 5px;
}

.schedule-app-sidebar {
  flex: 1;
  height: 100%;
}

.schedule-app-main {
  flex: 3;
  padding: 1em;
}

.schedule-app-modal {
  flex: 1;
}

.fc { /* the calendar root */
  max-width: 1100px;
  margin: 0 auto;
}
</style>

<script>
import { i18n } from "./utils";
import { defineComponent, ref } from "vue";
import Demo from "./ScheduleCategory.vue";

import { CalendarOptions, EventApi, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import FullCalendar from "@fullcalendar/vue3";
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import { createElement } from '@fullcalendar/core/preact';

import * as moment from "moment";
import EventAggregator from "./EventAggregator";
import { format, parseISO, getTime } from 'date-fns';

export default defineComponent({
  components: {
    Demo,
    FullCalendar
  },

  setup() {
    return {
      selectedDate: "",
      isDeleteButtonDisabled: true,
      selectedCategory: ref(null),
      scheduleRange: ref(null),
      scheduleName: ref(null),
      scheduleContent: ref(null),
      selectedScheduleStatus: ref(null),
      scheduleStatusList: [
        {
          value: 1,
          label: "未开始"
        },
        {
          value: 2,
          label: '进行中'
        },
        {
          value: 3,
          label: '已完成'
        }
      ]
    }
  },

  data() {
    return {
      showModal: false,
      calendarCategories: [],

      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin],
        initialView: 'dayGridMonth', // 默认为哪个视图（月： dayGridMonth，周：timeGridWeek，日：timeGridDay）
        firstDay: 1, // 设置一周中显示的第一天是哪天，周日是 0，周一是 1， 类推
        locale: 'zh-cn', // 切换语言，当前为中文
        eventColor: '#3BB2E3', // 全部日历日程背景色
        themeSystem: 'bootstrap4', // 主题
        initialDate: moment().format('YYYY-MM-DD'), // 自定义设置背景颜色时，一定要初始化日期时间
        timeGridEventMinHeight: '20', // 设置事件的最小高度
        aspectRatio: 1.65, // 设置日历单元格宽度与高度的比例
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
        allowContextMenu: false,
        editable: true, // 是否可以进行（拖动、缩放）修改
        eventStartEditable: true, // Event日程开始时间可以改变，默认true，如果是false其实就是指日程块不能随意拖动，只能上下拉伸改变他的endTime
        eventDurationEditable: true, // Event日程的开始结束时间距离是否可以改变，默认true，如果是false则表示开始结束时间范围不能拉伸，只能拖拽
        selectable: true, // 是否可以选中日历格
        selectMirror: true,
        selectMinDistance: 0, // 选中日历格的最小距离
        dayMaxEvents: true,
        weekends: true,
        navLinks: true, // 天链接
        selectHelper: false,
        slotEventOverlap: false // 相同时间段的多个日程视觉上是否允许重叠，默认true允许
      },
    }
  },

  mounted() {
    EventAggregator.on('initScheduleCategory', scheduleCategories => {
      console.log(JSON.stringify(scheduleCategories));
      this.calendarCategories = [];
      for(let category of scheduleCategories) {
        let newValue = {
          label: category.name,
          value: category.color
        }
        this.calendarCategories.push(newValue);
      }
    });

    EventAggregator.on('addCategorty', (p) => {
      let newValue = {
          label: p.name,
          value: p.color
        }
      this.calendarCategories.push(newValue);
    });

    EventAggregator.on('deleteCategorty', (p) => {
      let index = 0;
      for(let category of this.calendarCategories) {
        if(category.label === p.name) {
          this.calendarCategories.splice(index, 1);
          this.selectedCategory = "";
          this.$forceUpdate();
          break;
        }
        index++;
      }
    });
  },

  methods: {
        submitCallback () {
          let newEvent = {
            id: moment(),
            title: this.scheduleName,
            start: format(this.scheduleRange[0], 'yyyy-MM-dd') + ' ' + format(this.scheduleRange[0], 'HH:mm:ss'),
            end: format(this.scheduleRange[1], 'yyyy-MM-dd') + ' ' + format(this.scheduleRange[1], 'HH:mm:ss'),
            // 修改背景颜色
            backgroundColor:this.selectedCategory,
            // 修改边框颜色
            borderColor:this.selectedCategory,
            extendedProps: {
              content: this.scheduleContent,
              status: this.selectedScheduleStatus // 日程状态
            }
          };
          this.$refs.FullCalendar.getApi().addEvent(newEvent);
        },

        cancelCallback () {
        },

        handleWeekendsToggle() {
          this.calendarOptions.weekends = !this.calendarOptions.weekends // update a property
        },

        handleDateSelect(selectInfo) {
          //let calendarApi = selectInfo.view.calendar
          //calendarApi.unselect() // clear date selection
          if(this.selectedDate !== "" && this.selectedDate === selectInfo.startStr) {
            this.selectedDate = "";
            this.isDeleteButtonDisabled = true;
            this.showModal = true;
          } else {
            this.selectedDate = selectInfo.startStr;
          }
        },

        handleEventClick(clickInfo) {
          this.isDeleteButtonDisabled = false;
          this.scheduleName = clickInfo.event.title;
          let date = parseISO(clickInfo.event.startStr);
          this.scheduleRange[0] = getTime(date);
          date = parseISO(clickInfo.event.endStr);
          this.scheduleRange[1] = getTime(date);
          this.scheduleContent = clickInfo.event.content;
          this.selectedScheduleStatus = clickInfo.event.extendedProps.status;
          this.showModal = true;
        },

        handleEvents(events) {
          this.currentEvents = events
        }
      }
});
</script>