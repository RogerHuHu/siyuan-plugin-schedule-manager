<template>
  <n-card title="日程">
    <n-grid :y-gap="3" :cols="1">
      <n-grid-item>
        <n-button type="primary" @click="showModal = true">添加日程</n-button>
      </n-grid-item>
      <n-grid-item>
        <n-list>
          <n-list-item>
            <div>123424</div>
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
      <n-color-picker @update:value="handleColorUpdate"
        :swatches="[
          '#FFFFFF',
          '#18A058',
          '#2080F0',
          '#F0A020',
          'rgba(208, 48, 80, 1)'
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

export default defineComponent({
  setup () {
    const message = useMessage()
    const scheduleName = ref('')
    const scheduleColor = ref('#FFFFFF')

    return {
      showModal: ref(false),
      cancelCallback () {
        message.success('Cancel')
      },
      submitCallback () {
        message.success('Submit')
      },

      // 日程名变更
      handleNameChange(value) {
        scheduleName.value = value
        message.success(scheduleName.value)
      },

      // 颜色变更
      handleColorUpdate(value) {
        scheduleColor.value = value
        message.success(scheduleColor.value)
      }
    }
  }
})
</script>