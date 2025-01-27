<template>
  <div class="row items-center">
    <!-- 折叠按钮 -->
    <div class="collapse-btn" v-if="!isControlFlow || isFirstCommandInChain">
      <q-btn
        :icon="isCollapsed ? 'expand_more' : 'expand_less'"
        dense
        flat
        size="sm"
        @click="$emit('toggle-collapse')"
      >
        <q-tooltip>{{ isCollapsed ? "展开" : "折叠" }}</q-tooltip>
      </q-btn>
    </div>
    <div v-else-if="isLastCommandInChain" class="chain-icon">
      <q-icon name="linear_scale" size="xs" />
    </div>
    <div v-else class="chain-icon">
      <q-icon name="fork_left" size="xs" />
    </div>

    <!-- 标题 -->
    <div class="drag-handle command-label">
      <div class="text-subtitle2 command-label-text">
        {{ command.label }}
      </div>
      <div
        class="text-caption text-grey command-summary"
        v-if="command.summary && isCollapsed"
      >
        {{ command.summary }}
      </div>
    </div>

    <q-icon
      name="info"
      class="info-icon"
      v-if="command.description && !isCollapsed"
    >
      <q-tooltip max-width="300px">
        {{ command.description }}
      </q-tooltip>
    </q-icon>

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
  },
  emits: ["update:outputVariable", "run", "remove", "toggle-collapse"],
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
    isCollapsed() {
      return this.command.isCollapsed;
    },
  },
};
</script>

<style scoped>
.collapse-btn,
.chain-icon {
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.collapse-btn :deep(.q-btn),
.chain-icon {
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
  pointer-events: all;
  cursor: grab;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 8px;
}

.command-label:hover {
  color: var(--q-primary);
  transition: all 0.3s ease;
}

.command-summary {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-icon {
  opacity: 0.6;
  font-size: 12px;
}
</style>
