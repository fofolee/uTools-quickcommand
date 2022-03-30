<template>
  <div class="q-pa-md">
    <div class="row q-gutter-sm">
      <div class="col-3">
        <div style="max-width: 300px">
          <q-select
            dense
            outlined
            label-color="primary"
            v-model="program"
            :options="options"
            label="编程语言"
          >
            <template v-slot:append>
              <q-avatar rounded>
                <img :src="'/logo/' + program + '.png'" />
              </q-avatar>
            </template>
            <template v-slot:option="{ itemProps, itemEvents, opt }">
              <q-item v-bind="itemProps" v-on="itemEvents">
                <q-item-section avatar>
                  <img width="32" :src="'/logo/' + opt + '.png'" />
                </q-item-section>
                <q-item-section>
                  <q-item-label v-html="opt" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>
      <div class="col">
        <div class="row q-gutter-sm" v-show="program === 'custom'">
          <div class="col">
            <q-input
              dense
              v-model="customOptions.bin"
              stack-label
              label="解释器路径"
            />
          </div>
          <div class="col">
            <q-input
              dense
              v-model="customOptions.argv"
              stack-label
              label="解释器参数"
            />
          </div>
          <div class="col">
            <q-input
              dense
              v-model="customOptions.ext"
              @blur="matchLanguage"
              label="后缀,不含."
              stack-label
            />
          </div>
        </div>
      </div>
      <div class="col-auto doc-container">
        <div class="row q-gutter-sm items-center justify-end">
          <q-input
            dense
            outlined
            style="width: 90px"
            v-model="scptarg"
            label="脚本参数"
            v-show="program !== 'quickcommand'"
          />
          <q-btn
            color="primary"
            label="文档"
            @click="showHelp"
            v-show="program === 'quickcommand'"
          />
          <q-btn
            color="primary"
            label="编码设置"
            @click="showCoding = true"
            v-show="program !== 'quickcommand'"
          />
          <q-btn color="primary" label="运行" />
        </div>
      </div>
    </div>
    <div class="row">
      <div
        id="monocaEditor"
        style="
          position: fixed;
          bottom: 1px;
          left: 1px;
          right: 1px;
          top: 70px;
          border-radius: 4px;
          border: 2px solid #3376cd;
        "
      />
    </div>
    <q-dialog v-model="showCoding" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h5" align="center">编码设置</div>
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input
            outlined
            v-model="scriptCode"
            label="脚本编码"
            hint="未出现乱码问题请留空"
            hide-hint
            autofocus
            @keyup.enter="showCoding = false"
          />
          <q-input
            outlined
            v-model="outputCode"
            label="输出编码"
            hint="未出现乱码问题请留空"
            hide-hint
            @keyup.enter="showCoding = false"
          />
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn color="primary" label="帮助" @click="showSupportEncodings()" />
          <q-btn color="primary" label="确定" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import GlobalVars from "components/GlobalVars";
import * as monaco from "monaco-editor";

export default {
  data() {
    return {
      options: Object.keys(GlobalVars.programs),
      program: "quickcommand",
      editor: null,
      customOptions: { bin: "", argv: "", ext: "" },
      scptarg: "",
      showCoding: false,
      scriptCode: "",
      outputCode: "",
    };
  },
  mounted() {
    this.initEditor();
  },
  computed: {},
  created() {},
  watch: {
    program(val) {
      this.setLanguage(val);
    },
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
      this.editor.onDidChangeModelContent((e) => {
        console.log(e);
      });
    },
    getValue() {
      this.editor.getValue();
    },
    matchLanguage() {
      let language = Object.values(GlobalVars.programs).filter(
        (program) => program.ext === this.customOptions.ext
      );
      if (language.length) {
        this.setLanguage(language[0].name);
      }
    },
    setLanguage(language) {
      let highlight = GlobalVars.programs[language].highlight;
      monaco.editor.setModelLanguage(
        this.editor.getModel(),
        highlight ? highlight : language
      );
    },
    showHelp() {
      utools.createBrowserWindow("./helps/quickcommand.html", {
        width: 1280,
        height: 920,
      });
    },
    showSupportEncodings() {
      utools.ubrowser
        .goto(
          "https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings"
        )
        .run({ width: 1280, height: 920 });
    },
  },
};
</script>

<style scoped>
</style>
