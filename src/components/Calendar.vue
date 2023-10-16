<template>
  <n-card style="border-radius: 10px;" size="small">
    <FullCalendar :options="calendarOptions" ref="fullCalendar"/>
  </n-card>

  <ScheduleEditor ref="scheduleEditor"/>
</template>

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
  import rrulePlugin from '@fullcalendar/rrule'

  import ScheduleEditor from "./ScheduleEditor.vue";

  import * as moment from "moment";
  import EventAggregator from "../utils/EventAggregator";

  export default defineComponent({
    components: {
      FullCalendar,
      ScheduleEditor
    },

    setup() {
      return {
      };
    },

    data() {
      return {
        globalData,
        
        calendarOptions: {
          plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin, rrulePlugin],
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
    },

    methods: {
      handleWeekendsToggle() {
        this.calendarOptions.weekends = !this.calendarOptions.weekends // update a property
      },

      handleDateSelect(selectInfo) {
        this.$refs.scheduleEditor.newSchedule(selectInfo);
      },

      handleEventClick(clickInfo) {
        this.$refs.scheduleEditor.updateSchedule(clickInfo.event);
      },

      handleEvents(events) {
        this.currentEvents = events
      },
    }
  });
</script>