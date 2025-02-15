<template>
  <CommandEditor />
</template>

<script>
import CommandEditor from "components/CommandEditor";
import { dbManager } from "js/utools.js";
import { useCommandManager } from "js/commandManager.js";

export default {
  components: { CommandEditor },
  setup() {
    const commandManager = useCommandManager();
    const savedCommand = dbManager.getDB("cfg_codeHistory");
    const defaultCommand = commandManager.getDefaultCommand("quickcommand");
    commandManager.state.currentCommand = {
      ...defaultCommand,
      ...savedCommand,
    };
  },
};
</script>
