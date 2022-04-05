<template>
  <div class="relative">
    <!-- 命令设置栏 -->
    <q-scroll-area
      :thumb-style="{
        width: '3px',
      }"
      class="absolute-left shadow-10"
      :style="{
        width: sideBarWidth,
        background: $q.dark.isActive ? '#2d2d2d' : '#f2f2f2',
        zIndex: 1,
      }"
      v-if="showSidebar"
    >
      <div class="row q-pa-md q-gutter-md">
        <q-btn
          dense
          flat
          color="grey"
          icon="arrow_back_ios_new"
          @click="closeEditor"
        />
        <q-img class="commandLogo" width="64px" :src="commandIcon" />
        <div class="row">
          <div>
            <!-- 说明 -->
            <q-input
              standout="bg-primary text-white"
              square
              v-model="quickcommandInfo.features.explain"
              type="text"
              label="说明"
            >
              <template v-slot:prepend>
                <q-icon name="drive_file_rename_outline" />
              </template>
            </q-input>
            <!-- 匹配类型 -->
            <q-select
              standout="bg-primary text-white"
              square
              options-dense
              @update:model-value="cmdMatch = null"
              :options="commandTypesOptions"
              v-model="cmdType"
              type="text"
              label="匹配类型"
            >
              <template v-slot:prepend>
                <q-icon :name="cmdType.icon" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label v-html="scope.opt.name" />
                    <q-item-label caption>{{ scope.opt.desc }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template></q-select
            >
            <!-- 匹配规则 -->
            <q-select
              v-if="cmdType.valueType === 'array'"
              standout="bg-primary text-white"
              square
              v-model="cmdMatch"
              use-input
              use-chips
              multiple
              hide-dropdown-icon
              input-debounce="0"
              new-value-mode="add-unique"
              type="text"
              placeholder="回车添加"
              :label="cmdType.matchLabel"
            >
              <template v-slot:prepend>
                <q-icon name="square_foot" />
              </template>
            </q-select>
            <q-input
              v-else
              autogrow
              standout="bg-primary text-white"
              square
              v-model="cmdMatch"
              :readonly="cmdType.inputType === 'null'"
              type="text"
              :label="cmdType.matchLabel"
            >
              <template v-slot:prepend>
                <q-icon name="square_foot" />
              </template>
            </q-input>
            <!-- 标签 -->
            <q-input
              standout="bg-primary text-white"
              square
              v-model="quickcommandInfo.tags"
              type="text"
              label="标签"
            />
            <q-input
              standout="bg-primary text-white"
              square
              type="text"
              label="变量"
            />
            <q-input
              standout="bg-primary text-white"
              square
              type="text"
              label="输出"
            />
            <q-input
              standout="bg-primary text-white"
              square
              v-model="quickcommandInfo.features.platform"
              type="text"
              label="平台"
            />
          </div>
        </div>
      </div>
      <div></div>
    </q-scroll-area>
    <!-- 编程语言栏 -->
    <div
      class="absolute-top"
      :style="{
        left: showSidebar ? sideBarWidth : 0,
      }"
    >
      <div class="row" v-show="languageBarHeight">
        <div class="col">
          <div>
            <q-select
              dense
              standout="bg-primary text-white"
              square
              hide-bottom-space
              color="primary"
              transition-show="jump-down"
              transition-hide="jump-up"
              @update:model-value="programChanged"
              v-model="quickcommandInfo.program"
              :options="programLanguages"
              label="编程语言"
            >
              <template v-slot:append>
                <q-avatar size="lg" square>
                  <img :src="currentProgramLogo" />
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
            standout="bg-primary text-white"
            square
            stack-label
            hide-bottom-space
            color="primary"
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
              color="primary"
              icon="help"
              @click="showHelp"
              v-show="quickcommandInfo.program === 'quickcommand'"
              ><q-tooltip>查看文档</q-tooltip></q-btn
            >
            <q-btn
              flat
              color="primary"
              icon="code"
              @click="showCustomOptions"
              v-show="quickcommandInfo.program !== 'quickcommand'"
              ><q-tooltip>其他编程语言或自定义解释器路径</q-tooltip></q-btn
            >
            <q-btn
              flat
              color="primary"
              icon="format_size"
              @click="showCodingPage()"
              v-show="quickcommandInfo.program !== 'quickcommand'"
              ><q-tooltip>脚本及输出编码设置</q-tooltip></q-btn
            >
            <q-btn
              flat
              color="primary"
              icon="play_arrow"
              @click="runCurrentCommand()"
              ><q-tooltip>运行命令 {{ commandString }}+b</q-tooltip></q-btn
            >
            <q-btn
              flat
              v-if="!isRunCodePage"
              color="primary"
              icon="save"
              @click="saveCurrentCommand()"
              ><q-tooltip>保存 {{ commandString }}+s</q-tooltip></q-btn
            >
          </q-btn-group>
        </div>
      </div>
    </div>
    <MonocaEditor
      class="absolute-bottom"
      ref="editor"
      :style="{
        top: languageBarHeight,
        left: this.action.type === 'run' ? '0' : sideBarWidth,
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
          <q-btn flat label="关闭" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import MonocaEditor from "components/MonocaEditor";
import commandTypes from "../js/commandTypes.js";
let commandTypesOptions = Object.values(commandTypes);

export default {
  components: { MonocaEditor },
  data() {
    return {
      reg: "i",
      programLanguages: Object.keys(this.$programmings),
      currentMatchType: "关键字",
      sideBarWidth: "240px",
      languageBarHeight: "40px",
      commandTypes: commandTypes,
      commandTypesOptions: commandTypesOptions,
      cmdType: commandTypesOptions[0],
      cmdMatch: "",
      quickcommandInfo: {
        features: {
          explain: "",
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
      showSidebar: this.action.type !== "run",
      isRunCodePage: this.action.type === "run",
      commandString: this.$q.platform.is.mac ? "⌘" : "ctrl",
    };
  },
  props: {
    action: Object,
  },
  mounted() {
    this.init();
  },
  computed: {
    commandIcon() {
      return this.quickcommandInfo.features?.icon || this.currentProgramLogo;
    },
    currentProgramLogo() {
      return "/logo/" + this.quickcommandInfo.program + ".png";
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
      // 获取当前命令的匹配类型及匹配规则
      let currentQuickCommandCmds = this.getCommandType();
      // 设置匹配类型下拉框的值（Object）及匹配规则的值
      this.cmdType = this.commandTypes[currentQuickCommandCmds.type];
      this.cmdMatch = currentQuickCommandCmds.match;
      // monoca 相关
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
          this.matchLanguage(this.quickcommandInfo.customOptions.ext);
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
    closeEditor() {
      this.$emit("editorEvent", {
        type: "close",
        data: {},
      });
    },
    // 保存
    saveCurrentCommand() {},
    // 判断命令类型
    getCommandType() {
      let data = {};
      let cmds = this.quickcommandInfo.features.cmds;
      if (cmds.length === 1) {
        let { type, match } = cmds[0];
        data.type = type ? type : "keyword";
        data.match =
          data.type === "keyword" ? cmds[0] : match?.app ? match.app : match;
      } else {
        data.type = cmds.filter((x) => !x.length).length
          ? "professional"
          : "keyword";
        data.match =
          data.type === "keyword" ? cmds : JSON.stringify(cmds, null, 4);
      }
      return data;
    },
  },
};
</script>

<style scoped>
.commandLogo {
  cursor: pointer;
  transition: 10s;
  filter: drop-shadow(2px 1px 1px grey);
}
.commandLogo:hover {
  transition: 10s;
  transform: rotate(360deg);
}
</style>
