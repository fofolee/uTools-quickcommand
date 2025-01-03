<template>
  <div class="ubrowser-editor">
    <!-- 标签页导航 -->
    <q-tabs
      v-model="step"
      class="ubrowser-tabs"
      dense
      align="left"
      narrow-indicator
      inline-label
    >
      <q-tab name="1" icon="settings" label="基础参数" size="sm" />
      <q-tab name="2" icon="touch_app" label="浏览器操作" size="sm" />
      <q-tab name="3" icon="settings_applications" label="运行参数" size="sm" />
    </q-tabs>

    <!-- 内容区域 -->
    <q-tab-panels v-model="step" animated swipeable class="ubrowser-panels">
      <q-tab-panel name="1" class="panel-content">
        <UBrowserBasic :configs="configs" @update:configs="updateConfigs" />
      </q-tab-panel>

      <q-tab-panel name="2" class="panel-content">
        <UBrowserOperations
          :configs="configs"
          @update:configs="updateConfigs"
          v-model:selected-actions="selectedActions"
          @remove-action="removeAction"
        />
      </q-tab-panel>

      <q-tab-panel name="3" class="panel-content">
        <UBrowserRun :configs="configs" @update:configs="updateConfigs" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import UBrowserBasic from "./UBrowserBasic.vue";
import UBrowserOperations from "./UBrowserOperations.vue";
import UBrowserRun from "./UBrowserRun.vue";
import { defaultUBrowserConfigs } from "js/composer/ubrowserConfig";
import { generateUBrowserCode } from "js/composer/generateUBrowserCode";

export default defineComponent({
  name: "UBrowserEditor",
  components: {
    UBrowserBasic,
    UBrowserOperations,
    UBrowserRun,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      step: "1",
      selectedActions: [],
      configs: window.lodashM.cloneDeep(defaultUBrowserConfigs),
    };
  },
  methods: {
    updateConfigs(newConfigs) {
      this.configs = newConfigs;
    },
    removeAction(action) {
      const newActions = this.selectedActions.filter((a) => a.id !== action.id);
      this.selectedActions = newActions;
      const newConfigs = { ...this.configs };
      delete newConfigs[action.value];
      this.configs = newConfigs;
    },
  },
  watch: {
    configs: {
      deep: true,
      handler() {
        this.$emit(
          "update:modelValue",
          generateUBrowserCode(this.configs, this.selectedActions)
        );
      },
    },
    selectedActions: {
      handler() {
        this.$emit(
          "update:modelValue",
          generateUBrowserCode(this.configs, this.selectedActions)
        );
      },
    },
    step: {
      handler() {
        this.$emit(
          "update:modelValue",
          generateUBrowserCode(this.configs, this.selectedActions)
        );
      },
    },
  },
});
</script>

<style scoped>
.ubrowser-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.ubrowser-tabs {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px 4px 0 0;
  flex-shrink: 0;
}

.ubrowser-panels {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0 0 4px 4px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}


/* 调整面板内边距和布局 */
.ubrowser-panels :deep(.q-tab-panel) {
  padding: 8px;
  height: 100%;
  min-height: 0;
}

/* 面板内容区域 */
.panel-content {
  height: 100%;
  overflow: auto;
}

/* 调整标签页样式 */
.ubrowser-tabs :deep(.q-tab) {
  min-height: 36px;
  padding: 0 12px;
}

.ubrowser-tabs :deep(.q-tab__content) {
  min-width: 0;
  flex-direction: row;
  gap: 4px;
}

.ubrowser-tabs :deep(.q-tab__label) {
  font-size: 12px;
  line-height: 1;
}

.ubrowser-tabs :deep(.q-tab__icon) {
  font-size: 16px;
  margin: 0;
}
</style>
