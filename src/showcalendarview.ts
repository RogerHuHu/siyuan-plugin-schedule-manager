import { Calendar } from '@fullcalendar/core'
import FullCalendar from "@fullcalendar/vue";
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'

export function showCalendar() {
   console.log("show calendar");

   let calendarDiv = document.createElement('div');

   let calendar = new Calendar(calendarDiv, {
       plugins: [dayGridPlugin],
       initialView: 'dayGridMonth'
   });
   
   calendar.render();
}