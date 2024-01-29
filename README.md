[中文](https://github.com/RogerHuHu/siyuan-plugin-schedule-manager/blob/main/README_zh_CN.md)

# Schedule Manager

<b><font color="#dd0000">Note: Upgrading from version "1.0. x" to version "1.1. x" may require reopening the plugin to update the format of the schedule records</font></b>

## Introduction
The schedule management plugin manages to-do items in the form of a calendar, and currently supports multiple views such as month, week, day, and list.

The calendar is displayed as a tab and automatically creates a **Schedule Manager Notebook** in the document tree when first launched.

<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/schedule_manager_notebook.png" alt="">

 >- **Mind using with caution!!!**
 >- **Please do not remove the notebook. I'm new to Vue, Typescript, etc., and have not added enough exception handling, removing the notebook may cause unnecessary trouble !!!**

The icons of schedule statuses：☕ Todo, 🏃‍♂️ Doing, ✅ Done, 📦 Archive

## Function
### 1. Add Schedule Category
<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/add_schedule_category.png" alt="">

Clicking the add schedule category button to open the schedule category information editing window, where you can customize the schedule category name and corresponding color.

When you add a schedule category, a document with the corresponding name will be created under **Schedule Manager Notebook**.

### 2. Remove Schedule Category
Through clicking the remove button at the end of a schedule category, you can remove the corresponding schedule category, as well as the corresponding document under the **Schedule Manager Notebook**.

>- **Need to be careful**, removing a schedule category removes all the corresponding schedules and cannot be recovered.

### 3. Selection of Schedule Category
Click the checkbox in front of the schedule category name to choose whether to display all schedules under the current category. The check status will be saved in the document.

### 4. Add Schedule
Double-click a calendar grid to open a schedule adding window, where you can customize the category, time range, name, content and status of a schedule.

When adding a schedule, a record will be created in the corresponding document, **do not edit it!!!**.

<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/add_schedule.png" alt="">

### 5. Update Schedule
Clicking on a certain schedule will open an update window, where you can modify the information of the schedule. Simultaneously, the information recoreded in the corresponding document will be modified.
<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/update_schedule.png" alt="">

### 6. Remove Schedule
Clicking the remove schedule button on the above-mentioned window will remove the current schedule, as well as the recored in the corresponding document, **it is non-recoverable**.

### 7. Recurring schedules
In the schedule information editing interface, the repeating slider can be used to set whether the current schedule is a repeating schedule, it supports：
- Recurring by day, automatically generates recurring schedules at set intervals (daily intervals) within the selected date range
- Recurring by week, automatically generates a recurring schedule by selecting "Monday, Tuesday, ..., Sunday" within the selected date range
- Recurring by month, automatically generates a recurring schedule at the set interval (monthly interval) within the selected date range, **generates a schedule every day of the month**
- Recurring by year, automatically generates a recurring schedule at the set interval (yearly interval) within the selected date range, **generates a schedule every day of the year**

### 8.Whole day schedule
In the schedule information editing interface, the whole day slider can be used to set whether the current schedule is a whole day schedul, the time information will be automatically removed after being set to whole day schedule.

### 9. Schedule information Edit Window
1. When you click the OK, Update, Remove, or Cancel buttons, the window disappears and the last filled information will be cleared.
2. When you click on a blank space, the window disappear and will retain the last filled information (to prevent misuse).
3. You can fill in the block ID in the red box (* * only the ID text of the block can be filled in * *). Clicking the arrow will open a window, displaying the content of the corresponding block.
   
<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/blockId.png" alt="">

### 10. Task kanban view
1. Implemented a relatively rudimentary task kanban.
2. Adding or dragging a schedule is not supported.
3. Support for editing schedule information.

<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/kanban.png" alt="">

### 11. One-click archive (Moved to settings tab)
After clicking the archive button，calculate from the time when the schedule is set to completed, and select a schedule that meets the requirements according to the time set on the interface for archiving
> If the set time is 7 days, the completed schedule of 7 days or more will be archived
> The schedule that was in a completed state before the update of this feature will be fully archived as there is no completed time

<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/oneclick_archive.png" alt="">

### 12. Schedule category collapse
After clicking the arrow button, you can hide the schedule category view on the left, which is more friendly to small screens.
<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/schedule_category_collapse.png" alt="">

### 13. Set the first day of a week
Added a setting to select whether the week starts on Sunday or Monday in the settings interface (After the setting is completed, you need to re-open the plug-in.).
<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/set_firstdayofweek.png" alt="">

## Todo
- [x] The internationalization of the interface language and the document
- [ ] Schedule drag & drop
- [ ] Optimization of the display style of schedule records in documents
- [x] Task kanban view
- [ ] Adaptation for mobile
- [x] Filter loaded schedules according to schedule categories
- [ ] Connect third-party calendars through iCal, CalDav, Google Calendar, etc. to achieve cross platform schedule reminders

## FAQ

## Thanks
Thank you for the support of the following framework for this project (in no particular order)
- Vue3
- Naive UI
- FullCalendar

## By me a cup of coffee
<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/code.png" alt="" width="653" height="360" align="center">

## Changelog
[CHANGELOG](https://github.com/RogerHuHu/siyuan-plugin-schedule-manager/blob/main/CHANGELOG.md)