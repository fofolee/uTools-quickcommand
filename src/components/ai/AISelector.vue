<template>
  <div>
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
    >
      <template v-slot:prepend>
        <q-badge color="primary" text-color="white" class="q-mr-sm q-pa-xs">
          模型
        </q-badge>
      </template>
      <template v-slot:append>
        <q-btn icon="settings" dense flat @click.stop="showAIConfig = true" />
      </template>
    </q-select>
    <q-btn
      dense
      color="primary"
      class="full-width q-px-sm"
      icon="settings"
      label="配置AI接口"
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
import AIConfig from "components/popup/AIConfig.vue";
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
    if (!this.modelValue.id) {
      this.updateModelValue(this.apiOptions[0]?.value || {});
    }
  },
});
</script>
