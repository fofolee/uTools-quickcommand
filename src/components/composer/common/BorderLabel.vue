<template>
  <div class="border-label" :class="{ collapsed }" :data-label="label">
    <div class="label-header row items-center" @click="toggleCollapse">
      <q-icon
        v-if="icon"
        :name="icon"
        size="16px"
        class="collapse-icon"
      />
      <div class="label-text">{{ label }}</div>
      <q-icon
        :name="collapsed ? 'expand_more' : 'expand_less'"
        size="16px"
        class="collapse-icon"
      />
    </div>
    <div class="content" :class="{ collapsed }">
      <slot></slot>
    </div>
  </div>
</template>

<script>
/**
 * 边框标签组件
 * @description 对指定元素进行包裹，显示一个定位在左上角的标签，点击标签可以折叠/展开内容
 *
 * @property {Boolean} modelValue - 控制内容的展开/折叠状态
 * @property {String} label - 标签文本
 */
export default {
  name: "BorderLabel",
  props: {
    label: {
      type: String,
      default: "",
    },
    modelValue: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      collapsed: this.modelValue,
    };
  },
  watch: {
    modelValue(val) {
      this.collapsed = val;
    },
  },
  methods: {
    toggleCollapse() {
      this.collapsed = !this.collapsed;
      this.$emit("update:modelValue", this.collapsed);
    },
  },
};
</script>

<style scoped>
.border-label {
  width: 100%;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-radius: 6px;
  position: relative;
  margin-top: 8px;
  transition: border 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.label-header {
  position: absolute;
  top: -9px;
  left: 16px;
  background-color: #fafafa;
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
  line-height: 16px;
  padding: 0 8px;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
  margin-left: -12px;
  transition: none;
}

.label-text {
  transition: color 0.3s ease;
}

.collapse-icon {
  opacity: 0.6;
  transition: all 0.3s ease;
  font-size: 18px;
}

.label-header:hover .label-text {
  color: var(--q-primary);
}

.label-header:hover .collapse-icon {
  opacity: 1;
  color: var(--q-primary);
}

.content {
  position: relative;
  padding: 16px 8px 8px 8px;
  opacity: 1;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0;
}

.content.collapsed {
  padding-top: 0;
  padding-bottom: 0;
  height: 0;
  opacity: 0;
  margin: 0;
}

.border-label.collapsed {
  border-width: 0;
  border-top-width: 1px;
  border-radius: 0;
  margin: 8px 0;
}

.border-label::after {
  content: "";
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: inherit;
}

/* 暗黑模式适配 */
.body--dark .border-label {
  --border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .label-header {
  color: rgba(255, 255, 255, 0.7);
  background-color: #2e2e2e;
}

/* 动画优化 */
.border-label,
.content {
  will-change: max-height, padding, opacity, border-width;
}

.collapse-icon {
  will-change: transform, opacity, color;
}
</style>
