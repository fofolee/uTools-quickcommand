<template>
  <div class="command-composer">
    <!-- 固定头部 -->
    <div class="composer-header q-pa-sm row items-center bg-white">
      <div class="text-h6 text-weight-medium">可视化命令编排</div>
      <q-space />
      <q-btn flat round dense icon="close" v-close-popup />
    </div>

    <!-- 主体内容 -->
    <div class="composer-body row no-wrap q-pa-sm">
      <!-- 左侧命令列表 -->
      <div class="col-3">
        <div class="text-subtitle1 q-pb-sm">可用命令</div>
        <q-scroll-area style="height: calc(100vh - 200px)">
          <ComposerList
            :commands="availableCommands"
            @add-command="addCommand"
          />
        </q-scroll-area>
      </div>

      <!-- 右侧命令流程 -->
      <div class="col q-pl-md">
        <div class="text-subtitle1 q-pb-sm">命令流程</div>
        <q-scroll-area style="height: calc(100vh - 200px)">
          <ComposerFlow v-model="commandFlow" @add-command="addCommand" />
        </q-scroll-area>
      </div>
    </div>

    <!-- 固定底部 -->
    <div class="composer-footer q-pa-sm row items-center justify-end bg-white">
      <q-btn
        outline
        color="primary"
        label="运行"
        icon="play_arrow"
        class="q-mr-sm"
        @click="runCommands"
      />
      <q-btn flat label="取消" v-close-popup />
      <q-btn unelevated color="primary" label="确认" @click="applyCommands" />
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
    runCommands() {
      const code = this.generateCode();
      this.$emit("run", code);
    },
    applyCommands() {
      const code = this.generateCode();
      this.$emit("apply", code);
      this.$emit("update:modelValue", false);
    },
  },
});
</script>

<style scoped>
.command-composer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.composer-header {
  border-bottom: 1px solid #e0e0e0;
}

.composer-body {
  flex: 1;
  overflow: hidden;
  background-color: #f5f5f5;
}

.composer-footer {
  border-top: 1px solid #e0e0e0;
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
</style>
