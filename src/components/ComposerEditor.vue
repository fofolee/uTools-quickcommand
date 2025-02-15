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
import { findCommandByValue } from "js/composer/composerConfig";
import { useCommandManager } from "js/commandManager.js";

export default {
  components: { CommandComposer, CommandRunResult },
  setup() {
    const commandManager = useCommandManager();

    const retoreToFullCommand = (command) => {
      const newCommand = window.lodashM.cloneDeep(command);
      const { flows } = newCommand;
      if (!flows) return newCommand;
      const newFlows = flows.map((flow) => ({
        ...flow,
        commands: flow.commands.map((cmd) => {
          // 恢复所有属性
          const command = findCommandByValue(cmd.value);
          return {
            ...command,
            ...cmd,
          };
        }),
      }));
      return {
        ...command,
        flows: newFlows,
      };
    };

    const getLitedComposerCommand = (command) => {
      const { flows } = command;
      if (!flows) return command;
      const newFlows = flows.map((flow) => ({
        ...flow,
        commands: flow.commands.map((cmd) => {
          const cmdCopy = { ...cmd };
          // 移除不必要保存的属性
          const uselessProps = [
            "config",
            "label",
            "component",
            "subCommands",
            "outputs",
            "options",
            "icon",
            "width",
            "placeholder",
            "summary",
            "type",
          ];
          uselessProps.forEach((prop) => delete cmdCopy[prop]);
          return cmdCopy;
        }),
      }));
      return {
        ...command,
        flows: newFlows,
      };
    };

    const defaultCommand = commandManager.getDefaultCommand("quickcomposer");

    commandManager.state.currentCommand = {
      ...defaultCommand,
      ...retoreToFullCommand(commandManager.state.currentCommand),
    };

    return {
      commandManager,
      getLitedComposerCommand,
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
            this.getLitedComposerCommand(command)
          );
      }
    },
    runCurrentCommand(command) {
      this.$refs.result.runCurrentCommand(command);
    },
  },
};
</script>
