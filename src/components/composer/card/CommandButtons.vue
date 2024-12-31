<template>
  <div class="command-buttons q-px-sm">
    <div class="row items-center no-wrap">
      <!-- 输出变量设置和按钮 -->
      <div
        class="output-section row items-center no-wrap"
        v-if="!showDeleteOnly"
      >
        <!-- 变量输入框 -->
        <q-input
          v-if="command.saveOutput"
          :model-value="command.outputVariable"
          @update:model-value="$emit('update:outputVariable', $event)"
          dense
          outlined
          placeholder="变量名"
          class="variable-input"
          align="center"
        >
        </q-input>
        <!-- 保存变量按钮 -->
        <q-btn
          :icon="command.saveOutput ? 'data_object' : 'output'"
          :label="command.saveOutput ? '保存到变量' : '获取输出'"
          flat
          dense
          class="output-btn"
          size="sm"
          @click="$emit('toggle-output')"
        >
          <q-tooltip>
            <div class="text-body2">
              {{
                command.saveOutput
                  ? "当前命令的输出将保存到变量中"
                  : "点击将此命令的输出保存为变量以供后续使用"
              }}
            </div>
            <div class="text-caption text-grey-5">
              {{
                command.saveOutput
                  ? "点击取消输出到变量"
                  : "保存后可在其他命令中使用此变量"
              }}
            </div>
          </q-tooltip>
        </q-btn>
      </div>

      <!-- 操作按钮组 -->
      <div class="action-buttons row items-center no-wrap">
        <q-btn
          flat
          dense
          v-if="!showDeleteOnly"
          round
          icon="play_arrow"
          class="run-btn q-mr-xs"
          size="sm"
          @click="$emit('run')"
        >
          <q-tooltip>单独运行此命令并打印输出</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="close"
          @click="$emit('remove')"
          size="sm"
          class="remove-btn"
        >
          <q-tooltip>移除此命令</q-tooltip>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CommandButtons",
  props: {
    command: {
      type: Object,
      required: true,
    },
    showDeleteOnly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:outputVariable", "toggle-output", "run", "remove"],
};
</script>

<style scoped>
.command-buttons {
  display: flex;
  align-items: center;
}

/* 输出部分样式 */
.output-section {
  margin-right: 8px;
  gap: 8px;
}

.variable-input {
  width: 100px;
}

.output-section :deep(.q-field) {
  border-radius: 4px;
}

.output-section :deep(.q-field__control) {
  height: 28px;
  min-height: 28px;
  padding: 0 4px;
}

.output-section :deep(.q-field__marginal) {
  height: 28px;
  width: 24px;
  min-width: 24px;
}

.output-section :deep(.q-field__native) {
  padding: 0;
  font-size: 12px;
  min-height: 28px;
  text-align: center;
}

/* 按钮样式 */
.output-btn,
.run-btn,
.remove-btn {
  font-size: 12px;
  border-radius: 4px;
  min-height: 28px;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.output-btn:hover,
.run-btn:hover,
.remove-btn:hover {
  opacity: 1;
  transform: scale(1.05);
}

.run-btn:hover {
  color: var(--q-positive);
}

.remove-btn:hover {
  color: var(--q-negative);
}

.output-btn.q-btn--active {
  color: var(--q-primary);
}

/* 暗色模式适配 */
.body--dark .output-section :deep(.q-field) {
  background: rgba(255, 255, 255, 0.03);
}

.body--dark .output-section :deep(.q-field--focused) {
  background: #1d1d1d;
}

.body--dark .output-btn {
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .output-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>
