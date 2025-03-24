<template>
  <div
    class="composer-card"
    :class="{
      collapsed: localCommand.isCollapsed && !localCommand.isControlFlow,
    }"
    v-bind="$attrs"
  >
    <!-- 禁用遮罩层 -->
    <div
      v-if="localCommand.disabled"
      class="disabled-overlay"
      :class="{
        showToggleBtn: canToggleDisable,
      }"
      @click.stop="handleToggleDisable"
    >
      <div class="enable-btn-wrapper row items-center text-primary">
        <q-icon
          name="layers"
          class="q-mr-sm"
          :size="localCommand.isCollapsed ? '14px' : '18px'"
        />
        <div :style="{ fontSize: localCommand.isCollapsed ? '12px' : '15px' }">
          点击启用
        </div>
      </div>
    </div>
    <q-card class="command-item">
      <q-card-section
        class="card-section"
        :class="{
          collapsed: localCommand.isCollapsed || localCommand.isControlFlow,
        }"
      >
        <CommandHead
          :command="localCommand"
          @update:outputVariable="handleOutputVariableUpdate"
          @update:summary="localCommand.userComments = $event"
          @toggle-collapse="handleToggleCollapse"
          @run="runCommand"
          @remove="$emit('remove')"
          @copy="handleCopy"
          @toggle-disable="handleToggleDisable"
          @add-print="handleAddPrint"
        >
          <!-- 控制流程组件，直接把组件放在head中 -->
          <template v-if="localCommand.isControlFlow">
            <ControlCommand
              v-model="localCommand"
              v-bind="localCommand.componentProps || {}"
              class="control-component"
              @addBranch="(event) => $emit('addBranch', event)"
            />
          </template>

          <!-- 非控制流程组件，使用正常布局 -->
          <template v-else>
            <q-space />
          </template>
        </CommandHead>

        <!-- 非控制流程组件的参数输入 -->
        <div
          v-if="!localCommand.isControlFlow"
          class="command-content-wrapper"
          :class="{ collapsed: localCommand.isCollapsed }"
        >
          <div class="command-content">
            <component
              v-if="!!localCommand.component"
              :is="localCommand.component"
              v-model="localCommand"
              class="col q-mt-sm"
              v-bind="localCommand.componentProps || {}"
            />
            <MultiParams
              v-else
              v-model="localCommand"
              :class="
                localCommand.config?.length || localCommand.subCommands
                  ? 'col q-mt-md'
                  : 'col'
              "
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent, provide, computed } from "vue";
import VariableInput from "components/composer/common/VariableInput.vue";
import MultiParams from "components/composer/MultiParams.vue";
import CommandHead from "components/composer/card/CommandHead.vue";
import * as CardComponents from "js/composer/cardComponents";
import { newVarInputVal } from "js/composer/varInputValManager";
import ControlCommand from "components/composer/control/ControlCommand.vue";

