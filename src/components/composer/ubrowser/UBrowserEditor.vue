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
    <q-tab-panels v-model="step" class="ubrowser-panels">
      <q-tab-panel name="1" class="panel-content">
        <UBrowserBasic :configs="configs" @update:configs="updateConfigs" />
      </q-tab-panel>

      <q-tab-panel name="2" class="panel-content">
        <UBrowserOperations
          :configs="configs"
          :selected-actions="selectedActions"
          @update:configs="updateConfigs"
          @update:selected-actions="(val) => (selectedActions = val)"
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
import { defineComponent, ref, computed } from "vue";
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
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    // 基础状态
    const step = ref("1");
    const selectedActions = ref([]);

    // 初始化配置，确保包含 run 参数
    const localConfigs = ref(window.lodashM.cloneDeep(defaultUBrowserConfigs));
    if (props.modelValue?.argvs) {
      // 合并配置，保留默认的 run 参数
      localConfigs.value = {
        ...localConfigs.value,
        ...props.modelValue.argvs,
        run: {
          ...localConfigs.value.run,
          ...props.modelValue.argvs.run,
        },
      };
    }

    // 计算 argvs
    const argvs = computed({
      get: () => localConfigs.value,
      set: (val) => {
        // 确保保留 run 参数
        const newConfigs = {
          ...val,
          run: {
            ...localConfigs.value.run,
            ...val.run,
          },
        };
        localConfigs.value = newConfigs;
        emit("update:modelValue", {
          ...props.modelValue,
          argvs: newConfigs,
          code: generateUBrowserCode(newConfigs, selectedActions.value),
        });
      },
    });

    // 更新配置
    const updateConfigs = (newConfigs) => {
      argvs.value = window.lodashM.cloneDeep(newConfigs);
    };

    // 移除操作
    const removeAction = (action) => {
      selectedActions.value = selectedActions.value.filter(
        (a) => a.id !== action.id
      );
      const newConfigs = { ...argvs.value };
      delete newConfigs[action.value];
      argvs.value = newConfigs;
    };

    return {
      step,
      selectedActions,
      configs: argvs,
      updateConfigs,
      removeAction,
    };
  },
});
</script>

<style>
.ubrowser-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.ubrowser-tabs {
  flex-shrink: 0;
}

.ubrowser-panels {
  flex: 1;
  overflow: auto;
}

.panel-content {
  padding: 16px;
  min-height: 200px;
}

.ubrowser-panels :deep(.q-tab-panel) {
  padding: 0;
}

.ubrowser-tabs :deep(.q-tab) {
  min-height: 40px;
  padding: 0 16px;
}

.ubrowser-tabs :deep(.q-tab__icon) {
  font-size: 20px;
}

.ubrowser-tabs :deep(.q-tab__label) {
  font-size: 14px;
  line-height: 1.2;
  margin-left: 8px;
}
</style>
