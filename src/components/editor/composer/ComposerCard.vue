<template>
  <div
    class="composer-card q-pa-xs"
    :class="{ 'can-drop': canDrop }"
    v-bind="$attrs"
  >
    <q-card class="command-item">
      <q-card-section class="q-pa-sm">
        <div class="col">
          <!-- 命令标题和描述 -->
          <div class="row items-center q-mb-sm">
            <!-- 拖拽手柄 -->
            <div class="drag-handle cursor-move q-mr-sm">
              <q-icon name="drag_indicator" size="18px" class="text-grey-6" />
            </div>
            <div class="text-subtitle1">{{ command.label }}</div>
            <q-space />

            <!-- 输出变量设置 -->
            <div
              class="output-section row items-center no-wrap"
              v-if="command.saveOutput"
            >
              <q-input
                :model-value="command.outputVariable"
                @update:model-value="handleOutputVariableUpdate"
                dense
                outlined
                placeholder="变量名"
                class="variable-input"
                style="width: 100px"
                align="center"
              >
              </q-input>
            </div>

            <q-btn
              :icon="saveOutputLocal ? 'data_object' : 'output'"
              :label="saveOutputLocal ? '保存到变量' : '获取输出'"
              flat
              dense
              class="output-btn q-px-sm q-mr-sm"
              size="sm"
              @click="handleToggleOutput"
            >
              <q-tooltip>
                <div class="text-body2">
                  {{
                    saveOutputLocal
                      ? "当前命令的输出将保存到变量中"
                      : "点击将此命令的输出保存为变量以供后续使用"
                  }}
                </div>
                <div class="text-caption text-grey-5">
                  {{
                    saveOutputLocal
                      ? "点击取消输出到变量"
                      : "保存后可在其他命令中使用此变量"
                  }}
                </div>
              </q-tooltip>
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

          <!-- 参数输入 -->
          <div class="row items-center">
            <!-- 按键编辑器 -->
            <template v-if="command.hasKeyRecorder">
              <KeyEditor v-model="argvLocal" class="col" />
            </template>
            <!-- UBrowser编辑器 -->
            <template v-else-if="command.hasUBrowserEditor">
              <UBrowserEditor v-model="argvLocal" class="col" />
            </template>
            <!-- 普通参数输入 -->
            <template v-else>
              <VariableInput
                v-model="argvLocal"
                :label="placeholder"
                class="col"
                ref="variableInput"
                @update:type="handleArgvTypeUpdate"
              />
            </template>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent, inject } from "vue";
import KeyEditor from "./KeyEditor.vue";
import UBrowserEditor from "./ubrowser/UBrowserEditor.vue";
import VariableInput from "./VariableInput.vue";

