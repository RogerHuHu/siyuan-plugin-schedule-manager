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
                    <n-tag :bordered="false" :color="{color: category.color}">{{ schedule.title }}</n-tag>
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
                    <n-tag :bordered="false" :color="{color: category.color}">{{ schedule.title }}</n-tag>
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
                    <n-tag :bordered="false" :color="{color: category.color}">{{ schedule.title }}</n-tag>
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
                        <n-tag :bordered="false" :color="{color: category.color}">{{ schedule.title }}</n-tag>
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

  <n-modal
    v-model:show="showModal"
    preset="dialog"
    v-model:title="addScheduleText"
    style="width:600px"
    :closable="modalClosable"
    :showIcon="modalShowIcon"
  >
    <n-grid :cols="4" y-gap="5">
      <n-gi>
        <div>{{ selectScheduleCategoryText }}</div>
      </n-gi>
      <n-gi :span="3">
        <n-select v-model:value="selectedCategory" label-field="name" value-field="name"
                  :options="globalData.scheduleCategories.categories" />
      </n-gi>

      <n-gi>
        <div>{{ selectScheduleRangeText }}</div>
      </n-gi>
      <n-gi :span="3">
        <n-date-picker v-model:value="scheduleRange" type="datetimerange" clearable />
      </n-gi>

      <n-gi>
        <div>{{ scheduleNameText }}</div>
      </n-gi>
      <n-gi :span="3">
        <n-input v-model:value="scheduleName" type="text" v-model:placeholder="inputScheduleNameText" />
      </n-gi>

      <n-gi>
        <div>{{ scheduleContentText }}</div>
      </n-gi>
      <n-gi :span="3">
        <n-input
          v-model:value="scheduleContent"
          type="textarea"
          placeholder=""
        />
      </n-gi>

      <n-gi>
        <div>{{ statusText }}</div>
      </n-gi>
      <n-gi :span="3">
        <n-radio-group v-model:value="selectedScheduleStatus" name="radiogroup">
          <n-space>
            <n-radio v-for="scheduleStatus in scheduleStatusList" :key="scheduleStatus.value" :value="scheduleStatus.value">
              {{ scheduleStatus.label }}
            </n-radio>
          </n-space>
        </n-radio-group>
      </n-gi>

      <n-gi :span="4">
        <n-space justify="end">
          <n-button type="info" @click="handleCancelClick">
            {{ cancelText }}
          </n-button>
          <n-button type="error" v-if="isUpdateButtonVisible" @click="handleDeleteClick">
            {{ removeScheduleText }}
          </n-button>
          <n-button type="success" v-if="isUpdateButtonVisible" @click="handleUpdateClick">
            {{ updateText }}
          </n-button>
          <!--n-button type="success" v-if="isSubmitButtonVisible" @click="handleSubmitClick">
            {{ confirmText }}
          </n-button-->
        </n-space>
      </n-gi>
    </n-grid>             
  </n-modal>

  <n-modal
    v-model:show="showDeleteScheduleConfirmModal"
    preset="dialog"
    type="warning"
    v-model:title="confirmText"
    v-model:content="confirmRemoveScheduleText"
    style="width:600px"
    :closable="modalClosable"
    v-model:positive-text="confirmText"
    v-model:negative-text="cancelText"
    @positive-click="submitDeleteSchedule"
  />
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
import { useMessage, useDialog, NCollapse } from 'naive-ui'
import { format, parseISO, getTime } from 'date-fns';
import EventAggregator from "../utils/EventAggregator";
import { showMessage } from "siyuan";
import { SettingOutlined, } from '@vicons/antd'
import { Schedule } from '../Schedule'

