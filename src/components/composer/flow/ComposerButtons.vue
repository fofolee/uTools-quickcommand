<template>
  <div class="composer-buttons">
    <div class="left-buttons">
      <q-btn
        :icon="isAllCollapsed ? 'unfold_more' : 'unfold_less'"
        dense
        flat
        rounded
        size="9px"
        @click="$emit('action', isAllCollapsed ? 'expandAll' : 'collapseAll')"
      >
        <q-tooltip>{{ isAllCollapsed ? "展开所有" : "折叠所有" }}</q-tooltip>
      </q-btn>
    </div>

    <div class="right-buttons">
      <q-btn
        @click="$q.dark.toggle()"
        :icon="$q.dark.isActive ? 'dark_mode' : 'light_mode'"
        flat
        dense
        v-if="isDev"
      >
      </q-btn>
      <q-btn icon="logout" dense flat v-close-popup>
        <q-tooltip>退出可视化编排</q-tooltip>
      </q-btn>
      <q-separator vertical />
      <q-btn dense icon="publish" flat @click="$emit('action', 'insert')">
        <q-tooltip>插入到编辑器光标处</q-tooltip>
      </q-btn>
      <q-btn dense flat icon="done_all" @click="$emit('action', 'apply')">
        <q-tooltip>清空编辑器内容并插入</q-tooltip>
      </q-btn>
      <q-separator vertical />
      <q-btn dense flat icon="save" @click="$emit('action', 'save')">
        <q-tooltip>保存</q-tooltip>
      </q-btn>
      <q-btn dense flat icon="history" @click="$emit('action', 'load')">
        <q-tooltip>载入</q-tooltip>
      </q-btn>
      <q-separator vertical />
      <q-btn
        flat
        dense
        icon="preview"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
      </q-btn>
      <q-btn dense flat icon="play_circle" @click="$emit('action', 'run')">
        <q-tooltip>运行</q-tooltip>
      </q-btn>
    </div>

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
  name: "ComposerButtons",

  props: {
    generateCode: {
      type: Function,
      required: true,
    },
    isAllCollapsed: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["action"],

  data() {
    return {
      isVisible: false,
      code: "",
      previewTimer: null,
      isDev: window.utools.isDev(),
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
.composer-buttons {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.left-buttons,
.right-buttons {
  display: flex;
  align-items: center;
}

.composer-buttons > div > .q-btn {
  opacity: 0.6;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 12px;
}

.composer-buttons > div > .q-btn:hover {
  opacity: 1;
  transform: translateY(-1px);
  color: var(--q-primary);
}

.preview-popup {
  position: absolute;
  top: 40px;
  right: 30px;
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
