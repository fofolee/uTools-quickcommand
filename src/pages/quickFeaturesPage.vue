<template>
  <div
    class="flex justify-center content-center"
    style="height: 500px"
    v-show="showPluNickNameSetting"
  >
    <div class="q-gutter-lg q-pa-lg" style="width: 600px">
      <div class="text-center text-h2 q-ma-none">插件别名设置</div>
      <q-select
        outlined
        v-model="plugin"
        :options="plugins"
        type="text"
        class="full-width"
        :display-value="plugin.pluginName"
        @update:model-value="feature = features[0]"
        label="请选择插件"
      >
        <template v-slot:prepend>
          <q-icon name="extension" />
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-img :src="`file:///${scope.opt.logoPath}`" />
            </q-item-section>
            <q-item-section>
              <q-item-label v-html="scope.opt.pluginName" />
              <q-item-label caption>{{ scope.opt.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-select
        outlined
        v-model="feature"
        :options="features"
        type="text"
        :display-value="feature.cmd || ''"
        class="full-width"
        label="请选择功能关键字"
      >
        <template v-slot:prepend>
          <q-icon name="font_download" />
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-img :src="`file:///${plugin.logoPath}`" />
            </q-item-section>
            <q-item-section>
              <q-item-label v-html="scope.opt.cmd" />
              <q-item-label caption>{{ scope.opt.explain }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-select
        class="full-width"
        max-values="3"
        type="text"
        placeholder="键入后回车"
        use-input
        hide-dropdown-icon
        use-chips
        multiple
        new-value-mode="add-unique"
        input-debounce="0"
        outlined
        v-model="nickName"
        label="要设置的别名"
      >
        <template v-slot:prepend>
          <q-icon name="drive_file_rename_outline" />
        </template>
      </q-select>
      <q-btn
        class="full-width"
        color="primary"
        label="确定"
        @click="addPluNickName()"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      featureType: this.$route.params.featuretype,
      cmdCtrlKey: window.processPlatform === "darwin" ? "command" : "control",
      plugins: [],
      plugin: {},
      feature: {},
      nickName: [],
      showPluNickNameSetting: false,
    };
  },
  computed: {
    features() {
      return this.plugin?.features
        ?.map((x) => {
          return {
            explain: x.explain,
            cmd: x.cmds.filter((y) => y.length)[0],
          };
        })
        .filter((x) => x.cmd);
    },
  },
  mounted() {
    switch (this.featureType) {
      case "pluNickName":
        this.showPluNickNameSetting = true;
        this.plugins = _.values(window.getUtoolsPlugins());
        this.plugin = this.plugins[0];
        this.feature = this.features[0];
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
    getPlugins() {},
    addPluNickName() {
      if (!this.nickName.length)
        return quickcommand.showMessageBox("请填写别名", "warning");
      let uid = this.getUid();
      let command = {
        features: {
          cmds: this.nickName,
          explain: this.feature.explain,
          icon: window.getBase64Ico(this.plugin.logoPath),
          platform: this.plugin.platform || ["darwin", "win32", "linux"],
          code: `key_${uid}`,
        },
        program: "quickcommand",
        cmd: `utools.redirect("${this.feature.cmd}");utools.showMainWindow()`,
        output: "ignore",
        tags: [this.$profile.quickFeatures.pluNickName.tag],
      };
      this.importCommand(command);
      this.nickName = [];
      quickcommand.showMessageBox("添加成功！");
    },
    addFavFile() {
      utools.setExpendHeight(0);
      quickcommand.enterData.payload.forEach((file) => {
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
          tags: [this.$profile.quickFeatures.favFile.tag],
        };
        this.importCommand(command);
      });
      this.showMsg();
    },
    async addFavUrl() {
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
        tags: [this.$profile.quickFeatures.favUrl.tag],
      };
      try {
        let res = await quickcommand.downloadFile(iconUrl, iconPath);
        if (res) command.features.icon = iconPath;
      } catch (e) {}
      this.importCommand(command);
      this.showMsg();
    },
    importCommand(command) {
      command = _.cloneDeep(command);
      this.$utools.putDB(
        command,
        this.$utools.DBPRE.QC + command.features.code
      );
      this.$utools.whole.setFeature(command.features);
    },
    getUid() {
      return Number(
        Math.random().toString().substr(3, 3) + Date.now()
      ).toString(36);
    },
    showMsg() {
      utools.showNotification("操作成功！");
      utools.outPlugin();
    },
  },
};
</script>
