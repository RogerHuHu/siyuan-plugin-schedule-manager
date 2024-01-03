<template>
  <n-card style="border-radius: 10px;" size="small">
    <n-grid :cols="8" x-gap="5" y-gap="5">
      <n-gi>
        <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ archiveTimeText }}</div>
      </n-gi>
      <n-gi :span="7">
        <n-space>
          <n-input-number v-model:value="archiveTime" size="small"/>
          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ dayText }}</div>
          <n-button quaternary circle size="small" @click="handleUpdate()">
            <template #icon>
              <n-icon :component="CheckOutlined" color="#18a058" />
            </template>
          </n-button>
          <n-button strong secondary round type="info" @click="handleArchive()">
            {{ archiveText }}
          </n-button>
        </n-space>
      </n-gi>
      <n-gi :span="8">
        <n-divider />
      </n-gi>
      <!--n-gi :span="8">
        <n-button strong secondary round type="info" @click="handleTest()">
          {{ archiveText }}
        </n-button>
      </n-gi-->
    </n-grid>
  </n-card>
</template>

<style scoped lang="scss">
.sm-schedule-item-header {
  font-size: 14px;
  font-weight: bold;
}
</style>

<script>
  import { defineComponent, ref } from 'vue';
  import { i18n, globalData } from "../utils/utils";
  import { CheckOutlined } from '@vicons/antd'
  import EventAggregator from "../utils/EventAggregator";
  import { showMessage } from "siyuan";
  import { CalDavClient } from "../ThirdPartyCalendars/CalDav";

export default defineComponent({
  components: {
    
  },

  setup() {
    return {
      CheckOutlined,
      archiveTimeText: i18n.archiveTime,
      dayText: i18n.day,
      archiveText: i18n.archive,
      archiveTime: ref(7),
      calDavClient: CalDavClient,
    };  
  },

  data() {
    return {
      globalData
    }
  },

  mounted() {
    this.archiveTime = globalData.archiveTime;
  },

  methods: {
    handleUpdate() {
      EventAggregator.emit('updateArchiveTime', this.archiveTime);
      showMessage(i18n.hasUpdated, 6000, "info");
    },

    handleArchive() {
      this.globalData.scheduleCategories.archiveSchedules(this.archiveTime);
    },

    handleTest() {
      this.calDavClient = new CalDavClient("https://calendar.dingtalk.com/dav/users/u_oslxrjui", "u_oslxrjui", "ow5kp2zd");
      //this.calDavClient = new CalDavClient("https://dav.qq.com/dav/users/196550051@qq.com", "196550051@qq.com", "ezgcgtzkjkihbiah");
      //this.calDavClient = new CalDavClient("https://caldav.mail.qq.com/", "196550051@qq.com", "dream91722");
      //this.calDavClient = new CalDavClient("https://dida365.com/pub/calendar/feeds/quraph7at8zb/basic.ics", "hujunjie7174@126.com", "hello7109");
      this.calDavClient.login();
    }
  }
})
</script>