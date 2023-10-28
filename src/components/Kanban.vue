<template>
  <n-grid x-gap="5" :cols="4">
    <n-gi>
      <n-card content-style="padding: 10px;" style="background-color: var(--spsm-color-gray5)">
        <n-grid :cols=1 y-gap="5">
          <n-gi>
            <div class="sm-title1">{{ ' ☕ ' + todoText }}</div>
          </n-gi>
          <n-gi>
            <n-space vertical>
              <template v-for="(category,cindex) in globalData.scheduleCategories.categories" :key="cindex">
                <template v-for="(schedule,sindex) in category.schedules" :key="sindex">
                  <n-card v-if="schedule.status == 1" size="small" hoverable>
                    <n-grid :cols="3" y-gap="2">
                      <n-gi :span="2">
                        <n-space>
                          <n-tooltip v-if="schedule.isRecurringSchedule == true">
                            <template #trigger>
                              <n-icon size="20" color="var(--spsm-color-green11)">
                                <retweet-outlined />
                              </n-icon>
                            </template>
                            {{ recurringText }}
                          </n-tooltip>
                          <n-ellipsis :style="{backgroundColor: category.color, color: category.textColor}" style="padding: 5px; border-radius: 5px;">
                            {{ schedule.title }}
                          </n-ellipsis>
                        </n-space>
                      </n-gi>
                      <n-gi align="right">
                        <n-button text style="font-size: 20px;" @click="handleSetSchedule(cindex, sindex)">
                          <n-icon>
                            <setting-outlined />
                          </n-icon>
                        </n-button>
                      </n-gi>
                      <n-gi :span="3">
                        <n-space>
                          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ startTimeText }}</div>
                          <div style="margin-top: 3px;">{{ schedule.start }}</div>
                        </n-space>
                      </n-gi>
                      <n-gi :span="3">
                        <n-space>
                          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ endTimeText }}</div>
                          <div style="margin-top: 3px;">{{ schedule.end }}</div>
                        </n-space>
                      </n-gi>
                      <n-gi v-if="schedule.refBlockId != '' && schedule.refBlockId != undefined" :span="3">
                        <a href="#" @click="handleJumpToBlock">
                          {{ schedule.refBlockId }}
                        </a>
                      </n-gi>
                      <n-gi :span="3">
                        <n-ellipsis>
                          {{ schedule.content }}
                        </n-ellipsis>
                      </n-gi>
                    </n-grid>
                  </n-card>
                </template>
              </template>
            </n-space>
          </n-gi>
        </n-grid>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card content-style="padding: 10px;" style="background-color: var(--spsm-color-gray5)">
        <n-grid :cols=1 y-gap="5">
          <n-gi>
            <div class="sm-title2">{{ ' 🏃‍♂️ ' + doingText }}</div>
          </n-gi>
          <n-gi>
            <n-space vertical>
              <template v-for="(category,cindex) in globalData.scheduleCategories.categories" :key="cindex">
                <template v-for="(schedule,sindex) in category.schedules" :key="sindex">
                  <n-card v-if="schedule.status == 2" size="small" hoverable>
                    <n-grid :cols="3" y-gap="2">
                      <n-gi :span="2">
                        <n-space>
                          <n-tooltip v-if="schedule.isRecurringSchedule == true">
                            <template #trigger>
                              <n-icon size="20" color="var(--spsm-color-green11)">
                                <retweet-outlined />
                              </n-icon>
                            </template>
                            {{ recurringText }}
                          </n-tooltip>
                          <n-ellipsis :style="{backgroundColor: category.color, color: category.textColor}" style="padding: 5px; border-radius: 5px;">
                            {{ schedule.title }}
                          </n-ellipsis>
                        </n-space>
                      </n-gi>
                      <n-gi align="right">
                        <n-button text style="font-size: 20px" @click="handleSetSchedule(cindex, sindex)">
                          <n-icon>
                            <setting-outlined />
                          </n-icon>
                        </n-button>
                      </n-gi>
                      <n-gi :span="3">
                        <n-space>
                          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ startTimeText }}</div>
                          <div style="margin-top: 3px;">{{ schedule.start }}</div>
                        </n-space>
                      </n-gi>
                      <n-gi :span="3">
                        <n-space>
                          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ endTimeText }}</div>
                          <div style="margin-top: 3px;">{{ schedule.end }}</div>
                        </n-space>
                      </n-gi>
                      <n-gi v-if="schedule.refBlockId != '' && schedule.refBlockId != undefined" :span="3">
                        <a href="#" @click="handleJumpToBlock">
                          {{ schedule.refBlockId }}
                        </a>
                      </n-gi>
                      <n-gi :span="3">
                        <n-ellipsis>
                          {{ schedule.content }}
                        </n-ellipsis>
                      </n-gi>
                    </n-grid>
                  </n-card>
                </template>
              </template>
            </n-space>
          </n-gi>
        </n-grid>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card content-style="padding: 10px;" style="background-color: var(--spsm-color-gray5)">
        <n-grid :cols=1 y-gap="5">
          <n-gi>
            <div class="sm-title3">{{ ' ✅ ' + doneText }}</div>
          </n-gi>
          <n-gi>
            <n-space vertical>
              <template v-for="(category,cindex) in globalData.scheduleCategories.categories" :key="cindex">
                <template v-for="(schedule,sindex) in category.schedules">
                    <n-card v-if="schedule.status == 3" :key="sindex" size="small" hoverable>
                      <n-grid :cols="3" y-gap="2">
                        <n-gi :span="2">
                          <n-space>
                            <n-tooltip v-if="schedule.isRecurringSchedule == true">
                              <template #trigger>
                                <n-icon size="20" color="var(--spsm-color-green11)">
                                  <retweet-outlined />
                                </n-icon>
                              </template>
                              {{ recurringText }}
                            </n-tooltip>
                            <n-ellipsis :style="{backgroundColor: category.color, color: category.textColor}" style="padding: 5px; border-radius: 5px;">
                              {{ schedule.title }}
                            </n-ellipsis>
                          </n-space>
                        </n-gi>
                        <n-gi align="right">
                          <n-button text style="font-size: 20px" @click="handleSetSchedule(cindex, sindex)">
                            <n-icon>
                              <setting-outlined />
                            </n-icon>
                          </n-button>
                        </n-gi>
                        <n-gi :span="3">
                          <n-space>
                            <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ startTimeText }}</div>
                            <div style="margin-top: 3px;">{{ schedule.start }}</div>
                          </n-space>
                        </n-gi>
                        <n-gi :span="3">
                          <n-space>
                            <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ endTimeText }}</div>
                            <div style="margin-top: 3px;">{{ schedule.end }}</div>
                          </n-space>
                        </n-gi>
                        <n-gi v-if="schedule.refBlockId != '' && schedule.refBlockId != undefined" :span="3">
                          <a href="#" @click="handleJumpToBlock">
                            {{ schedule.refBlockId }}
                          </a>
                        </n-gi>
                        <n-gi :span="3">
                          <n-ellipsis style="max-width: 100px">
                            {{ schedule.content }}
                          </n-ellipsis>
                        </n-gi>
                      </n-grid>
                    </n-card>
                </template>
              </template>  
            </n-space>
          </n-gi>
        </n-grid>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card content-style="padding: 10px;" style="background-color: var(--spsm-color-gray5)">
        <n-grid :cols=1 y-gap="5">
          <n-gi>
            <div class="sm-title4">{{ ' 📦 ' + archiveText }}</div>
          </n-gi>
          <n-gi>
            <n-collapse v-for="(category,cindex) in globalData.scheduleCategories.categories" :key="cindex">
              <n-collapse-item :title="category.name">
                <n-space vertical>
                  <template v-for="(schedule,sindex) in category.schedules" :key="sindex">
                    <n-card v-if="schedule.status == 4" size="small" hoverable>
                      <n-grid :cols="3" y-gap="2">
                        <n-gi :span="2">
                          <n-space>
                            <n-tooltip v-if="schedule.isRecurringSchedule == true">
                              <template #trigger>
                                <n-icon size="20" color="var(--spsm-color-green11)">
                                  <retweet-outlined />
                                </n-icon>
                              </template>
                              {{ recurringText }}
                            </n-tooltip>
                            <n-ellipsis :style="{backgroundColor: category.color, color: category.textColor}" style="padding: 5px; border-radius: 5px;">
                              {{ schedule.title }}
                            </n-ellipsis>
                          </n-space>
                        </n-gi>
                        <n-gi align="right">
                          <n-button text style="font-size: 20px" @click="handleSetSchedule(cindex, sindex)">
                            <n-icon>
                              <setting-outlined />
                            </n-icon>
                          </n-button>
                        </n-gi>
                        <n-gi :span="3">
                          <n-space>
                            <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ startTimeText }}</div>
                            <div style="margin-top: 3px;">{{ schedule.start }}</div>
                          </n-space>
                        </n-gi>
                        <n-gi :span="3">
                          <n-space>
                            <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ endTimeText }}</div>
                            <div style="margin-top: 3px;">{{ schedule.end }}</div>
                          </n-space>
                        </n-gi>
                        <n-gi v-if="schedule.refBlockId != '' && schedule.refBlockId != undefined" :span="3">
                          <a href="#" @click="handleJumpToBlock">
                            {{ schedule.refBlockId }}
                          </a>
                        </n-gi>
                        <n-gi :span="3">
                          <n-ellipsis style="max-width: 100px">
                            {{ schedule.content }}
                          </n-ellipsis>
                        </n-gi>
                      </n-grid>
                    </n-card>
                  </template>
                </n-space>
              </n-collapse-item>
            </n-collapse>
          </n-gi>
        </n-grid>
      </n-card>
    </n-gi>
  </n-grid>

  <ScheduleEditor ref="scheduleEditor"/>
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
    background-color: var(--spsm-color-blue4);
  }

  .sm-title2 {
    background-color: var(--spsm-color-orange4);
  }

  .sm-title3 {
    background-color: var(--spsm-color-green4);
  }

  .sm-title4 {
    background-color: var(--spsm-color-gray7);
  }

  .sm-schedule-item-header {
    font-size: 14px;
    font-weight: bold;
    margin-right: 5px;
  }
