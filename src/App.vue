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
    this.pluginEnterEvent();
  },
  methods: {
    pluginEnterEvent() {
      // 版本检测
      const requiredVersion = "2.6.1";
      let version = utools.getAppVersion();
      if (version < requiredVersion) {
        this.$router.push({
          path: `/needupdate/${version}-${requiredVersion}`,
        });
        return;
      }
      utools.onPluginEnter((enter) => {
        localStorage["enterData"] = JSON.stringify(enter);
        this.$router.push(enter.code);
      });
    },
  },
});
</script>
