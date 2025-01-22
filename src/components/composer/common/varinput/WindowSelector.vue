<template>
  <q-btn
    @click="inspectWindow"
    icon="my_location"
    flat
    dense
    size="sm"
    :label="window.label"
  >
    <q-tooltip>选择窗口获取属性</q-tooltip>
  </q-btn>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "WindowSelector",
  emits: ["emitValue"],
  props: {
    window: {
      type: Object,
      required: true,
    },
  },
  methods: {
    async inspectWindow() {
      const { props } = this.window;
      window.utools.hideMainWindow();
      const selectWindow = await quickcomposer.windows.automation.inspect();
      window.utools.showMainWindow();
      let propKeys = [];
      if (typeof props === "object") {
        const result = await quickcommand.showButtonBox(
          props.map((item) => item.label),
          "请选择要填入的属性"
        );
        propKeys = props[result.id].value.split(".");
      } else {
        propKeys = props.split(".");
      }
      const propValue = propKeys.reduce((acc, key) => acc[key], selectWindow);
      this.$emit("emitValue", "str", propValue || "");
    },
  },
});
</script>