export default defineComponent({
  name: "ComposerCard",
  components: {
    VariableInput,
    MultiParams,
    CommandHead,
    ControlCommand,
    ...CardComponents,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    commandIndex: {
      type: Number,
      required: true,
    },
  },
  emits: [
    "remove",
    "run",
    "addBranch",
    "toggle-collapse",
    "update:modelValue",
    "add-command",
    "toggle-chain-disable",
  ],
  computed: {
    localCommand: {
      get() {
        return this.modelValue || {};
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    isFirstCommandInChain() {
      if (!this.localCommand.commandChain) return false;
      return (
        this.localCommand.commandType === this.localCommand.commandChain?.[0]
      );
    },
    canToggleDisable() {
      return !this.localCommand.isControlFlow || this.isFirstCommandInChain;
    },
  },
  setup(props) {
    // 创建响应式的commandIndex
    const commandIndex = computed(() => props.commandIndex);
    // 主要用于VariableInput组件的变量选择下拉框，获取当前命令的索引
    provide("commandIndex", commandIndex);
  },
  methods: {
    handleOutputVariableUpdate(result) {
      const { outputVariable, asyncMode, callbackFunc } = result;

      if (outputVariable.name || outputVariable.details) {
        this.localCommand.outputVariable = { ...outputVariable };
      } else {
        delete this.localCommand.outputVariable;
      }

      if (asyncMode) {
        this.localCommand.asyncMode = asyncMode;
        // 如果是回调模式，添加 callbackFunc 属性
        if (callbackFunc) {
          this.localCommand.callbackFunc = callbackFunc;
          let params = [];
          if (outputVariable?.name) {
            params.push(outputVariable.name);
          }
          if (outputVariable?.details) {
            params.push(...Object.values(outputVariable.details));
          }
          this.$emit("add-command", {
            command: {
              name: callbackFunc,
              params,
              silent: true,
            },
            type: "function",
          });
        } else {
          delete this.localCommand.callbackFunc;
        }
      }
    },
    runCommand() {
      if (!this.localCommand.code)
        return quickcommand.showMessageBox("请检查参数是否正确", "info");
      // 创建一个带临时变量的命令副本
      const outputVariable = this.getAvailableOutputVariable();
      const tempCommand = {
        ...this.localCommand,
        outputVariable,
      };
      const consoleLogVars =
        this.getAvailableOutputVariableName(outputVariable);
      const tempFlows = [
        {
          name: "main",
          commands: [
            tempCommand,
            {
              //没有输出，则不打印
              code: `if(${consoleLogVars}!==undefined){
              console.log(${consoleLogVars})
            }`,
            },
          ],
        },
      ];
      this.$emit("run", tempFlows);
    },
    handleToggleCollapse() {
      if (this.localCommand.isControlFlow) {
        // 控制命令的折叠，直接传递给父组件处理
        this.$emit("toggle-collapse", {
          isCollapsed: this.localCommand.isCollapsed,
          chainId: this.localCommand.chainId,
        });
      } else {
        // 非控制命令的折叠，更新自身状态
        this.localCommand.isCollapsed = !this.localCommand.isCollapsed;
      }
    },
    handleCopy() {
      if (this.localCommand.isControlFlow && this.localCommand.chainId) {
        // 如果是控制流程命令，通知父组件复制整个链
        this.$emit("add-command", {
          command: this.localCommand,
          type: "chain",
        });
      } else {
        // 非控制流程命令的复制逻辑保持不变
        const copiedCommand = window.lodashM.cloneDeep(this.localCommand);
        delete copiedCommand.id;
        delete copiedCommand.chainId;
        delete copiedCommand.commandType;
        this.$emit("add-command", {
          command: copiedCommand,
          type: "single",
        });
      }
    },
    handleToggleDisable() {
      if (!this.canToggleDisable) return;
      if (this.localCommand.isControlFlow && this.localCommand.chainId) {
        // 如果是控制流程命令，通知父组件切换整个链的禁用状态
        this.$emit("toggle-chain-disable", {
          chainId: this.localCommand.chainId,
          disabled: !this.localCommand.disabled,
        });
      } else {
        // 非控制流程命令的禁用逻辑保持不变
        this.localCommand.disabled = !this.localCommand.disabled;
      }
    },
    getAvailableOutputVariable() {
      let outputVariable = { ...this.localCommand.outputVariable };
      if (
        window.lodashM.isEmpty(outputVariable.name) &&
        window.lodashM.isEmpty(outputVariable.details)
      ) {
        outputVariable.name = `temp_${Date.now()}`;
      }
      return outputVariable;
    },
    getAvailableOutputVariableName(outputVariable) {
      const availableVars = [
        outputVariable.name,
        ...Object.values(outputVariable.details || {}),
      ].filter((v) => v);

      const finalVars =
        availableVars.length > 1
          ? `{ ${availableVars.join(", ")} }`
          : availableVars[0];
      return finalVars;
    },
    handleAddPrint() {
      // 创建一个打印命令
      const outputVariable = this.getAvailableOutputVariable();
      this.localCommand = {
        ...this.localCommand,
        outputVariable,
      };
      const consoleLogVars =
        this.getAvailableOutputVariableName(outputVariable);

      const consoleLogCommand = {
        value: "console.log",
        label: "显示消息",
        config: [
          {
            label: "要打印的消息文本",
            component: "VariableInput",
            icon: "info",
          },
        ],
        argvs: [newVarInputVal("var", consoleLogVars)],
      };
      this.$emit("add-command", {
        command: consoleLogCommand,
        type: "single",
      });
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
  border-radius: inherit;
  position: relative;
}

/* 控制流程组件样式 */
.control-component {
  flex: 1;
  display: flex;
  align-items: center;
  width: 100%;
}

.composer-card,
.composer-card::before,
.composer-card .command-item {
  transition: none !important;
  transform: none !important;
}

.command-item {
  transition: all 0.3s ease;
  background-color: var(--transparent-bg-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: inherit;
  user-select: none;
  transform: translateZ(0);
  will-change: transform;
}

/* 暗色模式适配 */
.body--dark .command-item {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 收起状态样式 */
.composer-card.collapsed {
  transform-origin: top;
}

.composer-card.collapsed .command-item {
  min-height: 20px;
}

/* 卡片内容区域动画 */
.card-section {
  transition: padding 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px;
}

.card-section.collapsed {
  padding: 2px 8px;
}

/* 命令内容动画 */
.command-content-wrapper {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.command-content {
  min-height: 0;
  overflow: hidden;
}

.command-content-wrapper.collapsed {
  grid-template-rows: 0fr;
  margin-top: 0;
}

.command-content-wrapper.collapsed .command-content {
  opacity: 0;
}

/* 调整控制流程组件的样式 */
.command-item :deep(.condition-type-btn) {
  margin-left: -8px;
}

/* 禁用状态样式 */
.composer-card.disabled {
  position: relative;
}

/* 禁用遮罩层 */
.disabled-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(1px);
  border: 1px dashed rgba(0, 0, 0, 0.2);
  z-index: 10;
  border-radius: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.body--dark .disabled-overlay {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}

/* 斜纹背景 */
.disabled-overlay::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    -45deg,
    rgba(0, 0, 0, 0.02),
    rgba(0, 0, 0, 0.02) 10px,
    rgba(0, 0, 0, 0.04) 10px,
    rgba(0, 0, 0, 0.04) 20px
  );
  border-radius: inherit;
  pointer-events: none;
}

.enable-btn-wrapper {
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  cursor: pointer !important;
}

.disabled-overlay.showToggleBtn:hover .enable-btn-wrapper {
  opacity: 1;
  transform: scale(1);
}

.disabled-overlay.showToggleBtn:hover {
  backdrop-filter: blur(0.5px);
  border-color: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