</style>

<script>
import { i18n, globalData, smColor } from "../utils/utils";
import { defineComponent, ref } from 'vue'
import { useDialog, NCollapse } from 'naive-ui'
import { SettingOutlined, RetweetOutlined } from '@vicons/antd'
import ScheduleEditor from "./ScheduleEditor.vue";
import EventAggregator from "../utils/EventAggregator";
import "../index.scss";

export default defineComponent({
  components: {
    SettingOutlined,
    RetweetOutlined,
    NCollapse,
    ScheduleEditor
  },

  setup () {
    return {
      todoText: i18n.todo,
      doingText: i18n.doing,
      doneText: i18n.done,
      archiveText: i18n.archive,
      startTimeText: i18n.startTime,
      endTimeText: i18n.endTime,
      recurringText: i18n.recurring,

      cindex: 0,
      sindex: 0,
      scheduleGap: ref(3),
    }
  },

  data() {
    return {
      globalData,
      dialog: useDialog(),
    };
  },

  mounted() {
  },

  methods: {
    handleSetSchedule(cindex, sindex) {
     this.$refs.scheduleEditor.updateScheduleKanban(cindex, sindex);
    },

    handleJumpToBlock(event) {
        event.preventDefault();
        EventAggregator.emit('openBlockFloatLayer', event.target.innerText);
      }
  }
})
</script>