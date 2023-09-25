<template>
  <n-card title="日程分类">
    <n-grid :y-gap="3" :cols="1">
      <n-grid-item>
        <n-button type="primary" @click="showModal = true">添加日程分类</n-button>
      </n-grid-item>
      <n-grid-item>
        <n-list hoverable clickable>
          <n-list-item v-for="(schedule,index) in schedules" :key="index" style="padding:0px; margin:0px;">
            <n-space align="center">
              <n-checkbox v-model:checked="schedule.checked" style="width:100px">
                {{schedule.name}}
              </n-checkbox>
              <div :style="{backgroundColor:schedule.color, width:'15px', height:'15px'}"/>
              <n-button quaternary circle style="padding:0px;" @click="handleDeleteScheduleCategory(index)">
                 <template #icon>
                   <n-icon :component="DeleteOutlined" color="#0e7a0d"/>
                 </template>
               </n-button>
            </n-space>
          </n-list-item>
        </n-list>
      </n-grid-item>
    </n-grid>
  </n-card>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    title="添加日程分类"
    positive-text="添加"
    negative-text="取消"
    @positive-click="submitCallback"
    @negative-click="cancelCallback"
  >
    <n-space vertical>
      <n-input placeholder="请输入日程分类名" autosize style="min-width: 50%" @update:value="handleNameChange"/>
      <n-color-picker v-model:value="scheduleColor" :modes="['hex']" :show-alpha="false"
        :swatches="[
          '#00C9A7',
          '#18A058',
          '#2080F0',
          '#F0A020'
        ]"
      />
    </n-space>
  </n-modal>
</template>

<style lang='scss'>
.n-card {
  margin:1.5em 0;
}
</style>

<script>
import { defineComponent, ref } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import { DeleteOutlined } from '@vicons/antd'
import EventAggregator from "./EventAggregator";
import { showMessage } from "siyuan";

export default defineComponent({
  components: {
    DeleteOutlined
  },

  setup () {
    return {
      DeleteOutlined,
      scheduleColor: ref("#00C9A7"),
      showModal: ref(false),
      cancelCallback () {
        //message.success('Cancel')
      }
    }
  },

  data() {
    return {
      schedules: [],
      scheduleName: '',
      message: useMessage(),
      dialog: useDialog()
    };
  },

  mounted() {
    EventAggregator.on('initScheduleCategory', scheduleCategories => {
      this.schedules = [];
      for(let category of scheduleCategories) {
        this.schedules.push(category);
      }
    });

    EventAggregator.on('showErrorMessage', message => {
      this.message.error(message);
    });
  },

  methods: {
    submitCallback () {
      let scheduleExists = false;
      for(let sdl of this.schedules) {
        if(sdl.name === this.scheduleName || sdl.color === this.scheduleColor) {
          scheduleExists = true;
          showMessage("日程分类颜色不能重复", 6000, "error");
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
        title: '警告',
        content: '删除日程分类会导致对应日程丢失，确定删除日程分类' + '【' + category.name + '】？',
        positiveText: '确定',
        negativeText: '取消',
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