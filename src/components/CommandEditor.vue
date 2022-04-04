<template>
  <div class="relative">
    <!-- 匹配类型 -->
    <div class="row q-gutter-sm q-py-xs" v-if="notRunCodePage">
      <div class="col">
        <q-select
          dense
          outlined
          color="teal"
          transition-show="jump-down"
          transition-hide="jump-up"
          label-color="teal"
          v-model="currentMatchType"
          :options="matchTypes"
          label="匹配类型"
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
      <div class="col">
        <q-select
          dense
          outlined
          color="teal"
          transition-show="jump-down"
          transition-hide="jump-up"
          label-color="teal"
          v-model="quickcommandInfo.program"
          :options="programLanguages"
          label="匹配规则"
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
    <!-- 说明、图标及标签 -->
    <div class="row q-gutter-sm q-py-xs" v-if="notRunCodePage">
      <div class="col-auto">
        <q-img width="40px" src="/logo/quickcommand.png"></q-img>
      </div>
      <div class="col">
        <q-select
          dense
          outlined
          color="teal"
          transition-show="jump-down"
          transition-hide="jump-up"
          label-color="teal"
          v-model="currentMatchType"
          :options="matchTypes"
          label="说明"
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
      <div class="col-6">
        <q-select
          dense
          outlined
          color="teal"
          transition-show="jump-down"
          transition-hide="jump-up"
          label-color="teal"
          v-model="quickcommandInfo.program"
          :options="programLanguages"
          label="标签"
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
    <!-- 特殊变量、输出 -->
    <div class="row q-gutter-sm q-py-xs" v-if="notRunCodePage">
      <div class="col">
        <q-select
          dense
          outlined
          color="teal"
          transition-show="jump-down"
          transition-hide="jump-up"
          label-color="teal"
          v-model="currentMatchType"
          :options="matchTypes"
          label="变量"
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
      <div class="col">
        <q-select
          dense
          outlined
          color="teal"
          transition-show="jump-down"
          transition-hide="jump-up"
          label-color="teal"
          v-model="quickcommandInfo.program"
          :options="programLanguages"
          label="输出"
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
    <!-- 编程语言 -->
    <div class="row">
      <div class="col">
        <div>
          <q-select
            dense
            filled
            square
            hide-bottom-space
            color="teal"
            transition-show="jump-down"
            transition-hide="jump-up"
            label-color="teal"
            @update:model-value="programChanged"
            v-model="quickcommandInfo.program"
            :options="programLanguages"
            label="编程语言"
          >
            <template v-slot:prepend>
              <q-avatar
                size="lg"
                square
                :src="'/logo/' + quickcommandInfo.program + '.png'"
              >
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
      <q-separator vertical />
      <div class="col-auto">
        <q-input
          dense
          filled
          square
          hide-bottom-space
          color="teal"
          input-style="width: 120px;"
          v-model="quickcommandInfo.scptarg"
          label="脚本参数"
          v-show="quickcommandInfo.program !== 'quickcommand'"
        />
      </div>
      <div class="col-auto justify-end flex">
        <q-btn-group>
          <q-btn
            flat
            color="teal"
            icon="help"
            @click="showHelp"
            v-show="quickcommandInfo.program === 'quickcommand'"
            ><q-tooltip>查看文档</q-tooltip></q-btn
          >
          <q-btn
            flat
            color="teal"
            icon="code"
            @click="showCustomOptions"
            v-show="quickcommandInfo.program !== 'quickcommand'"
            ><q-tooltip>其他编程语言或自定义解释器路径</q-tooltip></q-btn
          >
          <q-btn
            flat
            color="teal"
            icon="format_size"
            @click="showCodingPage()"
            v-show="quickcommandInfo.program !== 'quickcommand'"
            ><q-tooltip>脚本及输出编码设置</q-tooltip></q-btn
          >
          <q-btn flat color="teal" icon="send" @click="runCurrentCommand()"
            ><q-tooltip>运行命令</q-tooltip></q-btn
          >
        </q-btn-group>
      </div>
    </div>
    <MonocaEditor
      class="absolute-bottom"
      ref="editor"
      :style="{
        top: this.action.type === 'run' ? '40px' : '250px',
      }"
    />
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
      programLanguages: Object.keys(this.$programmings),
      matchTypes: ["关键字", "正则", "窗口", "文件", "专业模式"],
      currentMatchType: "关键字",
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
    notRunCodePage() {
      return this.action.type !== "run";
    },
  },
  created() {},
  methods: {
    init() {
      window.commandEditor = this;
      this.bindKeys();
      let quickCommandInfo =
        this.action.type === "edit"
          ? this.action.data
          : this.$utools.getDB(this.$utools.DBPRE.CFG + "codeHistory");
      Object.assign(this.quickcommandInfo, quickCommandInfo);
      this.setLanguage(this.quickcommandInfo.program);
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
    programChanged(value) {
      this.setLanguage(value);
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
    // 自定义解释器路径界面
    showCustomOptions() {
      quickcommand
        .showInputBox(
          {
            labels: ["解释器路径", "解释器参数", "脚本后缀"],
            hints: [
              "绝对路径，如：/home/.bin/python",
              "运行参数，如：-u",
              "脚本的后缀，不含点，如：py",
            ],
            values: [
              this.quickcommandInfo.customOptions?.bin,
              this.quickcommandInfo.customOptions?.argv,
              this.quickcommandInfo.customOptions?.ext,
            ],
          },
          "其他编程语言或自定义解释器路径"
        )
        .then((res) => {
          if (res)
            [
              this.quickcommandInfo.customOptions.bin,
              this.quickcommandInfo.customOptions.argv,
              this.quickcommandInfo.customOptions.ext,
            ] = res;
            this.matchLanguage(this.quickcommandInfo.customOptions.ext)
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
