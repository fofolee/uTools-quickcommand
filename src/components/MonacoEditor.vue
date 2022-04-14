<template>
  <div>
    <div id="monacoEditor" style="width: 100%; height: 100%"></div>
    <div class="absolute-center flex" v-show="!value">
      <div class="placeholder text-center q-gutter-md">
        <div v-for="shortCut in shortCuts" :key="shortCut">
          <span>{{ shortCut[0] }}</span
          ><span class="shortcut-key">{{ shortCut[1] }}</span
          ><span class="shortcut-key">{{ shortCut[2] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as monaco from "monaco-editor";
import { toRaw } from "vue";
import importAll from "../js/common/importAll.js";

// 批量导入声明文件
let apis = importAll(
  require.context("!raw-loader!../plugins/monaco/types/", false, /\.ts$/)
);

// 批量导入关键字补全
let languageCompletions = importAll(
  require.context("../plugins/monaco/completions/", false, /\.js$/)
);

let cmdCtrlKey = utools.isMacOs() ? "⌘" : "Ctrl";
let optAltKey = utools.isMacOs() ? "⌥" : "Alt";

export default {
  data() {
    return {
      editor: null,
      value: null,
      wordWrap: "off",
      shortCutKeyBg: this.$q.dark.isActive ? "#262626" : "#f3f4f6",
      shortCuts: [
        ["保存", cmdCtrlKey, "S"],
        ["运行", cmdCtrlKey, "B"],
        ["换行", optAltKey, "Z"],
      ],
    };
  },
  mounted() {
    this.initEditor();
  },
  computed: {
    rawEditor() {
      return toRaw(this.editor);
    },
    isDark() {
      return this.$q.dark.isActive;
    },
  },
  methods: {
    initEditor() {
      let monacoEditorPreferences = {
        value: "",
        automaticLayout: true,
        foldingStrategy: "indentation",
        autoClosingBrackets: true,
        tabSize: 2,
        minimap: {
          enabled: false,
        },
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
        let tokens = getTokens(toRaw(editor).getModel().getValue());
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
      });
    },
    setEditorTheme() {
      monaco.editor.setTheme(this.isDark ? "vs-dark" : "vs");
    },
    getEditorValue() {
      return this.rawEditor.getValue();
    },
    setEditorValue(value) {
      this.rawEditor.setValue(value);
    },
    setEditorLanguage(language) {
      monaco.editor.setModelLanguage(this.rawEditor.getModel(), language);
    },
    getCursorPosition() {
      return this.rawEditor.getPosition();
    },
    setCursorPosition(pos) {
      if (!pos) return;
      this.rawEditor.setPosition(pos);
    },
    repacleEditorSelection(text) {
      var selection = this.rawEditor.getSelection();
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
      this.rawEditor.executeEdits("my-source", [op]);
    },
    destoryEditor() {
      this.rawEditor.dispose();
    },
    listenEditorValue() {
      this.rawEditor.focus();
      this.rawEditor.onDidChangeModelContent(() => {
        this.value = this.getEditorValue();
        this.$emit("typing", this.value);
      });
    },
    bindKeys() {
      let that = this;
      // ctrl + b 运行
      this.rawEditor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB,
        () => {
          that.$parent.runCurrentCommand();
        }
      );
      // alt + z 换行
      this.rawEditor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyZ, () => {
        that.wordWrap = that.wordWrap === "off" ? "on" : "off";
        that.rawEditor.updateOptions({ wordWrap: that.wordWrap });
      });
      // ctrl + s 保存
      this.rawEditor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        () => {
          that.$parent.saveCurrentCommand();
        }
      );
    },
  },
};
</script>

<style scoped>
.placeholder {
  font-size: 12px;
  font-family: sans-serif;
  color: #a3a3a3;
  user-select: none;
}
.shortcut-key {
  background-color: v-bind(shortCutKeyBg);
  border-radius: 0.25rem;
  margin-left: 0.5rem;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}
</style>