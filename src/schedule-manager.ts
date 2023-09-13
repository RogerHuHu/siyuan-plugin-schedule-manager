import { App, I18N } from 'siyuan';
import { Calendar } from '@fullcalendar/core'
import FullCalendar from "@fullcalendar/vue";
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import * as moment from "moment"

export class ScheduleManager {
    // 字段
    app: App;
    i18n: I18N;
    private calendar: Calendar;

    // 构造函数
    constructor(app: App, i18n: I18N) {
        this.app = app;
        this.i18n = i18n;
    }

    show(el: HTMLElement) : void {
        this.calendar = new Calendar(el, {
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
                today: this.i18n.today,
                month: this.i18n.month,
                week: this.i18n.week,
                day: this.i18n.day,
                list: this.i18n.list
            },
            slotLabelFormat: {
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false // 设置时间为24小时
            },
            
            /*
            events: [
                {
                  title: 'All Day Event',
                  start: '2023-09-01',
                },
                {
                  title: 'Long Event',
                  start: '2023-09-07',
                  end: '2023-09-10'
                },
                {
                  groupId: '999',
                  title: 'Repeating Event',
                  start: '2023-09-09T16:00:00'
                },
                {
                  groupId: '999',
                  title: 'Repeating Event',
                  start: '2023-09-16T16:00:00'
                },
                {
                  title: 'Conference',
                  start: '2023-09-11',
                  end: '2023-09-13'
                },
                {
                  title: 'Meeting',
                  start: '2023-09-12T10:30:00',
                  end: '2023-09-12T12:30:00'
                },
                {
                  title: 'Lunch',
                  start: '2023-09-12T12:00:00'
                },
                {
                  title: 'Meeting',
                  start: '2023-09-12T14:30:00'
                },
                {
                  title: 'Happy Hour',
                  start: '2023-09-12T17:30:00'
                },
                {
                  title: 'Dinner',
                  start: '2023-09-12T20:00:00'
                },
                {
                  title: 'Birthday Party',
                  start: '2023-09-13T07:00:00'
                },
                {
                  title: 'Click for Google',
                  url: 'http://google.com/',
                  start: '2023-09-28'
                }
              ],
              */

            // 事件
            dateClick: this.handleDateClick,
            // eventClick: this.handleEventClick, // 点击日历日程事件
            //eventDblClick: this.handleEventDblClick, // 双击日历日程事件 (这部分是在源码中添加的)
            //eventClickDelete: this.eventClickDelete, // 点击删除标签事件 (这部分是在源码中添加的)
            //eventDrop: this.eventDrop, // 拖动日历日程事件
            //eventResize: this.eventResize, // 修改日历日程大小事件
            //select: this.handleDateSelect, // 选中日历格事件
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
        });
    }

    render() {
        this.calendar.render();
    }

    // 日期点击事件
    handleDateClick(selectInfo) {
        if(confirm('您是否要在【' + selectInfo.dateStr + '】添加一个新的事件？')) {
        }
    }
}