<template>
  <div id="monocaEditor"></div>
</template>

<script>
import * as monaco from "monaco-editor";
import { toRaw } from "vue";
import importAll from "../js/importAll.js";

// 批量导入声明文件
let apis = importAll(
  require.context("!raw-loader!../plugins/monaco/types/", false, /\.ts$/)
);

// 批量导入关键字补全
let languageCompletions = importAll(
  require.context("../plugins/monaco/completions/", false, /\.js$/)
);

export default {
  data() {
    return {
      editor: null,
    };
  },
  mounted() {
    this.initEditor();
  },
  computed: {
    rawEditor() {
      return toRaw(this.editor);
    },
  },
  methods: {
    initEditor() {
      let monacoEditorPreferences = {
        value: "",
        language: "javascript",
        automaticLayout: true,
        foldingStrategy: "indentation",
        autoClosingBrackets: true,
        tabSize: 2,
        minimap: {
          enabled: false,
        },
      };
      if (this.$q.dark.isActive) monacoEditorPreferences.theme = "vs-dark";
      this.editor = monaco.editor.create(
        document.getElementById("monocaEditor"),
        monacoEditorPreferences
      );
      this.loadTypes();
      this.registerLanguage();
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
    getEditorValue() {
      return this.rawEditor.getValue();
    },
    setEditorValue(value) {
      this.rawEditor.setValue(value);
    },
    setEditorLanguage(language) {
      monaco.editor.setModelLanguage(this.rawEditor.getModel(), language);
    },
    addEditorCommand(key, callback) {
      this.rawEditor.addCommand(key, callback);
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
  },
};
</script>
