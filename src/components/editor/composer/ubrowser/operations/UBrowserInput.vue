<template>
  <q-input
    :model-value="modelValue"
    :label="label"
    :type="inputType"
    dense
    outlined
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template v-slot:prepend>
      <q-icon :name="icon" />
    </template>
  </q-input>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "UBrowserInput",
  props: {
    modelValue: {
      type: [String, Number],
      default: "",
    },
    label: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "",
    },
    inputType: {
      type: String,
      default: "text",
    },
  },
  emits: ["update:modelValue"],
});
</script>
