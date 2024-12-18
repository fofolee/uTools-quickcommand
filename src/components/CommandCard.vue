<template>
  <!-- mini 模式下如果命令未启用或者不可直接运行则隐藏卡片面板 -->
  <div
    :class="{ wrapper: 1, warpperHover: isWarpperHover }"
    v-show="!cardStyleVars.hideCard"
    :id="commandInfo.features.code"
    @mouseenter="isWarpperHover = true"
    @mouseleave="if (!isCtrlBtnMenuOpen) isWarpperHover = false;"
  >
    <div>
      <!-- mini 模式下不显示各类按钮 -->
      <div v-show="cardStyleVars.showButtons">
        <!-- 开关 -->
        <div class="absolute" style="z-index: 1; left: 20px; bottom: 16px">
          <q-toggle
            :model-value="isCommandActivated"
            checked-icon="flash_on"
            color="orange-6"
            @click="toggleCommandActivated"
          />
        </div>
        <!-- 选项按钮 -->
        <div
          class="absolute control-buttons"
          style="z-index: 1; right: 16px; top: 16px"
          :class="{ 'buttons-visible': isWarpperHover }"
        >
          <q-btn
            flat
            round
            dense
            color="green"
            icon="play_arrow"
            v-show="canCommandRun"
            @click="runCommand"
            ><q-tooltip anchor="top middle" self="center middle">
              运行
            </q-tooltip></q-btn
          >
          <q-btn
            v-if="canCommandEdit"
            dense
            flat
            round
            :color="!!cronExp ? 'amber' : 'blue-9'"
            :icon="!!cronExp ? 'timer' : 'insights'"
            @click="isCtrlBtnMenuOpen = true"
          >
            <q-tooltip anchor="top middle" self="center middle">
              设置
            </q-tooltip>
            <q-menu
              transition-show="jump-down"
              transition-hide="jump-up"
              @hide="
                isCtrlBtnMenuOpen = false;
                isWarpperHover = false;
              "
            >
              <q-list style="min-width: 100px">
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
                  :disable="!canCommandAddCron"
                >
                  <q-item-section side>
                    <q-icon name="timer" />
                  </q-item-section>
                  <q-item-section>定时任务</q-item-section>
                  <q-tooltip
                    >在后台定时执行当前命令，仅匹配类型为关键字时可用，且一律忽略输出<br />
                    不同电脑间的定时任务不会同步</q-tooltip
                  >
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn
            v-if="canCommandEdit"
            flat
            round
            dense
            color="red"
            icon="close"
            @click="removeCommand"
            ><q-tooltip anchor="top middle" self="center middle">
              删除
            </q-tooltip></q-btn
          >
        </div>
      </div>
      <!-- 未启用的命令文字为灰色 -->
      <q-card
        @click="handleCardClick"
        v-ripple
        :class="{ [`text-${disabledColor}`]: !isCommandActivated, command: 1 }"
      >
        <q-card-section>
          <!-- logo -->
          <div class="row" :class="cardStyleVars.logoPosition">
            <q-avatar
              square
              size="48px"
              :class="{
                featureIco: 1,
                featureIcoHover: isWarpperHover,
                'feature-disabled': !isCommandActivated
              }"
            >
              <img :src="commandInfo.features.icon" />
            </q-avatar>
          </div>
          <!-- 名称 -->
          <!-- mini 和 small 模式下命令标题字体变小 -->
          <div :class="'row ' + cardStyleVars.fontPosition">
            <div
              class="ellipsis"
              :style="{
                fontSize: cardStyleVars.showBiggerTitle ? '1.25rem' : '1.1rem',
              }"
              v-html="commandInfo.features.explain.trim() || '<br/>'"
            />
          </div>
          <!-- 匹配模式 -->
          <div class="row">
            <div
              :class="
                'matchTypesBox flex q-gutter-xs ' + cardStyleVars.fontPosition
              "
            >
              <span v-for="cmd in commandInfo.features.cmds" :key="cmd">
                <span v-if="typeof cmd === 'string'">
                  <q-badge
                    rounded
                    :color="matchTypeColor()"
                    :class="cardBadgeClass"
                  >
                    <q-icon class="q-mr-xs" :name="commandTypes.key.icon" />
                    {{ getShortStrByByte(cmd) }}
                  </q-badge>
                  <q-tooltip>
                    <div class="text-subtitle2">
                      {{ cmd }}
                    </div>
                  </q-tooltip>
                </span>
                <span v-else-if="cmd.type === 'window' && cmd.match">
                  <q-badge
                    rounded
                    :color="matchTypeColor(cmd.type)"
                    :class="cardBadgeClass"
                  >
                    <q-icon
                      class="q-mr-xs"
                      :name="commandTypes.window.icon"
                    />
                    {{ getShortStrByByte(cmd.match.app[0]) }}
                  </q-badge>
                  <q-tooltip>
                    <div
                      class="text-subtitle2"
                      v-for="app in cmd.match.app"
                      :key="app"
                    >
                      {{ app }}
                    </div>
                  </q-tooltip>
                </span>
                <span v-else-if="cmd.type === 'files'">
                  <q-badge
                    rounded
                    :color="matchTypeColor(cmd.type)"
                    :class="cardBadgeClass"
                  >
                    <q-icon class="q-mr-xs" :name="commandTypes.files.icon" />
                    {{
                      (cmd.match && getShortStrByByte(cmd.match)) || "所有文件"
                    }}
                  </q-badge>
                  <q-tooltip>
                    <div class="text-subtitle2">
                      {{ cmd.match || "所有文件" }}
                    </div>
                  </q-tooltip>
                </span>
                <span v-else-if="cmd.type === 'regex'">
                  <q-badge
                    rounded
                    :color="matchTypeColor(cmd.type)"
                    :class="cardBadgeClass"
                  >
                    <q-icon
                      class="q-mr-xs"
                      :name="commandTypes.regex.icon"
                    />
                    {{ getShortStrByByte(cmd.match) }}
                  </q-badge>
                  <q-tooltip>
                    <div class="text-subtitle2">
                      {{ cmd.match }}
                    </div>
                  </q-tooltip>
                </span>
                <span v-else-if="cmd.type === 'over'">
                  <q-badge
                    rounded
                    :color="matchTypeColor(cmd.type)"
                    :class="cardBadgeClass"
                  >
                    <q-icon
                      class="q-mr-xs"
                      :name="commandTypes.over.icon"
                    />所有文本
                  </q-badge>
                </span>
                <span v-else-if="cmd.type === 'img'">
                  <q-badge
                    rounded
                    :color="matchTypeColor(cmd.type)"
                    :class="cardBadgeClass"
                  >
                    <q-icon class="q-mr-xs" :name="commandTypes.img.icon" />图片
                  </q-badge>
                </span>
              </span>
            </div>
          </div>
          <!-- mini模式下不显示语言类型和适配系统 -->
          <!-- 语言类型 -->
          <div
            class="row justify-end items-center q-gutter-xs"
            v-show="cardStyleVars.showLanguages"
          >
            <span :class="`text-${programColor}`">●</span>
            <span class="text-subtitle2">{{ commandInfo.program }}</span>
            <!-- mini 和 small 模式下不显示适配系统 -->
            <!-- 适配系统 -->
            <div class="q-gutter-xs" v-show="cardStyleVars.showPlatforms">
              <span
                v-for="platform in commandInfo.features.platform"
                :key="platform"
                :class="`iconfont icon-${platformTypes[platform].icon} text-${programColor}`"
                style="font-size: 12px"
              ></span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <q-dialog v-model="showCrontab">
      <CrontabSetting
        :cronExp="cronExp"
        @addCrontab="addCrontab"
        @delCrontab="delCrontab"
      />
    </q-dialog>
    <!-- <q-dialog v-model="showShare">
      <ShareDialog :command="getRawCommand(commandInfo)" />
    </q-dialog> -->
  </div>
