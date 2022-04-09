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

export default {
  data() {
    return {
      isResultShow: false,
      runResult: "",
      runResultStatus: true,
    };
  },
  props: {
    action: Object,
  },
  mounted() {
    window.runResult = this;
  },
  computed: {
    fromUtools() {
      return this.action.type !== "inPlugin";
    },
  },
  methods: {
    // 运行命令
    async runCurrentCommand(currentCommand) {
      currentCommand.cmd = this.assignSpecialVars(currentCommand.cmd);
      // currentCommand.cmd = await this.replaceTempInputVars(currentCommand.cmd);
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
        if (cmd.includes(val.label.slice(0, 12))) {
          cmd = cmd.replace(val.match, (x) => val.repl(x));
        }
      });
      return cmd;
    },
    // 替换特殊变量
    async replaceTempInputVars(cmd) {
      let tempInputVals = [];
      let needInputVal = [
        "input",
        "subinput",
        "pwd",
        // "SelectFile",
        "WindowInfo",
        "MatchedFiles",
      ];
      needInputVal.forEach((x) => {
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
    showRunResult(content, isSuccess, action) {
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
  },
};
</script>
