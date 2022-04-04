<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  data() {
    return {};
  },
  computed: {},
  created: function () {
    this.init();
  },
  methods: {
    init() {
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
      utools.onPluginEnter((enter) => {
        // 暗黑模式
        this.$q.dark.set(utools.isDarkColors());
        // 路由跳转
        quickcommand.enterData = enter
        this.$router.push(enter.code);
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
