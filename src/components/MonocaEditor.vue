<template>
  <div id="monocaEditor"></div>
</template>

<script>
import * as monaco from "monaco-editor";
import { toRaw } from "vue";
import utoolsApi from "!raw-loader!../types/utools.api.d.ts";
import quickcommandApi from "!raw-loader!../types/quickcommand.api.d.ts";
import electronApi from "!raw-loader!../types/electron.d.ts";
import nodeApi from "!raw-loader!../types/node.api.d.ts";
import commonApi from "!raw-loader!../types/common.d.ts";

export default {
  data() {
    return {
      editor: null,
    };
  },
  mounted() {
    this.initEditor();
  },
  methods: {
    initEditor() {
      this.editor = monaco.editor.create(
        document.getElementById("monocaEditor"),
        {
          value: "",
          language: "javascript",
          automaticLayout: true,
          foldingStrategy: "indentation",
          autoClosingBrackets: true,
          tabSize: 2,
          minimap: {
            enabled: false,
          },
        }
      );
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
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        quickcommandApi + utoolsApi + electronApi + nodeApi + commonApi,
        "api.d.ts"
      );
    },
    getEditorValue() {
      return toRaw(this.editor).getValue();
    },
    setEditorLanguage(language) {
      monaco.editor.setModelLanguage(this.editor.getModel(), language);
    },
    addEditorCommand(key, callback) {
      this.editor.addCommand(key, callback);
    },
  },
};
</script>
