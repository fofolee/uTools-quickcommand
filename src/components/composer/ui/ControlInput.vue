<template>
  <div class="control-input-wrapper">
    <q-input
      dense
      borderless
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      class="control-input"
      v-bind="$attrs"
    >
      <template v-slot:prepend>
        <q-badge class="control-input-prepend" color="primary">{{
          label
        }}</q-badge>
      </template>
    </q-input>
  </div>
</template>

<script>
import { defineComponent } from "vue";

/**
 * 控制流程输入框组件
 * @description 调整了样式的输入框组件
 *
 * @property {String|Number} modelValue - 输入框的值
 * @property {String} label - 输入框前置标签文本
 */
export default defineComponent({
  name: "ControlInput",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number],
      default: "",
    },
    label: {
      type: String,
      required: true,
    },
  },
  emits: ["update:modelValue"],
});
</script>

<style scoped>
.control-input :deep(.q-field__control),
.control-input :deep(.q-field__native),
.control-input :deep(.q-field__marginal) {
  height: 21px !important;
  min-height: 21px;
  font-size: 13px;
}

.control-input-prepend {
  font-size: 12px;
  font-weight: normal;
  padding: 2px 4px;
}
</style>
