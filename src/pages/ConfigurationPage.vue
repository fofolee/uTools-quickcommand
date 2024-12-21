<template>
  <div class="config-page-container">
    <!-- 主界面内容 -->
    <div
      class="main-content"
      :class="{ hide: isCommandEditorShow && !isEditorLeaving }"
    >
      <BackgroundLayer />
      <!-- 标签栏 -->
      <TagBar
        v-model="currentTag"
        :tab-bar-width="tabBarWidth"
        :all-quick-command-tags="allQuickCommandTags"
        :activated-quick-panels="activatedQuickPanels"
        :dense-tag-bar="$root.profile.denseTagBar"
      />
      <CommandPanels
        v-model="currentTag"
        :footer-bar-height="footerBarHeight"
        :tab-bar-width="tabBarWidth"
        :all-quick-command-tags="allQuickCommandTags"
        :current-tag-quick-commands="currentTagQuickCommands"
        :activated-quick-command-feature-codes="
          activatedQuickCommandFeatureCodes
        "
        @command-changed="commandChanged"
      />
      <!-- 底栏 -->
      <FooterBar
        :height="footerBarHeight"
        :left="tabBarWidth"
        :is-tag-stared="activatedQuickPanels.includes(currentTag)"
        :current-tag="currentTag"
        :search-keyword="commandSearchKeyword"
        @update:search="updateSearch"
        @add-new="addNewCommand"
      />
    </div>

    <!-- 命令编辑界面 -->
    <CommandEditor
      v-show="isCommandEditorShow"
      ref="commandEditor"
      :action="commandEditorAction"
      @editorEvent="editorEvent"
      :allQuickCommandTags="allQuickCommandTags"
      :isLeaving="isEditorLeaving"
      @animationend="handleAnimationEnd"
    ></CommandEditor>

    <CommandRunResult
      :action="{ type: 'config' }"
      ref="result"
    ></CommandRunResult>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import quickcommandParser from "js/common/quickcommandParser.js";
import importAll from "js/common/importAll.js";
import changeLog from "js/options/changeLog.js";
import pinyinMatch from "pinyin-match";
import CommandEditor from "components/CommandEditor";
import FooterBar from "src/components/config/FooterBar.vue";
import TagBar from "src/components/config/TagBar.vue";
import BackgroundLayer from "src/components/config/BackgroundLayer.vue";
import CommandPanels from "src/components/config/CommandPanels.vue";
const CommandRunResult = defineAsyncComponent(() =>
  import("components/CommandRunResult.vue")
);
// Performance Rendering > 300ms

// 默认命令
let defaultCommands = importAll(require.context("../json/", false, /\.json$/));

export default {
  components: {
    CommandEditor,
    CommandRunResult,
    FooterBar,
    TagBar,
    BackgroundLayer,
    CommandPanels,
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
      isEditorLeaving: false,
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
      return this.$root.profile.commandCardStyle === "mini" ? "0" : "80px";
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
        this.$root.profile.commandCardStyle = "mini";
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
      this.removeCommandFromHistory(code);
      this.disableCommand(code);
      this.getAllQuickCommandTags();
      if (!this.allQuickCommandTags.includes(this.currentTag))
        this.changeCurrentTag("默认");
      quickcommand.showMessageBox(
        "删除成功，为防止误操作，已将删除的命令复制到剪贴板",
        "success",
        1000,
        "bottom-right"
      );
    },
    removeCommandFromHistory(code) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("editor_history_" + code)) {
          localStorage.removeItem(key);
        }
      }
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
            "清空完毕，为防止误操作，已将所有命令复制到剪贴板，可通过导入命令恢复",
            "success",
            2000,
            "bottom-right"
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
    // 搜索方法
    updateSearch(value) {
      this.commandSearchKeyword = value;
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
          break;
        case "back":
          this.isEditorLeaving = true;
          break;
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
    handleAnimationEnd(e) {
      if (this.isEditorLeaving) {
        this.isEditorLeaving = false;
        this.isCommandEditorShow = false;
      }
    },
  },
};
</script>

<style scoped>
.config-page-container {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.q-tab-panels {
  background: transparent;
}

.main-content {
  transition: opacity 0.3s ease;
}

.main-content.hide {
  opacity: 0;
}
</style>
