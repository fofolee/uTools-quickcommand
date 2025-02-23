<template>
  <div class="command-editor">
    <div class="command-editor-header">
      <!-- 语言选择器及相关配置 -->
      <CommandLanguage
        v-model="commandManager.state.currentCommand"
        @action="handleAction"
      />

      <!-- 操作按钮 -->
      <CommandActions
        ref="editorActions"
        :command-code="currentCommand.features?.code || 'temp'"
        :can-command-save="canCommandSave"
        @action="handleAction"
      />
    </div>

    <!-- 命令设置栏 -->
    <CommandConfig
      v-if="!isRunCodePage && showCommandConfig"
      v-model="commandManager.state.currentCommand"
      from="quickcommand"
      :expand-on-focus="true"
      class="command-config"
    />

    <!-- 编辑器 -->
    <CodeEditor
      v-model="commandManager.state.currentCommand.cmd"
      v-model:cursor-position="
        commandManager.state.currentCommand.cursorPosition
      "
      :language="getLanguage()"
      @saveHistory="saveToHistory"
      @request-full-screen="requestFullScreen"
      placeholder="请输入代码"
      class="codeEditor"
      ref="editor"
    />
  </div>

  <!-- 可视化编排 -->
  <q-dialog v-model="showComposer" maximized>
    <CommandComposer
      ref="composer"
      v-model="composerInfo"
      @action="handleComposerAction"
      :disabled-control-buttons="['save']"
    />
  </q-dialog>

  <!-- 运行结果 -->
  <CommandRunResult ref="result"></CommandRunResult>
</template>

<script>
import { defineAsyncComponent, computed } from "vue";
import CommandConfig from "components/editor/CommandConfig.vue";
import CommandRunResult from "components/CommandRunResult";
import CommandComposer from "components/composer/CommandComposer.vue";
import CommandLanguage from "components/editor/CommandLanguage";
import CommandActions from "components/editor/CommandActions";
import programs from "js/options/programs.js";
import { useCommandManager } from "js/commandManager.js";

// 预加载 MonacoEditor
const CodeEditorPromise = import("components/editor/CodeEditor.vue");
// 在空闲时预加载
if (window.requestIdleCallback) {
  window.requestIdleCallback(() => {
    CodeEditorPromise;
  });
} else {
  setTimeout(() => {
    CodeEditorPromise;
  }, 0);
}

// Performance Scripting > 500ms
const CodeEditor = defineAsyncComponent({
  loader: () => CodeEditorPromise,
  timeout: 3000,
});

export default {
  components: {
    CodeEditor,
    CommandConfig,
    CommandRunResult,
    CommandLanguage,
    CommandActions,
    CommandComposer,
  },
  emits: ["editorEvent"],
  data() {
    return {
      programLanguages: Object.keys(programs),
      showComposer: false,
      showCommandConfig: true,
      listener: null,
      composerInfo: {
        program: "quickcomposer",
      },
    };
  },
  setup() {
    const commandManager = useCommandManager();

    const defaultCommand = commandManager.getDefaultCommand("quickcommand");

    commandManager.state.currentCommand = {
      ...defaultCommand,
      ...commandManager.state.currentCommand,
    };

    const currentCommand = computed(() => {
      return commandManager.state.currentCommand;
    });

    return {
      commandManager,
      currentCommand,
    };
  },
  mounted() {
    this.saveToHistory();
    document.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },
  computed: {
    isRunCodePage() {
      return this.$route.name === "code";
    },
    canCommandSave() {
      if (this.isRunCodePage) return false;
      if (window.utools.isDev()) return true;
      if (this.currentCommand.tags?.includes("默认")) return false;
      return true;
    },
  },
  methods: {
    handleComposerAction(actionType, actionData) {
      switch (actionType) {
        case "run":
          // actionData 完整命令
          this.runCurrentCommand(actionData);
          break;
        case "apply":
          // actionData 命令的cmd
          this.showComposer = false;
          this.commandManager.state.currentCommand.cmd = actionData;
          this.$refs.editor.formatDocument();
          break;
        case "close":
          this.showComposer = false;
          break;
      }
    },
    // 保存
    saveCurrentCommand() {
      this.$emit("editorEvent", "save", this.currentCommand);
      this.saveToHistory(); // 保存时记录历史
    },
    // 运行
    runCurrentCommand(command) {
      if (!command) {
        this.saveToHistory(); // 运行时不保存但记录历史
        command = { ...this.currentCommand };
      }
      this.$refs.result.runCurrentCommand(command);
    },
    handleAction(event, data) {
      switch (event) {
        case "run":
          this.runCurrentCommand();
          break;
        case "save":
          this.saveCurrentCommand();
          break;
        case "back":
          this.$emit("editorEvent", "back");
          break;
        case "show-composer":
          this.showComposer = true;
          break;
        case "insert-text":
          this.$refs.editor.replaceEditorSelection(data);
          break;
        case "restore":
          this.restoreHistory(data);
          break;
        default:
          break;
      }
    },
    saveToHistory() {
      this.$refs.editorActions.tryToSave(
        this.currentCommand.cmd,
        this.currentCommand.program
      );
    },
    restoreHistory(item) {
      // 保存当前内容
      this.saveToHistory();

      // 恢复历史内容
      this.currentCommand.cmd = item.content;
      this.currentCommand.program = item.program;
    },
    getLanguage() {
      if (this.currentCommand.program !== "custom") {
        return this.currentCommand.program;
      }
      if (!this.currentCommand.customOptions.ext) return;
      let language = Object.values(programs).find(
        (program) => program.ext === this.currentCommand.customOptions.ext
      );
      if (!language) return;
      return language.name;
    },
    // 添加快捷键处理
    handleKeydown(e) {
      // 检查是否按下 Ctrl 键 (Windows) 或 Command 键 (Mac)
      const isCmdOrCtrl = window.utools.isMacOS() ? e.metaKey : e.ctrlKey;
      if (!isCmdOrCtrl) return;

      switch (e.key.toLowerCase()) {
        case "s":
          e.preventDefault();
          if (!this.canCommandSave) return;
          this.saveCurrentCommand();
          break;
        case "b":
          e.preventDefault();
          this.runCurrentCommand();
          break;
      }
    },
    requestFullScreen(value) {
      this.showCommandConfig = !value;
    },
  },
};
</script>

<style scoped>
.command-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  background-color: #fffffe;
  position: fixed;
  inset: 0;
}

.body--dark .command-editor {
  background-color: #1e1e1e;
}

.command-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
}

.command-editor-header :deep(.q-btn) {
  padding: 0 5px;
}

.command-editor-header :deep(.q-btn__content) {
  font-size: 12px;
}

.command-editor-header :deep(.q-btn-dropdown__arrow) {
  margin-left: 0;
}

.command-editor-header :deep(.q-focus-helper) {
  display: none;
}

.command-editor-header :deep(.q-btn:hover) {
  filter: brightness(1.2);
  transition: all 0.2s ease;
}

.codeEditor {
  flex: 1;
  min-height: 0;
  border-radius: 0 0 10px 10px;
  overflow: hidden;
}

.command-config {
  padding: 4px 10px;
}
</style>
