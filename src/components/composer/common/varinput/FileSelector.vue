<template>
  <q-btn flat dense icon="file_open" size="sm" @click="handleFileOpen">
    <q-tooltip>选择文件</q-tooltip>
  </q-btn>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "FileSelector",
  props: {
    dialog: {
      type: Object,
      required: true,
    },
  },
  emits: ["emitValue"],
  methods: {
    handleFileOpen() {
      let { type, options } = window.lodashM.cloneDeep(this.dialog);
      if (!type) type = "open";
      if (type === "open") {
        const files = utools.showOpenDialog(options);
        if (!files) return;
        if (files.length > 1) {
          this.$emit("emitValue", "var", files);
        } else if (files.length === 1) {
          this.$emit("emitValue", "str", files[0]);
        }
      } else {
        const file = utools.showSaveDialog(options);
        if (!file) return;
        this.$emit("emitValue", "str", file);
      }
    },
  },
});
</script>
