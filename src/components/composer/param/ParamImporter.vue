<template>
  <component
    :is="config.component"
    v-model="localValue"
    v-bind="componentProps"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template v-if="isQuasarInput" #prepend>
      <q-icon v-if="config.icon" :name="config.icon" />
    </template>
  </component>
</template>

<script>
import { defineComponent } from "vue";
// 导入OptionEditor之外的通用组件，因为他还要被OptionEditor使用，防止循环引用
import VariableInput from "components/composer/common/VariableInput.vue";
import NumberInput from "components/composer/common/NumberInput.vue";
import ArrayEditor from "components/composer/common/ArrayEditor.vue";
import DictEditor from "components/composer/common/DictEditor.vue";
import ButtonGroup from "components/composer/common/ButtonGroup.vue";
import ControlInput from "components/composer/common/ControlInput.vue";
import CheckGroup from "components/composer/common/CheckGroup.vue";
import CheckButton from "components/composer/common/CheckButton.vue";
import CodeEditor from "components/composer/common/CodeEditor.vue";

export default defineComponent({
  name: "ParamInput",
  components: {
    VariableInput,
    NumberInput,
    ArrayEditor,
    DictEditor,
    ButtonGroup,
    ControlInput,
    CheckGroup,
    CheckButton,
    CodeEditor,
  },
  props: {
    config: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: null,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  computed: {
    localValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    isQuasarInput() {
      return ["q-select", "q-input"].includes(this.config?.component);
    },
    isQuasarSelect() {
      return ["q-select"].includes(this.config?.component);
    },
    componentProps() {
      return {
        ...this.config,
        filled: true,
        dense: true,
        emitValue: this.isQuasarSelect,
        mapOptions: this.isQuasarSelect,
      };
    },
  },
});
</script>
