<template>
  <CommandComposer
    ref="composer"
    @action="handleComposerAction"
    v-model="quickcommandInfo"
    :show-close-button="!isRunComposePage"
    class="fixed-full"
  />
  <!-- 运行结果 -->
  <CommandRunResult :action="action" ref="result"></CommandRunResult>
</template>

<script>
import CommandComposer from "components/composer/CommandComposer.vue";
import CommandRunResult from "components/CommandRunResult";
import { findCommandByValue } from "js/composer/composerConfig";
import programs from "js/options/programs.js";
import { ref } from "vue";

export default {
  components: { CommandComposer, CommandRunResult },
  setup(props) {
    const retoreToFullCommand = (command) => {
      const { flows } = command;
      if (!flows) return command;
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

    const commandAction = window.lodashM.cloneDeep(props.action);
    const savedCommand = commandAction.data || {};
    const defaultCommand = {
      program: "quickcomposer",
      features: {
        icon: programs.quickcommand.icon,
        explain: "",
        platform: ["win32", "linux", "darwin"],
        mainPush: false,
        cmds: [],
      },
      flows: [
        {
          id: "main",
          name: "main",
          label: "主流程",
          commands: [],
          customVariables: [],
        },
      ],
      output: "text",
      tags: [],
    };
    const quickcommandInfo = ref({
      ...defaultCommand,
      ...retoreToFullCommand(savedCommand),
    });

    const isRunComposePage = ref(props.action.type === "composer");

    return {
      quickcommandInfo,
      getLitedComposerCommand,
      isRunComposePage,
    };
  },
  emits: ["editorEvent"],
  props: {
    action: {
      type: Object,
      required: true,
    },
  },
  methods: {
    handleComposerAction(actionType, command) {
      switch (actionType) {
        case "run":
          return this.runCurrentCommand(command);
        case "close":
          return this.$emit("editorEvent", {
            type: "back",
          });
        case "save":
          return this.$emit("editorEvent", {
            type: "save",
            data: this.getLitedComposerCommand(command),
          });
      }
    },
    runCurrentCommand(command) {
      this.$refs.result.runCurrentCommand(command);
    },
  },
};
</script>
