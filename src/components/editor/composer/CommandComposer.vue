<template>
  <div class="command-composer">
    <!-- 主体内容 -->
    <div class="composer-body row no-wrap q-pa-sm q-gutter-sm">
      <!-- 左侧命令列表 -->
      <div class="col-3 command-section">
        <div class="section-header">
          <q-icon name="list" size="20px" class="q-mr-sm text-primary" />
          <span class="text-subtitle1">可用命令</span>
        </div>
        <q-scroll-area class="command-scroll">
          <ComposerList
            :commands="availableCommands"
            @add-command="addCommand"
          />
        </q-scroll-area>
      </div>

      <!-- 右侧命令流程 -->
      <div class="col q-pl-md command-section">
        <div class="section-header">
          <q-icon name="timeline" size="20px" class="q-mr-sm text-primary" />
          <span class="text-subtitle1">命令流程</span>
          <q-space />
          <CodePreview :generate-code="generateCode" />
        </div>
        <q-scroll-area class="command-scroll">
          <ComposerFlow v-model="commandFlow" @add-command="addCommand" />
        </q-scroll-area>
      </div>
    </div>

    <!-- 固定底部 -->
    <div class="composer-footer q-pa-sm row justify-end">
      <div class="action-buttons q-gutter-sm">
        <q-btn label="取消" v-close-popup />
        <q-btn color="primary" label="插入" @click="handleComposer('insert')" />
        <q-btn color="primary" label="应用" @click="handleComposer('apply')" />
        <q-btn color="positive" label="运行" @click="handleComposer('run')" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, provide, ref } from "vue";
import ComposerList from "./ComposerList.vue";
import ComposerFlow from "./ComposerFlow.vue";
import CodePreview from "./CodePreview.vue";
import { commandCategories } from "js/composer/composerConfig";

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
    CodePreview,
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
        argvType: "string",
        saveOutput: false,
        useOutput: null,
        outputVariable: null,
        cmd: action.value || action.cmd,
        value: action.value || action.cmd,
      });
    },
    generateCode() {
      let code = [];

      this.commandFlow.forEach((cmd) => {
        let line = "";
        // TODO: 切换到变量后还是string类型
        console.log("Generating code for command:", cmd);

        if (cmd.outputVariable) {
          line += `let ${cmd.outputVariable} = `;
        }

        if (cmd.value === "ubrowser") {
          line += cmd.argv;
        } else if (cmd.useOutput !== null) {
          const outputVar = this.commandFlow[cmd.useOutput].outputVariable;
          line += `${cmd.value}(${outputVar})`;
        } else {
          const needQuotes =
            cmd.argvType === "string" && cmd.argvType !== "variable";
          const argv = needQuotes ? `"${cmd.argv}"` : cmd.argv;
          line += `${cmd.value}(${argv})`;
        }

        code.push(line);
      });

      return code.join("\n");
    },
    handleComposer(type) {
      const code = this.generateCode();
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

.section-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.body--dark .section-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.command-scroll {
  flex: 1;
  overflow: hidden;
}

.composer-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: white;
}

.body--dark .composer-footer {
  border-top-color: rgba(255, 255, 255, 0.1);
  background: #1d1d1d;
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
</style>