export default defineComponent({
  name: "ComposerCard",
  components: {
    KeyEditor,
    UBrowserEditor,
    VariableInput,
  },
  props: {
    command: {
      type: Object,
      required: true,
    },
    availableOutputs: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: "",
    },
    canDrop: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showKeyRecorder: false,
    };
  },
  emits: [
    "remove",
    "toggle-output",
    "update:argv",
    "update:use-output",
    "update:command",
  ],
  computed: {
    saveOutputLocal: {
      get() {
        return this.command.saveOutput;
      },
      set(value) {
        this.$emit("toggle-output");
      },
    },
    argvLocal: {
      get() {
        return this.command.argv;
      },
      set(value) {
        this.$emit("update:argv", value);
      },
    },
    useOutputLocal: {
      get() {
        return this.command.useOutput;
      },
      set(value) {
        this.$emit("update:use-output", value);
      },
    },
  },
  setup() {
    const addVariable = inject("addVariable");
    const removeVariable = inject("removeVariable");

    return {
      addVariable,
      removeVariable,
    };
  },
  methods: {
    handleClearOutput() {
      this.$emit("update:use-output", null);
    },
    handleKeyRecord(keys) {
      this.showKeyRecorder = false;
      // 从keyTap("a","control")格式中提取参数
      const matches = keys.match(/keyTap\((.*)\)/);
      if (matches && matches[1]) {
        this.$emit("update:argv", matches[1]);
      }
    },
    handleOutputVariableChange(value) {
      if (this.command.outputVariable) {
        this.removeVariable(this.command.outputVariable);
      }
      if (value) {
        this.addVariable(value, this.command);
      }
    },
    handleOutputVariableUpdate(value) {
      // 创建命令的副本并更新
      const updatedCommand = {
        ...this.command,
        outputVariable: value,
      };
      // 发出更新事件
      this.$emit("update:command", updatedCommand);
      // 处理变量管理
      this.handleOutputVariableChange(value);
    },
    handleArgvTypeUpdate(type) {
      console.log("Type updated in card:", type);
      const updatedCommand = {
        ...this.command,
        argvType: type,
      };
      this.$emit("update:command", updatedCommand);
    },
    handleToggleOutput() {
      // 创建命令的副本
      const updatedCommand = {
        ...this.command,
        saveOutput: !this.command.saveOutput,
      };

      // 如果关闭输出，清空变量名
      if (!updatedCommand.saveOutput && updatedCommand.outputVariable) {
        this.removeVariable(updatedCommand.outputVariable);
        updatedCommand.outputVariable = null;
      }

      // 发出更新事件
      this.$emit("update:command", updatedCommand);
    },
  },
  mounted() {
    this.$el.classList.add("composer-card-enter-from");
    requestAnimationFrame(() => {
      this.$el.classList.remove("composer-card-enter-from");
    });
  },
});
</script>

<style scoped>
.composer-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 进入动画 */
.composer-card-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.composer-card-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* 移除动画 */
.composer-card-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
}

.composer-card-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* 拖拽动画 */
/* .composer-card:active { */
/* transform: scale(1.02); */
/* transition: transform 0.2s; */
/* } */

.command-item {
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.command-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.composer-card :deep(.q-field__label) {
  font-size: 13px;
}

/* 可放置状态动画 */
.can-drop {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.can-drop .command-item {
  border: 2px dashed var(--q-primary);
  background: rgba(var(--q-primary-rgb), 0.05);
}

/* 暗色模式适配 */
.body--dark .command-item {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.body--dark .command-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.body--dark .can-drop {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.drag-handle {
  display: flex;
  align-items: center;
  padding: 0 4px;
}

.drag-handle:hover {
  color: var(--q-primary);
}

/* 添加新的样式 */
.output-section {
  max-width: 120px;
  margin-right: 4px;
}

.output-section :deep(.q-field) {
  background: rgba(var(--q-primary-rgb), 0.03);
  border-radius: 4px;
}

/* 输出按钮样式优化 */
.output-btn {
  font-size: 12px;
  border-radius: 4px;
  min-height: 28px;
  padding: 0 8px;
  border: 1px solid rgba(var(--q-primary-rgb), 0.1);
  transition: all 0.3s ease;
}

.output-btn:hover {
  background: rgba(var(--q-primary-rgb), 0.05);
}

.output-btn .q-icon {
  font-size: 14px;
  margin-right: 4px;
}

.output-btn.q-btn--active {
  background: rgba(var(--q-primary-rgb), 0.1);
  color: var(--q-primary);
}

/* 移除按钮样式 */
.remove-btn {
  opacity: 0.5;
  transition: all 0.3s ease;
  font-size: 18px;
}

.remove-btn:hover {
  opacity: 1;
  color: var(--q-negative);
  transform: scale(1.05);
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

/* 输入框内部样式优化 */
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

/* Tooltip 样式优化 */
:deep(.q-tooltip) {
  max-width: 300px;
  padding: 8px 12px;
}

/* 优化图标样式 */
.output-section :deep(.q-icon) {
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.output-section :deep(.q-field--focused .q-icon) {
  opacity: 1;
}
</style>
