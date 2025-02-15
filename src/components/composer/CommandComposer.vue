<template>
  <div class="command-composer">
    <!-- 主体内容 -->
    <div class="composer-body row no-wrap">
      <!-- 左侧命令列表 -->
      <div class="command-section" style="width: 180px">
        <ComposerList :commands="availableCommands" />
      </div>

      <!-- 右侧命令流程 -->
      <div class="col command-section">
        <FlowTabs
          @action="handleAction"
          :disabled-control-buttons="disabledControlButtons"
          :model-value="modelValue"
          @update:model-value="$emit('update:modelValue', $event)"
        />
      </div>
    </div>
    <q-inner-loading :showing="hasCommandNeedLoading && $root.isRunningCommand">
      <q-spinner-cube size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import ComposerList from "./ComposerList.vue";
import FlowTabs from "./FlowTabs.vue";
import { availableCommands } from "js/composer/composerConfig";

export default defineComponent({
  name: "CommandComposer",
  components: {
    ComposerList,
    FlowTabs,
  },
  data() {
    return {
      availableCommands,
      hasCommandNeedLoading: false,
    };
  },
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
  emits: ["action", "update:modelValue"],
  methods: {
    handleAction(actionType, actionData) {
      // 直接转发事件和代码
      this.$emit("action", actionType, actionData);
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
  background-color: var(--utools-bg-color);
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
