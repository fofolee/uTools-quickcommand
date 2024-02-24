<template>
  <div>
    <q-dialog v-model="isResultShow" :position="fromUtools ? 'top' : 'bottom'" @hide="stopRun" :maximized="fromUtools"
      :transition-duration="fromUtools ? 0 : 200">
      <q-card :style="{
        maxWidth: fromUtools ? '100%' : '700px',
        width: fromUtools ? '100%' : '700px',
        overflow: 'hidden',
      }">
        <div v-if="!(enableHtml && fromUtools)" :style="{
          height: headerHeight + 'px',
        }" class="flex items-center justify-between">
          <div>
            <q-avatar :size="`${headerHeight}`">
              <q-icon :class="runResultStatus ? 'text-green' : 'text-red'"
                :name="runResultStatus ? 'task_alt' : 'error'"></q-icon>
            </q-avatar>
            <span class="text-weight-bold text-h6">运行结果</span>
          </div>
          <ResultMenu class="no-shadow" :stretch="true" :content="runResult.join('')" :closebtn="!fromUtools"
            :textbtn="!enableHtml" :imagebtn="!enableHtml && isDataUrl" @showImg="showBase64Img" :style="{
              height: headerHeight + 'px',
            }" />
        </div>
        <div :style="{ maxHeight: maxHeight - headerHeight + 'px' }" class="scroll">
          <ResultArea v-if="isResultShow" @frameLoad="frameLoad" :frameInitHeight="frameInitHeight"
            :enableHtml="enableHtml" :runResultStatus="runResultStatus" :runResult="runResult" :key="timeStamp"
            @mouseup="selectHandler" />
          <q-resize-observer @resize="autoHeight" debounce="0" />
        </div>
        <q-menu v-if="selectText" touch-position @before-hide="clearSelect">
          <ResultMenu :dense="true" :content="selectText" :textbtn="true" />
        </q-menu>
      </q-card>
    </q-dialog>
  </div>
</template>


<script>
import outputTypes from "../js/options/outputTypes.js";
import specialVars from "../js/options/specialVars.js";
import commandTypes from "../js/options/commandTypes.js";
import ResultArea from "components/ResultArea.vue";
import ResultMenu from "components/popup/ResultMenu.vue";

