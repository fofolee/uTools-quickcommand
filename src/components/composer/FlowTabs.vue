<template>
  <div class="flow-tabs">
    <div class="tabs-header">
      <div class="tabs-container">
        <!-- main 作为固定按钮 -->
        <q-btn
          flat
          dense
          label="主流程"
          class="main-btn"
          :class="{ 'main-btn-active': activeTab === 'main' }"
          @click="activeTab = 'main'"
        />

        <!-- 其他流程标签可滚动 -->
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
          outside-arrows
        >
          <draggable
            v-model="subFlows"
            :animation="150"
            item-key="id"
            tag="div"
            class="row no-wrap"
            handle=".flow-tab-content"
          >
            <template #item="{ element: flow }">
              <q-tab :name="flow.id" class="flow-tab" no-caps>
                <div class="flow-tab-content">
                  <template v-if="flow.isEditing">
                    <q-input
                      v-model="flow.label"
                      dense
                      borderless
                      class="flow-name-input"
                      @keydown.space.prevent
                      @blur="finishEdit(flow)"
                      @keyup.enter="finishEdit(flow)"
                      ref="inputRefs"
                    />
                  </template>
                  <template v-else>
                    <span class="flow-name-text" @dblclick="startEdit(flow)">{{
                      flow.label
                    }}</span>
                  </template>
                  <q-btn
                    flat
                    dense
                    round
                    icon="close"
                    size="xs"
                    @click.stop="removeFlow(flow)"
                  />
                </div>
                <q-tooltip> 双击修改名称，拖动排序 </q-tooltip>
              </q-tab>
            </template>
          </draggable>
        </q-tabs>

        <q-icon dense name="add" class="add-btn" @click="addFlow" />
      </div>

      <ComposerButtons
        :generate-code="generateAllFlowCode"
        :is-all-collapsed="isAllCollapsed"
        :show-close-button="showCloseButton"
        @action="handleAction"
      />
    </div>

    <div
      class="flow-container"
      v-for="flow in flows"
      :key="flow.id"
      v-show="activeTab === flow.id"
    >
      <ComposerFlow
        class="flow-wrapper"
        v-model="flow.commands"
        :generate-code="() => generateFlowCode(flow)"
        :show-close-button="flows.length > 1"
        @action="(type, payload) => handleAction(type, payload)"
        ref="flowRefs"
      />
      <VariableManager
        v-model="showVariableManager"
        :variables="flow.customVariables"
        @update:variables="flow.customVariables = $event"
        :is-main-flow="flow.id === 'main'"
        :output-variables="outputVariables"
        class="variable-panel"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent, provide, ref, computed } from "vue";
