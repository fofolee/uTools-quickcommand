<template>
  <div>
    <div v-if="!fromUtools">
      <q-dialog v-model="isResultShow" position="bottom" @hide="stopRun">
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
            <q-btn flat round icon="close" color="negative" v-close-popup />
          </q-toolbar>
          <iframe
            ref="iframe"
            :srcdoc="frameStyle + runResult"
            :height="frameHeight"
            @load="frameLoad"
            frameborder="0"
            v-if="htmlOutput"
          ></iframe>
          <q-card-section v-else class="row items-center">
            <pre
              :class="{
                'text-red': !runResultStatus,
                result: 1,
              }"
              v-text="runResult"
            ></pre>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
    <div v-else>
      <iframe
        ref="iframe"
        :srcdoc="frameStyle + runResult"
        :height="frameHeight"
        frameborder="0"
        @load="frameLoad"
        v-if="htmlOutput"
      ></iframe>
      <pre
        v-else
        v-show="!!runResult"
        :class="{
          'text-red': !runResultStatus,
          'q-pa-md': 1,
          result: 1,
        }"
        v-text="runResult"
      ></pre>
    </div>
  </div>
</template>


<script>
import outputTypes from "../js/options/outputTypes.js";
import specialVars from "../js/options/specialVars.js";
import commandTypes from "../js/options/commandTypes.js";

const frameStyle = `<style>::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: rgba(194, 194, 194, 0.4);
}

::-webkit-scrollbar-track {
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
}
body {
  margin: 0;
  color: ${utools.isDarkColors() ? "white" : "unset"}
}
</style>
`;

