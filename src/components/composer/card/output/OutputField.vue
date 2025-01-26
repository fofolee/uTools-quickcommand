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
    <template v-slot:append>
      <VariableList
        :show-variable-list="showVariableList"
        :show-function-list="showFunctionList"
        @emit-value="updateValBySelect"
        class="variable-list-btn"
      />
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
import VariableList from "components/composer/common/varinput/VariableList.vue";

export default defineComponent({
  components: {
    VariableList,
  },
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
    showVariableList: {
      type: Boolean,
      default: false,
    },
    showFunctionList: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  methods: {
    updateValBySelect(_type, val) {
      this.$emit("update:modelValue", val);
    },
  },
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

.output-field:not(.q-select) :deep(.q-field__control) {
  padding-right: 0;
}

.output-field.q-select :deep(.q-field__append) {
  font-size: 16px;
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

.variable-list-btn {
  padding: 0 12px;
}

/* 去掉下拉按钮的焦点效果 */
.variable-list-btn :deep(.q-focus-helper) {
  display: none !important;
}

/* 移除波纹效果 */
.variable-list-btn :deep(.q-ripple) {
  display: none;
}
</style>
