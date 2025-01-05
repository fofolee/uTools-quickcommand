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
import {
  availableCommands,
  findCommandByValue,
} from "js/composer/composerConfig";
import { generateCode } from "js/composer/generateCode";

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
      availableCommands,
    };
  },
  emits: ["use-composer", "update:modelValue"],
  methods: {
    addCommand(action) {
      let newAction = window.lodashM.cloneDeep(action);
      this.commandFlow.push({
        ...newAction,
        id: this.$root.getUniqueId(),
        saveOutput: false,
        outputVariable: null,
      });
    },
    generateFlowCode() {
      return generateCode(this.commandFlow);
    },
    handleComposer(type, flow) {
      if (type === "save") return this.saveFlow();
      if (type === "load") return this.loadFlow();
      const code = flow ? generateCode(flow) : generateCode(this.commandFlow);
      this.$emit("use-composer", { type, code });
      if (type !== "run") return this.$emit("update:modelValue", false);
      if (!code.includes("console.log")) quickcommand.showMessageBox("已运行");
    },
    saveFlow() {
      const flow = window.lodashM.cloneDeep(this.commandFlow);
      const uselessProps = ["config", "argvs", "label", "type"];
      // 移除不必要属性
      flow.forEach((cmd) => {
        for (const props of uselessProps) {
          delete cmd[props];
        }
      });
      localStorage.setItem("quickcomposer.flow", JSON.stringify(flow));
      quickcommand.showMessageBox("保存成功");
    },
    loadFlow() {
      const savedFlow = localStorage.getItem("quickcomposer.flow");
      if (!savedFlow) return;
      this.commandFlow = JSON.parse(savedFlow).map((cmd) => {
        // 获取完整命令
        const command = findCommandByValue(cmd.value);
        return {
          ...command,
          ...cmd,
        };
      });
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
</style>
