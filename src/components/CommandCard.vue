<template>
  <!-- mini 模式下如果命令未启用或者不可直接运行则隐藏卡片面板 -->
  <div
    class="wrapper"
    v-show="!cardStyleVars.hideCard"
    :id="commandInfo.features.code"
  >
    <div>
      <!-- mini 模式下不显示各类按钮 -->
      <div v-show="cardStyleVars.showButtons">
        <!-- 开关 -->
        <div class="absolute" style="z-index: 1; left: 20px; bottom: 16px">
          <q-toggle
            v-model="isCommandActivated"
            checked-icon="flash_on"
            color="orange-6"
            @click="toggleCommandActivated"
          />
        </div>
        <!-- 选项按钮 -->
        <div class="absolute" style="z-index: 1; right: 16px; top: 16px">
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
            color="blue-9"
            icon="share"
          >
            <q-tooltip anchor="top middle" self="center middle">
              导出
            </q-tooltip>
            <q-menu transition-show="jump-down" transition-hide="jump-up">
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
        :style="{
          color: isCommandActivated ? 'unset' : 'grey',
          background: $q.dark.isActive ? '#ffffff08' : '#00000008'
        }"
      >
        <q-card-section>
          <!-- logo -->
          <div class="row" :class="cardStyleVars.logoPosition">
            <q-img width="48px" :src="commandInfo.features.icon" />
          </div>
          <!-- 名称 -->
          <!-- mini 和 small 模式下命令标题字体变小 -->
          <div :class="'row ' + cardStyleVars.fontPosition">
            <div
              class="ellipsis"
              :style="{
                fontSize: cardStyleVars.showBiggerTitle ? '1.25rem' : '1.1rem',
              }"
            >
              {{ commandInfo.features.explain }}
            </div>
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
                  <q-badge rounded :color="cmdBadgeColor()"
                    ><q-icon class="q-mr-xs" name="font_download" />{{
                      getShortStrByByte(cmd)
                    }}</q-badge
                  >
                  <q-tooltip>
                    <div class="text-subtitle2">
                      {{ cmd }}
                    </div>
                  </q-tooltip>
                </span>
                <span v-else-if="cmd.type === 'window' && cmd.match">
                  <q-badge rounded :color="cmdBadgeColor(cmd.type)"
                    ><q-icon class="q-mr-xs" name="widgets" />{{
                      getShortStrByByte(cmd.match.app[0])
                    }}
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
                  <q-badge rounded :color="cmdBadgeColor(cmd.type)"
                    ><q-icon class="q-mr-xs" name="description" />
                    {{
                      (cmd.match && getShortStrByByte(cmd.match)) || "所有文件"
                    }}</q-badge
                  >
                  <q-tooltip>
                    <div class="text-subtitle2">
                      {{ cmd.match || "所有文件" }}
                    </div>
                  </q-tooltip>
                </span>
                <span v-else-if="cmd.type === 'regex'">
                  <q-badge rounded :color="cmdBadgeColor(cmd.type)"
                    ><q-icon class="q-mr-xs" name="playlist_add_check" />{{
                      getShortStrByByte(cmd.match)
                    }}
                  </q-badge>
                  <q-tooltip>
                    <div class="text-subtitle2">
                      {{ cmd.match }}
                    </div>
                  </q-tooltip>
                </span>
                <span v-else-if="cmd.type === 'over'">
                  <q-badge rounded :color="cmdBadgeColor(cmd.type)"
                    ><q-icon class="q-mr-xs" name="clear_all" />所有文本
                  </q-badge>
                </span>
                <span v-else-if="cmd.type === 'img'">
                  <q-badge rounded :color="cmdBadgeColor(cmd.type)" label="">
                    <q-icon class="q-mr-xs" name="panorama" />图片
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
            <span :style="'color:' + allProgrammings[commandInfo.program].color"
              >●</span
            >
            <span class="text-subtitle2">{{ commandInfo.program }}</span>
            <!-- mini 和 small 模式下不显示适配系统 -->
            <!-- 适配系统 -->
            <div class="flex" v-show="cardStyleVars.showPlatforms">
              |&nbsp;
              <img
                width="16"
                v-for="platform in commandInfo.features.platform"
                :key="platform"
                :src="'/img/' + platform + '.svg'"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      allProgrammings: this.$programmings,
      isCommandActivated: this.activated,
      maxCmdStingLen: 8,
      cmdBadgeSheet: {
        keyword: "primary",
        files: "light-blue",
        window: "indigo",
        regex: "cyan",
        over: "light-green",
        img: "deep-orange",
      },
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
    // 命令是否可直接运行, 无论 cmds 长度为多少，只运行 cmds[0]
    canCommandRun() {
      // 未启用
      if (!this.isCommandActivated) return false;
      let cmd = this.commandInfo.features.cmds[0];
      // 窗口模式
      if (cmd.type && cmd.type === "window") return false;
      return true;
    },
    // 默认命令不可删除
    canCommandEdit() {
      if (utools.isDev()) return true;
      return this.commandInfo.tags?.includes("默认") ? false : true;
    },
    // 匹配类型的颜色
    cmdBadgeColor() {
      return (cmdType = "keyword") => {
        if (!this.isCommandActivated)
          return this.$q.dark.isActive ? "grey-9" : "grey-5";
        return this.cmdBadgeSheet[cmdType];
      };
    },
  },
  props: {
    commandInfo: Object,
    activated: Boolean,
    cardStyle: Object,
  },
  mounted() {
    // console.log(this.commandInfo.features.code, this);
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
      // 视图模式下直接运行命令
      if (this.cardStyle.code === 1) return this.runCommand();
      if (!this.canCommandEdit)
        return quickcommand.showMessageBox("默认命令不可编辑", "warning");
      this.editCommand();
    },
    // 编辑命令
    editCommand() {
      let event = {
        type: "edit",
        data: this.commandInfo.features.code,
      };
      this.$emit("commandChanged", event);
    },
    // 运行命令
    runCommand() {
      utools.redirect(
        this.commandInfo.features.cmds.filter((x) => x.length)[0]
      );
    },
    // 启用/禁用命令
    toggleCommandActivated() {
      let event = {
        data: this.commandInfo.features.code,
      };
      event.type = this.isCommandActivated ? "enable" : "disable";
      this.$emit("commandChanged", event);
    },
    // 移除命令
    removeCommand() {
      quickcommand.showConfirmBox("删除这个快捷命令").then((x) => {
        if (!x) return;
        this.isCommandAlive = false;
        let code = this.commandInfo.features.code;
        this.$emit("commandChanged", {
          type: "remove",
          data: code,
        });
      });
    },
    // 导出到剪贴板
    exportCommandRaw() {
      utools.copyText(JSON.stringify(this.commandInfo, null, 4)) &&
        quickcommand.showMessageBox("已复制到剪贴板");
    },
    // 导出到文件
    exportCommandFile() {
      window.saveFile(JSON.stringify(this.commandInfo), {
        title: "选择保存位置",
        defaultPath: `${this.commandInfo.features.explain}.json`,
        filters: [{ name: "json", extensions: ["json"] }],
      });
    },
  },
};
</script>

<style scoped>
.q-card {
  cursor: pointer;
  user-select: none;
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
  transition: 0.5s;
}
.wrapper:hover {
  transition: 0.5s;
  transform: translateY(-5px);
  filter: drop-shadow(1px 1px 5px #0000008e);
}
</style>
