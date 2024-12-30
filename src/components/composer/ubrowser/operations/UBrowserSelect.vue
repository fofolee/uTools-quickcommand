<template>
  <q-select
    :model-value="modelValue"
    :label="label"
    :options="options"
    dense
    filled
    emit-value
    map-options
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template v-slot:prepend>
      <q-icon :name="icon" />
    </template>
  </q-select>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "UBrowserSelect",
  props: {
    modelValue: {
      type: [String, Number],
      default: "",
    },
    label: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    icon: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
});
</script>
