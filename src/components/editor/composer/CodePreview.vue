<template>
  <div class="code-preview">
    <q-btn
      flat
      round
      dense
      icon="preview"
      class="preview-btn"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
    </q-btn>

    <transition name="preview-fade">
      <div v-if="isVisible" class="preview-popup">
        <div class="preview-header">
          <q-icon name="code" size="16px" class="q-mr-xs" />
          <span>预览代码</span>
        </div>
        <pre class="preview-code"><code>{{ code }}</code></pre>
      </div>
    </transition>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "CodePreview",

  props: {
    generateCode: {
      type: Function,
      required: true,
    },
  },

  data() {
    return {
      isVisible: false,
      code: "",
      previewTimer: null,
    };
  },

  methods: {
    handleMouseEnter() {
      this.previewTimer = setTimeout(() => {
        this.code = this.generateCode();
        this.isVisible = true;
      }, 200);
    },

    handleMouseLeave() {
      clearTimeout(this.previewTimer);
      this.isVisible = false;
    },
  },

  beforeUnmount() {
    clearTimeout(this.previewTimer);
  },
});
</script>

<style scoped>
.code-preview {
  position: relative;
}

.preview-btn {
  color: var(--q-primary);
  opacity: 0.7;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.preview-popup {
  position: absolute;
  top: 0;
  right: calc(100% + 12px);
  min-width: 300px;
  max-width: 600px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transform-origin: center right;
}

.preview-header {
  padding: 10px 14px;
  background: rgba(var(--q-primary-rgb), 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px 8px 0 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--q-primary);
  display: flex;
  align-items: center;
}

.preview-code {
  margin: 0;
  padding: 14px;
  font-family: consolas, monaco, monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 400px;
  overflow-y: auto;
}

/* 自定义滚动条 */
.preview-code::-webkit-scrollbar {
  width: 6px;
}

.preview-code::-webkit-scrollbar-thumb {
  background: var(--q-primary-opacity-20);
  border-radius: 3px;
  transition: background 0.3s;
}

.preview-code::-webkit-scrollbar-thumb:hover {
  background: var(--q-primary-opacity-30);
}

/* 过渡动画 */
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

/* 暗色模式适配 */
.body--dark .preview-popup {
  background: #1d1d1d;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.body--dark .preview-header {
  background: rgba(255, 255, 255, 0.03);
}

.body--dark .preview-code {
  color: #e0e0e0;
}
</style>
