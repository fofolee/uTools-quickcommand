<template>
  <q-scroll-area
    v-show="$root.profile.commandCardStyle !== 'mini'"
    class="absolute-left tag-bar"
    :thumb-style="{
      width: '2px',
    }"
    :style="{
      width: tabBarWidth,
      zIndex: 1,
    }"
  >
    <q-tabs
      v-model="currentTag"
      vertical
      switch-indicator
      :key="denseTagBar"
      :dense="denseTagBar"
    >
      <!-- 所有标签 -->
      <q-tab
        v-for="tag in allQuickCommandTags"
        :key="tag"
        :name="tag"
        :data-search-result="tag === '搜索结果'"
        :data-active-panel="activatedQuickPanels.includes(tag)"
      >
        {{ tag }}
        <q-tooltip v-if="tag === '未分类'">
          所有没有添加标签的命令都会归在未分类 <br />
          可以在新建命令时在标签一栏选择或直接键入标签名来添加标签
        </q-tooltip>
      </q-tab>
    </q-tabs>
  </q-scroll-area>
</template>

<script>
export default {
  name: "TagBar",
  props: {
    tabBarWidth: {
      type: String,
      required: true,
    },
    allQuickCommandTags: {
      type: Array,
      required: true,
    },
    activatedQuickPanels: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: String,
      required: true,
    },
    denseTagBar: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    currentTag: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
};
</script>

<style scoped>
/* 标签栏容器样式 */
.q-tabs {
  height: auto !important;
  min-height: 100vh !important;
  background: transparent !important;
}

.q-scroll-area {
  height: 100vh;
}

/* 标签栏和底栏内的按钮悬浮效果 */
.q-tabs .q-tab:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.body--dark .q-tabs .q-tab:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

.q-tab {
  word-break: break-all;
  white-space: normal;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--q-blue-grey) !important;
  opacity: 0.7;
  transition: all 0.3s ease;
}

/* 激活标签样式 */
.q-tab--active {
  color: var(--q-primary) !important;
  font-weight: 600 !important;
  opacity: 1;
}

.q-tab:hover::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: var(--q-primary);
  opacity: 0.1;
  border-radius: 4px;
  transition: opacity 0.3s;
}

/* 特殊标签样式（搜索结果和激活面板） */
.q-tab[data-search-result="true"],
.q-tab[data-active-panel="true"] {
  color: #4286de !important;
  font-weight: 600 !important;
}

/* 标签悬浮效果 */
.q-tab:hover {
  opacity: 0.9;
  transform: translateX(4px);
}

/* 标签内容过渡效果 */
.q-tab__content {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 标签栏过渡动画 */
.tag-bar {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: width, opacity;
  opacity: 1;
  background: transparent;
}

/* 标签栏隐藏时的样式 */
.tag-bar[style*="display: none"] {
  opacity: 0;
  width: 0 !important;
}

/* 暗色模式适配 */
:deep(.body--dark) .q-tab:hover::after {
  opacity: 0.15;
}
</style>
