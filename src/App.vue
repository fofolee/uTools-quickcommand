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
      utools.onPluginEnter((enter) => {
        // 暗黑模式
        this.$q.dark.set(utools.isDarkColors());
        // 路由跳转
        quickcommand.enterData = enter;
        this.$router.push({
          path: enter.code,
          query: {
            timestamp: new Date().getTime(),
          },
        });
      });
    },
  },
});
</script>

<style>
body.body--dark {
  background: #1d1d1d;
}
</style>
