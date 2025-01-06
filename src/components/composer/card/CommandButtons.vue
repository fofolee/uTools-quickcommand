<template>
  <div class="command-buttons q-px-sm">
    <div class="row items-center no-wrap">
      <!-- 输出变量设置和按钮 -->
      <div
        class="output-section row items-center no-wrap"
        v-if="!isControlFlow"
      >
        <!-- 变量输入框 -->
        <q-input
          v-if="command.saveOutput"
          v-model="inputValue"
          @focus="sourceValue = inputValue"
          @blur="handleBlur"
          outlined
          placeholder="变量名"
          class="variable-input"
          align="center"
        >
        </q-input>
        <!-- 保存变量按钮 -->
        <q-icon
          :name="command.saveOutput ? 'data_object' : 'output'"
          class="output-btn"
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
        </q-icon>
      </div>

      <!-- 操作按钮组 -->
      <div class="action-buttons row items-center no-wrap">
        <q-icon
          v-if="!isControlFlow"
          name="play_arrow"
          class="run-btn"
          @click="$emit('run')"
        >
          <q-tooltip>单独运行此命令并打印输出</q-tooltip>
        </q-icon>

        <q-icon
          name="close"
          @click="$emit('remove')"
          class="remove-btn"
          v-if="!isLastCommandInChain"
        >
          <q-tooltip>移除此命令</q-tooltip>
        </q-icon>
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
    isCollapsed: {
      type: Boolean,
      default: false,
    },
    isControlFlow: {
      type: Boolean,
      default: false,
    },
    isFirstCommandInChain: {
      type: Boolean,
      default: false,
    },
    isLastCommandInChain: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      inputValue: this.command.outputVariable || "",
      sourceValue: "",
    };
  },
  watch: {
    "command.outputVariable"(newVal) {
      this.inputValue = newVal || "";
    },
  },
  emits: [
    "update:outputVariable",
    "toggle-output",
    "run",
    "remove",
    "toggle-collapse",
  ],
  methods: {
    handleBlur() {
      // 如果输入框的值和源值相同，则不更新
      if (
        this.inputValue.replace(/[ ]/g, "") ===
        this.sourceValue.replace(/[ ]/g, "")
      )
        return;
      this.$emit("update:outputVariable", this.inputValue);
    },
  },
};
</script>

<style scoped>
.command-buttons {
  display: flex;
  align-items: center;
  height: 20px;
}

/* 输出部分样式 */
.output-section {
  /* margin-right: 8px; */
  gap: 8px;
}

.variable-input {
  width: 120px;
}

.output-section :deep(.q-field) {
  border-radius: 4px;
}

.output-section :deep(.q-field__control) {
  height: 20px;
  min-height: 20px;
  padding: 0 4px;
}

.output-section :deep(.q-field__marginal) {
  height: 20px;
  width: 24px;
  min-width: 24px;
}

.output-section :deep(.q-field__native) {
  padding: 0;
  font-size: 12px;
  min-height: 20px;
  text-align: center;
}

/* 按钮样式 */
.output-btn,
.run-btn,
.remove-btn {
  font-size: 18px;
  min-height: 25px;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.3s ease;
  padding: 0 4px;
}

.output-btn:hover,
.run-btn:hover,
.remove-btn:hover {
  opacity: 1;
  transform: scale(1.1) translateY(-1px);
  transition: all 0.3s ease;
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
