<template>
  <div class="command-composer">
    <!-- 主体内容 -->
    <div class="composer-body row no-wrap q-pa-sm">
      <!-- 左侧命令列表 -->
      <div class="col-3 command-section">
        <div class="text-subtitle1 q-pb-sm">可用命令</div>
        <q-scroll-area class="command-scroll">
          <ComposerList
            :commands="availableCommands"
            @add-command="addCommand"
          />
        </q-scroll-area>
      </div>

      <!-- 右侧命令流程 -->
      <div class="col q-pl-md command-section">
        <div class="text-subtitle1 q-pb-sm">命令流程</div>
        <q-scroll-area class="command-scroll">
          <ComposerFlow v-model="commandFlow" @add-command="addCommand" />
        </q-scroll-area>
      </div>
    </div>

    <!-- 固定底部 -->
    <div class="composer-footer q-pa-sm q-gutter-sm row justify-end">
      <q-btn label="取消" v-close-popup />
      <q-btn color="primary" label="插入" @click="handleComposer('insert')" />
      <q-btn color="primary" label="应用" @click="handleComposer('apply')" />
      <q-btn color="positive" label="运行" @click="handleComposer('run')" />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import ComposerList from "./ComposerList.vue";
import ComposerFlow from "./ComposerFlow.vue";
import { commandCategories } from "./composerConfig";

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
  data() {
    return {
      commandFlow: [],
      nextId: 1,
      availableCommands,
    };
  },
  methods: {
    addCommand(action) {
      this.commandFlow.push({
        ...action,
        id: this.nextId++,
        argv: "",
        saveOutput: false,
        useOutput: null,
        cmd: action.value || action.cmd,
        value: action.value || action.cmd,
      });
    },
    generateCode() {
      let code = [];
      let outputVars = new Map();

      this.commandFlow.forEach((cmd, index) => {
        let line = "";
        if (cmd.saveOutput) {
          const varName = `output${index}`;
          outputVars.set(index, varName);
          line += `let ${varName} = `;
        }

        if (cmd.useOutput !== null) {
          const inputVar = outputVars.get(cmd.useOutput);
          line += `${cmd.value}(${inputVar})`;
        } else {
          const argv =
            cmd.value !== "quickcommand.sleep" ? `"${cmd.argv}"` : cmd.argv;
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
}

.command-scroll {
  flex: 1;
  overflow: hidden;
}

.composer-footer {
  border-top: 1px solid #e0e0e0;
}

.body--dark .composer-footer {
  border-top: 1px solid #676666;
}

/* 滚动美化 */
:deep(.q-scrollarea__thumb) {
  width: 6px;
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

:deep(.q-scrollarea__thumb:hover) {
  opacity: 0.8;
}

:deep(.q-scrollarea__content) {
  padding-right: 8px;
}
</style>
