<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";
import { setCssVar } from "quasar";

export default defineComponent({
  name: "App",
  data() {
    return {
      setCssVar: setCssVar,
    };
  },
  computed: {},
  created: function () {
    this.init();
  },
  methods: {
    init() {
      window.utools = window.getuToolsLite();
      // 版本检测
      const requiredVersion = "2.6.1";
      let version = utools.getAppVersion();
      if (version < requiredVersion) {
        this.$router.push({
          name: "needupdate",
          params: { version: version, requiredVersion: requiredVersion },
        });
        return;
      }
      // 默认主题色
      this.setCssVar("primary", this.$profile.primaryColor);
      // 进入插件
      utools.onPluginEnter((enter) => {
        // 暗黑模式
        this.$q.dark.set(utools.isDarkColors());
        // 路由跳转
        quickcommand.enterData = enter;
        this.$router.push(enter.code);
      });
      // 退出插件
      utools.onPluginOut(() => {
        // 切到空路由
        this.$router.push("loading");
        // 清空临时数据
        window.temporaryStoreSoldOut();
        // 保存偏好
        this.$utools.putDB(
          _.cloneDeep(this.$profile),
          this.$utools.DBPRE.CFG + "preferences"
        );
      });
    },
  },
});
</script>

<style>
.q-tooltip {
  font-size: 11px;
}
:root {
  --q-dark: #303133;
  --q-dark-page: #303133;
}
</style>
