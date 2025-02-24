<template>
  <div class="code-editor" :style="{ height: height + 'px' }">
    <div
      class="editor-container"
      :style="{
        width: showAIAssistant ? `calc(100% - ${aiAssistantWidth}px)` : '100%',
      }"
    >
      <div ref="editorContainer" class="monaco-container" />
      <div class="placeholder-wrapper" v-show="showPlaceholder">
        <div class="placeholder">
          {{ placeholder }}
        </div>
      </div>
    </div>

    <!-- AI助手侧边栏 -->
    <Transition name="slide">
      <AIAssistantSideBar
        v-if="showAIAssistant && hasAIAssistant"
        class="ai-assistant-panel"
        :style="{ width: aiAssistantWidth + 'px' }"
        :code="modelValue"
        :language="language"
        @close="toggleAIAssistant(false)"
        @update-code="updateEditorValue"
      />
    </Transition>

    <!-- AI助手按钮 -->
    <div class="ai-button-wrapper" v-if="hasAIAssistant">
      <q-btn
        round
        dense
        color="primary"
        icon="smart_toy"
        @click="toggleAIAssistant(true)"
        v-if="!showAIAssistant"
      >
      </q-btn>
    </div>
  </div>
</template>

<script>
import * as monaco from "monaco-editor";
import importAll from "js/common/importAll.js";
import { defineComponent } from "vue";
import AIAssistantSideBar from "components/ai/AIAssistantSideBar.vue";
import editorOptions from "js/options/editorOptions.js";

// 批量导入关键字补全
let languageCompletions = importAll(
  require.context("plugins/monaco/completions/", false, /\.js$/)
);

let monacoCompletionProviders = {};

// 声明文件映射
const typeDefinitions = {
  javascript: ["lib.es5.d.ts", "common.d.ts", "node.api.d.ts", "electron.d.ts"],
  quickcommand: [
    "lib.es5.d.ts",
    "common.d.ts",
    "node.api.d.ts",
    "electron.d.ts",
    "quickcommand.api.d.ts",
    "utools.api.d.ts",
    "shortcode.api.d.ts",
    "quickcomposer.d.ts",
  ],
};

