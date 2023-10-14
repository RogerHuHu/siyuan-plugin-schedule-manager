<template>
  <n-grid x-gap="5" :cols="4">
    <n-gi>
      <n-card content-style="padding: 10px;">
        <n-space vertical>
          <div class="sm-title1">{{ ' ☕ ' + todoText }}</div>
          <n-grid :y-gap="scheduleGap" :cols="1" v-for="(category,cindex) in globalData.scheduleCategories.categories" :key="cindex">
            <n-gi v-for="(schedule,sindex) in category.schedules" :key="sindex">
              <n-card v-if="schedule.status == 1" size="small" style="box-shadow: 0px 0px 5px #959595;">
                <n-space vertical>
                  <n-space justify="space-between">
                    <n-tag :bordered="false" :color="{color: category.color}" :style="{color: category.textColor}">{{ schedule.title }}</n-tag>
                    <n-button text style="font-size: 20px" @click="handleSetSchedule(cindex, sindex)">
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
          <div class="sm-title2">{{ ' 🏃‍♂️ ' + doingText }}</div>
          <n-grid :y-gap="scheduleGap" :cols="1" v-for="(category,cindex) in globalData.scheduleCategories.categories" :key="cindex">
            <n-gi v-for="(schedule,sindex) in category.schedules" :key="sindex">
              <n-card v-if="schedule.status == 2" size="small" style="box-shadow: 0px 0px 5px #959595;">
                <n-space vertical>
                  <n-space justify="space-between">
                    <n-tag :bordered="false" :color="{color: category.color}" :style="{color: category.textColor}">{{ schedule.title }}</n-tag>
                    <n-button text style="font-size: 20px" @click="handleSetSchedule(cindex, sindex)">
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
          <div class="sm-title3">{{ ' ✅ ' + doneText }}</div>
          <n-grid :y-gap="scheduleGap" :cols="1" v-for="(category,cindex) in globalData.scheduleCategories.categories" :key="cindex">
            <n-gi v-for="(schedule,sindex) in category.schedules" :key="sindex">
              <n-card v-if="schedule.status == 3" size="small" style="box-shadow: 0px 0px 5px #959595;">
                <n-space vertical>
                  <n-space justify="space-between">
                    <n-tag :bordered="false" :color="{color: category.color}" :style="{color: category.textColor}">{{ schedule.title }}</n-tag>
                    <n-button text style="font-size: 20px" @click="handleSetSchedule(cindex, sindex)">
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
          <div class="sm-title4">{{ ' 📦 ' + archiveText }}</div>
          <n-collapse v-for="(category,cindex) in globalData.scheduleCategories.categories" :key="cindex">
            <n-collapse-item :title="category.name">
              <n-grid :y-gap="scheduleGap" :cols="1">
                <n-gi v-for="(schedule,sindex) in category.schedules" :key="sindex">
                  <n-card v-if="schedule.status == 4" size="small" style="box-shadow: 0px 0px 5px #959595;">
                    <n-space vertical>
                      <n-space justify="space-between">
                        <n-tag :bordered="false" :color="{color: category.color}" :style="{color: category.textColor}">{{ schedule.title }}</n-tag>
                        <n-button text style="font-size: 20px" @click="handleSetSchedule(cindex, sindex)">
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
            </n-collapse-item>
          </n-collapse>
        </n-space>
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
    background: todoColor;
  }

  .sm-title2 {
    background: doingColor;
  }

  .sm-title3 {
    background: doneColor;
  }

  .sm-title4 {
    background: archivedColor;
  }
</style>

<script>
import { i18n, globalData, smColor } from "../utils/utils";
import { defineComponent, ref } from 'vue'
import { useDialog, NCollapse } from 'naive-ui'
import { SettingOutlined, } from '@vicons/antd'
import ScheduleEditor from "./ScheduleEditor.vue";

export default defineComponent({
  components: {
    SettingOutlined,
    NCollapse,
    ScheduleEditor
  },

  setup () {
    return {
      todoText: i18n.todo,
      doingText: i18n.doing,
      doneText: i18n.done,
      archiveText: i18n.archive,

      cindex: 0,
      sindex: 0,
      scheduleGap: ref(3),
      todoColor: smColor.TODO_COLOR,
      doingColor: smColor.DOING_COLOR,
      doneColor: smColor.DONE_COLOR,
      archiveColor: smColor.ARCHIVE_COLOR,
    }
  },

  data() {
    return {
      globalData,
      dialog: useDialog()
    };
  },

  mounted() {
  },

  methods: {
    handleSetSchedule(cindex, sindex) {
     this.$refs.scheduleEditor.updateScheduleKanban(cindex, sindex);
    }
  }
})
</script>