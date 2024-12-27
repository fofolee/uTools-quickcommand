<template>
  <div class="ubrowser-editor">
    <q-stepper
      v-model="step"
      vertical
      color="primary"
      header-nav
      animated
      alternative-labels
      flat
      class="ubrowser-stepper"
    >
      <!-- 基础参数步骤 -->
      <q-step :name="1" title="基础参数" icon="settings" :done="step > 1">
        <UBrowserBasic :configs="configs" @update:configs="updateConfigs" />
      </q-step>

      <!-- 浏览器操作步骤 -->
      <q-step :name="2" title="浏览器操作" icon="touch_app" :done="step > 2">
        <UBrowserOperations
          :configs="configs"
          @update:configs="updateConfigs"
          v-model:selected-actions="selectedActions"
          @remove-action="removeAction"
        />
      </q-step>

      <!-- 运行参数步骤 -->
      <q-step
        :name="3"
        title="运行参数"
        icon="settings_applications"
        class="q-pb-md"
      >
        <UBrowserRun :configs="configs" @update:configs="updateConfigs" />
      </q-step>
    </q-stepper>
  </div>
</template>

<style scoped>
.ubrowser-editor {
  width: 100%;
}

.ubrowser-stepper {
  box-shadow: none;
  background-color: rgba(255, 255, 255, 0.8);
}

.body--dark .ubrowser-stepper {
  background-color: rgba(255, 255, 255, 0.05);
}

.ubrowser-stepper :deep(.q-stepper__header) {
  cursor: pointer;
}

.ubrowser-stepper :deep(.q-stepper__step-inner) {
  padding-bottom: 5px;
}
</style>

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
      step: 1,
      selectedActions: [],
      configs: _.cloneDeep(defaultUBrowserConfigs),
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
