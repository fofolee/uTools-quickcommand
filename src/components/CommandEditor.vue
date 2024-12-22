<template>
  <div
    class="command-editor-container"
    :class="{ leaving: isLeaving, 'run-code': isRunCodePage }"
    @animationend="$emit('animationend')"
  >
    <!-- 命令设置栏 -->
    <CommandSideBar
      ref="sidebar"
      :canCommandSave="canCommandSave"
      :quickcommandInfo="quickcommandInfo"
      class="absolute-left shadow-10"
      :style="{
        width: sideBarWidth + 'px',
        zIndex: 1,
        transform: isFullscreen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }"
      :sideBarWidth="sideBarWidth"
      v-if="showSidebar"
      @back="handleBack"
    ></CommandSideBar>

    <!-- 编程语言栏 -->
    <CommandLanguageBar
      class="absolute-top"
      :style="{
        left: showSidebar ? sideBarWidth + 'px' : 65,
        zIndex: 1,
        transform: isFullscreen ? 'translateY(-100%)' : 'translateY(0)',
        opacity: isFullscreen ? 0 : 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }"
      v-model="quickcommandInfo"
      :height="languageBarHeight"
      :canCommandSave="canCommandSave"
      :isRunCodePage="isRunCodePage"
      @program-changed="programChanged"
      @run="runCurrentCommand"
      @save="saveCurrentCommand"
      @add-action="insertText"
    />

    <!-- 编辑器 -->
    <MonacoEditor
      class="editor-transition"
      :placeholder="true"
      ref="editor"
      @loaded="monacoInit"
      @typing="(val) => monacoTyping(val)"
      @keyStroke="monacoKeyStroke"
      :style="{
        position: 'absolute',
        top: isFullscreen ? 0 : languageBarHeight + 'px',
        left: isFullscreen
          ? 0
          : action.type === 'run'
          ? 0
          : sideBarWidth + 'px',
        right: 0,
        bottom: 0,
      }"
    />

    <!-- 编辑器工具按钮组 -->
    <EditorTools
      ref="editorTools"
      :commandCode="quickcommandInfo?.features?.code || 'temp'"
      :isFullscreen="isFullscreen"
      @restore="restoreHistory"
      @toggle-fullscreen="toggleFullscreen"
    />

    <!-- 运行结果 -->
    <CommandRunResult :action="action" ref="result"></CommandRunResult>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import CommandSideBar from "components/editor/CommandSideBar";
import CommandLanguageBar from "components/editor/CommandLanguageBar";
import EditorTools from "components/editor/EditorTools";
import CommandRunResult from "components/CommandRunResult";
// Performance Scripting > 500ms
const MonacoEditor = defineAsyncComponent(() =>
  import("components/editor/MonacoEditor")
);