export default defineComponent({
  name: "CodeEditor",
  components: {
    AIAssistantSideBar,
  },
  props: {
    // v-model 绑定值
    modelValue: {
      type: String,
      default: "",
    },
    // 编程语言
    language: {
      type: String,
      default: "javascript",
    },
    // 编辑器高度
    height: {
      type: Number,
      default: 300,
    },
    // 编辑器主题
    theme: {
      type: String,
      default: "vs",
    },
    // 编辑器选项
    options: {
      type: Object,
      default: () => ({}),
    },
    // placeholder提示文本
    placeholder: {
      type: String,
      default: "请输入...",
    },
    // 光标位置
    cursorPosition: {
      type: Object,
      default: () => ({}),
    },
    hasAIAssistant: {
      type: Boolean,
      default: true,
    },
    aiAssistantWidth: {
      type: Number,
      default: 320,
    },
  },
  emits: [
    "update:modelValue",
    "update:cursorPosition",
    "saveHistory",
    "requestFullScreen",
  ],
  data() {
    return {
      resizeTimeout: null,
      showAIAssistant: false,
      wordWrap: "off",
    };
  },
  watch: {
    // 监听 v-model 值变化
    modelValue: {
      immediate: true,
      handler(newValue) {
        if (!this.codeEditor || this.codeEditor.getValue() === newValue) return;
        this.codeEditor.setValue(newValue || "");
      },
    },
    cursorPosition: {
      immediate: true,
      handler(newValue) {
        if (!this.codeEditor) return;
        const { lineNumber, column } = newValue;
        if (!lineNumber || !column) return;
        const pos = this.codeEditor.getPosition();
        if (pos.lineNumber === lineNumber && pos.column === column) return;
        this.codeEditor.setPosition(newValue);
      },
    },
    "$q.dark.isActive": {
      immediate: true,
      handler(newValue) {
        monaco.editor.setTheme(newValue ? "vs-dark" : "vs");
      },
    },
    language: {
      immediate: true,
      handler(newValue) {
        if (!this.codeEditor) return;
        const language = this.getHighlighter(newValue);
        monaco.editor.setModelLanguage(this.codeEditor.getModel(), language);
        this.loadTypes();
      },
    },
  },
  mounted() {
    this.initEditor();
    // 手动监听窗口大小变化，解决Monaco自动调整大小时导致ResizeObserver loop limit exceeded错误
    window.addEventListener("resize", this.resizeEditor);
    monaco.editor.setTheme(this.$q.dark.isActive ? "vs-dark" : "vs");
  },
  beforeUnmount() {
    this.destroyEditor();
  },
  methods: {
    // 初始化编辑器
    initEditor() {
      const language = this.getHighlighter(this.language);

      const options = {
        ...editorOptions,
        ...this.options,
        value: this.modelValue || "",
        language,
        theme: this.theme,
        wordWrap: this.wordWrap,
      };

      this.codeEditor = monaco.editor.create(
        this.$refs.editorContainer,
        options
      );
      this.listenEditorValue();
      this.loadTypes();
      this.registerLanguage();
      this.bindKeys();
      this.setCursorPosition(this.cursorPosition);
      // 初始化完成后立即触发一次布局更新
      this.$nextTick(() => {
        this.resizeEditor();
      });
    },
    // 监听编辑器值变化
    listenEditorValue() {
      this.codeEditor.focus();
      this.codeEditor.onDidChangeModelContent(() => {
        this.$emit("update:modelValue", this.codeEditor.getValue());
      });

      // 监听光标位置变化
      this.codeEditor.onDidChangeCursorPosition((e) => {
        this.$emit("update:cursorPosition", e.position);
      });
    },
    // 处理窗口大小变化
    resizeEditor() {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = setTimeout(() => {
        this.codeEditor.layout();
      }, 50);
    },
    // 销毁编辑器
    destroyEditor() {
      window.removeEventListener("resize", this.resizeEditor);
      if (!this.codeEditor) return;
      this.codeEditor.dispose();
      this.codeEditor = null;
    },
    // 聚焦编辑器
    focus() {
      this.codeEditor && this.codeEditor.focus();
    },
    registerLanguage() {
      const identifierPattern = "([a-zA-Z_]\\w*)";
      let getTokens = (code) => {
        const identifier = new RegExp(identifierPattern, "g");
        let tokens = [];
        let array1;
        while ((array1 = identifier.exec(code)) !== null) {
          tokens.push(array1[0]);
        }
        return Array.from(new Set(tokens));
      };
      let createDependencyProposals = (range, completions, curWord) => {
        let keys = [];
        // fix getValue of undefined
        const tokens = getTokens(this.codeEditor?.getModel()?.getValue());
        // 自定义变量、字符串
        for (const item of tokens) {
          if (item != curWord.word) {
            keys.push({
              label: item,
              kind: monaco.languages.CompletionItemKind.Text,
              documentation: "",
              insertText: item,
              range: range,
            });
          }
        }
        // 关键字、函数
        Object.keys(completions).forEach((ItemKind) => {
          if (!Array.isArray(completions[ItemKind])) return;
          completions[ItemKind].forEach((item) => {
            keys.push({
              label: item,
              kind: monaco.languages.CompletionItemKind[ItemKind],
              documentation: "",
              insertText: item,
              range: range,
            });
          });
        });
        return keys;
      };
      // 注册 applescript
      monaco.languages.register({
        id: "applescript",
      });
      // 注册自动补全
      Object.keys(languageCompletions).forEach((language) => {
        // 防止自动补全被多次注册
        if (monacoCompletionProviders[language]) return;
        const completions = languageCompletions[language].default;
        monaco.languages.registerCompletionItemProvider(language, {
          provideCompletionItems: function (model, position) {
            var word = model.getWordUntilPosition(position);
            var range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn,
            };
            return {
              suggestions: createDependencyProposals(range, completions, word),
            };
          },
        });
        if (language === "applescript") {
          const { Keyword, Tokenizer, Operator, Symbol } = completions;
          // applescript 需要再添加语法高亮定义
          monaco.languages.setMonarchTokensProvider("applescript", {
            defaultToken: "",
            tokenPostfix: ".applescript",
            keywords: Keyword,
            operators: Operator,
            symbols: Symbol,
            tokenizer: Tokenizer,
          });
        }
        monacoCompletionProviders[language] = true;
      });
    },
    loadTypes() {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
      });

      const options = {
        target: monaco.languages.typescript.ScriptTarget.ES6,
        allowNonTsExtensions: true,
        allowJs: true,
      };

      // webjavascript 使用默认配置
      if (this.language === "webjavascript") {
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
          options
        );
        return;
      }

      // 其他语言根据语言加载对应的声明文件
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        ...options,
        lib: [],
      });

      const files = typeDefinitions[this.language] || [];
      const declarations = files.map((file) => {
        try {
          return require(`!raw-loader!plugins/monaco/types/${file}`).default;
        } catch (e) {
          console.warn(`Failed to load type definition: ${file}`, e);
          return "";
        }
      });

      if (declarations.length > 0) {
        // 添加声明文件
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          declarations.join("\n"),
          "api.d.ts"
        );
      }
    },
    getHighlighter(language) {
      const highLightLanguageDict = {
        quickcommand: "javascript",
        webjavascript: "javascript",
        cmd: "bat",
      };
      return highLightLanguageDict[language] || language;
    },
    setCursorPosition(position) {
      if (!position.lineNumber || !position.column) return;
      this.codeEditor.setPosition(position);
    },
    bindKeys() {
      // alt + z 换行
      this.codeEditor.addCommand(
        monaco.KeyMod.Alt | monaco.KeyCode.KeyZ,
        () => {
          this.wordWrap = this.wordWrap === "on" ? "off" : "on";
          this.codeEditor.updateOptions({
            wordWrap: this.wordWrap,
          });
        }
      );
    },
    // 替换选中的文本，供外部调用
    replaceEditorSelection(text) {
      var selection = this.codeEditor.getSelection();
      var range = new monaco.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn
      );
      var id = { major: 1, minor: 1 };
      var op = {
        identifier: id,
        range: range,
        text: text,
        forceMoveMarkers: true,
      };
      this.codeEditor.executeEdits("my-source", [op]);
    },
    // 格式化文档，供外部调用
    formatDocument() {
      this.codeEditor.getAction("editor.action.formatDocument").run();
    },
    updateEditorValue(type, value) {
      if (type === "replace") {
        this.codeEditor.setValue(value);
      } else if (type === "insert") {
        this.replaceEditorSelection(value);
      }
      this.$emit("saveHistory", value);
    },
    toggleAIAssistant(value) {
      this.showAIAssistant = value;
      this.$emit("requestFullScreen", value);
    },
  },
  computed: {
    showPlaceholder() {
      return this.placeholder && !this.modelValue;
    },
  },
});
</script>

<style scoped>
.code-editor {
  width: 100%;
  overflow: hidden;
  position: relative;
  border-radius: 4px;
  display: flex;
}

.editor-container {
  flex: 1;
  height: 100%;
}

.monaco-container {
  width: 100%;
  height: 100%;
}

.ai-assistant-panel {
  height: 100%;
  transition: width 0.3s ease;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.ai-button-wrapper {
  position: absolute;
  right: 30px;
  bottom: 30px;
  z-index: 500;
}

.placeholder-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding-left: 40px;
  pointer-events: none;
}

.placeholder {
  font-size: 14px;
  font-family: sans-serif;
  user-select: none;
  opacity: 0.4;
}
</style>