import ComposerFlow from "./ComposerFlow.vue";
import ComposerButtons from "./flow/ComposerButtons.vue";
import VariableManager from "./flow/VariableManager.vue";
import { generateCode } from "js/composer/generateCode";
import { findCommandByValue } from "js/composer/composerConfig";
import { generateUniqSuffix } from "js/composer/variableManager";
import draggable from "vuedraggable";
import { parseVariables } from "js/composer/variableManager";
export default defineComponent({
  name: "FlowTabs",
  components: {
    ComposerFlow,
    ComposerButtons,
    draggable,
    VariableManager,
  },
  props: {
    showCloseButton: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const mainFlow = ref({
      id: "main",
      name: "main",
      label: "主流程",
      commands: [],
      customVariables: [],
    });

    const subFlows = ref([]);

    // 获取所有函数
    const getCurrentFunctions = () => {
      return subFlows.value.map((flow) => {
        return {
          label: flow.label,
          value: flow.name,
          id: flow.id,
        };
      });
    };
    provide("getCurrentFunctions", getCurrentFunctions);

    const flows = computed(() => [mainFlow.value, ...subFlows.value]);

    const activeTab = ref("main");

    const getCurrentFlow = () => {
      return flows.value.find((flow) => flow.id === activeTab.value);
    };

    // 获取当前函数所有输出变量
    const getOutputVariables = (flow = getCurrentFlow()) => {
      const variables = [];
      for (const [index, cmd] of flow.commands.entries()) {
        if (cmd.saveOutput && cmd.outputVariable) {
          variables.push(
            ...parseVariables(cmd.outputVariable).map((variable) => ({
              name: variable,
              // 提供来源命令的标志信息
              sourceCommand: {
                label: cmd.label,
                id: cmd.id,
                index,
              },
              type: "output",
            }))
          );
        }
      }
      return variables;
    };

    const getFunctionParams = (flowId) => {
      const flow = flows.value.find((f) => f.id === flowId);
      return flow.customVariables.filter((v) => v.type === "param");
    };

    provide("getFunctionParams", getFunctionParams);

    /**
     * 获取当前函数所有变量
     * 返回格式：
     * [
     *   { name: "变量名", type: "变量类型", sourceCommand: { label: "变量来源" , index?: 来源命令索引, id?: 来源命令id} }
     * ]
     */
    const getCurrentVariables = () => {
      const currentFlow = getCurrentFlow();
      const variables = getOutputVariables(currentFlow);
      const customVariables = currentFlow.customVariables.map((v) => ({
        name: v.name,
        type: v.type,
        sourceCommand: {
          label: v.type === "param" ? "函数参数" : "局部变量",
        },
      }));
      return [...customVariables, ...variables];
    };

    provide("getCurrentVariables", getCurrentVariables);

    return {
      flows,
      mainFlow,
      subFlows,
      activeTab,
      getOutputVariables,
    };
  },
  data() {
    return {
      isAllCollapsed: false,
      showVariableManager: false,
      outputVariables: [],
    };
  },
  methods: {
    generateFlowName(baseName = "func_") {
      return (
        baseName +
        generateUniqSuffix(
          baseName,
          this.flows.map((f) => f.name),
          false
        )
      );
    },
    addFlow() {
      const id = this.$root.getUniqueId();
      const name = this.generateFlowName();
      this.subFlows.push({
        id,
        name,
        label: name.replace("func_", "函数"),
        commands: [],
        customVariables: [],
      });
      this.activeTab = id;
    },
    removeFlow(flow) {
      const index = this.subFlows.findIndex((f) => f.id === flow.id);
      if (index > -1) {
        this.subFlows.splice(index, 1);
        this.activeTab = this.flows[0].id;
      }
    },
    generateFlowCode(flow) {
      return generateCode(flow);
    },
    generateAllFlowCode() {
      // 生成所有flow的代码
      return [...this.subFlows, this.mainFlow]
        .map((flow) => this.generateFlowCode(flow))
        .join("\n\n");
    },
    handleAction(type, payload) {
      switch (type) {
        case "save":
          this.saveFlows();
          break;
        case "load":
          this.loadFlows();
          break;
        case "run":
          this.runFlows(payload);
          break;
        case "collapseAll":
          this.collapseAll();
          break;
        case "expandAll":
          this.expandAll();
          break;
        case "toggleVariableManager":
          this.showVariableManager = !this.showVariableManager;
          this.outputVariables = this.getOutputVariables();
          break;
        default:
          this.$emit("action", type, this.generateAllFlowCode());
      }
    },
    saveFlows() {
      const flowsData = this.flows.map((flow) => ({
        ...flow,
        commands: flow.commands.map((cmd) => {
          const cmdCopy = { ...cmd };
          // 移除不必要的属性
          const uselessProps = [
            "config",
            "code",
            "label",
            "component",
            "subCommands",
            "options",
            "defaultValue",
            "icon",
            "width",
            "placeholder",
          ];
          uselessProps.forEach((prop) => delete cmdCopy[prop]);
          return cmdCopy;
        }),
      }));
      localStorage.setItem("quickcomposer.flows", JSON.stringify(flowsData));
      quickcommand.showMessageBox("保存成功");
    },
    loadFlows() {
      const savedFlows = localStorage.getItem("quickcomposer.flows");
      if (!savedFlows) return;

      const flowsData = JSON.parse(savedFlows);
      const newFlows = flowsData.map((flow) => ({
        ...flow,
        commands: flow.commands.map((cmd) => {
          const command = findCommandByValue(cmd.value);
          return {
            ...command,
            ...cmd,
          };
        }),
      }));
      this.mainFlow = newFlows[0];
      this.subFlows = newFlows.slice(1);
      this.activeTab = this.mainFlow.id;
    },
    runFlows(flow) {
      const code = flow
        ? this.generateFlowCode(flow)
        : this.generateAllFlowCode();
      this.$emit("action", "run", code);
      if (!code.includes("console.log")) {
        quickcommand.showMessageBox("已运行");
      }
    },
    collapseAll() {
      this.$refs.flowRefs.forEach((flow) => {
        if (flow.collapseAll) flow.collapseAll();
      });
      this.isAllCollapsed = true;
    },
    expandAll() {
      this.$refs.flowRefs.forEach((flow) => {
        if (flow.expandAll) flow.expandAll();
      });
      this.isAllCollapsed = false;
    },
    startEdit(flow) {
      flow.isEditing = true;
      this.$nextTick(() => {
        const input = this.$refs.inputRefs?.[0];
        if (input) {
          input.focus();
        }
      });
    },
    finishEdit(flow) {
      flow.isEditing = false;
      if (!flow.label) {
        flow.label = this.generateFlowName().replace("func_", "函数");
      }
    },
  },
});
</script>

<style scoped>
.flow-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tabs-header {
  flex-shrink: 0;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.tabs-container {
  flex: 1;
  display: flex;
  align-items: center;
  height: 100%;
  min-width: 0;
  width: 0;
}

/* 限制在当前组件内的tabs样式 */
.tabs-container :deep(.q-tabs) {
  height: 30px;
  min-height: 30px;
  min-width: 0;
  width: auto;
  max-width: 100%;
}

.body--dark .tabs-container :deep(.q-tabs) {
  background-color: #232323 !important;
}

.tabs-container :deep(.q-tab) {
  min-height: 30px;
  height: 30px;
  padding: 0;
  text-align: center;
  background-color: transparent;
}

.tabs-container
  :deep(.q-tabs--scrollable.q-tabs__arrows--outside.q-tabs--horizontal) {
  padding: 0 15px;
}

.tabs-container :deep(.q-tabs__arrow) {
  min-width: 0;
  width: 15px;
  font-size: 15px;
}

.tabs-container :deep(.q-tab__content) {
  min-width: 0;
  width: 100%;
}

.flow-tab {
  min-width: 80px;
  max-width: 120px;
}

.flow-tab-content {
  display: flex;
  align-items: center;
  user-select: none;
  width: 100%;
}

.flow-name-input {
  max-width: 100%;
  min-width: 0;
}

.flow-name-input :deep(.q-field__control),
.flow-name-input :deep(.q-field__control *) {
  font-size: 12px;
  height: 30px;
  text-align: center;
}

.flow-name-text {
  font-size: 12px;
  padding: 0 2px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

/* 添加按钮样式 */
.add-btn {
  flex-shrink: 0;
  padding: 0 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.add-btn:hover {
  color: var(--q-primary);
  transform: scale(1.2);
  transition: all 0.2s ease-in-out;
}

.flow-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.flow-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  height: 100%;
}

.variable-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
}

.main-btn {
  height: 30px;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 8px 0 0 0;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
  color: var(--q-text-color);
}

.main-btn-active {
  color: var(--q-primary);
  border-bottom: 2px solid var(--q-primary);
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>
