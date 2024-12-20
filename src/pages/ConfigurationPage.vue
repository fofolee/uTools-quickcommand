<template>
  <div class="config-page-container">
    <div
      class="background-layer"
      :style="{
        background: $q.dark.isActive
          ? $root.profile.backgroundImgDark
            ? `url('${$root.profile.backgroundImgDark}')`
            : 'none'
          : $root.profile.backgroundImgLight
          ? `url('${$root.profile.backgroundImgLight}')`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }"
    ></div>
    <!-- 标签栏 -->
    <!-- 面板视图不显示标签栏 -->
    <q-scroll-area
      v-show="commandCardStyle !== 'mini'"
      class="absolute-left"
      :thumb-style="{
        width: '2px',
      }"
      :style="{
        width: tabBarWidth,
        zIndex: 1,
      }"
    >
      <q-tabs
        v-model="currentTag"
        vertical
        switch-indicator
        :key="$root.profile.denseTagBar"
        :dense="$root.profile.denseTagBar"
      >
        <!-- 所有标签 -->
        <q-tab
          v-for="tag in allQuickCommandTags"
          :key="tag"
          :name="tag"
          :data-search-result="tag === '搜索结果'"
          :data-active-panel="activatedQuickPanels.includes(tag)"
        >
          {{ tag }}
          <q-tooltip v-if="tag === '未分类'">
            所有没有添加标签的命令都会归在未分类 <br />
            可以在新建命令时在标签一栏选择或直接键入标签名来添加标签
          </q-tooltip>
        </q-tab>
      </q-tabs>
    </q-scroll-area>
    <!-- 面板栏 -->
    <q-tab-panels
      animated
      class="absolute-right"
      :style="{
        bottom: footerBarHeight,
        left: tabBarWidth,
      }"
      v-model="currentTag"
      transition-prev="slide-down"
      transition-next="slide-up"
    >
      <q-tab-panel
        style="padding: 0"
        v-for="tag in allQuickCommandTags"
        :key="tag"
        :name="tag"
      >
        <q-scroll-area
          style="height: 100%"
          :thumb-style="{
            background: 'grey',
            width: '6px',
            opacity: 0.5,
          }"
        >
          <div class="row center q-pa-xs">
            <CommandCard
              v-for="commandInfo in currentTagQuickCommands"
              :key="commandInfo.features.code"
              :commandInfo="commandInfo"
              :isCommandActivated="
                activatedQuickCommandFeatureCodes.includes(
                  commandInfo.features.code
                )
              "
              :cardStyle="commandCardStyleSheet[commandCardStyle]"
              @commandChanged="commandChanged"
              :style="{
                width: commandCardStyleSheet[commandCardStyle].width,
              }"
              class="relative-position q-pa-sm"
            ></CommandCard>
          </div>
        </q-scroll-area>
      </q-tab-panel>
    </q-tab-panels>
    <!-- 底栏 -->
    <div
      class="absolute-bottom"
      :style="{
        height: footerBarHeight,
        left: tabBarWidth,
      }"
    >
      <div class="row">
        <!-- 搜索栏 -->
        <div class="col">
          <q-input
            v-model="commandSearchKeyword"
            debounce="200"
            filled
            dense
            :autofocus="$root.profile.autofocusSearch"
            @update:model-value="updateSearch"
            placeholder="搜索，支持拼音首字母"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <!-- 按钮组 -->
        <div class="col-auto justify-end flex">
          <q-btn-group>
            <!-- 添加暗色模式切换按钮 -->
            <q-btn
              flat
              v-if="isDev"
              :color="$q.dark.isActive ? 'amber' : 'blue-9'"
              :icon="$q.dark.isActive ? 'dark_mode' : 'light_mode'"
              @click="$q.dark.toggle()"
            >
              <q-tooltip>
                {{ $q.dark.isActive ? "切换到亮色模式" : "切换到暗色模式" }}
              </q-tooltip>
            </q-btn>
            <!-- 切换视图 -->
            <q-btn-toggle
              v-model="commandCardStyle"
              @click="$root.profile.commandCardStyle = commandCardStyle"
              toggle-color="primary"
              flat
              :options="[
                { slot: 'normal', value: 'normal' },
                { slot: 'dense', value: 'dense' },
                { slot: 'mini', value: 'mini' },
              ]"
            >
              <template v-slot:normal>
                <q-icon name="dashboard" />
                <q-tooltip>按两列排列的基础视图</q-tooltip>
              </template>
              <template v-slot:dense>
                <q-icon name="apps" />
                <q-tooltip
                  >按三列排列的紧凑视图，但不会显示适用的操作系统</q-tooltip
                >
              </template>
              <template v-slot:mini>
                <q-icon name="view_comfy" />
                <q-tooltip
                  >按四列排列的面板视图<br />
                  老版本的「快捷面板」已被弃用，取而代之的是新版的「面板视图」<br />
                  注意：<br />
                  1.未启用、匹配类型为窗口的命令在此视图下不显示<br />
                  2.只显示图标描述和匹配类型<br />
                  3.点击卡片时会直接运行命令而不是编辑命令</q-tooltip
                >
              </template>
            </q-btn-toggle>
            <!-- <q-separator vertical /> -->
            <q-btn
              split
              flat
              @click="goShareCenter"
              color="primary"
              label="分享中心"
              icon="groups"
            />
            <!-- <q-separator vertical /> -->
            <!-- 新建按钮 -->
            <q-btn
              split
              flat
              @click="addNewCommand"
              color="primary"
              label="新建"
              icon="add"
            />
            <!-- <q-separator vertical /> -->
            <q-btn
              stretch
              color="primary"
              flat
              size="xs"
              id="menuBtn"
              :style="{
                height: footerBarHeight,
              }"
              ><q-spinner-bars color="primary" size="1.5em" />
              <!-- 菜单 -->
              <ConfigurationMenu
                :isTagStared="activatedQuickPanels.includes(currentTag)"
                :currentTag="currentTag"
              >
              </ConfigurationMenu>
            </q-btn>
          </q-btn-group>
        </div>
      </div>
    </div>
    <!-- 命令编辑界面 -->
    <q-dialog
      v-model="isCommandEditorShow"
      persistent
      maximized
      :transition-show="fromNewCommand ? '' : 'slide-up'"
      transition-hide="slide-down"
      style="overflow: hidden"
    >
      <CommandEditor
        ref="commandEditor"
        :action="commandEditorAction"
        @editorEvent="editorEvent"
      ></CommandEditor>
    </q-dialog>
    <CommandRunResult
      :action="{ type: 'config' }"
      ref="result"
    ></CommandRunResult>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import quickcommandParser from "../js/common/quickcommandParser.js";
