<template>
  <div></div>
</template>

<script>
import { getUniqueId } from "js/common/uuid.js";
import { useCommandManager } from "js/commandManager";

export default {
  async mounted() {
    const commandManager = useCommandManager();
    utools.setExpendHeight(0);
    utools.hideMainWindow();
    let url = utools.getCurrentBrowserUrl();
    if (!/^http/.test(url)) {
      const choise = await quickcommand.showSystemButtonBox(
        ["http", "https"],
        "当前浏览器网址显示不完整，请问访问的页面是哪一种？"
      );
      url = choise.text + "://" + url;
    }
    const title = this.$root.enterData.payload.title
      .replace(/和另外 \d+ 个页面.*/, "")
      .replace(/[-|—] .*?[Edge|Firefox|Chrome].*/, "")
      .trim();
    // let req = await axios(url)
    // let title = quickcommand.htmlParse(req.data).querySelector('title').innerText
    const base = /(http(s){0,1}:\/\/.*?(:\d+){0,1})(\/|$).*/.exec(url)[1];
    const iconUrl = base + "/favicon.ico";
    const iconPath = window.joinPath(
      utools.getPath("temp"),
      "quickcommandfavicon.ico"
    );
    const uid = getUniqueId({
      short: true,
    });
    const command = {
      features: {
        explain: title,
        cmds: [title],
        platform: ["linux", "win32", "darwin"],
        code: `key_${uid}`,
        mainHide: true,
        icon: "features/fav.png",
      },
      program: "quickcommand",
      cmd: `utools.shellOpenExternal(\"${url}\")\n`,
      output: "ignore",
      tags: [this.$root.profile.quickUrlTag],
    };
    try {
      const res = await quickcommand.downloadFile(iconUrl, iconPath);
      if (res) command.features.icon = window.resolveFileToBase64(iconPath);
    } catch (_) {}
    commandManager.importCommand(JSON.stringify(command));
    utools.showNotification("操作成功！");
    utools.outPlugin();
  },
};
</script>
