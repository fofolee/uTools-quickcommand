<script>
export default {
  data() {
    return {
      featureType: this.$route.params.featuretype,
    };
  },
  mounted() {
    switch (this.featureType) {
      case "pluNickName":
        this.showNickNameSetting();
        break;
      case "favFile":
        this.addFavFile();
        break;
      case "favUrl":
        this.addFavUrl();
        break;
      default:
        break;
    }
  },
  methods: {
    wait(ms) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, ms);
      });
    },
    showNickNameSetting() {
      quickcommand
        .showInputBox(["插件的功能关键字", "要设置的别名"], "插件别名设置")
        .then((res) => {});
    },
    addFavFile() {
      utools.setExpendHeight(0);
      quickcommand.enterData.payload.forEach((file) => {
        let uid = Number(
          Math.random().toString().substr(3, 3) + Date.now()
        ).toString(36);
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
          tags: [this.$profile.quickFeatures.favFile.tag],
        };
        this.importCommand(command);
      });
      utools.showNotification("收藏成功！");
      utools.outPlugin();
    },
    async addFavUrl() {
      utools.setExpendHeight(0);
      utools.hideMainWindow();
      // getCurrentBrowserUrl 似乎失效了
      // let url = utools.getCurrentBrowserUrl();
      utools.simulateKeyboardTap("l", "control");
      await this.wait(50);
      utools.simulateKeyboardTap("c", "control");
      await this.wait(50);
      let url = window.clipboardReadText();
      if (!/^http/.test(url)) {
        utools.setExpendHeight(550);
        let choise = await quickcommand.showButtonBox(
          ["http", "https"],
          "当前浏览器网址显示不完整，请问访问的页面是哪一种？"
        );
        url = choise.text + "://" + url;
      }
      let title = quickcommand.enterData.payload.title
        .replace(/和另外 \d+ 个页面.*/, "")
        .replace(/[-|—] .*?[Edge|Firefox|Chrome].*/, "")
        .trim();
      // let req = await axios(url)
      // let title = quickcommand.htmlParse(req.data).querySelector('title').innerText
      let base = /(http(s){0,1}:\/\/.*?(:\d+){0,1})(\/|$).*/.exec(url)[1];
      let iconUrl = base + "/favicon.ico";
      let iconPath = window.joinPath(
        utools.getPath("temp"),
        "quickcommandfavicon.ico"
      );
      let uid = Number(
        Math.random().toString().substr(3, 3) + Date.now()
      ).toString(36);
      let command = {
        features: {
          explain: `访问${title}`,
          cmds: [title],
          platform: ["linux", "win32", "darwin"],
          code: `key_${uid}`,
        },
        program: "quickcommand",
        cmd: `visit(\"${url}\")\n`,
        output: "ignore",
        tags: [this.$profile.quickFeatures.favUrl.tag],
      };
      try {
        let res = await quickcommand.downloadFile(iconUrl, iconPath);
        if (res) command.features.icon = iconPath;
      } catch (e) {}
      this.importCommand(command);
      utools.showNotification("收藏成功！");
      utools.outPlugin();
    },
    importCommand(command) {
      command = _.cloneDeep(command);
      this.$utools.putDB(
        command,
        this.$utools.DBPRE.QC + command.features.code
      );
      this.$utools.whole.setFeature(command.features);
    },
  },
};
</script>
