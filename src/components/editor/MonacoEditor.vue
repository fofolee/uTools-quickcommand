<template>
  <div class="monaco-container">
    <div id="monacoEditor" class="monaco-editor-instance"></div>
    <div class="placeholder-container" v-show="showPlaceholder">
      {{ placeholder }}
    </div>
    <div class="shortcut-container" v-show="showPlaceholder">
      <div class="shortcut text-center row q-gutter-md items-center">
        <div
          v-for="shortCut in shortCuts"
          :key="shortCut"
          class="row q-gutter-xs"
        >
          <q-badge v-for="item in shortCut" :key="item">{{ item }}</q-badge>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as monaco from "monaco-editor";
import { toRaw } from "vue";
import importAll from "js/common/importAll.js";

// 批量导入声明文件
let apis = importAll(
  require.context("!raw-loader!plugins/monaco/types/", false, /\.ts$/)
);

// 批量导入关键字补全
let languageCompletions = importAll(
  require.context("plugins/monaco/completions/", false, /\.js$/)
);

let monacoCompletionProviders = {};

let cmdCtrlKey = utools.isMacOs() ? "⌘" : "Ctrl";

export default {
  data() {
    return {
      editor: null,
      value: null,
      wordWrap: "off",
      shortCuts: [
        ["保存", cmdCtrlKey, "S"],
        ["运行", cmdCtrlKey, "B"],
      ],
    };
  },
  computed: {
    showPlaceholder() {
      return !this.value && !!this.placeholder;
    },
  },
  mounted() {
    this.initEditor();
    // 手动监听窗口大小变化，解决Monaco自动调整大小时导致ResizeObserver loop limit exceeded错误
    window.addEventListener("resize", this.resizeEditor);
    this.$emit("loaded");
  },
  props: {
    placeholder: String,
  },
  methods: {
    initEditor() {
      let monacoEditorPreferences = {
        value: "",
        // 自动布局
        automaticLayout: true,
        // 折叠策略
        foldingStrategy: "indentation",
        // 自动关闭括号
        autoClosingBrackets: true,
        // 制表符大小
        tabSize: 2,
        minimap: {
          enabled: false,
        },
        // 自动格式化
        formatOnType: true,
        formatOnPaste: true,
        // 自动缩进
        autoIndent: "full",
        // 行号
        lineNumbersMinChars: 3,
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
        // JavaScript 特定的格式化选项
        "javascript.format.insertSpaceAfterSemicolonInForStatements": true,
        "javascript.format.insertSpaceBeforeAndAfterBinaryOperators": true,
        "javascript.format.insertSpaceAfterConstructor": true,
        "javascript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets": true,
        "javascript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis": true,
        "javascript.format.insertSpaceAfterKeywordsInControlFlowStatements": true,
      };
      this.editor = monaco.editor.create(
        document.getElementById("monacoEditor"),
        monacoEditorPreferences
      );
      this.loadTypes();
      this.registerLanguage();
      this.setEditorTheme();
      this.listenEditorValue();
      this.bindKeys();
    },
    resizeEditor() {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = setTimeout(() => {
        this.rawEditor().layout();
      }, 50);
    },
    loadTypes() {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
      });
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES6,
        allowNonTsExtensions: true,
        allowJs: true,
        lib: [],
      });
      // 引入声明文件
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        Object.values(apis)
          .map((x) => x.default)
          .join("\n"),
        "api.d.ts"
      );
    },
    registerLanguage() {
      let that = this;
      const identifierPattern = "([a-zA-Z_]\\w*)";
      let getTokens = (code) => {
        let identifier = new RegExp(identifierPattern, "g");
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
        let tokens = getTokens(toRaw(editor).getModel()?.getValue());
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
                toRaw(that.editor),
                word
              ),
            };
          },
        });
        monacoCompletionProviders[language] = true;
      });
    },
    setEditorTheme() {
      monaco.editor.setTheme(this.$q.dark.isActive ? "vs-dark" : "vs");
    },
    getEditorValue() {
      return this.rawEditor().getValue();
    },
    setEditorValue(value) {
      this.rawEditor().setValue(value);
    },
    setEditorLanguage(language) {
      monaco.editor.setModelLanguage(this.rawEditor().getModel(), language);
    },
    getCursorPosition() {
      return this.rawEditor().getPosition();
    },
    setCursorPosition(pos) {
      if (!pos) return;
      this.rawEditor().setPosition(pos);
    },
    repacleEditorSelection(text) {
      var selection = this.rawEditor().getSelection();
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
      this.rawEditor().executeEdits("my-source", [op]);
    },
    formatDocument() {
      this.rawEditor().getAction("editor.action.formatDocument").run();
    },
    listenEditorValue() {
      this.rawEditor().focus();
      this.rawEditor().onDidChangeModelContent(() => {
        this.value = this.getEditorValue();
        this.$emit("typing", this.value);
      });
    },
    bindKeys() {
      const that = this;
      // alt + z 换行
      this.rawEditor().addCommand(
        monaco.KeyMod.Alt | monaco.KeyCode.KeyZ,
        () => {
          that.wordWrap = that.wordWrap === "off" ? "on" : "off";
          that.rawEditor().updateOptions({ wordWrap: that.wordWrap });
        }
      );
    },
    getSelectionOrLineContent() {
      let selection = this.rawEditor().getSelection();
      let range = new monaco.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn
      );
      let model = this.rawEditor().getModel();
      return (
        model.getValueInRange(range) ||
        model.getLineContent(selection.startLineNumber)
      );
    },
    rawEditor() {
      return toRaw(this.editor);
    },
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.resizeEditor);
    this.rawEditor().dispose();
  },
};
</script>

<style scoped>
.monaco-container {
  position: relative;
}

.monaco-editor-instance {
  width: 100%;
  height: 100%;
}

.placeholder-container {
  position: absolute;
  top: 0;
  left: 40px;
  font-style: italic;
  color: grey;
}

.shortcut-container {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.shortcut .q-badge {
  user-select: none;
  background-color: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.6);
}

.body--dark .shortcut .q-badge {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}
</style>
