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
      <q-icon :name="getChianIcon()" size="xs" />
    </div>

    <!-- 标题 -->
    <div class="command-label" v-if="!isControlFlow">
      <div class="drag-handle text-subtitle2 command-label-text">
        {{ command.label }}
      </div>
      <div
        v-if="isCollapsed"
        class="summary-container"
        @click.stop="isEditingSummary = true"
      >
        <div class="command-summary" v-if="!isEditingSummary">
          {{ commandSummary || "添加描述" }}
          <q-tooltip
            anchor="bottom left"
            self="top start"
            v-if="commandSummary"
          >
            单击修改描述
          </q-tooltip>
        </div>
        <q-input
          v-else
          borderless
          class="summary-input"
          :model-value="commandSummary"
          @update:model-value="$emit('update:summary', $event)"
          @blur="isEditingSummary = false"
          autofocus
          placeholder="描述"
        />
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
      @add-print="$emit('add-print')"
      @copy="$emit('copy')"
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
  data() {
    return {
      isEditingSummary: false,
    };
  },
  props: {
    command: {
      type: Object,
      required: true,
    },
  },
  emits: [
    "update:outputVariable",
    "update:summary",
    "run",
    "remove",
    "toggle-collapse",
    "copy",
    "add-print",
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
    isCollapsed() {
      return this.command.isCollapsed;
    },
    commandSummary() {
      return this.command.userComments || this.command.summary;
    },
  },
  methods: {
    getChianIcon() {
      return (
        this.command?.subCommands?.find(
          (command) => command.value === this.command.commandType
        )?.icon || "fork_left"
      );
    },
  },
};
</script>

<style scoped>
.collapse-btn,
.chain-icon {
  display: flex;
  align-items: center;
  margin-right: 2px;
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
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 8px;
}

.command-label-text {
  cursor: grab;
  transition: all 0.3s ease;
}

.command-label-text:hover {
  color: var(--q-primary);
  transition: all 0.3s ease;
}

.command-summary {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: gray;
  font-size: 11px;
}

.summary-container {
  cursor: text;
  width: 200px;
}

.info-icon {
  opacity: 0.6;
  font-size: 12px;
}

.summary-input :deep(.q-field__control),
.summary-input :deep(.q-field__native),
.summary-input :deep(.q-field__marginal) {
  height: 20px !important;
  min-height: 20px;
  font-size: 11px;
  color: gray;
}
</style>
