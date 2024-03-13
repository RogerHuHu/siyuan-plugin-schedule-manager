[English](https://github.com/RogerHuHu/siyuan-plugin-schedule-manager/blob/main/README.md)

# 日程管理

## 本次更新
1. 在周、月、日视图中，支持滑动选择时间
2. 添加农历显示

<b><font color="#4096ff">最近事情比较多，先更新比较简单的功能吧，正在研究实现跨平台日程提醒，目前的思路是通过iCal、CalDav、Google Calendar等连接第三方日历应用（比如可以连接手机自带日历），将日程添加到这些日历应用中，不知道大家有没有更好的想法，可以在链滴上发帖子讨论，或者到github上提issue</font></b>

## 简介
日程管理插件通过日历的形式管理待办事项，目前支持月、周、日、列表多种视图。

日历以标签页的方式显示，首次启动时，会自动在文档树中创建**日程管理笔记本**。

<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/schedule_manager_notebook.png" alt="">

 >- **介意的谨慎使用！！！**
 >- **请勿删除该笔记本，由于刚接触vue、typescript等，未做很多异常处理，删除可能会带来不必要的麻烦！！！**

日程状态图标：☕ 待完成、🏃‍♂️ 进行中、✅ 已完成、📦 归档

## 功能
### 1. 添加日程分类
<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/add_schedule_category.png" alt="">

点击添加日程分类按钮，会弹出日程分类信息编辑窗口，可以自定义日程分类名和对应颜色。

添加日程分类时，会在**日程管理笔记本**下创建对应名字的文档。

### 2. 删除日程分类
点击日程分类最后的删除按钮，可以删除对应日程分类，以及**日程管理笔记本**下的对应文档。

### 3. 日程分类选定
点击日程分类名前的勾选框，可以选择是否显示当前分类下的所有日程，勾选状态会保存到文档中。

>- **操作需谨慎**，删除日程分类会删除对应的所有日程，且不可恢复

### 4. 添加日程
双击某个日历格，会弹出日程添加界面，可以自定义日程分类、日程起止时间、日程名、日程内容和日程的状态。其中的刷子图标用于清空当前信息。

添加日程时，会在相应名字的文档中创建一条记录，**不要编辑！！！**

<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/add_schedule.png" alt="">

### 5. 更新日程
单击某个日程，会弹出更新日程的界面，可以修改日程的各种信息。同时修改对应文档中记录的信息。

<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/update_schedule.png" alt="">

### 6. 删除日程
在上述日程更新界面，点击删除日程按钮，会删除当前日程，以及对应文档中的记录，**不可恢复**。

### 7. 重复性日程
在日程信息编辑界面，通过重复滑块可以设置当前日程是否为重复日程，支持：
- 按天重复，在选定日期范围内，按设定的间隔（按天间隔）自动生成重复性日程
- 按周重复，在选定日期范围内，按选定的“周一、周二、......、周日”，自动生成重复性日程
- 按月重复，在选定日期范围内，按设定的间隔（按月间隔）自动生成重复性日程，**会在一个月中的每一天都生成一个日程**
- 按年重复，在选定日期范围内，按设定的间隔（按年间隔）自动生成重复性日程，**会在一年中的每一天都生成一个日程**

### 8.全天日程
在日程信息编辑界面，通过全天滑块可以设置当前日程是否为全天日程，设置为全天日程后，会自动剔除时分秒信息。

### 9. 日程信息编辑界面
1. 点击确定、更新、删除日程或取消按钮时，界面会消失，并且会清空上次填写的信息。
2. 点击空白处，界面会消失，会保留上次填写的信息（防止误操作）。
3. 红框处可以填写块ID（**只能填写块的ID文本**），点击箭头会打开窗口，显示对应块的内容。
   
<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/blockId.png" alt="">

### 10. 任务看板界面
1. 实现了比较简陋的任务看板界面。
2. 不支持日程的新增、拖拽。
3. 支持日程信息的更新。
   
<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/kanban.png" alt="">

### 11. 一键归档（移动至设置标签页）
点击归档按钮后，从日程设置为已完成的时间计算，按界面上设置的时间选择符合要求的日程进行归档
> 如设置的时间为7日，则将已完成7日及以上的日程归档
> 在更新该功能前处于已完成状态的日程，由于无已完成的时间，会全部归档

<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/oneclick_archive.png" alt="">

### 12.日程分类隐藏
点击箭头按钮后，可以隐藏左侧的日程分类视图，对小屏幕更友好
<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/schedule_category_collapse.png" alt="">

### 13.设置一周开始时间
在设置界面新增一周从周日还是周一开始的设置（设置完成后需要重新打开本插件）
<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/set_firstdayofweek.png" alt="">

## Todo
- [x] 界面语言、文档国际化
- [ ] 日程的拖拽
- [ ] 文档中日程记录显示样式优化
- [x] 任务看板界面
- [ ] 适配移动端
- [x] 根据日程分类筛选加载的日程
- [ ] 通过iCal、CalDav、Google Calendar等连接第三方日历，实现跨平台日程提醒

## FAQ

## 鸣谢
感谢如下框架对本项目的支持（排名不分先后）
- Vue3
- Naive UI
- FullCalendar

## 捐赠
开发不易，如果你喜欢本插件，欢迎给作者发电。

<img src="https://raw.gitmirror.com/RogerHuHu/siyuan-plugin-schedule-manager/master/asset/code.png" alt="" width="653" height="360" align="center">

## 更新日志
[CHANGELOG](https://github.com/RogerHuHu/siyuan-plugin-schedule-manager/blob/main/CHANGELOG.md)