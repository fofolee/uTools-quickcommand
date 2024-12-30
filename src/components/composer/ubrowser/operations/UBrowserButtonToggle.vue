<template>
  <div class="row items-center no-wrap">
    <q-badge class="q-pa-xs">{{ label }}</q-badge>
    <q-btn-toggle
      :model-value="modelValue"
      :options="options"
      dense
      flat
      no-caps
      spread
      class="button-group"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "UBrowserButtonToggle",
  props: {
    modelValue: {
      type: [String, Number, Boolean],
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
  },
  emits: ["update:modelValue"],
});
</script>

<style scoped>
.button-group {
  flex: 1;
  padding: 0 10px;
}

.button-group :deep(.q-btn) {
  min-height: 24px;
  font-size: 12px;
}
</style>
