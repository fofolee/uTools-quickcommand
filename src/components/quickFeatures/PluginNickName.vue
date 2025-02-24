<template>
  <div class="flex justify-center content-center" style="height: 500px">
    <div class="q-gutter-lg q-pa-lg" style="width: 600px">
      <div class="text-center text-h2 q-ma-none">插件别名设置</div>
      <q-select
        outlined
        transition-show="jump-down"
        transition-hide="jump-up"
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
        transition-show="jump-down"
        transition-hide="jump-up"
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
import { useCommandManager } from "js/commandManager";
import { getUniqueId } from "js/common/uuid.js";

export default {
  data() {
    return {
      plugins: [],
      plugin: {},
      feature: {},
      nickName: [],
    };
  },
  mounted() {
    this.plugins = window.lodashM.values(window.getUtoolsPlugins());
    this.plugin = this.plugins[0];
    this.feature = this.features[0];
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
  methods: {
    addPluNickName() {
      const commandManager = useCommandManager();
      if (!this.nickName.length)
        return quickcommand.showMessageBox("请填写别名", "warning");
      const uid = getUniqueId({
        short: true,
      });
      const command = {
        features: {
          cmds: this.nickName,
          explain: this.feature.explain,
          icon: window.resolveFileToBase64(this.plugin.logoPath),
          platform: this.plugin.platform || ["darwin", "win32", "linux"],
          code: `key_${uid}`,
        },
        program: "quickcommand",
        cmd: `utools.redirect("${this.feature.cmd}");utools.showMainWindow()`,
        output: "ignore",
        tags: [this.$root.profile.pluNickNameTag],
      };
      commandManager.importCommand(JSON.stringify(command), {
        showMessage: false,
      });
      this.nickName = [];
      quickcommand.showMessageBox("添加成功！");
    },
  },
};
</script>
