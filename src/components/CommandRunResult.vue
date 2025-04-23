<template>
  <div>
    <q-dialog
      v-model="isResultShow"
      :position="fromUtools ? 'top' : 'bottom'"
      @hide="stopRun"
      :maximized="fromUtools"
      :transition-duration="fromUtools ? 0 : 200"
    >
      <q-card
        :style="{
          maxWidth: fromUtools ? '100%' : '700px',
          width: fromUtools ? '100%' : '700px',
          overflow: 'hidden',
        }"
        class="command-run-result"
      >
        <div
          v-if="!(enableHtml && fromUtools)"
          :style="{
            height: headerHeight + 'px',
          }"
          class="flex items-center justify-between"
        >
          <div>
            <q-avatar :size="`${headerHeight}`">
              <q-icon
                :class="runResultStatus ? 'text-green' : 'text-red'"
                :name="runResultStatus ? 'task_alt' : 'error'"
                size="sm"
              ></q-icon>
            </q-avatar>
            <span class="text-weight-bold text-h7">运行结果</span>
          </div>
          <ResultMenu
            class="no-shadow q-pa-sm"
            :stretch="true"
            :runResult="runResult"
            :closebtn="!fromUtools"
            :textbtn="!enableHtml"
            :imagebtn="!enableHtml && isDataUrl"
            @showImg="showBase64Img"
            @updateResult="runResult = $event"
            :style="{
              height: headerHeight + 'px',
            }"
          />
        </div>
        <div
          :style="{ maxHeight: maxHeight - headerHeight + 'px' }"
          class="scroll"
        >
          <ResultArea
            v-if="isResultShow"
            @frameLoad="frameLoad"
            :frameInitHeight="frameInitHeight"
            :enableHtml="enableHtml"
            :runResultStatus="runResultStatus"
            :runResult="runResult"
            :key="timeStamp"
            @mouseup="selectHandler"
          />
          <q-resize-observer @resize="autoHeight" debounce="0" />
        </div>
        <q-menu v-if="selectText" touch-position @before-hide="clearSelect">
          <ResultMenu :dense="true" :selectText="selectText" :textbtn="true" />
        </q-menu>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import outputTypes from "js/options/outputTypes.js";
import specialVars from "js/options/specialVars.js";
import commandTypes from "js/options/commandTypes.js";
import ResultArea from "components/ResultArea.vue";
import ResultMenu from "components/popup/ResultMenu.vue";
import { generateFlowsCode } from "js/composer/generateCode";
import { dbManager } from "js/utools.js";
import programs from "js/options/programs.js";

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
  computed: {
    fromUtools() {
      return this.$route.name === "command";
    },
    needTempPayload() {
      return !["command", "code", "composer"].includes(this.$route.name);
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
      let command = window.lodashM.cloneDeep(currentCommand);
      if (!command.output) command.output = "text";
      // 如果是composer命令，则动态生成cmd
      if (command.program === "quickcomposer") {
        command.cmd = generateFlowsCode(command.flows);
      }
      this.needTempPayload && (await this.getTempPayload(command));
      // 如果命令包含子输入框，则设置子输入框
      if (command.cmd.includes("{{subinput")) return this.setSubInput(command);
      this.fire(command);
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
        case "quickcomposer":
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
            currentCommand.output === "terminal" ? {} : false,
            (stdout, stderr) => this.handleResult(stdout, stderr, resultOpts)
          );
          this.listenStopSign();
          break;
      }
    },
    getCommandOpt(command) {
      let option =
        command.program === "custom"
          ? command.customOptions || {}
          : programs[command.program] || {};
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
    escapeItem(item) {
      // 无论什么类型，先转为String
      if (typeof item === "object") {
        try {
          item = JSON.stringify(item);
        } catch (_) {
          item = item.toString();
        }
      } else {
        item = item.toString();
      }
      // 通过JSON.stringify，将所有特殊字符转义，输出为一个带双引号的字符串
      item = JSON.stringify(item)
        // 去掉两边双引号
        .slice(1, -1)
        // 单独转义单引号、反引号
        .replace(/`|'/g, "\\$&")
        // 转义双括号
        .replace(/\{\{/g, "\\{\\{");
      // .replace("$", '$$$')
      return item;
    },
    // 特殊变量赋值
    assignSpecialVars(cmd) {
      let userData = dbManager.userData.all();
      let spVars = window.lodashM.filter(specialVars, (sp) => sp.repl);
      window.lodashM.forIn(spVars, (val, key) => {
        let label = val.label.slice(0, -2);
        if (cmd.includes(label)) {
          let replData = label === "{{usr:" ? userData : this.$root.enterData;
          cmd = cmd.replace(val.match, (x) =>
            this.escapeItem(val.repl(x, replData))
          );
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
        let command = window.lodashM.cloneDeep(currentCommand);
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
      const firstCmd = currentCommand.features?.cmds?.[0];
      if (!firstCmd) return;
      const type = firstCmd.type || "text";
      const getPayload = async () => {
        if (type === "text") return firstCmd;
        const cmdType = commandTypes[type];
        if (!cmdType.tempPayload) return {};
        return await cmdType.tempPayload();
      };
      this.$root.enterData = {
        type,
        payload: await getPayload(),
      };
    },
    handleResult(stdout, stderr, options) {
      if (stderr) {
        return options.earlyExit
          ? alert(stderr)
          : this.showRunResult(stderr, false);
      }
      !options.action(stdout?.toString()) || this.showRunResult(stdout, true);
    },
    // 显示运行结果
    async showRunResult(content, isSuccess) {
      if (content.__clearQuickcommandRunResult) {
        this.runResult = [];
      } else {
        content = await this.handleContent(content);
        this.runResult = this.runResult.concat(content);
      }
      this.runResultStatus = isSuccess;
      // 刷新组件
      this.isResultShow
        ? (this.timeStamp = new Date().getTime())
        : (this.isResultShow = true);
      this.autoScroll();
    },
    async handleContent(content) {
      if (!window.lodashM.isArray(content)) content = [content];
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

<style scoped>
.command-run-result {
  background-color: var(--utools-bg-color);
}
</style>
