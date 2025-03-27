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
          @dblclick="editFunction(mainFlow)"
          :class="{ 'main-btn-active': activeTab === 'main' }"
          @click="activeTab = 'main'"
        >
          <q-tooltip>双击管理</q-tooltip>
        </q-btn>

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
                  <span class="flow-name-text" @dblclick="editFunction(flow)">
                    {{ flow.label }}
                  </span>
                  <q-btn
                    flat
                    dense
                    round
                    icon="close"
                    size="xs"
                    @click.stop="removeFlow(flow)"
                  />
                </div>
                <q-tooltip> 双击管理 </q-tooltip>
              </q-tab>
            </template>
          </draggable>
        </q-tabs>

        <q-icon dense name="add" class="add-btn" @click="addFlow" />
      </div>

      <ComposerButtons
        :is-all-collapsed="isAllCollapsed"
        :disabled-buttons="disabledControlButtons"
        :flows="flows"
        @action="handleAction"
      />
    </div>

    <div
      class="flow-container"
      v-for="flow in flows"
      :key="flow.id"
      v-show="activeTab === flow.id"
    >
      <CommandConfig
        class="command-config-panel"
        v-if="flow.id === 'main' && showCommandConfig"
        :model-value="commandConfig"
        from="quickcomposer"
        @update:model-value="updateCommandConfig"
      />
      <ComposerFlow
        class="flow-wrapper"
        v-model="flow.commands"
        :show-close-button="flows.length > 1"
        @action="(type, payload) => handleAction(type, payload)"
        ref="flowRefs"
      />
      <FlowManager
        v-model="showFlowManager"
        :flow="flow"
        :variables="flow.customVariables"
        @update-flow="updateFlows(flow)"
        :is-main-flow="flow.id === 'main'"
        :output-variables="outputVariables"
        :global-variables="pluginGlobalVariables"
        class="variable-panel"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent, provide, ref, computed } from "vue";
import { useRoute } from "vue-router";
import draggable from "vuedraggable";
import ComposerFlow from "components/composer/ComposerFlow.vue";
import ComposerButtons from "components/composer/flow/ComposerButtons.vue";
import FlowManager from "components/composer/flow/FlowManager.vue";
import CommandConfig from "components/editor/CommandConfig.vue";
import { generateUniqSuffix } from "js/composer/variableManager";
import { getUniqueId } from "js/common/uuid";

