<template>
    <n-card style="border-radius: 10px;" size="small">
      <n-grid :cols="8" x-gap="5" y-gap="5">
        <n-gi :span="8">
          <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ supportText }}</div>
        </n-gi>
        <n-gi :span="8">
          <n-space>
            <div style="height: 80px; width: 100px; transform: translate(0)">
              <n-float-button shape="square" height="80px" width="100px" @click="handleAddQQCalendar()">
                <n-icon style="height: 50px; width: 80px;">
                  <img style="height: 50px; width: auto;"  src="./qqmail.png">
                </n-icon>
                  <template #description>
                    {{ qqmailCalendarText }}
                  </template>
              </n-float-button>
            </div>
          </n-space>
        </n-gi>
        <n-gi :span="8">
          <n-space vertical>
            <template v-for="(tpCalendar, sindex) in globalData.schedConfig.tpCalendars" :key="sindex">
              <n-card size="small" hoverable>
                <n-grid :cols="7">
                  <n-gi :span="2">
                    <img style="height: 30px; width: auto;" src="./qqmail.png">
                  </n-gi>
                  <n-gi :span="3">
                    <div class="sm-schedule-item-header" style="margin-top: 3px;">{{ tpCalendar.name }}</div>
                  </n-gi>
                  <n-gi>
                    <n-button strong secondary circle @click="handleEditItem(sindex)">
                      <template #icon>
                        <n-icon :component="EditOutlined" color="#0A7FD3" />
                      </template>
                    </n-button>
                  </n-gi>
                  <n-gi>
                    <n-button strong secondary circle @click="handleDeleteItem(sindex)">
                      <template #icon>
                        <n-icon :component="DeleteOutlined" color="#D60D0D" />
                      </template>
                    </n-button>
                  </n-gi>
                </n-grid>
              </n-card>
            </template>
          </n-space>
        </n-gi>
      </n-grid>
    </n-card>

    <ThirdPartyCalendarEditor ref="thirdPartyCalendarEditor"/>
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
    import EventAggregator from "../utils/EventAggregator";
    import { showMessage } from "siyuan";
    import { CalDavClient } from "../ThirdPartyCalendars/CalDav";
    import { DeleteOutlined, EditOutlined, CheckOutlined, ClearOutlined, ArrowRightOutlined } from '@vicons/antd';
    import ThirdPartyCalendarEditor from "./ThirdPartyCalendarEditor.vue";
  
  export default defineComponent({
    components: {
      CheckOutlined,
      ClearOutlined,
      ArrowRightOutlined,
      ThirdPartyCalendarEditor,
    },
  
    setup() {
      return {
        EditOutlined,
        DeleteOutlined,

        supportText: i18n.support,
        qqmailCalendarText: i18n.qqmailCalendar,
        calDavClient: CalDavClient,
      };  
    },
  
    data() {
      return {
        globalData
      }
    },
  
    mounted() {
    },
  
    methods: {
      handleAddQQCalendar() {
        this.$refs.thirdPartyCalendarEditor.newCalendar(this.qqmailCalendarText, "./qqmail.png");
      },

      handleEditItem(index) {
        this.$refs.thirdPartyCalendarEditor.editCalendar(index);
      },

      handleDeleteItem(index) {
        this.$refs.thirdPartyCalendarEditor.deleteCalendar(index);
      }

      // handleDeleteItem(index) {
      //   this.calDavClient = new CalDavClient("https://dav.qq.com/.well-known/caldav", "196550051@qq.com", "zotkxjrtmemubgeb");
      //   // this.calDavClient = new CalDavClient("https://calendar.dingtalk.com/.well-known/caldav", "u_qgxrcn48", "fgfgrk8h");
      //   //this.calDavClient = new CalDavClient("https://calendar.dingtalk.com/dav/users/u_qgxrcn48", "u_qgxrcn48", "fgfgrk8h");
      //   this.calDavClient.login();
      // }
    }
  })
  </script>