<template>
  <div class="row items-center no-wrap">
    <q-badge class="q-pa-xs">{{ label }}</q-badge>
    <q-btn-toggle
      :model-value="modelValue ? 'true' : 'false'"
      :options="[
        { label: '是', value: 'true' },
        { label: '否', value: 'false' },
      ]"
      dense
      flat
      no-caps
      spread
      class="button-group"
      @update:model-value="$emit('update:modelValue', $event === 'true')"
    />
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "UBrowserCheckbox",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      required: true,
    },
  },
  emits: ["update:modelValue"],
});
</script>
