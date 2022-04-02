<template>
  <!-- mini 模式下如果命令未启用或者不可直接运行则隐藏卡片面板 -->
  <div
    class="wrapper"
    v-show="!(cardStyle.code === 1 && (!isCommandActivated || !canCommandRun))"
  >
    <div>
      <!-- mini 模式下不显示各类按钮 -->
      <div v-show="cardStyle.code > 1">
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
            color="green"
            icon="play_arrow"
            v-show="canCommandRun"
            @click="runCommand"
            ><q-tooltip anchor="top middle" self="center middle">
              运行
            </q-tooltip></q-btn
          >
          <q-btn flat round color="primary" icon="share">
            <q-tooltip anchor="top middle" self="center middle">
              导出
            </q-tooltip>
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item clickable v-close-popup @click="exportCommandFile">
                  <q-item-section>导出</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="exportCommandRaw">
                  <q-item-section>复制到剪贴板</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn flat round color="red" icon="close" @click="removeCommand"
            ><q-tooltip anchor="top middle" self="center middle">
              删除
            </q-tooltip></q-btn
          >
        </div>
      </div>
      <!-- 未启用的命令文字为灰色 -->
      <q-card v-ripple :style="isCommandActivated ? '' : 'color:grey'">
        <q-card-section>
          <!-- logo -->
          <div class="row">
            <q-img width="48px" :src="commandInfo.features.icon" />
          </div>
          <!-- 名称 -->
          <!-- mini 和 small 模式下命令标题字体变小 -->
          <div class="row justify-end">
            <div
              class="ellipsis"
              :style="{
                fontSize: cardStyle.code > 2 ? '1.25rem' : '1.1rem',
              }"
            >
              {{ commandInfo.features.explain }}
            </div>
          </div>
          <!-- 匹配模式 -->
          <div class="row justify-end q-gutter-xs">
            <div class="matchTypesBox">
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
            v-show="cardStyle.code > 1"
          >
            <span :style="'color:' + allProgrammings[commandInfo.program].color"
              >●</span
            >
            <span class="text-subtitle2">{{ commandInfo.program }}</span>
            <!-- mini 和 small 模式下不显示适配系统 -->
            <!-- 适配系统 -->
            <div class="flex" v-show="cardStyle.code > 2">
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
import allProgrammings from "../js/programs.js";
import UTOOLS from "../js/utools.js";

export default {
  data() {
    return {
      allProgrammings: allProgrammings,
      isCommandActivated: this.activated,
      maxCmdStingLen: 8,
      cmdBadgeSheet: {
        keyword: "teal",
        files: "light-blue",
        window: "indigo",
        regex: "cyan",
        over: "light-green",
        img: "deep-orange",
      },
    };
  },
  computed: {
    // 命令是否可直接运行
    canCommandRun() {
      return (
        this.commandInfo.features.cmds.filter((x) => x.length).length &&
        this.isCommandActivated
      );
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
    console.log("CommandCard", this);
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
    // 运行命令
    runCommand() {
      utools.redirect(
        this.commandInfo.features.cmds.filter((x) => x.length)[0]
      );
    },
    // 启用/禁用命令
    toggleCommandActivated() {
      let event = {
        type: "disable",
        data: this.commandInfo.features.code,
      };
      if (!UTOOLS.whole.removeFeature(this.commandInfo.features.code)) {
        UTOOLS.whole.setFeature(
          JSON.parse(JSON.stringify(this.commandInfo.features))
        );
        event.type = "enable";
      }
      this.$emit("commandChanged", event);
    },
    // 移除命令
    removeCommand() {
      quickcommand.showConfirmBox("删除这个快捷命令").then((x) => {
        if (!x) return;
        let code = this.commandInfo.features.code;
        utools.copyText(JSON.stringify(this.commandInfo, null, 4));
        UTOOLS.delDB(UTOOLS.DBPRE.QC + code);
        UTOOLS.whole.removeFeature(code);
        this.isCommandAlive = false;
        this.$emit("commandChanged", {
          type: "remove",
          data: code,
        });
        quickcommand.showMessageBox(
          "删除成功，为防止误操作，已将删除的命令复制到剪贴板"
        );
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
  width: 80%;
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