export default defineComponent({
  components: {
    SettingOutlined,
    NCollapse
},

  setup () {
    return {
      todoText: i18n.todo,
      doingText: i18n.doing,
      doneText: i18n.done,
      archiveText: i18n.archive,

      addScheduleText: i18n.addSchedule,
      selectScheduleCategoryText: i18n.selectScheduleCategory,
      selectScheduleRangeText: i18n.selectScheduleRange,
      scheduleNameText: i18n.scheduleName,
      inputScheduleNameText: i18n.inputScheduleName,
      scheduleContentText: i18n.scheduleContent,
      statusText: i18n.status,
      cancelText: i18n.cancel,
      removeScheduleText: i18n.removeSchedule,
      updateText: i18n.update,
      confirmText: i18n.confirm,
      confirmRemoveScheduleText: i18n.confirmRemoveSchedule,
      selectedDate: "",
      modalClosable: false,
      modalShowIcon: false,
      isUpdateButtonVisible: true,
      isSubmitButtonVisible: false,
      selectedCategoryColor: ref(null),
      selectedCategory: null,
      scheduleRange: ref(null),
      scheduleName: ref(null),
      scheduleContent: ref(null),
      selectedScheduleStatus: ref(null),
      scheduleStatusList: [
        {
          value: 1,
          label: '☕ ' + i18n.todo
        },
        {
          value: 2,
          label: '🏃‍♂️ ' + i18n.doing
        },
        {
          value: 3,
          label: '✅ ' + i18n.done
        },
        {
          value: 4,
          label: '📦 ' + i18n.archive
        }
      ],
      selectedSchedule: null,
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
      showModal: false,
      showDeleteScheduleConfirmModal: false,
      message: useMessage(),
      dialog: useDialog()
    };
  },

  mounted() {
  },

  methods: {
    handleSetSchedule(cindex, sindex) {
      this.cindex = cindex;
      this.sindex = sindex;
      let schedule = this.globalData.scheduleCategories.categories[cindex].schedules[sindex];
      this.selectedCategory = schedule.category;
      this.scheduleName = schedule.title;
      if(this.scheduleRange == null) {
        this.scheduleRange = [Date.now(), Date.now() + 1];
      }
      let date = parseISO(schedule.start);
      this.scheduleRange[0] = getTime(date);
      date = parseISO(schedule.end);
      this.scheduleRange[1] = getTime(date);
      this.scheduleContent = schedule.content;
      this.selectedScheduleStatus = schedule.status;
      this.selectedSchedule = schedule;
      this.showModal = true;
    },

    handleCancelClick() {
      this.showModal = false;
      this.clearEventInfo();
    },

    handleDeleteClick() {
      this.showModal = false;
      this.showDeleteScheduleConfirmModal = true;
    },

    handleUpdateClick() {
      this.showModal = false;

      if (this.scheduleRange[0] == this.scheduleRange[1]) {
        showMessage(i18n.scheduleRangeError, 6000, "error");
      } else {
        let oldCategory = this.selectedSchedule.category;
        let start = format(this.scheduleRange[0], 'yyyy-MM-dd') + ' ' + format(this.scheduleRange[0], 'HH:mm:ss');
        let end = format(this.scheduleRange[1], 'yyyy-MM-dd') + ' ' + format(this.scheduleRange[1], 'HH:mm:ss');
        let newSchedule = new Schedule(this.selectedSchedule.id, this.scheduleName,
                                       start, end, this.selectedCategory, this.scheduleContent,
                                       this.selectedScheduleStatus);

        this.globalData.scheduleCategories.updateSchedule(oldCategory, newSchedule);
        EventAggregator.emit('updateSchedule', {
          old: oldCategory,
          new: newSchedule
        });
        this.clearEventInfo();
      }
    },

    submitDeleteSchedule() {
      let schedule = this.selectedSchedule;
      this.globalData.scheduleCategories.removeSchedule(schedule);
      EventAggregator.emit('deleteSchedule', schedule);
      this.clearEventInfo();
    },

    clearEventInfo() {
      this.selectedCategoryColor = "";
      this.selectedCategory = "";
      this.scheduleRange = null;
      this.scheduleName = null;
      this.scheduleContent = null;
      this.selectedScheduleStatus = null;
    },
  }
})
</script>