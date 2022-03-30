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
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <img width="32" :src="'/logo/' + scope.opt + '.png'" />
                </q-item-section>
                <q-item-section>
                  <q-item-label v-html="scope.opt" />
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
            @click="showCodingPage()"
            v-show="program !== 'quickcommand'"
          />
          <q-btn color="primary" @click="runCurrentCommand()" label="运行" />
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
    <q-dialog v-model="isResultShow" @hide="runResult = ''" position="bottom">
      <q-card style="width: 90vh">
        <q-toolbar>
          <q-avatar>
            <q-icon
              :class="runResultStatus ? 'text-green' : 'text-red'"
              style="font-size: 30px"
              :name="runResultStatus ? 'task_alt' : 'error'"
            ></q-icon>
          </q-avatar>
          <q-toolbar-title
            ><span class="text-weight-bold">运行结果</span></q-toolbar-title
          >
        </q-toolbar>
        <q-card-section class="row items-center">
          <pre
            :class="runResultStatus ? 'text-green' : 'text-red'"
            v-html="runResult"
          ></pre>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="关闭" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import globalVars from "components/GlobalVars";
import * as monaco from "monaco-editor";
import { toRaw } from "vue";

export default {
  data() {
    return {
      options: Object.keys(globalVars.programs),
      program: "quickcommand",
      editor: null,
      customOptions: { bin: "", argv: "", ext: "" },
      scptarg: "",
      scriptCode: "",
      outputCode: "",
      output: "",
      isResultShow: false,
      runResult: "",
      runResultStatus: true,
      resultMaxLength: 10000,
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
    },
    getEditorValue() {
      return toRaw(this.editor).getValue();
    },
    matchLanguage() {
      let language = Object.values(globalVars.programs).filter(
        (program) => program.ext === this.customOptions.ext
      );
      if (language.length) {
        this.setLanguage(language[0].name);
      }
    },
    setLanguage(language) {
      let highlight = globalVars.programs[language].highlight;
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
    showCodingPage() {
      quickcommand.showInputBox(
        ["文件编码", "输出编码"],
        "编码设置",
        ["基于iconv-lite进行编码，无乱码请留空", "无乱码请留空"],
        (res) => {
          if (res) [this.scriptCode, this.outputCode] = res;
        }
      );
    },
    async runCurrentCommand() {
      let cmd = this.getEditorValue();
      cmd = window.special(cmd);
      cmd = await this.replaceTempInputVals(cmd);
      let terminal = false;
      let raw = true;
      switch (this.output) {
        case "html":
          raw = false;
          break;
        case "terminal":
          terminal = true;
          break;
        case "ignore":
          utools.hideMainWindow();
          break;
      }
      if (this.program === "quickcommand") {
        window.runCodeInVm(cmd, (stdout, stderr) => {
          if (stderr) return this.showRunResult(stderr, raw, false);
          this.showRunResult(stdout, raw, true);
        });
      } else {
        let option = globalVars.programs[this.program];
        if (this.program === "custom")
          option = {
            bin: this.customOptions.bin,
            argv: this.customOptions.argv,
            ext: this.customOptions.ext,
          };
        option.scptarg = this.scptarg;
        option.charset = {
          scriptCode: this.scriptCode,
          outputCode: this.outputCode,
        };
        window.runCodeFile(cmd, option, terminal, (stdout, stderr) => {
          if (terminal) return;
          if (stderr) return this.showRunResult(stderr, raw, false);
          this.showRunResult(stdout, raw, true);
        });
      }
    },
    async replaceTempInputVals(cmd) {
      let tempInputVals = [];
      let specilaVals = [
        "input",
        "subinput",
        "pwd",
        "SelectFile",
        "WindowInfo",
        "MatchedFiles",
      ];
      specilaVals.forEach((x) => {
        let m = cmd.match(new RegExp("{{" + x + ".*?}}", "g"));
        m &&
          m.forEach((y) => tempInputVals.includes(y) || tempInputVals.push(y));
      });
      if (!tempInputVals.length) return cmd;
      let inputs = await quickcommand.showInputBox(
        tempInputVals,
        "需要临时为以下变量赋值"
      );
      tempInputVals.forEach((t, n) => {
        cmd = cmd.replace(new RegExp(t, "g"), inputs[n]);
      });
      return cmd;
    },
    showRunResult(content, raw, isSuccess) {
      this.isResultShow = true;
      this.runResultStatus = isSuccess;
      let contlength = content.length;
      if (contlength > this.resultMaxLength)
        content =
          content.slice(0, this.resultMaxLength - 100) +
          `\n\n...\n${
            contlength - this.resultMaxLength - 100
          } 字省略\n...\n\n` +
          content.slice(contlength - 100);
      this.runResult += htmlEncode(content, raw);
    },
  },
};
</script>

<style scoped>
</style>
