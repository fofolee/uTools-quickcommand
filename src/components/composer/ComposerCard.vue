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
            <div class="text-subtitle2">{{ command.label }}</div>
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
              v-if="showOutputBtn"
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

            <!-- 运行按钮 -->
            <q-btn
              flat
              dense
              round
              icon="play_arrow"
              v-if="showRunBtn"
              class="run-btn q-px-sm q-mr-sm"
              size="sm"
              @click="runCommand"
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

          <!-- 参数输入 -->
          <div class="row items-center">
            <!-- 单独写组件的参数 -->
            <component
              :is="command.component"
              v-model="argvLocal"
              :command="command"
              class="col"
              v-if="!!command.component"
              v-bind="command.componentProps || {}"
            />
            <!-- 通用组件参数 -->
            <MultiParamInput
              v-else
              v-model="argvLocal"
              :command="command"
              class="col"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent, inject, defineAsyncComponent } from "vue";
import { validateVariableName } from "js/common/variableValidator";
import VariableInput from "components/composer/ui/VariableInput.vue";
import MultiParamInput from "components/composer/ui/MultiParamInput.vue";

export default defineComponent({
  name: "ComposerCard",
  components: {
    VariableInput,
    MultiParamInput,
    KeyEditor: defineAsyncComponent(() =>
      import("components/composer/ui/KeyEditor.vue")
    ),
    UBrowserEditor: defineAsyncComponent(() =>
      import("components/composer/ubrowser/UBrowserEditor.vue")
    ),
    AxiosConfigEditor: defineAsyncComponent(() =>
      import("components/composer/http/AxiosConfigEditor.vue")
    ),
    SymmetricCryptoEditor: defineAsyncComponent(() =>
      import("components/composer/crypto/SymmetricCryptoEditor.vue")
    ),
    AsymmetricCryptoEditor: defineAsyncComponent(() =>
      import("components/composer/crypto/AsymmetricCryptoEditor.vue")
    ),
    FunctionSelector: defineAsyncComponent(() =>
      import("components/composer/ui/FunctionSelector.vue")
    ),
    RegexEditor: defineAsyncComponent(() =>
      import("components/composer/regex/RegexEditor.vue")
    ),
    ConditionalJudgment: defineAsyncComponent(() =>
      import("components/composer/control/ConditionalJudgment.vue")
    ),
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
  emits: ["remove", "toggle-output", "update:argv", "update:command", "run"],
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
        if (this.command.hasAxiosEditor) {
          // 如果是编辑现有配置
          if (
            this.command.argv &&
            !this.command.argv.includes("axios.") &&
            !this.command.argv.includes("fetch(")
          ) {
            try {
              return JSON.parse(this.command.argv);
            } catch (e) {
              return {};
            }
          }
          // 如果已经是格式化的代码，直接返回
          return this.command.argv || {};
        }
        return this.command.argv;
      },
      set(value) {
        const updatedCommand = {
          ...this.command,
          argv: this.command.hasAxiosEditor
            ? typeof value === "string"
              ? value
              : JSON.stringify(value)
            : value,
        };
        this.$emit("update:command", updatedCommand);
      },
    },
    showRunBtn() {
      return !this.command.isControlFlow;
    },
    showOutputBtn() {
      return !this.command.isControlFlow;
    },
  },
  setup() {
    const addVariable = inject("addVariable");
    const removeVariable = inject("removeVariable");
    const variables = inject("composerVariables", []);

    return {
      addVariable,
      removeVariable,
      variables,
    };
  },
  methods: {
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
      // 检查变量名是否合法
      const validation = validateVariableName(value);
      if (!validation.isValid) {
        quickcommand.showMessageBox(validation.error, "warning");
        return;
      }

      // 检查变量名是否重复
      if (this.variables.some((v) => v.name === value)) {
        quickcommand.showMessageBox(`变量名 "${value}" 已经存在`, "warning");
        return;
      }

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
    handleArgvChange(key, value) {
      // 收集所有参数的当前值
      const args = this.command.config.reduce((acc, item) => {
        acc[item.key] = item.key === key ? value : item.value || "";
        return acc;
      }, {});

      // 按照配置顺序拼接参数值
      const argv = this.command.config
        .map((item) => args[item.key])
        .filter(Boolean)
        .join(",");

      this.$emit("update:argv", argv);
    },
    runCommand() {
      // 创建一个带临时变量的命令副本
      const tempCommand = {
        ...this.command,
        outputVariable: this.command.outputVariable || `temp_${Date.now()}`,
        saveOutput: true,
      };
      this.$emit("run", tempCommand);
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
/* 卡片基础样式 */
.composer-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  opacity: 1;
  transform: translateY(0) scale(1);
}

.command-item {
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.command-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* 拖拽和放置样式 */
.can-drop {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.can-drop .command-item {
  border: 2px dashed var(--q-primary);
}

.drag-handle {
  display: flex;
  align-items: center;
  padding: 0 4px;
}

.drag-handle:hover {
  color: var(--q-primary);
}

/* 输出部分样式 */
.output-section {
  max-width: 120px;
  margin-right: 4px;
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
  padding: 0 8px;
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

/* 动画效果 */
.composer-card-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.composer-card-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.composer-card-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
}

.composer-card-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* 暗色模式适配 */
.body--dark .command-item {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.body--dark .command-item:hover {
  box-shadow: 0 4px 8px rgba(58, 58, 58, 0.3);
}

.body--dark .can-drop {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

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
