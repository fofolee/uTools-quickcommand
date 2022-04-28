<template>
  <div>
    <div v-if="!fromUtools">
      <q-dialog v-model="isResultShow" position="bottom" @hide="stopRun">
        <q-card style="max-width: 700px; min-width: 700px; overflow: hidden">
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
          <q-card-section
            style="max-height: calc(100% - 50px); padding: 0"
            class="scroll"
          >
            <ResultArea
              v-if="isResultShow"
              @frameLoad="frameLoad"
              @expandTrees="outputAutoHeight(fromUtools)"
              :frameInitHeight="frameInitHeight"
              :enableHtml="enableHtml"
              :runResultStatus="runResultStatus"
              :runResult="runResult"
              :maxHeight="maxHeight"
              :key="timeStamp"
            />
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
    <div v-else>
      <ResultArea
        v-if="isResultShow"
        @frameLoad="frameLoad"
        @expandTrees="outputAutoHeight(fromUtools)"
        :frameInitHeight="frameInitHeight"
        :enableHtml="enableHtml"
        :runResultStatus="runResultStatus"
        :runResult="runResult"
        :maxHeight="maxHeight"
        :key="timeStamp"
      />
    </div>
  </div>
</template>


<script>
import outputTypes from "../js/options/outputTypes.js";
import specialVars from "../js/options/specialVars.js";
import commandTypes from "../js/options/commandTypes.js";
import ResultArea from "components/ResultArea.vue";

export default {
  components: { ResultArea },
  data() {
    return {
      isResultShow: false,
      runResult: [],
      runResultStatus: true,
      subInputValue: "",
      subInputListener: null,
      quickcommandListener: null,
      history: [],
      historyIdx: null,
      enableHtml: false,
      frameInitHeight: 0,
      childProcess: null,
      timeStamp: null,
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
      this.enableHtml = currentCommand.output === "html";
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
        window.runCodeInSandbox(
          currentCommand.cmd,
          (stdout, stderr) => {
            if (stderr) {
              return quitBeforeShowResult
                ? alert(stderr)
                : this.showRunResult(stderr, false, action);
            }
            outPlugin
              ? action(stdout.toString())
              : this.showRunResult(stdout, true);
          },
          { enterData: this.$root.enterData }
        );
      } else if (currentCommand.program === "html") {
        this.showRunResult(currentCommand.cmd, true, action);
      } else {
        let option =
          currentCommand.program === "custom"
            ? currentCommand.customOptions
            : this.$root.programs[currentCommand.program];
        option.scptarg = currentCommand.scptarg || "";
        option.charset = currentCommand.charset || {};
        this.childProcess = window.runCodeFile(
          currentCommand.cmd,
          option,
          currentCommand.output === "terminal",
          (stdout, stderr) => {
            if (stderr) {
              return quitBeforeShowResult
                ? alert(stderr)
                : this.showRunResult(stderr, false, action);
            }
            outPlugin
              ? action(stdout.toString())
              : this.showRunResult(stdout, true);
          }
        );
      }
    },
    // 特殊变量赋值
    assignSpecialVars(cmd) {
      let userData = this.$root.utools.userData.all();
      let spVars = _.filter(specialVars, (sp) => sp.repl);
      _.forIn(spVars, (val, key) => {
        let label = val.label.slice(0, -2);
        if (cmd.includes(label)) {
          let replData = label === "{{usr:" ? userData : this.$root.enterData;
          cmd = cmd.replace(val.match, (x) => val.repl(x, replData));
        }
      });
      return cmd;
    },
    // 子输入框
    setSubInput(currentCommand) {
      this.fromUtools && utools.setExpendHeight(0);
      let matched = specialVars.subinput.match.exec(currentCommand.cmd);
      let placeholder = matched[1]?.slice(1) || "↩ 执行命令，↑↓ 切换历史";
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
        this.clear();
        this.fire(command);
      };
      // 自动粘贴的情况下自动执行
      setTimeout(() => {
        if (this.subInputValue) querySubInput();
      }, 100);
      this.subInputListener = (event) => {
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
      document.addEventListener("keydown", this.subInputListener, true);
    },
    // payload 临时赋值
    async getTempPayload(currentCommand) {
      if (!this.needTempPayload) return;
      let type =
        currentCommand.cmdType || currentCommand.features?.cmds[0].type;
      this.$root.enterData = {
        type: type || "text",
        payload: await commandTypes[type]?.tempPayload?.(),
      };
    },
    // 显示运行结果
    showRunResult(content, isSuccess) {
      this.isResultShow = true;
      this.timeStamp = new Date().getTime();
      this.runResultStatus = isSuccess;
      if (!_.isArray(content)) content = [content];
      this.runResult = this.runResult.concat(content);
      this.outputAutoHeight(this.fromUtools);
    },
    // 根据输出自动滚动及调整 utools 高度
    outputAutoHeight(autoHeight = true, autoScroll = true) {
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
      this.runResult = [];
      if (!!this.subInputListener) {
        this.subInputValue = "";
        utools.removeSubInput();
        document.removeEventListener("keydown", this.subInputListener, true);
      }
      this.clear();
    },
    clear() {
      if (!!this.childProcess) {
        quickcommand.kill(this.childProcess.pid);
      }
      quickcommand.removeListener();
      quickcommand.closeWaitButton();
    },
    frameLoad(initHeight) {
      this.outputAutoHeight(this.fromUtools);
      this.frameInitHeight = initHeight;
    },
  },
  unmounted() {
    this.stopRun();
  },
};
</script>