import importAll from "../js/common/importAll.js";
import changeLog from "../js/options/changeLog.js";
import pinyinMatch from "pinyin-match";
import CommandCard from "components/CommandCard";
import CommandEditor from "components/CommandEditor";
const CommandRunResult = defineAsyncComponent(() =>
  import("components/CommandRunResult.vue")
);
// Performance Rendering > 300ms
const ConfigurationMenu = defineAsyncComponent(() =>
  import("components/ConfigurationMenu.vue")
);

// 默认命令
let defaultCommands = importAll(require.context("../json/", false, /\.json$/));

export default {
  components: {
    CommandCard,
    CommandEditor,
    ConfigurationMenu,
    CommandRunResult,
  },
  data() {
    return {
      currentTag: "默认",
      lastTag: "",
      activatedQuickCommandFeatureCodes: [],
      activatedQuickPanels: [],
      allQuickCommands: {},
      allQuickCommandTags: [],
      commandSearchKeyword: "",
      isCommandEditorShow: false,
      commandEditorAction: {},
      footerBarHeight: "40px",
      commandCardStyle: this.$root.profile.commandCardStyle,
      isDev: window.utools.isDev(),
      commandCardStyleSheet: {
        mini: {
          width: "20%",
          code: 1,
        },
        dense: {
          width: "33%",
          code: 2,
        },
        normal: {
          width: "50%",
          code: 3,
        },
        large: {
          width: "100%",
          code: 4,
        },
      },
    };
  },
  computed: {
    // 当前标签下的所有快捷命令
    currentTagQuickCommands() {
      let commands = Object.values(_.cloneDeep(this.allQuickCommands));
      switch (this.currentTag) {
        case "未分类":
          return commands.filter((cmd) => !cmd.tags || cmd.tags.length === 0);
        // case "来自分享":
        //   return commands.filter((cmd) => cmd.fromShare);
        case "搜索结果":
          if (this.commandSearchKeyword?.length < 2) return;
          let searchResult = [];
          commands.forEach((cmd) => {
            // 拼音搜索
            let explain = cmd.features.explain;
            let matchedWordPositions = pinyinMatch.match(
              explain,
              this.commandSearchKeyword
            );
            if (!matchedWordPositions) return;
            let matchedWords = explain.slice(
              matchedWordPositions[0],
              matchedWordPositions[1] + 1
            );
            // 高亮
            cmd.features.explain = explain.replace(
              matchedWords,
              `<strong style="color:#ed6237">${matchedWords}</strong>`
            );
            searchResult.push(cmd);
          });
          return searchResult;
        default:
          return commands.filter((cmd) => cmd.tags?.includes(this.currentTag));
      }
    },
    // 标签栏宽度
    tabBarWidth() {
      return this.commandCardStyle === "mini" ? "0" : "80px";
    },
    fromNewCommand() {
      return this.$route.name === "newcommand";
    },
    fromImportCommand() {
      return this.$route.name === "importcommand";
    },
  },
  mounted() {
    this.initPage();
  },
  methods: {
    // 初始化
    initPage() {
      // newcommand 直接新建命令
      if (this.fromNewCommand) this.addNewCommand();
      // importcommand 导入命令
      else if (this.fromImportCommand)
        this.importCommand(this.$root.enterData.payload);
      this.$router.push("/configuration");
      if (this.$route.params.tags) {
        this.changeCurrentTag(window.hexDecode(this.$route.params.tags));
        this.commandCardStyle = "mini";
      }
      this.showChangeLog();
      // 异步读取
      setTimeout(this.getActivatedFeatures, 0);
      setTimeout(this.getAllQuickCommands, 0);
    },
    // 获取所有已启用的命令的 features 以及面板名称
    getActivatedFeatures() {
      let features = utools.getFeatures();
      let currentFts = [];
      let quickpanels = [];
      features.forEach((x) =>
        x.code.slice(0, 6) == "panel_"
          ? quickpanels.push(window.hexDecode(x.code.slice(6)))
          : currentFts.push(x)
      );
      this.activatedQuickCommandFeatureCodes = currentFts.map((f) => f.code);
      // 已启用的面板
      this.activatedQuickPanels = quickpanels;
    },
    // 获取所有的命令（导出的格式）
    getAllQuickCommands() {
      this.allQuickCommands = _.cloneDeep(defaultCommands);
      this.$root.utools.getAll("qc_").forEach((x) => {
        if (x.data.features.code.includes("default_")) return;
        this.allQuickCommands[x.data.features.code] = x.data;
      });
      this.getAllQuickCommandTags();
    },
    getAllQuickCommandTags() {
      this.allQuickCommandTags = _.union(
        ...Object.values(this.allQuickCommands).map((x) => x.tags)
      )
        .concat([
          "未分类",
          // "来自分享"
        ])
        .filter((x) => x);
    },
    // 监听命令变更事件
    commandChanged(event) {
      switch (event.type) {
        case "remove":
          this.removeCommand(event.data);
          return;
        case "enable":
          this.enableCommand(event.data);
          return;
        case "disable":
          this.disableCommand(event.data);
          return;
        case "edit":
          this.editCommand(event.data);
          return;
        case "run":
          this.runCommand(event.data);
          return;
        default:
          return;
      }
    },
    runCommand(code) {
      this.$refs.result.runCurrentCommand(
        _.cloneDeep(this.allQuickCommands[code])
      );
    },
    // 启用命令
    enableCommand(code) {
      this.$root.utools.whole.setFeature(
        _.cloneDeep(this.allQuickCommands[code].features)
      );
      this.activatedQuickCommandFeatureCodes.push(code);
    },
    // 禁用命令
    disableCommand(code) {
      this.$root.utools.whole.removeFeature(code);
      this.activatedQuickCommandFeatureCodes =
        this.activatedQuickCommandFeatureCodes.filter((x) => x !== code);
    },
    // 删除命令
    removeCommand(code) {
      utools.copyText(JSON.stringify(this.allQuickCommands[code], null, 4));
      delete this.allQuickCommands[code];
      this.$root.utools.delDB("qc_" + code);
      this.disableCommand(code);
      this.getAllQuickCommandTags();
      if (!this.allQuickCommandTags.includes(this.currentTag))
        this.changeCurrentTag("默认");
      quickcommand.showMessageBox(
        "删除成功，为防止误操作，已将删除的命令复制到剪贴板",
        "success",
        1000
      );
    },
    // 编辑命令
    editCommand(command) {
      // 即可传入 code，也可直接传入 command
      if (typeof command === "string") command = this.allQuickCommands[command];
      this.commandEditorAction = {
        type: "edit",
        data: _.cloneDeep(command),
      };
      this.isCommandEditorShow = true;
    },
    // 是否为默认命令
    isDefaultCommand(code) {
      return code.slice(0, 8) === "default_";
    },
    // 导入命令
    async importCommand(quickCommandInfo) {
      if (!quickCommandInfo)
        return quickcommand.showMessageBox("导入未完成！", "warning");
      let parsedData = await quickcommandParser(quickCommandInfo);
      if (!parsedData) return quickcommand.showMessageBox("格式错误", "error");
      // 单个命令导入
      let dataToPushed = {};
      if (parsedData.single) {
        if (this.isDefaultCommand(parsedData.qc.features.code))
          return quickcommand.showMessageBox("默认命令不能导入！", "error");
        dataToPushed[parsedData.qc.features.code] = parsedData.qc;
        // 多个
      } else {
        dataToPushed = parsedData.qc;
      }
      for (var code of Object.keys(dataToPushed)) {
        if (this.isDefaultCommand(code)) continue;
        this.$root.utools.putDB(dataToPushed[code], "qc_" + code);
      }
      Object.assign(this.allQuickCommands, dataToPushed);
      this.getAllQuickCommandTags();
      quickcommand.showMessageBox("导入成功！");
      this.locateToCommand(parsedData.qc.tags, parsedData.qc.features?.code);
    },
    // 定位命令, 包含changeCurrentTag
    locateToCommand(tags = ["默认"], code) {
      this.currentTag = !tags || !tags.length ? "未分类" : tags[0];
      if (!code) return;
      // 等待 dom 渲染
      this.$nextTick(() => {
        let el = document.getElementById(code);
        el.scrollIntoViewIfNeeded();
        el.querySelector(".q-card").style.boxShadow =
          "0px 1px var(--q-primary)";
        setTimeout(() => {
          el.querySelector(".q-card").style.boxShadow = "";
        }, 5000);
        // 跳转标签
        document
          .querySelector(".q-tab--active")
          .scrollIntoView({ behavior: "smooth" });
      });
    },
    // 修改并定位当前标签事件
    changeCurrentTag(tagName) {
      this.currentTag = tagName;
      this.$nextTick(() => {
        document
          .querySelector(".q-tab--active")
          .scrollIntoView({ behavior: "smooth" });
      });
    },
    // 全部导出
    exportAllCommands(saveAsFile = true) {
      let options = {
        title: "选择保存位置",
        defaultPath: "quickCommand",
        filters: [
          {
            name: "json",
            extensions: ["json"],
          },
        ],
      };
      let commandsToExport = _.cloneDeep(this.allQuickCommands);
      // 不导出默认命令
      Object.keys(commandsToExport).forEach((code) => {
        if (this.isDefaultCommand(code)) delete commandsToExport[code];
      });
      let stringifyCommands = JSON.stringify(commandsToExport);
      if (saveAsFile) {
        window.saveFile(stringifyCommands, options) &&
          quickcommand.showMessageBox("导出成功！");
      } else {
        utools.copyText(stringifyCommands);
      }
    },
    // 清空
    clearAllCommands() {
      quickcommand
        .showConfirmBox("将会清空所有自定义命令，停用所有实用功能，请确认！")
        .then((isConfirmed) => {
          if (!isConfirmed)
            return quickcommand.showMessageBox("取消操作", "info");
          this.exportAllCommands(false);
          this.$root.utools.delAll("qc_");
          this.clearAllFeatures();
          this.allQuickCommands = _.cloneDeep(defaultCommands);
          this.getAllQuickCommandTags();
          this.changeCurrentTag("默认");
          quickcommand.showMessageBox(
            "清空完毕，为防止误操作，已将所有命令复制到剪贴板，可通过导入命令恢复"
          );
        });
    },
    // 删除所有 features
    clearAllFeatures() {
      for (var feature of utools.getFeatures()) {
        if (feature.code.slice(0, 8) === "feature_") continue;
        this.$root.utools.whole.removeFeature(feature.code);
      }
      this.activatedQuickCommandFeatureCodes = [];
    },
    // 搜索
    updateSearch() {
      // 记录当前标签页
      let searchTagName = "搜索结果";
      if (this.currentTag !== searchTagName) this.lastTag = this.currentTag;
      if (this.commandSearchKeyword?.length > 1) {
        if (!this.allQuickCommandTags.includes(searchTagName))
          this.allQuickCommandTags.push(searchTagName);
        // 搜索时跳转到搜索结果标签
        this.changeCurrentTag(searchTagName);
      } else {
        // 清空搜索回跳到之前标签
        if (this.allQuickCommandTags.slice(-1)[0] === searchTagName)
          this.allQuickCommandTags.pop();
        if (this.currentTag !== this.lastTag)
          this.changeCurrentTag(this.lastTag);
      }
    },
    // 新建命令
    addNewCommand() {
      this.commandEditorAction = {
        type: "new",
        data: {},
      };
      this.isCommandEditorShow = true;
    },
    saveCommand(command) {
      let code = command.features.code;
      this.allQuickCommands[code] = command;
      //无论禁用还是启用都启用
      if (!this.activatedQuickCommandFeatureCodes.includes(code))
        this.activatedQuickCommandFeatureCodes.push(code);
      // 先删除再添加，强制刷新
      this.$root.utools.whole.removeFeature(code);
      this.$root.utools.whole.setFeature(command.features);
      this.getAllQuickCommandTags();
      this.locateToCommand(command.tags, code);
    },
    editorEvent(event) {
      switch (event.type) {
        case "save":
          this.saveCommand(event.data);
        // this.isCommandEditorShow = false;
        default:
          return;
      }
    },
    showChangeLog() {
      let lastNeedLogEvent = changeLog[changeLog.length - 1];
      let loggedVersion =
        this.$root.utools.whole.dbStorage.getItem("cfg_loggedVersion") ||
        "0.0.0";
      if (loggedVersion < lastNeedLogEvent.version) {
        quickcommand.showConfirmBox(
          '<pre style="white-space: pre-wrap;word-wrap: break-word;">' +
            lastNeedLogEvent.log +
            "</pre>",
          "更新日志",
          true,
          700
        );
        this.$root.utools.whole.dbStorage.setItem(
          "cfg_loggedVersion",
          lastNeedLogEvent.version
        );
      }
    },
    goShareCenter() {
      utools.shellOpenExternal("https://qc.qaz.ink/");
    },
  },
};
</script>