export default {
  components: { ResultArea, ResultMenu },
  data() {
    return {
      isResultShow: false,
      selectText: null,
      runResult: [],
      runResultStatus: true,
      subInputValue: "",
      ctrlCListener: null,
      quickcommandListener: null,
      history: [],
      historyIdx: null,
      enableHtml: false,
      frameInitHeight: 0,
      childProcess: null,
      timeStamp: null,
      urlReg:
        /^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/,
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
      return this.fromUtools ? 600 : 400;
    },
    headerHeight() {
      return this.enableHtml && this.fromUtools ? 0 : 40;
    },
    isDataUrl() {
      return this.runResult.join("").includes("data:image/");
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
      let { outPlugin, action } = outputTypes[currentCommand.output];
      let earlyExit = this.fromUtools && outPlugin;
      // 对于本身就没有输出的命令，无法确认命令是否执行完成，所以干脆提前退出插件
      // 弊端就是如果勾选了隐藏后台就完全退出的话，会造成命令直接中断
      if (outPlugin) {
        utools.hideMainWindow();
        !earlyExit || setTimeout(utools.outPlugin, 500);
      }
      let resultOpts = { outPlugin, action, earlyExit };
      switch (currentCommand.program) {
        case "quickcommand":
          window.runCodeInSandbox(
            currentCommand.cmd,
            (stdout, stderr) => this.handleResult(stdout, stderr, resultOpts),
            { enterData: this.$root.enterData }
          );
          break;
        case "html":
          this.showRunResult(currentCommand.cmd, true);
          break;
        default:
          this.childProcess = window.runCodeFile(
            currentCommand.cmd,
            this.getCommandOpt(currentCommand),
            currentCommand.output === "terminal",
            (stdout, stderr) => this.handleResult(stdout, stderr, resultOpts)
          );
          this.listenStopSign();
          break;
      }
    },
    getCommandOpt(command) {
      let option =
        command.program === "custom"
          ? command.customOptions
          : this.$root.programs[command.program];
      option.scptarg = command.scptarg || "";
      option.charset = command.charset || {};
      option.envPath = this.$root.nativeProfile.envPath.trim() || "";
      option.alias = this.$root.nativeProfile.alias.trim() || "";
      return option;
    },
    listenStopSign() {
      // ctrl c 终止
      this.ctrlCListener = (e) => {
        if (e.key === "c" && e.ctrlKey) {
          quickcommand.kill(this.childProcess.pid);
          quickcommand.showMessageBox("命令已终止");
          document.removeEventListener("keydown", this.ctrlCListener);
        }
      };
      document.addEventListener("keydown", this.ctrlCListener);
    },
    // 转义特殊变量里的特殊字符和换行符
    escapeChars(string) {
      return string
        // 转义特殊字符
        .replace(/`|'|"|\\/g, "\\$&")
        // 转义换行字符
        .replace(/\r\n/g, "\\r\\n")
        .replace(/\n/g, "\\n")
    },
    // 特殊变量赋值
    assignSpecialVars(cmd) {
      let userData = this.$root.utools.userData.all();
      let spVars = _.filter(specialVars, (sp) => sp.repl);
      _.forIn(spVars, (val, key) => {
        let label = val.label.slice(0, -2);
        if (cmd.includes(label)) {
          let replData = label === "{{usr:" ? userData : this.$root.enterData;
          cmd = cmd.replace(val.match, (x) => this.escapeChars(val.repl(x, replData)));
        }
      });
      return cmd;
    },
    // 子输入框
    setSubInput(currentCommand) {
      this.fromUtools && utools.setExpendHeight(0);
      let matched = specialVars.subinput.match.exec(currentCommand.cmd);
      let placeholder = matched?.[1]?.slice(1) || "↩ 执行命令，↑↓ 切换历史";
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
      let listener = (event) => {
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
      this.$root.subInputEvent = ["keydown", listener, true];
      document.addEventListener(...this.$root.subInputEvent);
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
    handleResult(stdout, stderr, options) {
      if (stderr) {
        return options.earlyExit
          ? alert(stderr)
          : this.showRunResult(stderr, false);
      }
      !options.action(stdout.toString()) || this.showRunResult(stdout, true);
    },
    // 显示运行结果
    async showRunResult(content, isSuccess) {
      content = await this.handleContent(content);
      this.runResultStatus = isSuccess;
      this.runResult = this.runResult.concat(content);
      // 刷新组件
      this.isResultShow
        ? (this.timeStamp = new Date().getTime())
        : (this.isResultShow = true);
      this.autoScroll();
    },
    async handleContent(content) {
      if (!_.isArray(content)) content = [content];
      if (this.enableHtml) content = await this.cacheScript(content);
      return content;
    },
    // 根据输出自动滚动及调整 utools 高度
    autoHeight(e) {
      if (!this.fromUtools) return;
      let pluginHeight =
        e.height + this.headerHeight < this.maxHeight
          ? e.height + this.headerHeight
          : this.maxHeight;
      utools.setExpendHeight(pluginHeight);
    },
    autoScroll() {
      if (this.enableHtml) return;
      this.$nextTick(() => {
        let results = document.querySelectorAll(".result");
        if (!results.length) return;
        results[results.length - 1].scrollIntoView({
          block: "end",
          behavior: "smooth",
        });
      });
    },
    stopRun() {
      this.runResult = [];
      utools.removeSubInput();
      if (!!this.$root.subInputEvent) {
        this.subInputValue = "";
        document.removeEventListener(...this.$root.subInputEvent);
      }
      this.clear();
      this.frameInitHeight = 0;
    },
    clear() {
      !!this.ctrlCListener &&
        document.removeEventListener("keydown", this.ctrlCListener);
      quickcommand.removeListener();
      quickcommand.closeWaitButton();
    },
    frameLoad(initHeight) {
      this.frameInitHeight = initHeight;
    },
    // 预先下载远程脚本
    async cacheScript(content) {
      let html = quickcommand.htmlParse(content.join(""));
      let scriptDoms = html.querySelectorAll("script");
      for (let i = 0; i < scriptDoms.length; i++) {
        let src = scriptDoms[i].src;
        if (!this.urlReg.test(src)) continue;
        let dest = window.getQuickcommandTempFile("js", "remoteScript_" + i);
        await quickcommand.downloadFile(src, dest);
        scriptDoms[i].src = "file://" + dest;
      }
      return [html.documentElement.innerHTML];
    },
    selectHandler() {
      this.selectText = window.getSelection().toString().trim();
    },
    clearSelect() {
      window.getSelection().removeAllRanges();
      this.selectText = null;
    },
    showBase64Img(imgs) {
      this.runResult = [];
      this.enableHtml = true;
      this.showRunResult(imgs, true);
    },
  },
  unmounted() {
    this.stopRun();
  },
};
</script>
