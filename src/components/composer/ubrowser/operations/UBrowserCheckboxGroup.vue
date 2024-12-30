<template>
  <div class="row items-center">
    <q-option-group
      :model-value="modelValue"
      :options="options"
      type="checkbox"
      inline
      dense
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "UBrowserCheckboxGroup",
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    options: {
      type: Array,
      required: true,
    },
  },
  emits: ["update:modelValue"],
});
</script>