export default defineComponent({
  name: "FlowTabs",
  components: {
    ComposerFlow,
    ComposerButtons,
    draggable,
    FlowManager,
    CommandConfig,
  },
  emits: ["update:modelValue", "action"],
  props: {
    disabledControlButtons: {
      type: Array,
      default: () => [],
    },
    modelValue: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const updateFlows = (newFlows) => {
      emit("update:modelValue", {
        ...props.modelValue,
        flows: newFlows,
      });
    };

    const defaultFlow = [
      {
        id: "main",
        name: "main",
        label: "主流程",
        commands: [],
        customVariables: [],
      },
    ];

    const clearFlows = () => {
      updateFlows(window.lodashM.cloneDeep(defaultFlow));
      activeTab.value = "main";
    };

    if (!props.modelValue.flows || props.modelValue.flows.length === 0) {
      updateFlows(window.lodashM.cloneDeep(defaultFlow));
    }

    const flows = computed(() => props.modelValue.flows || []);

    const commandConfig = computed(() => {
      const { tags, output, features, program } = props.modelValue;
      return { tags, output, features, program };
    });

    const mainFlow = computed({
      get: () => flows.value[0],
      set: (newVal) => {
        const newFlows = [newVal, ...flows.value.slice(1)];
        updateFlows(newFlows);
      },
    });

    const subFlows = computed({
      get: () => flows.value.slice(1),
      set: (newVal) => {
        const newFlows = [mainFlow.value, ...newVal];
        updateFlows(newFlows);
      },
    });

    // 获取所有函数
    const getCurrentFunctions = () => {
      return subFlows.value.map((flow) => {
        return {
          label: flow.label,
          name: flow.name,
          id: flow.id,
        };
      });
    };
    provide("getCurrentFunctions", getCurrentFunctions);

    const activeTab = ref("main");

    const getCurrentFlow = () => {
      return flows.value.find((flow) => flow.id === activeTab.value);
    };

    const route = useRoute();

    const isRunComposerPage = computed(() => {
      return route.name === "composer";
    });

    const pluginGlobalVariables = computed(() => {
      if (isRunComposerPage.value) return [];
      return [
        {
          name: "quickcommand.enterData.type",
          sourceCommand: {
            label: "匹配模式",
          },
          description:
            "以什么模式进入插件，可能的值：\n" +
            "关键字：text\n" +
            "正则匹配：regex\n" +
            "所有文本：over\n" +
            "图片匹配：img\n" +
            "文件匹配：files\n" +
            "窗口匹配：window",
          type: "global",
        },

        {
          name: "quickcommand.enterData.payload",
          sourceCommand: {
            label: "匹配内容",
          },
          description:
            "根据不同的匹配模式，返回不同的内容：\n" +
            "关键字(text)：返回进入插件的关键字\n" +
            "正则(regex)：返回匹配的文本\n" +
            "所有文本(over)：返回匹配的文本\n" +
            "窗口(window)：返回匹配的窗口信息(对象)\n" +
            "文件(files)：返回匹配的文件信息(数组)\n" +
            "图片(img)：返回匹配的图片信息(dataURL)",
          type: "global",
        },
      ];
    });

    // 获取当前函数所有输出变量
    const getOutputVariables = (flow = getCurrentFlow()) => {
      const variables = [];
      for (const [index, cmd] of flow.commands.entries()) {
        if (cmd.outputVariable && cmd.asyncMode !== "then") {
          const { name, details = {} } = cmd.outputVariable;
          variables.push(
            ...[name, ...Object.values(details)]
              .filter((v) => v)
              .map((variable) => ({
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
     *
     * type:
     * 1. output: 输出变量
     * 2. param: 函数参数
     * 3. var: 局部变量
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
      return [...pluginGlobalVariables.value, ...customVariables, ...variables];
    };

    provide("getCurrentVariables", getCurrentVariables);

    return {
      flows,
      mainFlow,
      subFlows,
      commandConfig,
      activeTab,
      getOutputVariables,
      pluginGlobalVariables,
      updateFlows,
      clearFlows,
      isRunComposerPage,
    };
  },
  data() {
    return {
      isAllCollapsed: false,
      showFlowManager: false,
      outputVariables: [],
    };
  },
  computed: {
    showCommandConfig() {
      return !this.isRunComposerPage && !!this.commandConfig.features;
    },
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
    addFlow(options = {}) {
      const id = getUniqueId();
      const name = options.name || this.generateFlowName();
      const newFlow = {
        id,
        name,
        label: name.replace("func_", "函数"),
        commands: [],
        customVariables: [],
      };

      // 添加函数参数
      if (options.params) {
        options.params.forEach((param) => {
          newFlow.customVariables.push({
            name: param,
            type: "param",
          });
        });
      }

      this.subFlows = [...this.subFlows, newFlow];

      if (options.silent) {
        return;
      }

      this.activeTab = id;
      this.$nextTick(() => {
        this.toggleFlowManager();
      });
    },
    removeFlow(flow) {
      const index = this.subFlows.findIndex((f) => f.id === flow.id);
      if (index > -1) {
        this.subFlows = [
          ...this.subFlows.slice(0, index),
          ...this.subFlows.slice(index + 1),
        ];
        this.activeTab = this.flows[0].id;
      }
    },
    updateSubFlow(index, payload) {
      const { params } = payload;
      const newParams = params.map((param) => ({
        name: param,
        type: "param",
      }));
      const localVars = this.subFlows[index].customVariables.filter(
        (v) => v.type === "var"
      );
      // 完全更新参数
      this.subFlows[index].customVariables = [...newParams, ...localVars];
    },
    handleAction(type, payload) {
      switch (type) {
        case "save":
          this.saveFlows();
          break;
        case "run":
          this.runCommand(payload);
          break;
        case "collapseAll":
          this.collapseAll();
          break;
        case "expandAll":
          this.expandAll();
          break;
        case "toggleFlowManager":
          this.toggleFlowManager();
          break;
        case "close":
          this.$emit("action", "close");
          break;
        case "apply":
          this.$emit("action", "apply", payload);
          break;
        case "addFlow":
          // 处理新函数创建
          const index = this.subFlows.findIndex((f) => f.name === payload.name);
          if (index > -1) {
            // 如果函数已存在，则更新
            this.updateSubFlow(index, payload);
          } else {
            this.addFlow(payload);
          }
          break;
        case "clear":
          this.clearFlows();
          break;
        default:
          this.$emit("action", type, payload);
      }
    },
    toggleFlowManager() {
      this.showFlowManager = !this.showFlowManager;
      this.outputVariables = this.getOutputVariables();
    },
    saveFlows() {
      this.$emit("action", "save", {
        ...this.modelValue,
        flows: this.flows,
      });
    },
    runCommand(flows = this.flows) {
      const command = {
        ...this.modelValue,
        flows,
      };
      this.$emit("action", "run", command);
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
    editFunction(flow) {
      this.activeTab = flow.id;
      this.toggleFlowManager();
    },
    updateCommandConfig(newVal) {
      const newModelValue = {
        ...this.modelValue,
        ...newVal,
      };
      this.$emit("update:modelValue", newModelValue);
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
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.command-config-panel {
  flex-shrink: 0;
  padding: 8px;
  z-index: 1;
}

.flow-wrapper {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
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
