<template>
  <q-input
    v-if="!options"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    filled
    dense
    class="output-field"
    :placeholder="placeholder"
    :autofocus="autofocus"
  >
    <template v-slot:prepend>
      <div class="variable-label">{{ label }}</div>
    </template>
  </q-input>
  <q-select
    v-else
    :model-value="modelValue"
    :options="options"
    filled
    dense
    emit-value
    map-options
    class="output-field"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "OutputField",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    label: {
      type: String,
    },
    placeholder: {
      type: String,
      default: "",
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    options: {
      type: null,
      default: null,
    },
  },
  emits: ["update:modelValue"],
});
</script>

<style scoped>
.variable-label {
  font-size: 12px;
  border-radius: 4px;
  padding-right: 10px;
  text-align: center;
}

.output-field :deep(.q-field__control),
.output-field :deep(.q-field__control > *),
.output-field :deep(.q-field__native) {
  max-height: 36px;
  min-height: 36px;
  border-radius: 5px;
  font-size: 12px;
}

/* 去除filled输入框边框 */
.output-field :deep(.q-field__control:before) {
  border: none;
}

/* 去除filled输入框下划线 */
.output-field :deep(.q-field__control:after) {
  height: 0;
  border-bottom: none;
}
</style>
