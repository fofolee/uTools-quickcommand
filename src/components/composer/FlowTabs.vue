<template>
  <div class="flow-tabs">
    <div class="tabs-header">
      <div class="header-content">
        <div class="tabs-container">
          <!-- main 作为固定按钮 -->
          <q-btn
            flat
            dense
            :color="activeTab === 'main' ? 'primary' : 'grey'"
            label="main"
            class="main-btn"
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
          >
            <template v-for="flow in nonMainFlows" :key="flow.id">
              <q-tab :name="flow.id" class="flow-tab">
                <div class="flow-tab-content">
                  <q-input
                    v-model="flow.name"
                    dense
                    borderless
                    class="flow-name-input"
                    @keydown.space.prevent
                    @blur="validateFlowName(flow)"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    icon="close"
                    size="xs"
                    @click.stop="removeFlow(flow)"
                  />
                </div>
              </q-tab>
            </template>
          </q-tabs>

          <q-btn
            flat
            dense
            round
            icon="add"
            size="sm"
            class="q-ml-sm add-btn"
            @click="addFlow"
          />
        </div>

        <ComposerButtons
          :generate-code="generateAllFlowCode"
          :is-all-collapsed="isAllCollapsed"
          :show-close-button="showCloseButton"
          @action="handleAction"
        />
      </div>
    </div>

    <div class="flow-container">
      <ComposerFlow
        v-for="flow in flows"
        v-show="activeTab === flow.id"
        :key="flow.id"
        v-model="flow.commands"
        :generate-code="() => generateFlowCode(flow)"
        :show-close-button="flows.length > 1"
        @action="(type, payload) => handleFlowAction(type, payload, flow)"
        ref="flowRefs"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import ComposerFlow from "./ComposerFlow.vue";
import ComposerButtons from "./flow/ComposerButtons.vue";
import { generateCode } from "js/composer/generateCode";
import { findCommandByValue } from "js/composer/composerConfig";

export default defineComponent({
  name: "FlowTabs",
  components: {
    ComposerFlow,
    ComposerButtons,
  },
  props: {
    showCloseButton: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      flows: [
        {
          id: "main",
          name: "main",
          commands: [],
        },
      ],
      activeTab: "main",
      isAllCollapsed: false,
    };
  },
  computed: {
    nonMainFlows() {
      return this.flows.filter((f) => f.id !== "main");
    },
  },
  methods: {
    addFlow() {
      const id = `flow_${this.$root.getUniqueId()}`;
      const name = `flow${this.flows.length}`;
      this.flows.push({
        id,
        name,
        commands: [],
      });
      this.activeTab = id;
      this.$nextTick(this.updateWidths);
    },
    removeFlow(flow) {
      const index = this.flows.findIndex((f) => f.id === flow.id);
      if (index > -1 && flow.id !== "main") {
        this.flows.splice(index, 1);
        this.activeTab = this.flows[0].id;
        this.$nextTick(this.updateWidths);
      }
    },
    validateFlowName(flow) {
      if (flow.id === "main") return;
      // 移除空格并确保名字唯一
      let newName = flow.name.replace(/\s+/g, "_");
      let counter = 1;
      const baseName = newName;

      while (this.flows.some((f) => f.id !== flow.id && f.name === newName)) {
        newName = `${baseName}_${counter++}`;
      }

      flow.name = newName;
    },
    generateFlowCode(flow) {
      return generateCode(flow.commands, flow.name);
    },
    generateAllFlowCode() {
      // 生成所有flow的代码
      return this.flows.map((flow) => this.generateFlowCode(flow)).join("\n\n");
    },
    handleFlowAction(type, payload, flow) {
      if (type === "close") {
        const index = this.flows.findIndex((f) => f.id === flow.id);
        if (index > -1 && this.flows.length > 1) {
          this.flows.splice(index, 1);
          this.activeTab = this.flows[0].id;
        }
      } else {
        this.handleAction(type, payload);
      }
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
        default:
          this.$emit("action", type, this.generateAllFlowCode());
      }
    },
    saveFlows() {
      const flowsData = this.flows.map((flow) => ({
        id: flow.id,
        name: flow.name,
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
      this.flows = flowsData.map((flow) => ({
        ...flow,
        commands: flow.commands.map((cmd) => {
          const command = findCommandByValue(cmd.value);
          return {
            ...command,
            ...cmd,
          };
        }),
      }));
      this.activeTab = this.flows[0].id;
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
  height: 28px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.tabs-container {
  flex: 1;
  display: flex;
  align-items: center;
  height: 100%;
  min-width: 0;
  margin-right: 8px;
}

/* 限制在当前组件内的tabs样式 */
.tabs-container :deep(.q-tabs) {
  flex: 1;
  height: 28px;
  min-height: 28px;
  overflow-x: auto;
  overflow-y: hidden;
  margin-left: 4px; /* 与 main 按钮保持间距 */
}

/* 隐藏滚动条 */
.tabs-container :deep(.q-tabs)::-webkit-scrollbar {
  display: none;
}

.tabs-container :deep(.q-tab) {
  min-height: 28px;
  height: 28px;
  padding: 0 8px;
}

.tabs-container :deep(.q-tab__content) {
  min-width: 0;
}

.flow-tab {
  min-width: 80px;
}

.flow-tab-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.flow-name-input {
  max-width: 100px;
}

.flow-name-input :deep(.q-field__native) {
  padding: 0;
  font-size: 12px;
}

/* 添加按钮样式 */
.tabs-container .q-btn {
  height: 28px;
  min-height: 28px;
}

.add-btn {
  flex-shrink: 0;
  height: 28px;
  min-height: 28px;
}

.flow-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.body--dark .tabs-header {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.main-btn {
  height: 28px;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 4px;
  flex-shrink: 0;
}
</style>
