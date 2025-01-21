<template>
  <div class="command-composer">
    <!-- 主体内容 -->
    <div class="composer-body row no-wrap">
      <!-- 左侧命令列表 -->
      <div class="command-section" style="width: 180px">
        <ComposerList :commands="availableCommands" @add-command="addCommand" />
      </div>

      <!-- 右侧命令流程 -->
      <div class="col command-section">
        <FlowTabs
          @action="handleComposer"
          :show-close-button="showCloseButton"
        />
      </div>
    </div>
    <q-inner-loading :showing="hasCommandNeedLoading && $root.isRunningCommand">
      <q-spinner-cube size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import { defineComponent, provide, ref } from "vue";
import ComposerList from "./ComposerList.vue";
import FlowTabs from "./FlowTabs.vue";
import { availableCommands } from "js/composer/composerConfig";
import { parseVariables } from "js/composer/variableManager";

export default defineComponent({
  name: "CommandComposer",
  components: {
    ComposerList,
    FlowTabs,
  },
  setup() {
    const commandFlow = ref([]);

    // 提供获取当前变量的函数，直接返回解析后的变量列表
    const getCurrentVariables = () => {
      const variables = [];
      for (const [index, cmd] of commandFlow.value.entries()) {
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
            }))
          );
        }
      }
      return variables;
    };

    provide("getCurrentVariables", getCurrentVariables);

    return {
      commandFlow,
    };
  },
  data() {
    return {
      availableCommands,
      hasCommandNeedLoading: false,
    };
  },
  props: {
    showCloseButton: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["use-composer"],
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
    handleComposer(type, code) {
      // 直接转发事件和代码
      this.$emit("use-composer", { type, code });
    },
    findCommandNeedLoading(flow) {
      // 暂时只在运行单独命令时显示载入界面，因为运行整个命令流时，如果不打印输出，是无法判断什么时候运行结束的，
      // 运行单独命令时，添加了打印流程，且showLoading参数可控
      if (!flow) return;
      return flow.some(
        (cmd) =>
          cmd.showLoading ||
          cmd.subCommands?.find((c) => c.value === cmd.value)?.showLoading
      );
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
  background: #232323;
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
