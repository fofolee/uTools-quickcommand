<template>
  <div>
    <!-- 开关按钮 -->
    <div class="absolute" style="z-index: 1; left: 12px; bottom: 10px">
      <q-toggle
        :model-value="isActivated"
        checked-icon="flash_on"
        color="orange-6"
        @click="toggleCommandActivated"
        :size="toggleBtnSize"
      />
    </div>

    <!-- 控制按钮组 -->
    <div
      class="absolute control-buttons"
      style="z-index: 1; right: 16px; top: 10px"
      :class="{ 'buttons-visible': isVisible }"
    >
      <q-btn
        flat
        round
        dense
        color="green"
        icon="play_arrow"
        v-show="isRunButtonVisible"
        @click="runCommand"
        size="12px"
      >
      </q-btn>

      <q-btn
        v-if="canEdit"
        dense
        flat
        round
        :color="!!cronExp ? 'amber' : 'blue-9'"
        :icon="!!cronExp ? 'timer' : 'insights'"
        @click="isMenuOpen = true"
        size="12px"
      >
        <q-menu
          transition-show="jump-down"
          transition-hide="jump-up"
          @hide="hideMenu"
        >
          <q-list style="min-width: 100px" dense>
            <q-item clickable v-close-popup @click="exportCommandFile">
              <q-item-section side>
                <q-icon name="save" />
              </q-item-section>
              <q-item-section>导出</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="exportCommandRaw">
              <q-item-section side>
                <q-icon name="content_paste_go" />
              </q-item-section>
              <q-item-section>复制到剪贴板</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="createCommandCopy">
              <q-item-section side>
                <q-icon name="file_copy" />
              </q-item-section>
              <q-item-section>创建命令副本</q-item-section>
            </q-item>

            <q-item clickable @click="shareCommand" v-close-popup>
              <q-item-section side>
                <q-icon name="share" />
              </q-item-section>
              <q-item-section>分享</q-item-section>
              <q-tooltip>分享到分享中心</q-tooltip>
            </q-item>

            <q-item
              clickable
              v-close-popup
              @click="showCrontab = true"
              :disable="!canAddCron"
            >
              <q-item-section side>
                <q-icon name="timer" />
              </q-item-section>
              <q-item-section>定时任务</q-item-section>
              <q-tooltip>
                在后台定时执行当前命令，仅匹配类型为关键字时可用，且一律忽略输出<br />
                不同电脑间的定时任务不会同步
              </q-tooltip>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-btn
        v-if="canEdit"
        flat
        round
        dense
        color="red"
        icon="close"
        @click="removeCommand"
        size="12px"
      >
      </q-btn>
    </div>

    <!-- 定时任务设置对话框 -->
    <q-dialog v-model="showCrontab">
      <CrontabSetting
        :cronExp="cronExp"
        @addCrontab="addCrontab"
        @delCrontab="delCrontab"
      />
    </q-dialog>
  </div>
</template>

<script>
import CrontabSetting from "components/popup/CrontabSetting";

export default {
  components: {
    CrontabSetting,
  },
  props: {
    isVisible: Boolean,
    isActivated: Boolean,
    commandInfo: Object,
    isRunButtonVisible: Boolean,
    toggleBtnSize: String,
  },
  emits: ["update:isVisible", "commandChanged"],
  data() {
    return {
      isMenuOpen: false,
      showCrontab: false,
    };
  },
  computed: {
    // 获取定时任务表达式
    cronExp() {
      return this.$root.nativeProfile.crontabs[this.featureCode];
    },
    // 命令未启用可以添加计划任务
    canAddCron() {
      return !!this.commandInfo.features.cmds[0].length;
    },
    // 默认命令不可删除
    canEdit() {
      if (window.utools.isDev()) return true;
      return this.commandInfo.tags?.includes("默认") ? false : true;
    },
    featureCode() {
      return this.commandInfo.features.code;
    },
  },
  methods: {
    hideMenu() {
      this.isMenuOpen = false;
      this.$emit("update:isVisible", false);
    },
    runCommand() {
      this.$emit("commandChanged", {
        type: "run",
        data: this.featureCode,
      });
    },
    removeCommand() {
      quickcommand.showConfirmBox("删除这个快捷命令").then((ok) => {
        if (!ok) return;
        this.$emit("commandChanged", {
          type: "remove",
          data: this.featureCode,
        });
      });
    },
    toggleCommandActivated() {
      this.$emit("commandChanged", {
        type: this.isActivated ? "disable" : "enable",
        data: this.featureCode,
      });
    },
    getRawCommand() {
      let command = window.lodashM.cloneDeep(this.commandInfo);
      command.features.explain = window.removeHtmlTags(
        command.features.explain
      );
      return command;
    },
    // 导出到剪贴板
    exportCommandRaw() {
      const commandName = this.commandInfo.features.explain.replace(
        /<strong style=".*?">|<\/strong>/g,
        ""
      );
      utools.copyText(JSON.stringify(this.getRawCommand(), null, 4)) &&
        utools.showNotification(`「${commandName}」已复制到剪贴板`);
    },
    // 创建命令副本
    createCommandCopy() {
      this.$emit("commandChanged", {
        type: "createCopy",
        data: this.featureCode,
      });
    },
    // 导出到文件
    exportCommandFile() {
      window.saveFile(JSON.stringify(this.getRawCommand()), {
        title: "选择保存位置",
        defaultPath: `${window.removeHtmlTags(
          this.commandInfo.features.explain
        )}.json`,
        filters: [{ name: "json", extensions: ["json"] }],
      });
    },
    shareCommand() {
      this.exportCommandRaw();
      utools.shellOpenExternal("https://qc.qaz.ink/submit");
    },
    addCrontab(cronExp) {
      this.$root.nativeProfile.crontabs[this.featureCode] = cronExp;
      this.$root.runCronTask(this.featureCode, cronExp);
    },
    delCrontab() {
      delete this.$root.nativeProfile.crontabs[this.featureCode];
      this.$root.cronJobs[this.featureCode].stop();
    },
  },
};
</script>

<style scoped>
.control-buttons {
  opacity: 0;
  transform: translateY(5px);
  visibility: hidden;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity, visibility;
}

.control-buttons.buttons-visible {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
  backdrop-filter: blur(1px);
}

/* 按钮悬浮效果 */
.q-btn {
  transition: transform 0.35s cubic-bezier(0.68, -0.6, 0.32, 1.6);
  will-change: transform;
}

.q-btn:hover {
  transform: scale(1.15);
}
</style>
