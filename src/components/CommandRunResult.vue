<template>
  <div>
    <div v-if="action.type === 'inPlugin'">
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
      <q-card>
        {{ action.data }}
      </q-card>
    </div>
  </div>
</template>


<script>
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
  methods: {
    // 运行命令
    async runCurrentCommand(currentCommand) {
      currentCommand.cmd = window.special(currentCommand.cmd);
      currentCommand.cmd = await this.replaceTempInputVals(currentCommand.cmd);
      let terminal = false;
      let raw = true;
      switch (currentCommand.output) {
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
      if (currentCommand.program === "quickcommand") {
        window.runCodeInVm(currentCommand.cmd, (stdout, stderr) => {
          if (stderr) return this.showRunResult(stderr, raw, false);
          this.showRunResult(stdout, raw, true);
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
          terminal,
          (stdout, stderr) => {
            if (terminal) return;
            if (stderr) return this.showRunResult(stderr, raw, false);
            this.showRunResult(stdout, raw, true);
          }
        );
      }
    },
    // 替换特殊变量
    async replaceTempInputVals(cmd) {
      let tempInputVals = [];
      let needInputVal = [
        "input",
        "subinput",
        "pwd",
        "SelectFile",
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
