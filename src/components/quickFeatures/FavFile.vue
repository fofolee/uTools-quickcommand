<script>
export default {
  mounted() {
    utools.setExpendHeight(0);
    this.$root.payload.forEach((file) => {
      let uid = this.getUid();
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
        },
        program: "quickcommand",
        cmd: `open(\"${file.path.replace(/\\/g, "\\\\")}\")`,
        output: "ignore",
        tags: [this.$root.profile.quickFileTag],
      };
      this.importCommand(command);
    });
    utools.showNotification("操作成功！");
    utools.outPlugin();
  },
  methods: {
    getUid() {
      return this.$parent.getUid();
    },
    importCommand(command) {
      this.$parent.importCommand(command);
    },
  },
};
</script>