<style scoped>
/* 标签栏容器样式 */
.q-tabs {
  height: 100vh !important;
  background: transparent !important;
}

/* 标签栏和底栏内的按钮悬浮效果 */
.q-tabs .q-tab:hover,
.absolute-bottom .q-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.body--dark .q-tabs .q-tab:hover,
.body--dark .absolute-bottom .q-btn:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

.q-tab {
  word-break: break-all;
  white-space: normal;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--q-blue-grey) !important;
  opacity: 0.7;
  transition: all 0.3s ease;
}

/* 激活标签样式 */
.q-tab--active {
  color: var(--q-primary) !important;
  font-weight: 600 !important;
  opacity: 1;
}

.q-tab:hover::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: var(--q-primary);
  opacity: 0.1;
  border-radius: 4px;
  transition: opacity 0.3s;
}

/* 特殊标签样式（搜索结果和激活面板） */
.q-tab[data-search-result="true"],
.q-tab[data-active-panel="true"] {
  color: #4286de !important;
  font-weight: 600 !important;
}

/* 标签悬浮效果 */
.q-tab:hover {
  opacity: 0.9;
  transform: translateX(4px);
}

/* 标签内容过渡效果 */
.q-tab__content {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 面板过渡效果 */
.q-tab-panels {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: none !important;
}

.q-tab-panel {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 暗色模式适配 */
:deep(.body--dark) .q-tab:hover::after {
  opacity: 0.15;
}

/* 标签滚动区域样式 */
.q-scroll-area {
  background: transparent;
}

:deep(.body--dark) .q-scroll-area {
  background: transparent;
}

/* 底栏输入框样式 */
.absolute-bottom .q-field__control {
  background: rgba(255, 255, 255, 0.15) !important;
  border-radius: 4px;
}

.body--dark .absolute-bottom .q-field__control {
  background: rgba(0, 0, 0, 0.2) !important;
}

/* 底栏毛玻璃效果 */
body.glass-effect-menu .absolute-bottom {
  background: rgba(
    255,
    255,
    255,
    calc(0.15 + var(--glass-effect-strength) * 0.01)
  ) !important;
  backdrop-filter: blur(calc(var(--glass-effect-strength) * 1px)) !important;
  -webkit-backdrop-filter: blur(
    calc(var(--glass-effect-strength) * 1px)
  ) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

body.body--dark.glass-effect-menu .absolute-bottom {
  background: rgba(
    0,
    0,
    0,
    calc(0.2 + var(--glass-effect-strength) * 0.02)
  ) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* 调整内容层级 */
.q-scroll-area,
.q-tab-panels,
.absolute-bottom {
  position: absolute;
  z-index: 1;
}
</style>
