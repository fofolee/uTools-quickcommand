<template>
  <div class="multi-param-input row q-col-gutter-sm">
    <div
      v-for="item in config"
      :key="item.key"
      :class="['param-item', `col-${item.width || 12}`]"
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
  name: "MultiParamInput",
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
  computed: {
    config() {
      return this.command.config || [];
    },
  },
  methods: {
    handleArgvChange(key, value) {
      // 收集所有参数的当前值
      const args = this.config.reduce((acc, item) => {
        acc[item.key] = item.key === key ? value : item.value ?? "";
        return acc;
      }, {});

      // 按照配置顺序拼接参数值
      const argv = this.config
        .map((item) => args[item.key])
        .filter((val) => val !== undefined && val !== "")
        .join(",");

      this.$emit("update:modelValue", argv);
    },
  },
});
</script>

<style scoped>
.multi-param-input {
  width: 100%;
}

.param-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.param-item :deep(.q-field) {
  margin-bottom: 0;
}
</style>
