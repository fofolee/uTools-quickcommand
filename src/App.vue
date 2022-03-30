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
      utools.onPluginEnter((enter) => {
        localStorage["enterData"] = JSON.stringify(enter);
        this.$router.push(enter.code);
      });
    },
  },
});
</script>
