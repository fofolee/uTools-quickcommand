<template>
  <div
    class="composer-card q-pa-xs"
    :class="{ 'can-drop': canDrop }"
    v-bind="$attrs"
  >
    <q-card class="command-item">
      <q-card-section class="q-pa-sm">
        <CommandHead
          :command="command"
          :is-control-flow="command.isControlFlow"
          @update:outputVariable="handleOutputVariableUpdate"
          @toggle-output="handleToggleOutput"
          @run="runCommand"
          @remove="$emit('remove')"
        >
          <!-- 控制流程组件，直接把组件放在head中 -->
          <template v-if="command.isControlFlow">
            <component
              :is="command.component"
              v-model="argvLocal"
              :command="command"
              v-bind="command.componentProps || {}"
              :type="command.controlFlowType"
              @addBranch="$emit('addBranch')"
            />
          </template>

          <!-- 非控制流程组件，使用正常布局 -->
          <template v-else>
            <q-space />
          </template>
        </CommandHead>

        <!-- 非控制流程组件的参数输入 -->
        <div v-if="!command.isControlFlow" class="row items-center q-mt-sm">
          <component
            v-if="!!command.component"
            :is="command.component"
            v-model="argvLocal"
            :command="command"
            class="col"
            v-bind="command.componentProps || {}"
          />
          <MultiParamInput
            v-else
            v-model="argvLocal"
            :command="command"
            class="col"
          />
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
import CommandHead from "components/composer/card/CommandHead.vue";

export default defineComponent({
  name: "ComposerCard",
  components: {
    VariableInput,
    MultiParamInput,
    CommandHead,
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
  emits: [
    "remove",
    "toggle-output",
    "update:argv",
    "update:command",
    "run",
    "addBranch",
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
}

/* 拖拽和放置样式 */
.can-drop {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.can-drop .command-item {
  border: 2px dashed var(--q-primary);
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

/* 调整控制流程组件的样式 */
.command-item :deep(.condition-type-btn) {
  margin-left: -8px;
}
</style>
