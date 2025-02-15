<template>
  <div class="code-editor" :style="{ height: height }">
    <div ref="editorContainer" class="editor-container" />
    <div class="placeholder-wrapper" v-show="showPlaceholder">
      <div class="placeholder">
        {{ placeholder }}
      </div>
    </div>
  </div>
</template>

<script>
import * as monaco from "monaco-editor";
import importAll from "js/common/importAll.js";
import { defineComponent } from "vue";

// 批量导入关键字补全
let languageCompletions = importAll(
  require.context("plugins/monaco/completions/", false, /\.js$/)
);

let monacoCompletionProviders = {};
let editor = null;

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
      type: String,
      default: "300px",
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
  },
  emits: ["update:modelValue", "update:cursorPosition"],
  data() {
    return {
      resizeTimeout: null,
      defaultOptions: {
        value: "",
        // 自动布局
        automaticLayout: true,
        // 折叠策略
        foldingStrategy: "indentation",
        // 自动关闭括号
        autoClosingBrackets: true,
        // 制表符大小
        tabSize: 2,
        // 最小化
        minimap: {
          enabled: false,
        },
        // 自动格式化
        formatOnType: true,
        // 自动格式化
        formatOnPaste: true,
        // 自动缩进
        autoIndent: "full",
        // 滚动超出最后一行
        scrollBeyondLastLine: false,
        // 字体大小
        fontSize: 14,
        // 行号
        lineNumbers: "on",
        // 行号最小字符数
        lineNumbersMinChars: 3,
        // 行号
        renderLineNumbers: "on",
        // 行装饰宽度
        lineDecorationsWidth: 0,
        // 圆角
        roundedSelection: false,
        // 行高亮
        renderLineHighlight: "all",
        // 仅在聚焦时高亮行
        renderLineHighlightOnlyWhenFocus: true,
        // 隐藏光标
        hideCursorInOverviewRuler: true,
        // 隐藏概览边框
        overviewRulerBorder: false,
        // 隐藏概览线
        overviewRulerLanes: 0,
        // 滚动条
        scrollBars: {
          vertical: "visible",
          horizontal: "visible",
        },
        // 只读
        readOnly: false,
        // 光标样式
        cursorStyle: "line",
      },
    };
  },
  watch: {
    // 监听 v-model 值变化
    modelValue: {
      immediate: true,
      handler(newValue) {
        if (!editor || editor.getValue() === newValue) return;
        editor.setValue(newValue || "");
      },
    },
    cursorPosition: {
      immediate: true,
      handler(newValue) {
        if (!editor) return;
        const { lineNumber, column } = newValue;
        if (!lineNumber || !column) return;
        const pos = editor.getPosition();
        if (pos.lineNumber === lineNumber && pos.column === column) return;
        editor.setPosition(newValue);
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
        if (!editor) return;
        const language = this.getHighlighter(newValue);
        monaco.editor.setModelLanguage(editor.getModel(), language);
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
        ...this.defaultOptions,
        ...this.options,
        value: this.modelValue || "",
        language,
        theme: this.theme,
      };

      editor = monaco.editor.create(this.$refs.editorContainer, options);
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
      editor.focus();
      editor.onDidChangeModelContent(() => {
        this.$emit("update:modelValue", editor.getValue());
      });

      // 监听光标位置变化
      editor.onDidChangeCursorPosition((e) => {
        this.$emit("update:cursorPosition", e.position);
      });
    },
    // 处理窗口大小变化
    resizeEditor() {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = setTimeout(() => {
        editor.layout();
      }, 50);
    },
    // 销毁编辑器
    destroyEditor() {
      window.removeEventListener("resize", this.resizeEditor);
      if (!editor) return;
      editor.dispose();
      editor = null;
    },
    // 聚焦编辑器
    focus() {
      editor && editor.focus();
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
      let createDependencyProposals = (range, keyWords, editor, curWord) => {
        let keys = [];
        // fix getValue of undefined
        const tokens = getTokens(editor.getModel()?.getValue());
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
        Object.keys(keyWords).forEach((ItemKind) => {
          keyWords[ItemKind].forEach((item) => {
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
              suggestions: createDependencyProposals(
                range,
                languageCompletions[language].default,
                editor,
                word
              ),
            };
          },
        });
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
      if (["quickcommand", "javascript", "webjavascript"].includes(language)) {
        return "javascript";
      }
      if (language === "cmd") {
        return "bat";
      }
      return language;
    },
    setCursorPosition(position) {
      if (!position.lineNumber || !position.column) return;
      editor.setPosition(position);
    },
    bindKeys() {
      // alt + z 换行
      const revWordWrap = this.wordWrap === "on" ? "off" : "on";
      editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyZ, () => {
        editor.updateOptions({ wordWrap: revWordWrap });
      });
    },
    repacleEditorSelection(text) {
      var selection = editor.getSelection();
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
      editor.executeEdits("my-source", [op]);
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
}

.editor-container {
  width: 100%;
  height: 100%;
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
