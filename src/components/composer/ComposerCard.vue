<template>
  <div
    class="composer-card"
    :class="{
      collapsed: localCommand.isCollapsed && !localCommand.isControlFlow,
    }"
    v-bind="$attrs"
  >
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
          @toggle-output="handleToggleOutput"
          @toggle-collapse="handleToggleCollapse"
          @run="runCommand"
          @remove="$emit('remove')"
        >
          <!-- 控制流程组件，直接把组件放在head中 -->
          <template v-if="localCommand.isControlFlow">
            <component
              :is="localCommand.component"
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
              :class="localCommand.config?.length ? 'col q-mt-sm' : 'col'"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent, inject, provide, computed } from "vue";
import VariableInput from "components/composer/common/VariableInput.vue";
import MultiParams from "components/composer/MultiParams.vue";
import CommandHead from "components/composer/card/CommandHead.vue";
import * as CardComponents from "js/composer/cardComponents";
import { processVariable } from "js/composer/variableManager";

export default defineComponent({
  name: "ComposerCard",
  components: {
    VariableInput,
    MultiParams,
    CommandHead,
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
  emits: ["remove", "run", "addBranch", "toggle-collapse", "update:modelValue"],
  computed: {
    localCommand: {
      get() {
        return this.modelValue || {};
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    showRunBtn() {
      return !this.command.isControlFlow;
    },
    showOutputBtn() {
      return !this.command.isControlFlow;
    },
    isLastCommandInChain() {
      if (!this.command.commandChain) return false;
      return (
        this.command.commandType === this.command.commandChain?.slice(-1)[0]
      );
    },
  },
  setup(props) {
    const getCurrentVariables = inject("getCurrentVariables");
    // 创建响应式的commandIndex
    const commandIndex = computed(() => props.commandIndex);
    // 主要用于VariableInput组件的变量选择下拉框，获取当前命令的索引
    provide("commandIndex", commandIndex);
    return { getCurrentVariables };
  },
  methods: {
    handleOutputVariableUpdate(value) {
      const result = processVariable({
        value,
        existingVars: this.getCurrentVariables().map((v) => v.name),
      });

      if (result.warning) {
        quickcommand.showMessageBox(result.warning, "info");
      }

      this.localCommand.outputVariable = result.processedValue;
    },
    handleToggleOutput() {
      this.localCommand.saveOutput = !this.localCommand.saveOutput;

      // 如果关闭输出，清空变量名
      if (!this.localCommand.saveOutput) {
        this.localCommand.outputVariable = null;
      }
    },
    runCommand() {
      // 创建一个带临时变量的命令副本
      const tempCommand = {
        ...this.localCommand,
        outputVariable:
          this.localCommand.outputVariable || `temp_${Date.now()}`,
        saveOutput: true,
      };
      this.$emit("run", tempCommand);
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

.command-item {
  transition: all 0.3s ease;
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

.body--dark .composer-card.drag-handle:hover::before {
  background: rgba(255, 255, 255, 0.1);
}

.body--dark .composer-card.drag-handle:active::before {
  background: rgba(255, 255, 255, 0.15);
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
</style>
