[中文](https://github.com/RogerHuHu/siyuan-plugin-schedule-manager/blob/main/README_zh_CN.md)

# Schedule Manager

<b><font color="#dd0000">Note: Upgrading from version "1.0. x" to version "1.1. x" may require reopening the plugin to update the format of the schedule records</font></b>

## Introduction
The schedule management plugin manages to-do items in the form of a calendar, and currently supports multiple views such as month, week, day, and list.

The calendar is displayed as a tab and automatically creates a **Schedule Manager Notebook** in the document tree when first launched.

[![pPog6L8.png](https://z1.ax1x.com/2023/09/22/pPog6L8.png)](https://imgse.com/i/pPog6L8)

 >- **Mind using with caution!!!**
 >- **Please do not remove the notebook. I'm new to Vue, Typescript, etc., and have not added enough exception handling, removing the notebook may cause unnecessary trouble !!!**

The icons of schedule statuses：☕ Todo, 🏃‍♂️ Doing, ✅ Done, 📦 Archive（**The archive function may be implemented in the next version.**）

## Function
### 1. Add Schedule Category
[![pPoggeS.png](https://z1.ax1x.com/2023/09/22/pPoggeS.png)](https://imgse.com/i/pPoggeS)

Clicking the add schedule category button to open the schedule category information editing window, where you can customize the schedule category name and corresponding color.

When you add a schedule category, a document with the corresponding name will be created under **Schedule Manager Notebook**.

### 2. Remove Schedule Category
Through clicking the remove button at the end of a schedule category, you can remove the corresponding schedule category, as well as the corresponding document under the **Schedule Manager Notebook**.

>- **Need to be careful**, removing a schedule category removes all the corresponding schedules and cannot be recovered.

### 3. Selection of Schedule Category
Click the checkbox in front of the schedule category name to choose whether to display all schedules under the current category. The check status will be saved in the document.

### 3. Add Schedule
Double-click a calendar grid to open a schedule adding window, where you can customize the category, time range, name, content and status of a schedule.

When adding a schedule, a record will be created in the corresponding document, **do not edit it!!!**.

[![pPogRoQ.png](https://z1.ax1x.com/2023/09/22/pPogRoQ.png)](https://imgse.com/i/pPogRoQ)

### 4. Update Schedule
Clicking on a certain schedule will open an update window, where you can modify the information of the schedule. Simultaneously, the information recoreded in the corresponding document will be modified.
[![pPog2dg.png](https://z1.ax1x.com/2023/09/22/pPog2dg.png)](https://imgse.com/i/pPog2dg)

### 5. Remove Schedule
Clicking the remove schedule button on the above-mentioned window will remove the current schedule, as well as the recored in the corresponding document, **it is non-recoverable**.

### 6. Schedule information Edit Window
1. When you click the OK, Update, Remove, or Cancel buttons, the window disappears and the last filled information will be cleared.
2. When you click on a blank space, the window disappear and will retain the last filled information (to prevent misuse).

### 7. Task kanban view
1. Implemented a relatively rudimentary task kanban.
2. Adding or dragging a schedule is not supported.
3. Support for editing schedule information.

## Todo
- [x] The internationalization of the interface language and the document
- [ ] Schedule drag & drop
- [ ] Optimization of the display style of schedule records in documents
- [x] Task kanban view
- [ ] Adaptation for mobile
- [x] Filter loaded schedules according to schedule categories

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