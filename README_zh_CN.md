# 日程管理

## 简介
日程管理插件通过日历的形式管理待办事项，目前支持月、周、日、列表多种视图。

日历以标签页的方式显示，首次启动时，会自动在文档树中创建**日程管理笔记本**。

![](https://gitee.com/rogerhuhu/siyuan-plugin-schedule-manager/blob/main/asset/schedule_manager_notebook.png)

 >- **介意的谨慎使用！！！**
 >- **请勿删除该笔记本，由于刚接触vue、typescript等，未做很多异常处理，删除可能会带来不必要的麻烦！！！**

## 功能
### 1. 添加日程分类
![](https://gitee.com/rogerhuhu/siyuan-plugin-schedule-manager/blob/main/asset/add_schedule_category.png)

点击添加日程分类按钮，会弹出日程分类信息编辑窗口，可以自定义日程分类名和对应颜色。

添加日程分类时，会在**日程管理笔记本**下创建对应名字的文档。

### 2. 删除日程分类
点击日程分类最后的删除按钮，可以删除对应日程分类，以及**日程管理笔记本**下的对应文档。

>- **操作需谨慎**，删除日程分类会删除对应的所有日程，且不可恢复

### 3. 添加日程
双击某个日历格，会弹出日程添加界面，可以自定义日程分类、日程起止时间、日程名、日程内容和日程的状态。

添加日程时，会在相应名字的文档中创建一条记录，**不要编辑！！！**

![](https://gitee.com/rogerhuhu/siyuan-plugin-schedule-manager/blob/main/asset/add_schedule.png)

### 4. 更新日程
单机某个日程，会弹出更新日程的界面，可以修改日程的各种信息。同时修改对应文档中记录的信息。

![](https://gitee.com/rogerhuhu/siyuan-plugin-schedule-manager/blob/main/asset/update_schedule.png)

### 5. 删除日程
在上述日程更新界面，点击删除日程按钮，会删除当前日程，以及对应文档中的记录，**不可恢复**。

## Todo
- [ ] 界面语言、文档国际化
- [ ] 日程的拖拽
- [ ] 文档中日程记录显示样式优化
- [ ] 任务看板界面

## FAQ

## 鸣谢
感谢如下框架对本项目的支持（排名不分先后）
- Vue3
- Naive UI

## 捐赠
开发不易，如果你喜欢本插件，欢迎给作者发电。

![](https://gitee.com/rogerhuhu/siyuan-plugin-schedule-manager/blob/main/asset/code.png)

## 更新日志