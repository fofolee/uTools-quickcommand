<template>
  <q-input
    :model-value="modelValue"
    :label="label"
    type="textarea"
    dense
    outlined
    autogrow
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
  name: "UBrowserTextarea",
  props: {
    modelValue: {
      type: String,
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
  },
  emits: ["update:modelValue"],
});
</script>
