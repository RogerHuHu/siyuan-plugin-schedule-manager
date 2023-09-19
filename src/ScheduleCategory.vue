<template>
  <n-card title="日程">
    <n-grid :y-gap="3" :cols="1">
      <n-grid-item>
        <n-button type="primary" @click="showModal = true">添加日程</n-button>
      </n-grid-item>
      <n-grid-item>
        <n-list hoverable clickable>
          <n-list-item v-for="(schedule,index) in schedules" :key="index" style="padding:0px; margin:0px;">
            <n-space align="center">
              <n-checkbox v-model:checked="schedule.checked" style="width:150px">
                {{schedule.name}}
              </n-checkbox>
              <div :style="{backgroundColor:schedule.color, width:'15px', height:'15px'}"/>
              <n-button quaternary circle style="padding:0px;">
                 <template #icon>
                   <n-icon :component="DeleteOutlined" color="#0e7a0d"/>
                 </template>
               </n-button>
            </n-space>
                
                  <!--n-button text style="font-size: 24px">
                    <template>
                      <n-icon size="20" :component="DeleteOutlined" color="#0e7a0d"/>
                    </template>
                  </n-button-->
          </n-list-item>
        </n-list>
      </n-grid-item>
    </n-grid>
  </n-card>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    title="添加日程"
    positive-text="添加"
    negative-text="取消"
    @positive-click="submitCallback"
    @negative-click="cancelCallback"
  >
    <n-space vertical>
      <n-input placeholder="请输入日程名" autosize style="min-width: 50%" @update:value="handleNameChange"/>
      <n-color-picker @update:value="handleColorUpdate" :modes="['hex']" :show-alpha="false"
        :swatches="[
          '#FFFFFF',
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
import { useMessage } from 'naive-ui'
import { Icon } from '@vicons/utils'
import { DeleteOutlined } from '@vicons/antd'

export default defineComponent({
  components: {
    DeleteOutlined
  },

  setup () {
    //const message = useMessage()
    //const scheduleName = ref('')
    //const scheduleColor = ref('#FFFFFF')

    return {
      DeleteOutlined,
      showModal: ref(false),
      cancelCallback () {
        //message.success('Cancel')
      },  

      handleTest() {
        //message.info('Test')
      }
    }
  },

  data() {
    return {
      schedules: [],
      scheduleName: '',
      scheduleColor: '#FFFFFF',
      message: useMessage()
    };
  },

  methods: {
    submitCallback () {
      let newSchedule = {
        checked: false,
        color: this.scheduleColor,
        name: this.scheduleName
      }
      this.schedules.push(newSchedule)
    },

    // 日程名变更
    handleNameChange(value) {
        this.scheduleName = value
        //this.message.success(this.scheduleName)
      },

      // 颜色变更
      handleColorUpdate(value) {
        this.scheduleColor = value
        //this.message.success(this.scheduleColor)
      },
  }
})
</script>