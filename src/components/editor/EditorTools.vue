<template>
  <div class="editor-tools">
    <!-- 历史记录组件 -->
    <EditorHistory
      ref="history"
      :commandCode="commandCode"
      @restore="$emit('restore', $event)"
    />
  </div>
</template>

<script>
import EditorHistory from "components/popup/EditorHistory.vue";

export default {
  name: "EditorTools",
  components: {
    EditorHistory,
  },
  props: {
    commandCode: {
      type: String,
      default: "temp",
    },
  },
  emits: ["restore"],
  methods: {
    showHistory() {
      this.$refs.history.open();
    },
    tryToSave(content, program) {
      this.$refs.history.tryToSave(content, program);
    },
  },
};
</script>

<style scoped>
.editor-tools {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 500;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
