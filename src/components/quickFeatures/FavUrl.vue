<script>
export default {
  data() {
    return {
      cmdCtrlKey: window.processPlatform === "darwin" ? "command" : "control",
    };
  },
  async mounted() {
    utools.setExpendHeight(0);
    utools.hideMainWindow();
    // getCurrentBrowserUrl 似乎失效了
    // let url = utools.getCurrentBrowserUrl();
    utools.simulateKeyboardTap("l", this.cmdCtrlKey);
    await this.wait(50);
    utools.simulateKeyboardTap("c", this.cmdCtrlKey);
    await this.wait(50);
    let url = window.clipboardReadText();
    if (!/^http/.test(url)) {
      utools.showMainWindow();
      utools.setExpendHeight(550);
      let choise = await quickcommand.showButtonBox(
        ["http", "https"],
        "当前浏览器网址显示不完整，请问访问的页面是哪一种？"
      );
      url = choise.text + "://" + url;
    }
    let title = this.$root.payload.title
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
    let uid = this.getUid();
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
      tags: [this.$root.profile.quickFeatures.favUrl.tag],
    };
    try {
      let res = await quickcommand.downloadFile(iconUrl, iconPath);
      if (res) command.features.icon = iconPath;
    } catch (e) {}
    this.importCommand(command);
    utools.showNotification("操作成功！");
    utools.outPlugin();
  },
  methods: {
    wait(ms) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, ms);
      });
    },
    getUid() {
      return this.$parent.getUid();
    },
    importCommand(command) {
      this.$parent.importCommand(command);
    },
  },
};
</script>
