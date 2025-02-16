<template>
  <div>
    <ComposerEditor />
  </div>
</template>

<script>
import ComposerEditor from "components/ComposerEditor";
import { dbManager } from "js/utools.js";
import { useCommandManager } from "js/commandManager.js";

export default {
  components: { ComposerEditor },
  setup() {
    const commandManager = useCommandManager();
    const savedCommand = dbManager.getDB("cfg_composerHistory");
    const defaultCommand = commandManager.getDefaultCommand("quickcomposer");
    commandManager.state.currentCommand = {
      ...defaultCommand,
      ...savedCommand,
      program: "quickcomposer",
      output: "text",
    };
  },
};
</script>
