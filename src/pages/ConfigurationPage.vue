<template>
  <div class="config-page-container">
    <!-- 主界面内容 -->
    <div class="main-content">
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
        @commands-reordered="handleCommandsReorder"
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
    <transition name="slide">
      <div v-if="isEditorShow" class="editor-container">
        <component
          :is="commandEditorAction.component"
          :action="commandEditorAction"
          @editorEvent="editorEvent"
          :allQuickCommandTags="allQuickCommandTags"
        />
      </div>
    </transition>

    <CommandRunResult
      :action="{ type: 'config' }"
      ref="result"
    ></CommandRunResult>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useCommandManager } from "js/commandManager.js";
import changeLog from "js/options/changeLog.js";
import { utoolsFull, dbManager } from "js/utools.js";
import pinyinMatch from "pinyin-match";
import CommandEditor from "components/CommandEditor";
import ComposerEditor from "components/ComposerEditor";
import FooterBar from "src/components/config/FooterBar.vue";
import TagBar from "src/components/config/TagBar.vue";
import BackgroundLayer from "src/components/config/BackgroundLayer.vue";
import CommandPanels from "src/components/config/CommandPanels.vue";
const CommandRunResult = defineAsyncComponent(() =>
  import("components/CommandRunResult.vue")
);
// Performance Rendering > 300ms

export default {
  components: {
    CommandEditor,
    ComposerEditor,
    CommandRunResult,
    FooterBar,
    TagBar,
    BackgroundLayer,
    CommandPanels,
  },
  setup() {
    const commandManager = useCommandManager();
    return { commandManager };
  },
  data() {
    return {
      utools: utoolsFull,
      currentTag: "",
      lastTag: "",
      commandSearchKeyword: "",
      isEditorShow: false,
      commandEditorAction: {},
      footerBarHeight: "40px",
    };
  },
  computed: {
    allQuickCommands() {
      return this.commandManager.state.allQuickCommands;
    },
    allQuickCommandTags() {
      return this.commandManager.state.allQuickCommandTags;
    },
    activatedQuickCommandFeatureCodes() {
      return this.commandManager.state.activatedQuickCommandFeatureCodes;
    },
    activatedQuickPanels() {
      return this.commandManager.state.activatedQuickPanels;
    },
    // 当前标签下的所有快捷命令
    currentTagQuickCommands() {
      let commands = Object.values(
        window.lodashM.cloneDeep(this.allQuickCommands)
      );

      // 根据 order 排序
      const sortByOrder = (cmds) => {
        return cmds.sort((a, b) => {
          const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
      };

      switch (this.currentTag) {
        case "未分类":
          return sortByOrder(
            commands.filter((cmd) => !cmd.tags || cmd.tags.length === 0)
          );
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
        case "默认":
          return commands.filter((cmd) => cmd.tags?.includes(this.currentTag));
        default:
          return sortByOrder(
            commands.filter((cmd) => cmd.tags?.includes(this.currentTag))
          );
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
      this.commandManager.getActivatedFeatures();
    },
    // 获取所有的命令（导出的格式）
    getAllQuickCommands() {
      this.commandManager.getAllQuickCommands();
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
      this.$refs.result.runCurrentCommand(this.allQuickCommands[code]);
    },
    // 启用命令
    enableCommand(code) {
      this.commandManager.enableCommand(code);
    },
    // 禁用命令
    disableCommand(code) {
      this.commandManager.disableCommand(code);
    },
    // 删除命令
    removeCommand(code) {
      this.commandManager.removeCommand(code);
      if (!this.allQuickCommandTags.includes(this.currentTag)) {
        this.changeCurrentTag("默认");
      }
    },
    // 编辑命令
    editCommand(commandOrCode) {
      // 即可传入 code，也可直接传入 command
      const command =
        typeof commandOrCode === "string"
          ? this.allQuickCommands[commandOrCode]
          : commandOrCode;
      this.commandEditorAction = {
        type: "edit",
        data: window.lodashM.cloneDeep(command),
        component: command.flows ? "ComposerEditor" : "CommandEditor",
      };
      this.isEditorShow = true;
    },
    // 是否为默认命令
    isDefaultCommand(code) {
      return this.commandManager.isDefaultCommand(code);
    },
    // 导入命令
    async importCommand(quickCommandInfo) {
      const command = await this.commandManager.importCommand(quickCommandInfo);
      if (command) {
        this.locateToCommand(command.tags, command.features?.code);
      }
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
      if (this.commandManager.exportAllCommands(saveAsFile)) {
        quickcommand.showMessageBox("导出成功！");
      }
    },
    // 清空
    clearAllCommands() {
      quickcommand
        .showConfirmBox("将会清空所有自定义命令，停用所有实用功能，请确认！")
        .then((isConfirmed) => {
          if (!isConfirmed) {
            return quickcommand.showMessageBox("取消操作", "info");
          }
          this.commandManager.clearAllCommands();
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
      this.commandManager.clearAllFeatures();
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
    addNewCommand(component = "CommandEditor") {
      this.commandEditorAction = {
        type: "new",
        data: {},
        component,
      };
      this.isEditorShow = true;
    },
    saveCommand(command) {
      const code = this.commandManager.saveCommand(command);
      this.locateToCommand(command.tags, code);
      quickcommand.showMessageBox("保存成功！");
    },
    editorEvent(event) {
      switch (event.type) {
        case "save":
          this.saveCommand(event.data);
          break;
        case "back":
          this.isEditorShow = false;
          break;
        default:
          return;
      }
    },
    showChangeLog() {
      let lastNeedLogEvent = changeLog[changeLog.length - 1];
      let loggedVersion =
        this.utools.dbStorage.getItem("cfg_loggedVersion") ||
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
        this.utools.dbStorage.setItem(
          "cfg_loggedVersion",
          lastNeedLogEvent.version
        );
      }
    },
    handleCommandsReorder({ tag, commands }) {
      // 更新当前tag下的命令顺序
      const tagCommands = {};
      commands.forEach((command, index) => {
        tagCommands[command.features.code] = {
          ...command,
          order: index, // 添加排序信息
        };
      });

      // 更新存储
      this.commandManager.state.allQuickCommands = {
        ...this.allQuickCommands,
        ...tagCommands,
      };

      // 只保存被修改的命令
      this.saveCurrentTagOrderedCommand(tagCommands);
    },
    saveCurrentTagOrderedCommand(tagCommands) {
      // 只保存被修改的命令
      Object.entries(tagCommands).forEach(([code, command]) => {
        if (!this.isDefaultCommand(code)) {
          dbManager.putDB(
            window.lodashM.cloneDeep(command),
            "qc_" + code
          );
        }
      });
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

.editor-container {
  color: var(--utools-bright-font-color);
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5000;
  background: var(--utools-bright-bg);
}

.body--dark .editor-container {
  color: var(--utools-dark-font-color);
  background: var(--utools-dark-bg);
}

/* 编辑器容器动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-enter-from {
  transform: translateY(100%);
}

.slide-leave-to {
  transform: translateY(100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateY(0);
}
</style>
