<template>
  <div>
    <div class="text-caption q-mb-sm">{{ label }}</div>
    <div
      v-for="(param, index) in modelValue || []"
      :key="index"
      class="row q-col-gutter-sm q-mb-sm"
    >
      <div class="col-5">
        <VariableInput
          :model-value="param.name"
          label="参数名"
          :command="{ icon: 'label' }"
          @update:model-value="(value) => handleUpdate(index, 'name', value)"
        />
      </div>
      <div class="col-5">
        <VariableInput
          :model-value="param.value"
          label="传递给参数的值"
          :command="{ icon: 'edit' }"
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
import VariableInput from "components/composer/ui/VariableInput.vue";

export default defineComponent({
  name: "UBrowserNamedParamList",
  components: {
    VariableInput,
  },
  props: {
    modelValue: {
      type: Array,
      default: () => [{ name: "", value: "" }],
    },
    label: String,
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
