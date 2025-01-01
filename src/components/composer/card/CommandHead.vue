<template>
  <div class="row items-center">
    <!-- 折叠按钮 -->
    <div class="collapse-btn" v-if="!isLastCommandInChain">
      <q-btn
        :icon="isCollapsed ? 'expand_more' : 'expand_less'"
        dense
        flat
        size="sm"
        @click="$emit('toggle-collapse')"
      >
        <q-tooltip>折叠/展开此{{ isControlFlow ? "流程" : "命令" }}</q-tooltip>
      </q-btn>
    </div>
    <div v-else class="end-icon">
      <q-icon name="last_page" size="xs" />
    </div>

    <!-- 标题 -->
    <div v-if="!isControlFlow" class="text-subtitle2 command-label">
      {{ command.label }}
    </div>

    <!-- 主要内容区域 -->
    <div :class="contentClass">
      <slot></slot>
    </div>

    <!-- 按钮组 -->
    <CommandButtons
      :command="command"
      v-bind="$attrs"
      :isCollapsed="isCollapsed"
      :isControlFlow="isControlFlow"
      :isFirstCommandInChain="isFirstCommandInChain"
      :isLastCommandInChain="isLastCommandInChain"
      @update:outputVariable="$emit('update:outputVariable', $event)"
      @toggle-output="$emit('toggle-output')"
      @run="$emit('run')"
      @remove="$emit('remove')"
    />
  </div>
</template>

<script>
import CommandButtons from "./CommandButtons.vue";

export default {
  name: "CommandHead",
  components: {
    CommandButtons,
  },
  props: {
    command: {
      type: Object,
      required: true,
    },
    isCollapsed: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "update:outputVariable",
    "toggle-output",
    "run",
    "remove",
    "toggle-collapse",
  ],
  computed: {
    contentClass() {
      return {
        col: true,
        "q-ml-md": !this.command.isControlFlow,
      };
    },
    isControlFlow() {
      return this.command.isControlFlow;
    },
    isFirstCommandInChain() {
      if (!this.command.commandChain) return false;
      return this.command.commandType === this.command.commandChain?.[0];
    },
    isLastCommandInChain() {
      if (!this.command.commandChain) return false;
      return (
        this.command.commandType === this.command.commandChain?.slice(-1)[0]
      );
    },
  },
};
</script>

<style scoped>
.collapse-btn,
.end-icon {
  display: flex;
  align-items: center;
  padding-right: 4px;
  transition: all 0.2s ease;
}

.collapse-btn :deep(.q-btn),
.end-icon {
  opacity: 0.6;
  min-height: 20px;
  padding: 0 4px;
}

.collapse-btn :deep(.q-btn:hover) {
  opacity: 1;
  transform: scale(1.1) translateY(-1px);
  color: var(--q-primary);
}

.command-label {
  user-select: none;
  pointer-events: none;
}
</style>
