<template>
  <div
    class="row items-center"
    :class="{
      'q-pb-sm': !isControlFlow,
    }"
  >
    <!-- 拖拽手柄 -->
    <div class="drag-handle q-mr-sm" draggable="true">
      <q-icon name="drag_indicator" size="18px" class="text-grey-6" />
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
      :show-delete-only="isControlFlow"
      v-bind="$attrs"
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
    isControlFlow: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:outputVariable", "toggle-output", "run", "remove"],
  computed: {
    contentClass() {
      return {
        col: true,
        "q-ml-md": !this.isControlFlow,
      };
    },
  },
};
</script>

<style scoped>
.drag-handle {
  display: flex;
  align-items: center;
  padding: 0 4px;
  cursor: grab;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.row:hover .drag-handle {
  opacity: 0.8;
}

.drag-handle:hover {
  opacity: 1;
  color: var(--q-primary);
  transform: scale(1.2);
  transition: all 0.2s ease;
}

.drag-handle:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.command-label {
  user-select: none;
}
</style>
