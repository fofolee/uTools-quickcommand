<template>
  <div class="q-pa-md">
    <div class="row q-gutter-sm">
      <div class="col-3">
        <div style="max-width: 300px">
          <q-select
            dense
            outlined
            color="teal"
            transition-show="jump-down"
            transition-hide="jump-up"
            label-color="teal"
            v-model="quickcommandInfo.program"
            :options="options"
            label="编程语言"
          >
            <template v-slot:append>
              <q-avatar rounded>
                <img :src="'/logo/' + quickcommandInfo.program + '.png'" />
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
        <div
          class="row q-gutter-sm"
          v-show="quickcommandInfo.program === 'custom'"
        >
          <div class="col">
            <q-input
              dense
              color="teal"
              v-model="quickcommandInfo.customOptions.bin"
              stack-label
              label="解释器路径"
            />
          </div>
          <div class="col">
            <q-input
              dense
              color="teal"
              v-model="quickcommandInfo.customOptions.argv"
              stack-label
              label="解释器参数"
            />
          </div>
          <div class="col">
            <q-input
              dense
              color="teal"
              v-model="quickcommandInfo.customOptions.ext"
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
            color="teal"
            input-style="width: 120px;"
            v-model="quickcommandInfo.scptarg"
            label="脚本参数"
            v-show="quickcommandInfo.program !== 'quickcommand'"
          />
          <q-btn-group>
            <q-btn
              rounded
              color="teal"
              flat
              icon="description"
              @click="showHelp"
              v-show="quickcommandInfo.program === 'quickcommand'"
              ><q-tooltip>查看文档</q-tooltip></q-btn
            >
            <q-btn
              rounded
              color="teal"
              flat
              icon="format_size"
              @click="showCodingPage()"
              v-show="quickcommandInfo.program !== 'quickcommand'"
              ><q-tooltip>脚本及输出编码设置</q-tooltip></q-btn
            >
            <q-btn
              rounded
              flat
              color="teal"
              icon="send"
              @click="runCurrentCommand()"
              ><q-tooltip>运行命令</q-tooltip></q-btn
            >
          </q-btn-group>
        </div>
      </div>
    </div>
    <div class="row">
      <MonocaEditor
        ref="editor"
        style="
          position: fixed;
          bottom: 2px;
          left: 2px;
          right: 2px;
          top: 70px;
          border-radius: 4px;
          border: 1px solid #8080808c;
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
            :class="runResultStatus ? '' : 'text-red'"
            v-html="runResult"
          ></pre>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="关闭" color="teal" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import MonocaEditor from "components/MonocaEditor";

export default {
  components: { MonocaEditor },
  data() {
    return {
      options: Object.keys(this.$programmings),
      quickcommandInfo: {
        features: {
          explain: "",
          cmds: [],
          platform: [],
        },
        program: "quickcommand",
        cmd: "",
        output: "",
        hasSubInput: false,
        scptarg: "",
        charset: {
          scriptCode: "",
          outputCode: "",
        },
        tags: [],
        customOptions: {
          bin: "",
          argv: "",
          ext: "",
        },
      },
      isResultShow: false,
      runResult: "",
      runResultStatus: true,
      resultMaxLength: 10000,
    };
  },
  props: {
    action: Object,
  },
  mounted() {
    this.init();
  },
  computed: {
    currentProgram() {
      return this.quickcommandInfo.program;
    },
  },
  created() {},
  watch: {
    currentProgram(val) {
      this.setLanguage(val);
    },
  },
  methods: {
    init() {
      this.bindKeys();

      let quickCommandInfo =
        this.action.type === "edit"
          ? this.action.data
          : this.$utools.getDB(this.$utools.DBPRE.CFG + "codeHistory");
      Object.assign(this.quickcommandInfo, quickCommandInfo);
      this.$refs.editor.setEditorValue(quickCommandInfo.cmd);
      // 只有新建或运行时才保存记录
      if (this.action.type === "edit") return;
      utools.onPluginOut(() => {
        this.quickcommandInfo.cmd = this.$refs.editor.getEditorValue();
        // 保存本次编辑记录
        this.$utools.putDB(
          JSON.parse(JSON.stringify(this.quickcommandInfo)),
          this.$utools.DBPRE.CFG + "codeHistory"
        );
      });
    },
    // 绑定快捷键
    bindKeys() {
      let that = this;
      // ctrl+b 运行
      this.$refs.editor.addEditorCommand(2048 | 32, function () {
        that.runCurrentCommand();
      });
    },
    // 匹配编程语言
    matchLanguage() {
      let language = Object.values(this.$programmings).filter(
        (program) => program.ext === this.quickcommandInfo.customOptions.ext
      );
      if (language.length) {
        this.setLanguage(language[0].name);
      }
    },
    // 设置编程语言
    setLanguage(language) {
      let highlight = this.$programmings[language].highlight;
      this.$refs.editor.setEditorLanguage(highlight ? highlight : language);
    },
    // 打开文档
    showHelp() {
      utools.createBrowserWindow("./helps/quickcommand.html", {
        width: 1280,
        height: 920,
      });
    },
    // 编码设置页面
    showCodingPage() {
      quickcommand
        .showInputBox(
          {
            labels: ["文件编码", "输出编码"],
            hints: ["基于iconv-lite进行编码，无乱码请留空", "无乱码请留空"],
            values: [
              this.quickcommandInfo.charset?.scriptCode,
              this.quickcommandInfo.charset?.outputCode,
            ],
          },
          "编码设置"
        )
        .then((res) => {
          if (res)
            [
              this.quickcommandInfo.charset.scriptCode,
              this.quickcommandInfo.charset.outputCode,
            ] = res;
        });
    },
    // 运行命令
    async runCurrentCommand() {
      let cmd = this.$refs.editor.getEditorValue();
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
      if (this.quickcommandInfo.program === "quickcommand") {
        window.runCodeInVm(cmd, (stdout, stderr) => {
          if (stderr) return this.showRunResult(stderr, raw, false);
          this.showRunResult(stdout, raw, true);
        });
      } else {
        let option = this.$programmings[this.program];
        if (this.quickcommandInfo.program === "custom")
          option = this.quickcommandInfo.customOptions;
        option.scptarg = this.quickcommandInfo.scptarg;
        option.charset = this.quickcommandInfo.charset;
        window.runCodeFile(cmd, option, terminal, (stdout, stderr) => {
          if (terminal) return;
          if (stderr) return this.showRunResult(stderr, raw, false);
          this.showRunResult(stdout, raw, true);
        });
      }
    },
    // 替换特殊变量
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
    // 显示运行结果
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
