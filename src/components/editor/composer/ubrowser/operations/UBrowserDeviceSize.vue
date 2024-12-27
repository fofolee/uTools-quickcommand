<template>
  <div class="row q-col-gutter-sm">
    <div class="col-6">
      <VariableInput
        v-model.number="size.width"
        label="宽度"
        :command="{ icon: 'width', inputType: 'number' }"
        @update:model-value="handleUpdate"
      />
    </div>
    <div class="col-6">
      <VariableInput
        v-model.number="size.height"
        label="高度"
        :command="{ icon: 'height', inputType: 'number' }"
        @update:model-value="handleUpdate"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "components/editor/composer/VariableInput.vue";

export default defineComponent({
  name: "UBrowserDeviceSize",
  components: {
    VariableInput,
  },
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
