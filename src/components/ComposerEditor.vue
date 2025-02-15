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

export default {
  components: { CommandComposer, CommandRunResult },
  setup() {
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
