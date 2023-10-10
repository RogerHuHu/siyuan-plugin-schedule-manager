<template>
  <n-card style="border-radius: 10px;" size="small">
    <n-grid :y-gap="3" :cols="1">
      <n-gi>
        <n-space align="center" justify="space-between">
          <div class="sm-title">{{ scheduleCategoryText }}</div>
          <n-tooltip>
            <template #trigger>
              <n-button strong secondary circle type="primary" @click="showModal = true">
                <template #icon>
                  <n-icon :component="PlusOutlined" color="#18a058"/>
                </template>
              </n-button>
            </template>
            {{ addScheduleCategoryText }}
          </n-tooltip>
        </n-space>
      </n-gi>
      <n-gi>
        <n-list hoverable clickable>
          <n-list-item v-for="(category,index) in globalData.scheduleCategories.categories" :key="index" style="padding:0px; margin:0px;">
            <n-space align="center" justify="space-between">
              <n-checkbox v-model:checked="category.checked" style="min-width:70px" @update:checked="handleUpdateChecked">
                {{category.name}}
              </n-checkbox>
              <n-space align="center" justify="end">
                <div class="sm-circle" :style="{backgroundColor:category.color, width:'15px', height:'15px'}"/>
                <n-button quaternary circle style="padding:0px;" @click="handleDeleteScheduleCategory(index)">
                  <template #icon>
                    <n-icon :component="DeleteOutlined" color="#D60D0D"/>
                  </template>
                </n-button>
              </n-space>
            </n-space>
          </n-list-item>
        </n-list>
      </n-gi>
    </n-grid>
  </n-card>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    v-model:title="addScheduleCategoryText"
    v-model:positive-text="addText"
    v-model:negative-text="cancelText"
    @positive-click="submitCallback"
    @negative-click="cancelCallback"
  >
    <n-grid :y-gap="3" :cols="1">
      <n-gi>
        <n-input v-model:placeholder="inputScheduleCategoryNameText" autosize style="min-width: 50%" @update:value="handleNameChange"/>
      </n-gi>
      <n-gi>
        <n-color-picker v-model:value="scheduleColor" :modes="['hex']" :show-alpha="false"
        :swatches="[
          '#00C9A7',
          '#18A058',
          '#2080F0',
          '#F0A020'
        ]"
      />
      </n-gi>
    </n-grid>
  </n-modal>
</template>

<style scoped lang="scss">
/*
  .n-card {
    border-radius: 10px;
  }

  
  .n-button {
    border-radius: 5px;
  }
  */

  .sm-title {
    font-size: 16px;
    font-weight: bold;
  }

  .sm-circle {
    border-radius: 50%;
  }
</style>

<script>
import { i18n, globalData } from "../utils/utils";
import { defineComponent, ref } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import { DeleteOutlined, PlusOutlined } from '@vicons/antd'
import EventAggregator from "../utils/EventAggregator";
import { showMessage } from "siyuan";
import { ScheduleCategory } from "../ScheduleCategory";

export default defineComponent({
  components: {
    DeleteOutlined
  },

  setup () {
    return {
      DeleteOutlined,
      PlusOutlined,
      scheduleCategoryText: i18n.scheduleCategory,
      addScheduleCategoryText: i18n.addScheduleCategory,
      addText: i18n.add,
      cancelText: i18n.cancel,
      inputScheduleCategoryNameText: i18n.inputScheduleCategoryName,
      scheduleColor: ref("#00C9A7"),
      showModal: ref(false),
      cancelCallback () {
        //message.success('Cancel')
      }
    }
  },

  data() {
    return {
      globalData,
      scheduleName: '',
      message: useMessage(),
      dialog: useDialog()
    };
  },

  mounted() {
  },

  methods: {
    submitCallback() {
      let newCategory = new ScheduleCategory(this.scheduleName, this.scheduleColor, true);
      if(this.globalData.scheduleCategories.addCategory(newCategory) === true) {
        EventAggregator.emit('addCategorty', {
          "checked": newCategory.checked,
          "color": this.scheduleColor,
          "name": this.scheduleName
        });
      } else {
        showMessage(i18n.scheduleCategoryColorError, 6000, "error");
      }
    },

    // 日程名变更
    handleNameChange(value) {
      this.scheduleName = value
    },

    // 删除日程分类
    handleDeleteScheduleCategory(index) {
      let category = this.globalData.scheduleCategories.getCategory(index);
      this.dialog.warning({
        title: i18n.warning,
        content: i18n.confirmRemoveScheduleCategory + '【' + category.name + '】？',
        positiveText: i18n.confirm,
        negativeText: i18n.cancel,
        onPositiveClick: () => {
          this.globalData.scheduleCategories.removeCategory(index);
          EventAggregator.emit('deleteCategorty', category);
        }
      });
    },

    handleUpdateChecked(value) {
      this.globalData.scheduleCategories.updateSelection();
    }
  }
})
</script>