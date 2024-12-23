<template>
  <div>
    <div class="text-caption q-mb-sm">{{ label }}</div>
    <div
      v-for="(param, index) in modelValue || []"
      :key="index"
      class="row q-col-gutter-sm q-mb-sm"
    >
      <div class="col-5">
        <q-input
          :model-value="param.name"
          label="参数名"
          dense
          outlined
          @update:model-value="(value) => handleUpdate(index, 'name', value)"
        />
      </div>
      <div class="col-5">
        <q-input
          :model-value="param.value"
          label="传递给参数的值"
          dense
          outlined
          @update:model-value="(value) => handleUpdate(index, 'value', value)"
        />
      </div>
      <div class="col-2">
        <q-btn
          flat
          round
          dense
          color="negative"
          icon="remove"
          @click="removeParam(index)"
        />
      </div>
    </div>
    <q-btn
      flat
      dense
      color="primary"
      icon="add"
      label="添加参数"
      @click="addParam"
    />
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "UBrowserNamedParamList",
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  methods: {
    addParam() {
      const newValue = [...(this.modelValue || []), { name: "", value: "" }];
      this.$emit("update:modelValue", newValue);
    },
    removeParam(index) {
      const newValue = [...this.modelValue];
      newValue.splice(index, 1);
      this.$emit("update:modelValue", newValue);
    },
    handleUpdate(index, field, value) {
      const newValue = [...this.modelValue];
      newValue[index] = { ...newValue[index], [field]: value };
      this.$emit("update:modelValue", newValue);
    },
  },
});
</script>
