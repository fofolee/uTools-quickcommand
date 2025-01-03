<template>
  <div class="command-composer">
    <!-- 主体内容 -->
    <div class="composer-body row no-wrap">
      <!-- 左侧命令列表 -->
      <div class="col-3 command-section">
        <ComposerList :commands="availableCommands" @add-command="addCommand" />
      </div>

      <!-- 右侧命令流程 -->
      <div class="col command-section">
        <ComposerFlow
          v-model="commandFlow"
          :generate-code="generateFlowCode"
          @add-command="addCommand"
          @action="handleComposer"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, provide, ref } from "vue";
import ComposerList from "./ComposerList.vue";
import ComposerFlow from "./ComposerFlow.vue";
import { commandCategories } from "js/composer/composerConfig";
import { generateCode } from "js/composer/generateCode";
// 从commandCategories中提取所有命令
const availableCommands = commandCategories.reduce((commands, category) => {
  return commands.concat(
    category.commands.map((cmd) => ({
      type: category.label,
      ...cmd,
    }))
  );
}, []);

export default defineComponent({
  name: "CommandComposer",
  components: {
    ComposerList,
    ComposerFlow,
  },
  setup() {
    const variables = ref([]);

    const addVariable = (name, command) => {
      if (!variables.value.find((v) => v.name === name)) {
        variables.value.push({
          name,
          sourceCommand: command,
        });
      }
    };

    const removeVariable = (name) => {
      const index = variables.value.findIndex((v) => v.name === name);
      if (index !== -1) {
        variables.value.splice(index, 1);
      }
    };

    provide("composerVariables", variables);
    provide("addVariable", addVariable);
    provide("removeVariable", removeVariable);

    return {
      variables,
      addVariable,
      removeVariable,
    };
  },
  data() {
    return {
      commandFlow: [],
      nextId: 1,
      availableCommands,
    };
  },
  emits: ["use-composer", "update:modelValue"],
  methods: {
    addCommand(action) {
      this.commandFlow.push({
        ...action,
        id: this.nextId++,
        argv: "",
        saveOutput: false,
        outputVariable: null,
        cmd: action.value || action.cmd,
        value: action.value || action.cmd,
      });
    },
    generateFlowCode() {
      return generateCode(this.commandFlow);
    },
    handleComposer(type, flow) {
      const code = flow ? generateCode(flow) : generateCode(this.commandFlow);
      this.$emit("use-composer", { type, code });
      if (type !== "run") this.$emit("update:modelValue", false);
    },
  },
});
</script>

<style scoped>
.command-composer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f4f4f4;
}

.body--dark .command-composer {
  background-color: #303132;
}

.composer-body {
  flex: 1;
  overflow: hidden;
  gap: 8px;
  padding: 8px;
}

.command-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.body--dark .command-section {
  background: #1d1d1d;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 滚动美化 */
:deep(.q-scrollarea__thumb) {
  width: 2px;
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

:deep(.q-scrollarea__thumb:hover) {
  opacity: 0.8;
}

/* 动画效果 */
.command-section {
  transition: all 0.3s ease;
}

.command-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.body--dark .command-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 布局更加紧凑 */
/* 输入框高度及字体 */
.command-composer :deep(.q-field--filled:not(.q-textarea) .q-field__control),
.command-composer
  :deep(.q-field--filled:not(.q-textarea) .q-field__control > *),
.command-composer
  :deep(.q-field--filled:not(.q-field--labeled):not(.q-textarea)
    .q-field__native) {
  max-height: 36px !important;
  min-height: 36px !important;
}

.command-composer :deep(.q-field--filled .q-field__control),
.command-composer :deep(.q-field--filled .q-field__control > *),
.command-composer :deep(.q-field--filled .q-field__native) {
  border-radius: 5px;
  font-size: 12px;
}

/* 输入框图标大小 */
.command-composer :deep(.q-field--filled .q-field__control .q-icon) {
  font-size: 18px;
}

/* 输入框标签字体大小，占位时的位置 */
.command-composer :deep(.q-field--filled .q-field__label) {
  font-size: 11px;
  top: 11px;
}

/* 输入框标签悬浮的位置 */
.command-composer :deep(.q-field--filled .q-field--float .q_field__label) {
  transform: translateY(-35%) scale(0.7);
}

/* 去除filled输入框边框 */
.command-composer :deep(.q-field--filled .q-field__control:before) {
  border: none;
}

/* 去除filled输入框下划线 */
.command-composer :deep(.q-field--filled .q-field__control:after) {
  height: 0;
  border-bottom: none;
}

/* 输入框背景颜色及内边距 */
.command-composer :deep(.q-field--filled .q-field__control) {
  background: rgba(0, 0, 0, 0.03);
  padding: 0 8px;
}

/* 输入框聚焦时的背景颜色 */
.command-composer
  :deep(.q-field--filled.q-field--highlighted .q-field__control) {
  background: rgba(0, 0, 0, 0.03);
}

/* 暗黑模式下的输入框背景颜色 */
.body--dark .command-composer :deep(.q-field--filled .q-field__control) {
  background: rgba(255, 255, 255, 0.04);
}

/* 暗黑模式下输入框聚焦时的背景颜色 */
.body--dark
  .command-composer
  :deep(.q-field--filled.q-field--highlighted .q-field__control) {
  background: rgba(255, 255, 255, 0.08);
}

/* checkbox大小及字体 */
.command-composer :deep(.q-checkbox__label) {
  font-size: 12px;
}

.command-composer :deep(.q-checkbox__inner) {
  font-size: 24px;
}

/* 暗黑模式下的标签栏背景颜色 */
.body--dark .command-composer :deep(.q-tab),
.body--dark .command-composer :deep(.q-tab-panel) {
  background-color: #303133;
}

.body--dark .command-composer :deep(.q-tab--inactive) {
  opacity: 2;
}
</style>