export default {
  components: {
    MonacoEditor,
    CommandSideBar,
    CommandRunResult,
    CommandLanguageBar,
    EditorTools,
  },
  data() {
    return {
      programLanguages: Object.keys(this.$root.programs),
      sideBarWidth: 200,
      languageBarHeight: 40,
      canCommandSave: this.action.type === "code" ? false : true,
      quickcommandInfo: {
        program: "quickcommand",
        cmd: "",
        scptarg: "",
        charset: {
          scriptCode: "",
          outputCode: "",
        },
        customOptions: {
          bin: "",
          argv: "",
          ext: "",
        },
      },
      resultMaxLength: 10000,
      showSidebar: this.action.type !== "run",
      isRunCodePage: this.action.type === "run",
      listener: null,
      isFullscreen: false,
    };
  },
  props: {
    action: {
      type: Object,
      required: true,
    },
    allQuickCommandTags: {
      type: Array,
      required: true,
    },
    isLeaving: {
      type: Boolean,
      default: false,
    },
  },
  created() {
    this.commandInit();
  },
  mounted() {
    this.sidebarInit();
  },
  computed: {
    configurationPage() {
      return this.$root.$refs.view;
    },
  },
  methods: {
    // 命令初始化
    commandInit() {
      let quickCommandInfo =
        this.action.type === "run"
          ? this.$root.utools.getDB("cfg_codeHistory")
          : this.action.data;
      quickCommandInfo?.program &&
        Object.assign(this.quickcommandInfo, _.cloneDeep(quickCommandInfo));
      // 默认命令不可编辑
      if (this.quickcommandInfo.tags?.includes("默认") && !utools.isDev()) {
        this.canCommandSave = false;
      }
    },
    // 侧边栏初始化
    sidebarInit() {
      this.$refs.sidebar?.init();
    },
    // Monaco编辑器初始化，Monaco异步加载完执行
    monacoInit() {
      this.$refs.editor.setEditorValue(this.quickcommandInfo.cmd);
      this.setLanguage(this.quickcommandInfo.program);
      this.$refs.editor.setCursorPosition(this.quickcommandInfo.cursorPosition);

      // 等待编辑器内容加载完成后再保存
      setTimeout(() => {
        this.saveToHistory();
      }, 1000); // 给予足够的时间让编辑器加载完成
    },
    programChanged(value) {
      this.setLanguage(value);
      if (value === "custom") this.$refs.settings.show();
      this.$refs.sidebar?.setIcon(value);
    },
    // 匹配编程语言
    matchLanguage() {
      if (!this.quickcommandInfo.customOptions.ext) return;
      let language = Object.values(this.$root.programs).filter(
        (program) => program.ext === this.quickcommandInfo.customOptions.ext
      );
      if (language.length) {
        this.setLanguage(language[0].name);
      }
    },
    // 设置编程语言
    setLanguage(language) {
      let highlight = this.$root.programs[language].highlight;
      this.$refs.editor.setEditorLanguage(highlight ? highlight : language);
    },
    insertText(text) {
      this.$refs.editor.repacleEditorSelection(text);
    },
    // 保存
    saveCurrentCommand(message = "保存成功") {
      let updatedData = this.$refs.sidebar?.SaveMenuData();
      if (!updatedData) return;
      Object.assign(this.quickcommandInfo, _.cloneDeep(updatedData));
      let newQuickcommandInfo = _.cloneDeep(this.quickcommandInfo);
      this.$root.utools.putDB(
        newQuickcommandInfo,
        "qc_" + this.quickcommandInfo.features.code
      );
      this.$emit("editorEvent", {
        type: "save",
        data: newQuickcommandInfo,
      });
      this.saveToHistory(); // 保存时记录历史
      if (!message) return;
      quickcommand.showMessageBox(message, "success", 1000, "bottom-right");
    },
    // 运行
    runCurrentCommand(cmd) {
      this.saveToHistory(); // 运行时不保存但记录历史
      let command = _.cloneDeep(this.quickcommandInfo);
      if (cmd) command.cmd = cmd;
      command.output =
        this.$refs.sidebar?.currentCommand.output ||
        (command.program === "html" ? "html" : "text");
      command.cmdType = this.$refs.sidebar?.cmdType.name;
      this.$refs.result.runCurrentCommand(command);
    },
    saveCodeHistory() {
      if (this.action.type !== "run") return;
      let command = _.cloneDeep(this.quickcommandInfo);
      command.cursorPosition = this.$refs.editor.getCursorPosition();
      this.$root.utools.putDB(command, "cfg_codeHistory");
    },
    monacoTyping(val) {
      this.quickcommandInfo.cmd = val;
    },
    monacoKeyStroke(event, data) {
      switch (event) {
        case "run":
          this.runCurrentCommand();
          break;
        case "save":
          this.saveCurrentCommand();
          break;
        case "log":
          if (this.quickcommandInfo.program !== "quickcommand") return;
          this.runCurrentCommand(`console.log(${data})`);
          break;
        case "fullscreen":
          this.toggleFullscreen();
          break;
        default:
          break;
      }
    },
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;

      // 重新布局编辑器
      setTimeout(() => {
        this.$refs.editor.resizeEditor();
      }, 300);
    },
    saveToHistory() {
      this.$refs.editorTools.tryToSave(
        this.$refs.editor.getEditorValue(),
        this.quickcommandInfo.program
      );
    },
    restoreHistory(item) {
      // 保存当前内容
      this.saveToHistory();

      // 恢复历史内容
      this.$refs.editor.setEditorValue(item.content);
    },
    handleBack() {
      // 触发返回事件
      this.$emit("editorEvent", { type: "back" });
    },
  },
};
</script>

<style scoped>
/* 统一过渡效果 */
.sidebar-transition,
.language-bar-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, left, top, opacity;
}

/* 编辑器动画不一致，可以产生一个回弹效果 */
.editor-transition {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, left, top, opacity;
}

.command-editor-container {
  color: black;
  background: white;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5000;
  background: var(--q-page-background);
  animation: slideUpDefault 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.command-editor-container.run-code {
  animation: slideDownIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.command-editor-container.leaving {
  animation: slideDownOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
}

.command-editor-container.leaving.run-code {
  animation: slideUpOut 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUpDefault {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideDownIn {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideDownOut {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}

@keyframes slideUpOut {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100%);
  }
}

.body--dark .command-editor-container {
  color: white;
  background: var(--q-dark-page);
}
</style>
