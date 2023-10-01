<template>
  <n-grid x-gap="5" :cols="4">
    <n-gi>
      <n-card content-style="padding: 10px;">
        <n-space vertical>
          <div class="sm-title1">{{ todoText }}</div>
          <n-grid y-gap="5" :cols="1" v-for="(category,cindex) in globalData.schedules.categories" :key="cindex" style="padding:0px; margin:0px;">
            <n-gi v-for="(schedule,sindex) in category.schedules" :key="sindex" style="padding:0px; margin:0px;">
              <n-card v-if="schedule.status == 1" size="small">
                <n-space vertical>
                  <n-space justify="space-between">
                    <n-tag :bordered="false" :color="{color: schedule.backgroundColor}">{{ schedule.title }}</n-tag>
                    <n-button text style="font-size: 20px">
                      <n-icon>
                        <setting-outlined />
                      </n-icon>
                    </n-button>
                  </n-space>
                  <n-ellipsis style="max-width: 100px">
                    {{ schedule.content }}
                  </n-ellipsis>
                </n-space>
              </n-card>
            </n-gi>
          </n-grid>
        </n-space>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card content-style="padding: 10px;">
        <n-space vertical>
          <div class="sm-title2">{{ doingText }}</div>
          <n-grid y-gap="5" :cols="1" v-for="(category,cindex) in globalData.schedules.categories" :key="cindex" style="padding:0px; margin:0px;">
            <n-gi v-for="(schedule,sindex) in category.schedules" :key="sindex" style="padding:0px; margin:0px;">
              <n-card v-if="schedule.status == 2" size="small">
                <n-space vertical>
                  <n-space justify="space-between">
                    <n-tag :bordered="false" :color="{color: schedule.backgroundColor}">{{ schedule.title }}</n-tag>
                    <n-button text style="font-size: 20px">
                      <n-icon>
                        <setting-outlined />
                      </n-icon>
                    </n-button>
                  </n-space>
                  <n-ellipsis style="max-width: 100px">
                    {{ schedule.content }}
                  </n-ellipsis>
                </n-space>
              </n-card>
            </n-gi>
          </n-grid>
        </n-space>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card content-style="padding: 10px;">
        <n-space vertical>
          <div class="sm-title3">{{ doneText }}</div>
          <n-grid :cols="1" v-for="(category,cindex) in globalData.schedules.categories" :key="cindex" style="padding:0px; margin:0px;">
            <n-gi v-for="(schedule,sindex) in category.schedules" :key="sindex" style="padding:0px; margin:0px;">
              <n-card v-if="schedule.status == 3" size="small">
                <n-space vertical>
                  <n-space justify="space-between">
                    <n-tag :bordered="false" :color="{color: schedule.backgroundColor}">{{ schedule.title }}</n-tag>
                    <n-button text style="font-size: 20px">
                      <n-icon>
                        <setting-outlined />
                      </n-icon>
                    </n-button>
                  </n-space>
                  <n-ellipsis style="max-width: 100px">
                    {{ schedule.content }}
                  </n-ellipsis>
                </n-space>
              </n-card>
            </n-gi>
          </n-grid>
        </n-space>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card content-style="padding: 10px;">
        <n-space vertical>
          <div class="sm-title4">{{ archiveText }}</div>
          <n-grid :cols="1" v-for="(category,cindex) in globalData.schedules.categories" :key="cindex" style="padding:0px; margin:0px;">
            <n-gi v-for="(schedule,sindex) in category.schedules" :key="sindex" style="padding:0px; margin:0px;">
              <n-card v-if="schedule.status == 4" size="small">
                <n-space vertical>
                  <n-space justify="space-between">
                    <n-tag :bordered="false" :color="{color: schedule.backgroundColor}">{{ schedule.title }}</n-tag>
                    <n-button text style="font-size: 20px">
                      <n-icon>
                        <setting-outlined />
                      </n-icon>
                    </n-button>
                  </n-space>
                  <n-ellipsis style="max-width: 100px">
                    {{ schedule.content }}
                  </n-ellipsis>
                </n-space>
              </n-card>
            </n-gi>
          </n-grid>
        </n-space>
      </n-card>
    </n-gi>
  </n-grid>
</template>

<style scoped lang="scss">
  .n-card {
    border-radius: 10px;
  }
  
  .sm-title1, .sm-title2, .sm-title3, .sm-title4 {
    font-size: 16px;
    font-weight: bold;
    border-radius: 5px;
    padding: 3px;
  }

  .sm-title1 {
    background: #61C1F4;
  }

  .sm-title2 {
    background: #F8E496;
  }

  .sm-title3 {
    background: #96F896;
  }

  .sm-title4 {
    background: #C1C4C1;
  }
</style>

<script>
import { i18n, globalData } from "../utils/utils";
import { defineComponent, ref } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import EventAggregator from "../utils/EventAggregator";
import { showMessage } from "siyuan";
import { SettingOutlined, } from '@vicons/antd'

export default defineComponent({
  components: {
    SettingOutlined
  },

  setup () {
    return {
      todoText: i18n.todo,
      doingText: i18n.doing,
      doneText: i18n.done,
      archiveText: i18n.archive
    }
  },

  data() {
    return {
      globalData,
      calendarCategories: [],
      schedules: [],
      scheduleName: '',
      message: useMessage(),
      dialog: useDialog()
    };
  },

  mounted() {
  },

  methods: {
    submitCallback () {
      let scheduleExists = false;
      for(let sdl of this.schedules) {
        if(sdl.name === this.scheduleName || sdl.color === this.scheduleColor) {
          scheduleExists = true;
          showMessage(i18n.scheduleCategoryColorError, 6000, "error");
          break;
        }
      }

      if(scheduleExists == false) {
        let newCategory = {
          checked: true,
          color: this.scheduleColor,
          name: this.scheduleName
        };
        this.schedules.push(newCategory);
        EventAggregator.emit('addCategorty', {
          "checked": newCategory.checked,
          "color": this.scheduleColor,
          "name": this.scheduleName
        });
      }
    },

    // 日程名变更
    handleNameChange(value) {
      this.scheduleName = value
      //this.message.success(this.scheduleName)
    },

    // 删除日程分类
    handleDeleteScheduleCategory(index) {
      let category = this.schedules[index];
      this.dialog.warning({
        title: i18n.warning,
        content: i18n.confirmRemoveScheduleCategory + '【' + category.name + '】？',
        positiveText: i18n.confirm,
        negativeText: i18n.cancel,
        onPositiveClick: () => {
          this.schedules.splice(index, 1);
          this.$forceUpdate();
          EventAggregator.emit('deleteCategorty', category);
        }
      });
    }
  }
})
</script>