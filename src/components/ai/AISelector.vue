<template>
  <div class="selector-wrapper">
    <q-select
      v-if="apiOptions.length > 0"
      :model-value="modelValue"
      @update:model-value="updateModelValue($event)"
      :options="apiOptions"
      map-options
      emit-value
      dense
      options-dense
      filled
      class="ai-selector"
      :class="{ 'ai-selector--dense': dense }"
    >
      <template v-slot:prepend>
        <q-badge
          color="primary"
          text-color="white"
          class="q-mr-sm q-pa-xs"
          v-if="!dense"
        >
          模型
        </q-badge>
      </template>
      <template v-slot:append>
        <q-btn icon="settings" dense flat @click.stop="showAIConfig = true" />
      </template>
      <template v-slot:selected-item="scope">
        <div class="ellipsis">{{ scope.opt.label }}</div>
      </template>
    </q-select>
    <q-btn
      dense
      color="primary"
      class="full-width q-px-sm"
      icon="settings"
      label="配置AI接口"
      :size="dense ? 'xs' : 'md'"
      unelevated
      v-else
      @click="showAIConfig = true"
    />
    <q-dialog v-model="showAIConfig">
      <AIConfig @save="onAIConfigSave" />
    </q-dialog>
  </div>
</template>

<script>
import AIConfig from "components/ai/AIConfig.vue";
import { dbManager } from "js/utools.js";
import { defineComponent } from "vue";

export default defineComponent({
  components: { AIConfig },
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    dense: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showAIConfig: false,
      apiOptions: [],
    };
  },
  methods: {
    onAIConfigSave() {
      this.apiOptions = this.getApiOptions();
      const newApiConfig = this.apiOptions.find(
        (option) => option.value.id === this.modelValue.id
      );
      const newModelValue =
        newApiConfig?.value || this.apiOptions[0].value || {};
      this.updateModelValue({ ...newModelValue });
    },
    updateModelValue(value) {
      this.$emit("update:modelValue", value);
    },
    getApiOptions() {
      const apiConfigs = dbManager.getStorage("cfg_aiConfigs");
      if (!apiConfigs) return [];
      return apiConfigs.map((config) => {
        return {
          label: config.name,
          value: config,
        };
      });
    },
  },
  mounted() {
    this.apiOptions = this.getApiOptions();
    if (!this.modelValue?.id) {
      this.updateModelValue(this.apiOptions[0]?.value || {});
    }
  },
});
</script>

<style scoped>
.selector-wrapper {
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.ai-selector {
  width: 100%;
}

.ai-selector--dense {
  font-size: 12px;
}

:deep(.q-field__native) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.ai-selector--dense :deep(.q-field__control) {
  padding: 0;
}

.ai-selector--dense :deep(.q-field__control),
.ai-selector--dense :deep(.q-field__control > *),
.ai-selector--dense :deep(.q-field__native) {
  max-height: 26px !important;
  min-height: 26px !important;
}

.ai-selector--dense :deep(.q-field__native) {
  padding: 0 0 0 5px;
}

.ai-selector--dense :deep(.q-field__append) {
  padding: 0;
}
</style>
