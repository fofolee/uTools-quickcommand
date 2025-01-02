<template>
  <div class="flex-container">
    <div
      v-if="hasFunctionSelector"
      class="flex-item"
      :style="{ flex: command.functionSelector.width || 3 }"
    >
      <q-select
        v-model="selectedFunction"
        :options="command.functionSelector.options"
        :label="command.functionSelector.selectLabel"
        dense
        filled
        emit-value
        map-options
        @update:model-value="handleFunctionChange"
      >
        <template v-slot:prepend>
          <q-icon :name="command.icon || 'functions'" />
        </template>
      </q-select>
    </div>
    <div
      v-for="item in config"
      :key="item.key"
      class="flex-item"
      :style="{ flex: item.width || 12 }"
    >
      <VariableInput
        v-model="item.value"
        :label="item.label"
        :command="item"
        @update:model-value="handleArgvChange(item.key, $event)"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "./VariableInput.vue";

export default defineComponent({
  name: "MultiParams",
  components: {
    VariableInput,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    command: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      selectedFunction: this.command.functionSelector?.options[0]?.value || "",
      localConfig: (this.command.config || []).map((item) => ({
        ...item,
        value: item.defaultValue ?? "",
      })),
    };
  },
  computed: {
    config() {
      return this.localConfig;
    },
    hasFunctionSelector() {
      return !!this.command.functionSelector;
    },
  },
  methods: {
    generateCode() {
      const functionName = this.hasFunctionSelector
        ? this.selectedFunction
        : this.command.value;
      const args = this.config
        .map((item) => item.value)
        .filter((val) => val !== undefined && val !== "")
        .join(",");
      return `${functionName}(${args})`;
    },
    handleArgvChange(key, value) {
      const item = this.localConfig.find((item) => item.key === key);
      if (item) {
        item.value = value;
      }

      this.$emit("update:modelValue", this.generateCode());
    },
    handleFunctionChange(value) {
      this.selectedFunction = value;
      this.$emit("update:modelValue", this.generateCode());
    },
  },
  mounted() {
    if (this.command.allowEmptyArgv) {
      this.$emit("update:modelValue", this.generateCode());
    } else {
      const hasDefaultValues = this.localConfig.some(
        (item) => item.defaultValue !== undefined && item.defaultValue !== ""
      );
      if (hasDefaultValues) {
        this.$emit("update:modelValue", this.generateCode());
      }
    }
  },
});
</script>

<style scoped>
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.flex-item {
  min-width: 100px; /* 设置最小宽度以确保内容可读性 */
}

@media (max-width: 600px) {
  .flex-item {
    flex: 1 1 100% !important; /* 在小屏幕上强制换行 */
  }
}
</style>
