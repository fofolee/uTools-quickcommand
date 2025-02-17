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
