<template>
  <q-btn @click="inspectElement" icon="my_location" flat dense size="sm">
    <q-tooltip>选择元素获取选择器</q-tooltip>
  </q-btn>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "CssSelector",
  emits: ["emitValue"],
  methods: {
    async inspectElement() {
      try {
        const tab = await quickcomposer.browser.getCurrentTab();
        window.utools.hideMainWindow();
        const selectElement = await quickcomposer.browser.getSelector({
          by: "id",
          searchValue: tab.id,
        });
        window.utools.showMainWindow();
        this.$emit("emitValue", "str", selectElement || "");
      } catch (error) {
        quickcommand.showMessageBox(error.toString(), "error");
      }
    },
  },
});
</script>