export default {
  data() {
    return {
      isResultShow: false,
      runResult: "",
      runResultStatus: true,
      subInputValue: "",
      listener: null,
      history: [],
      historyIdx: null,
      htmlOutput: false,
      frameHeight: 0,
      frameStyle: frameStyle,
    };
  },
  props: {
    /**
     * run：    「RunCode界面」 无侧栏，运行结果弹窗显示，保存命令历史
     * edit：   「编辑命令界面』 有侧栏，运行结果弹窗显示，需要对payload临时赋值
     * new：    『新建命令界面」 有侧栏，运行结果弹窗显示，需要对payload临时赋值
     * config： 「配置界面』    运行结果弹窗显示，需要对payload临时赋值
     * input：  『主输入框进入」 运行结果直接展示，动态调整窗体高度
     */
    action: Object,
  },
  computed: {
    fromUtools() {
      return this.action.type === "input";
    },
    needTempPayload() {
      return ["edit", "new", "config"].includes(this.action.type);
    },
    maxHeight() {
      return this.fromUtools ? 600 : 300;
    },
  },
  methods: {
    // 运行命令
    async runCurrentCommand(currentCommand) {
      await this.getTempPayload(currentCommand);
      if (currentCommand.cmd.includes("{{subinput"))
        return this.setSubInput(currentCommand);
      this.fire(currentCommand);
    },
    async fire(currentCommand) {
      currentCommand.cmd = this.assignSpecialVars(currentCommand.cmd);
      this.htmlOutput = currentCommand.output === "html";
      let { hideWindow, outPlugin, action } =
        outputTypes[currentCommand.output];
      // 需要隐藏的提前隐藏窗口
      hideWindow && utools.hideMainWindow();
      // 对于本身就没有输出的命令，无法确认命令是否执行完成，所以干脆提前退出插件
      // 弊端就是如果勾选了隐藏后台就完全退出的话，会造成命令直接中断
      let quitBeforeShowResult = this.fromUtools && outPlugin;
      quitBeforeShowResult &&
        setTimeout(() => {
          utools.outPlugin();
        }, 500);
      if (currentCommand.program === "quickcommand") {
        window.runCodeInSandbox(currentCommand.cmd, (stdout, stderr) => {
          if (stderr) {
            return quitBeforeShowResult
              ? alert(stderr)
              : this.showRunResult(stderr, false, action);
          }
          !outPlugin && this.showRunResult(stdout, true, action);
        });
      } else {
        let option =
          currentCommand.program === "custom"
            ? currentCommand.customOptions
            : this.$root.programs[currentCommand.program];
        option.scptarg = currentCommand.scptarg || "";
        option.charset = currentCommand.charset || {};
        window.runCodeFile(
          currentCommand.cmd,
          option,
          currentCommand.output === "terminal",
          (stdout, stderr) => {
            if (stderr) {
              return quitBeforeShowResult
                ? alert(stderr)
                : this.showRunResult(stderr, false, action);
            }
            !outPlugin && this.showRunResult(stdout, true, action);
          }
        );
      }
    },
    // 特殊变量赋值
    assignSpecialVars(cmd) {
      let spVars = _.filter(specialVars, (sp) => sp.repl);
      _.forIn(spVars, (val, key) => {
        if (cmd.includes(val.label.slice(0, -2))) {
          cmd = cmd.replace(val.match, (x) => val.repl(x));
        }
      });
      return cmd;
    },
    // 子输入框
    setSubInput(currentCommand) {
      this.fromUtools && utools.setExpendHeight(0);
      let matched = specialVars.subinput.match.exec(currentCommand.cmd);
      let placeholder = matched[1] || "↩ 执行命令，↑↓ 切换历史";
      utools.setSubInput(({ text }) => {
        this.subInputValue = text;
      }, placeholder);
      let querySubInput = () => {
        let command = _.cloneDeep(currentCommand);
        command.cmd = currentCommand.cmd.replace(
          specialVars.subinput.match,
          this.subInputValue
        );
        this.history.push(this.subInputValue);
        this.historyIdx = this.history.length;
        utools.setSubInputValue("");
        this.fire(command);
      };
      // 自动粘贴的情况下自动执行
      setTimeout(() => {
        if (this.subInputValue) querySubInput();
      }, 100);
      this.listener = (event) => {
        event.preventDefault();
        switch (event.keyCode) {
          case 13:
            querySubInput();
            break;
          case 38:
            if (!this.history.length) break;
            this.historyIdx = Math.max(0, this.historyIdx - 1);
            utools.setSubInputValue(this.history[this.historyIdx] || "");
            break;
          case 40:
            if (this.historyIdx === this.history.length) break;
            this.historyIdx = Math.min(
              this.history.length - 1,
              this.historyIdx + 1
            );
            utools.setSubInputValue(this.history[this.historyIdx] || "");
          default:
            break;
        }
      };
      document.addEventListener("keydown", this.listener, true);
    },
    // payload 临时赋值
    async getTempPayload(currentCommand) {
      if (!this.needTempPayload) return;
      let type =
        currentCommand.cmdType || currentCommand.features?.cmds[0].type;
      quickcommand.enterData = {
        type: type || "text",
        payload: await commandTypes[type]?.tempPayload?.(),
      };
    },
    // 显示运行结果
    showRunResult(content, isSuccess, action) {
      this.isResultShow = true;
      this.frameInit();
      this.runResultStatus = isSuccess;
      let contlength = content?.length || 0;
      if (contlength > this.resultMaxLength)
        content =
          content.slice(0, this.resultMaxLength - 100) +
          `\n\n...\n${
            contlength - this.resultMaxLength - 100
          } 字省略\n...\n\n` +
          content.slice(contlength - 100);
      let pretreatment = action(content);
      pretreatment && (this.runResult += pretreatment);
      this.outputAutoHeight();
    },
    // 根据输出自动滚动及调整 utools 高度
    outputAutoHeight(autoScroll = true, autoHeight = true) {
      if (!this.fromUtools) return;
      this.$nextTick(() => {
        let clientHeight = document.body.clientHeight;
        let pluginHeight =
          clientHeight < this.maxHeight ? clientHeight : this.maxHeight;
        autoHeight && utools.setExpendHeight(pluginHeight);
        autoScroll &&
          window.scroll({
            top: clientHeight,
            left: 0,
            behavior: "smooth",
          });
      });
    },
    stopRun() {
      this.runResult = "";
      if (!!this.listener) {
        this.subInputValue = "";
        utools.removeSubInput();
        document.removeEventListener("keydown", this.listener, true);
      }
    },
    // 初始化时覆盖变量
    frameInit() {
      this.$nextTick(() => {
        let cfw = this.$refs?.iframe?.contentWindow;
        if (!cfw) return;
        let ctx = {
          quickcommand,
          utools,
          parent: undefined,
        };
        Object.assign(cfw, _.cloneDeep(ctx));
      });
    },
    // 加载时更改样式
    frameLoad() {
      let cfw = this.$refs?.iframe?.contentWindow;
      this.frameHeight = Math.min(
        cfw.document.body.scrollHeight,
        this.maxHeight
      );
      this.outputAutoHeight();
    },
  },
  unmounted() {
    this.stopRun();
  },
};
</script>

<style scoped>
.result {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;
  margin: 0;
}
iframe {
  width: 100%;
  display: block;
}
</style>
