<template>
  <div>
    <div v-if="!fromUtools">
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
            <div
              style="white-space: pre"
              :class="runResultStatus ? '' : 'text-red'"
              v-html="runResult"
            ></div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              flat
              label="关闭"
              color="primary"
              v-close-popup
              @click="stopRun"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
    <div v-else>
      <div
        v-show="!!runResult"
        :class="{
          'text-red': !runResultStatus,
          'q-pa-md': 1,
        }"
        style="white-space: pre"
        v-html="runResult"
      ></div>
    </div>
  </div>
</template>


<script>
import outputTypes from "../js/options/outputTypes.js";
import specialVars from "../js/options/specialVars.js";
import commandTypes from "../js/options/commandTypes.js";

export default {
  data() {
    return {
      isResultShow: false,
      runResult: "",
      runResultStatus: true,
      subInputValue: "",
    };
  },
  props: {
    /**
     * run：    「RunCode界面」 无侧栏，运行结果弹窗显示，保存命令历史
     * edit：   「编辑命令界面』 有侧栏，运行结果弹窗显示
     * new：    『新建命令界面」 有侧栏，运行结果弹窗显示
     * config： 「配置界面』    运行结果弹窗显示，需要对payload临时赋值
     * input：  『主输入框进入」 运行结果直接展示，动态调整窗体高度
     */
    action: Object,
  },
  mounted() {
    window.runResult = this;
  },
  computed: {
    fromUtools() {
      return this.action.type === "input";
    },
    needTempPayload() {
      return this.action.type === "config";
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
      let { hideWindow, outPlugin, action } =
        outputTypes[currentCommand.output];
      // 需要隐藏的提前隐藏窗口
      hideWindow && utools.hideMainWindow();
      // 对于本身就没有输出的命令，无法确认命令是否执行完成，所以干脆提前退出插件
      // 弊端就是如果勾选了隐藏后台就完全退出的话，会造成命令直接中断
      this.fromUtools &&
        outPlugin &&
        setTimeout(() => {
          utools.outPlugin();
        }, 500);
      if (currentCommand.program === "quickcommand") {
        window.runCodeInVm(currentCommand.cmd, (stdout, stderr) => {
          if (stderr) return this.showRunResult(stderr, false, action);
          this.showRunResult(stdout, true, action);
        });
      } else {
        let option = this.$programmings[currentCommand.program];
        if (currentCommand.program === "custom")
          option = currentCommand.customOptions;
        option.scptarg = currentCommand.scptarg;
        option.charset = currentCommand.charset;
        window.runCodeFile(
          currentCommand.cmd,
          option,
          currentCommand.output === "terminal",
          (stdout, stderr) => {
            if (stderr) return this.showRunResult(stderr, false, action);
            this.showRunResult(stdout, true, action);
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
      let matched = currentCommand.cmd.match(specialVars.subinput.match);
      let placeholder = matched[1] || "请输入";
      utools.setSubInput(({ text }) => {
        this.subInputValue = text;
      }, placeholder);
      let querySubInput = () => {
        let command = _.cloneDeep(currentCommand);
        command.cmd = currentCommand.cmd.replace(
          specialVars.subinput.match,
          this.subInputValue
        );
        this.fire(command);
      };
      // 自动粘贴的情况下自动执行
      setTimeout(() => {
        if (this.subInputValue) querySubInput();
      }, 100);
      this.$profile.tmp.handleEnter = (event) => {
        if (event.keyCode == 13) querySubInput();
      };
      document.addEventListener("keydown", this.$profile.tmp.handleEnter);
    },
    // payload 临时赋值
    async getTempPayload(currentCommand) {
      if (!this.needTempPayload) return;
      let cmd = currentCommand.features.cmds[0];
      let type = cmd.type;
      quickcommand.enterData = {
        type: cmd.type || "text",
        payload: (await commandTypes[type]?.tempPayload?.()) || cmd,
      };
    },
    // 显示运行结果
    showRunResult(content, isSuccess, action) {
      this.isResultShow = true;
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
      this.fromUtools &&
        this.$nextTick(() => {
          this.outputAutoHeight();
        });
    },
    // 根据输出自动滚动及调整 utools 高度
    outputAutoHeight(autoScroll = true, autoHeight = true) {
      let clientHeight = document.body.clientHeight;
      let pluginHeight = clientHeight < 600 ? clientHeight : 600;
      autoHeight && utools.setExpendHeight(pluginHeight);
      autoScroll &&
        window.scroll({
          top: clientHeight,
          left: 0,
          behavior: "smooth",
        });
    },
    stopRun() {
      if (this.$profile.tmp.handleEnter) {
        this.subInputValue = "";
        document.removeEventListener("keydown", this.$profile.tmp.handleEnter);
        utools.removeSubInput();
      }
    },
  },
};
</script>