</template>

<script>
import commandTypes from "../js/options/commandTypes.js";
import platformTypes from "../js/options/platformTypes.js";
import CrontabSetting from "components/popup/CrontabSetting";
// import ShareDialog from "components/popup/ShareDialog";

export default {
  components: {
    CrontabSetting,
    // ShareDialog
  },
  data() {
    return {
      allProgrammings: this.$root.programs,
      maxCmdStingLen: 8,
      commandTypes: commandTypes,
      platformTypes: platformTypes,
      showCrontab: false,
      // showShare: false,
      cronJob: null,
      isWarpperHover: false,
      isCtrlBtnMenuOpen: false,
    };
  },
  computed: {
    //   控制卡片样式的具体参数
    cardStyleVars() {
      return {
        showButtons: this.cardStyle.code > 1,
        showPlatforms: this.cardStyle.code > 2,
        showLanguages: this.cardStyle.code > 1,
        showBiggerTitle: this.cardStyle.code > 2,
        logoPosition:
          this.cardStyle.code > 1 ? "justify-start" : "justify-center",
        fontPosition:
          this.cardStyle.code > 1 ? "justify-end" : "justify-center",
        hideCard:
          this.cardStyle.code === 1 &&
          (!this.isCommandActivated || !this.canCommandRun),
      };
    },
    // 命令是否适合当前平台
    canCommandRunAtCurrentOS() {
      let { platform } = this.commandInfo.features;
      return !_.isEmpty(platform) && !platform.includes(window.processPlatform)
        ? false
        : true;
    },
    // 命令是否可直接运行, 无论 cmds 长度为多少，只运行 cmds[0]
    canCommandRun() {
      // 未启用
      if (!this.isCommandActivated) return false;
      if (!this.canCommandRunAtCurrentOS) return false;
      let { cmds } = this.commandInfo.features;
      // 窗口模式
      if (cmds[0].type && cmds[0].type === "window") return false;
      return true;
    },
    // 命令未启用也可以添加计划任务
    canCommandAddCron() {
      return !!this.commandInfo.features.cmds[0].length;
    },
    // 默认命令不可删除
    canCommandEdit() {
      if (utools.isDev()) return true;
      return this.commandInfo.tags?.includes("默认") ? false : true;
    },
    // 匹配类型的颜色
    matchTypeColor() {
      return (cmdType = "key") => {
        if (!this.canCommandRunAtCurrentOS || !this.isCommandActivated) {
          return this.$q.dark.isActive ? 'grey-9' : this.disabledColor;
        }
        return this.commandTypes[cmdType].color;
      };
    },
    programColor() {
      return this.isCommandActivated
        ? this.allProgrammings[this.commandInfo.program].color
        : this.disabledColor;
    },
    disabledColor() {
      return this.$q.dark.isActive ? "grey-6" : "grey-5";
    },
    featureCode() {
      return this.commandInfo.features.code;
    },
    cronExp() {
      return this.$root.nativeProfile.crontabs[this.featureCode];
    },
    cardBadgeClass() {
      return (!this.canCommandRunAtCurrentOS || !this.isCommandActivated) && this.$q.dark.isActive
        ? 'text-grey-6'
        : '';
    },
  },
  props: {
    commandInfo: Object,
    isCommandActivated: Boolean,
    cardStyle: Object,
  },
  methods: {
    // 匹配类型太长的话截断
    getShortStrByByte(str) {
      let byteLen = 0;
      let shortStr = "";
      for (let i = 0; i < str.length; i++) {
        byteLen += 129 - str[i].charCodeAt(0) > 0 ? 1 : 2;
        if (byteLen > this.maxCmdStingLen) break;
        shortStr += str[i];
      }
      return shortStr === str ? shortStr : shortStr + "...";
    },
    // 命令卡片点击事件
    handleCardClick() {
      // 视图模式直接运行命令
      if (this.cardStyle.code === 1) return this.runCommand();
      this.editCommand();
    },
    // 编辑命令
    editCommand() {
      let event = {
        type: "edit",
        data: this.featureCode,
      };
      this.$emit("commandChanged", event);
    },
    // 运行命令
    runCommand() {
      let event = {
        type: "run",
        data: this.featureCode,
      };
      this.$emit("commandChanged", event);
    },
    addCrontab(cronExp) {
      this.$root.nativeProfile.crontabs[this.featureCode] = cronExp;
      this.$root.runCronTask(this.featureCode, cronExp);
    },
    delCrontab() {
      delete this.$root.nativeProfile.crontabs[this.featureCode];
      this.$root.cronJobs[this.featureCode].stop();
    },
    // 启用/禁用命令
    toggleCommandActivated() {
      let event = {
        data: this.featureCode,
        type: "toggle",
      };
      event.type = this.isCommandActivated ? "disable" : "enable";
      this.$emit("commandChanged", event);
    },
    // 移除命令
    removeCommand() {
      quickcommand.showConfirmBox("删除这个快捷命令").then((x) => {
        if (!x) return;
        this.isCommandAlive = false;
        let code = this.featureCode;
        this.$emit("commandChanged", {
          type: "remove",
          data: code,
        });
      });
    },
    getRawCommand() {
      let command = _.cloneDeep(this.commandInfo);
      command.features.explain = window.removeHtmlTags(
        command.features.explain
      );
      return command;
    },
    // 导出到剪贴板
    exportCommandRaw() {
      utools.copyText(JSON.stringify(this.getRawCommand(), null, 4)) &&
        utools.showNotification(`「${this.commandInfo.features.explain}」已复制到剪贴板`);
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
  },
};
</script>

<style scoped>
.q-card.command {
  cursor: pointer;
  user-select: none;
  background: #ffffff08;
  transition: 0.5s;
}

.q-badge {
  font-size: 15px;
  margin: 0 1px;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.matchTypesBox {
  height: 23px;
  width: 100%;
  overflow: hidden;
  text-align: right;
}
.wrapper {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.warpperHover {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(-3px);
}
.featureIco {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.featureIcoHover {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(1.1);
}
.control-buttons {
  opacity: 0;
  transform: translateY(5px);
  visibility: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.control-buttons.buttons-visible {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
}

.feature-disabled {
  opacity: 0.5;
  filter: grayscale(100%);
}
</style>
