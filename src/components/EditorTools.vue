<template>
  <div class="editor-tools">
    <!-- 历史记录组件 -->
    <EditorHistory
      ref="history"
      :commandCode="commandCode"
      @restore="$emit('restore', $event)"
    />

    <!-- 全屏按钮 -->
    <q-btn
      round
      dense
      :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
      @click="$emit('toggle-fullscreen')"
      class="fullscreen-btn"
      :class="{ 'btn-fullscreen': isFullscreen }"
    >
      <q-tooltip>{{
        isFullscreen ? "退出全屏 (F11)" : "全屏编辑 (F11)"
      }}</q-tooltip>
    </q-btn>
  </div>
</template>

<script>
import EditorHistory from "components/popup/EditorHistory.vue";

export default {
  name: 'EditorTools',
  components: {
    EditorHistory
  },
  props: {
    commandCode: {
      type: String,
      default: 'temp'
    },
    isFullscreen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['restore', 'toggle-fullscreen'],
  methods: {
    showHistory() {
      this.$refs.history.open();
    },
    tryToSave(content, program) {
      this.$refs.history.tryToSave(content, program);
    }
  }
}
</script>

<style scoped>
.editor-tools {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fullscreen-btn {
  z-index: 1000;
  transform-origin: center;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fullscreen-btn:hover {
  transform: scale(1.1) translateY(-2px);
}

.fullscreen-btn:active {
  transform: scale(0.95);
  transition-duration: 0.1s;
}

.btn-fullscreen {
  transform: rotate(180deg);
}

.btn-fullscreen:hover {
  transform: rotate(180deg) scale(1.1);
}

.body--dark .fullscreen-btn {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  color: #bbb;
}

.body--dark .fullscreen-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>
