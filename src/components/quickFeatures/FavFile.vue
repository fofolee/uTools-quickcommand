<template>
  <div></div>
</template>

<script>
import { useCommandManager } from "js/commandManager";
import { getUniqueId } from "js/common/uuid.js";

export default {
  mounted() {
    const commandManager = useCommandManager();
    utools.setExpendHeight(0);
    this.$root.enterData.payload.forEach((file) => {
      let uid = getUniqueId({
        short: true,
      });
      let fileInfo = window.getFileInfo({
        type: "file",
        argvs: file.path,
        readfile: false,
      });
      let fileName = fileInfo.name.replace(fileInfo.ext, "");
      let command = {
        features: {
          cmds: [fileName],
          explain: `打开${fileName}`,
          icon: utools.getFileIcon(file.path),
          platform: [window.processPlatform],
          code: `key_${uid}`,
          mainHide: true,
        },
        program: "quickcommand",
        cmd: `utools.shellOpenPath(\"${file.path.replace(/\\/g, "\\\\")}\")`,
        output: "ignore",
        tags: [this.$root.profile.quickFileTag],
      };
      this.commandManager.importCommand(JSON.stringify(command));
    });
    utools.showNotification("操作成功！");
    utools.outPlugin();
  },
};
</script>
