<template>
  <CommandComposer
    ref="composer"
    @action="handleComposerAction"
    v-model="commandManager.state.currentCommand"
    :disabled-control-buttons="disabledControlButtons"
    class="fixed-full"
  />
  <!-- 运行结果 -->
  <CommandRunResult ref="result"></CommandRunResult>
</template>

<script>
import CommandComposer from "components/composer/CommandComposer.vue";
import CommandRunResult from "components/CommandRunResult";
import { useCommandManager } from "js/commandManager.js";
import { dbManager } from "js/utools";

export default {
  components: { CommandComposer, CommandRunResult },
  setup() {
    const hasRunComposer = dbManager.getStorage("st_hasRunComposer");

    if (!hasRunComposer) {
      quickcommand.showConfirmBox(
        `<div>👏🏻 欢迎使用可视化编排，由于编排功能众多，推荐先查看教程再使用</div>
        <div>查看教程<a href="javascript:void(0)" onclick="utools.ubrowser.goto('https://www.yuque.com/fofolee/qcdocs3/bg31vl#TMtYg').run({width: 1280, height: 720})">戳我</a></div>
        <div>或者看一个<a href="javascript:void(0)" onclick="utools.ubrowser.goto('https://www.yuque.com/fofolee/qcdocs3/bg31vl#JqM2f').run({width: 1280, height: 720})">浏览器控制典型案例</a>快速入门</div>
        <div>你随时可以点击右上角的<span style="font-weight: bolder;">帮助</span>按钮（图标为问号），再次查看教程</div>`,
        "帮助",
        true,
        600
      );
      dbManager.setStorage("st_hasRunComposer", true);
    }

    const commandManager = useCommandManager();

    const defaultCommand = commandManager.getDefaultCommand("quickcomposer");

    commandManager.state.currentCommand = {
      ...defaultCommand,
      ...commandManager.getFullComposerCommand(
        commandManager.state.currentCommand
      ),
    };

    return {
      commandManager,
    };
  },
  emits: ["editorEvent"],
  computed: {
    isRunComposerPage() {
      return this.$route.name === "composer";
    },
    disabledControlButtons() {
      return this.isRunComposerPage ? ["close", "save", "apply"] : ["apply"];
    },
  },
  methods: {
    handleComposerAction(actionType, command) {
      switch (actionType) {
        case "run":
          return this.runCurrentCommand(command);
        case "close":
          return this.$emit("editorEvent", "back");
        case "save":
          return this.$emit(
            "editorEvent",
            "save",
            this.commandManager.getLitedComposerCommand(command)
          );
      }
    },
    runCurrentCommand(command) {
      this.$refs.result.runCurrentCommand(command);
    },
  },
};
</script>
