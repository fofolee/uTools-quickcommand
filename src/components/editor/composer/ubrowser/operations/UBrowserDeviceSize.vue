<template>
  <div class="row q-col-gutter-sm">
    <div class="col-6">
      <q-input
        v-model.number="size.width"
        type="number"
        label="宽度"
        dense
        outlined
        @update:model-value="handleUpdate"
      >
        <template v-slot:prepend>
          <q-icon name="width" />
        </template>
      </q-input>
    </div>
    <div class="col-6">
      <q-input
        v-model.number="size.height"
        type="number"
        label="高度"
        dense
        outlined
        @update:model-value="handleUpdate"
      >
        <template v-slot:prepend>
          <q-icon name="height" />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "UBrowserDeviceSize",
  props: {
    modelValue: {
      type: Object,
      default: () => ({ width: 0, height: 0 }),
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      size: {
        width: this.modelValue.width,
        height: this.modelValue.height,
      },
    };
  },
  methods: {
    handleUpdate() {
      this.$emit("update:modelValue", { ...this.size });
    },
  },
  watch: {
    modelValue: {
      deep: true,
      handler(newValue) {
        this.size = { ...newValue };
      },
    },
  },
});
</script>
