import { Calendar } from '@fullcalendar/core'
import FullCalendar from "@fullcalendar/vue";
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'

export function showCalendar() {
   /*
    const calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth'
   });
   */

   let calendarEl: HTMLElement = document.getElementById('calendar')!;

   let calendar = new Calendar(calendarEl, {
       plugins: [dayGridPlugin],
       initialView: 'dayGridMonth'
   });

   calendar.render();
}