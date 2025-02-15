<template>
  <component
    :is="config.component"
    v-model="localValue"
    v-bind="componentProps"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #prepend>
      <q-icon v-if="config.icon" :name="config.icon" />
    </template>
  </component>
</template>

<script>
import { defineComponent, defineAsyncComponent } from "vue";
// 导入OptionEditor之外的通用组件，因为他还要被OptionEditor使用，防止循环引用
import VariableInput from "components/composer/common/VariableInput.vue";
import NumberInput from "components/composer/common/NumberInput.vue";
import ArrayEditor from "components/composer/common/ArrayEditor.vue";
import DictEditor from "components/composer/common/DictEditor.vue";
import ButtonGroup from "components/composer/common/ButtonGroup.vue";
import ControlInput from "components/composer/common/ControlInput.vue";
import CheckGroup from "components/composer/common/CheckGroup.vue";
import CheckButton from "components/composer/common/CheckButton.vue";
import TimeInput from "components/composer/common/TimeInput.vue";
import FunctionInput from "components/composer/common/FunctionInput.vue";
import { QInput, QSelect, QToggle, QCheckbox } from "quasar";
const CodeEditor = defineAsyncComponent(() =>
  import("components/editor/CodeEditor.vue")
);

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
    QToggle,
    QInput,
    QSelect,
    QCheckbox,
    TimeInput,
    CodeEditor,
    FunctionInput,
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
      return (
        this.config.component === "QInput" ||
        this.config.component === "QSelect"
      );
    },
    isQuasarSelect() {
      return this.config.component === "QSelect";
    },
    componentProps() {
      const props = { ...this.config, dense: true };

      if (this.isQuasarInput) {
        props.filled = true;
      }

      if (this.isQuasarSelect) {
        props.emitValue = true;
        props.mapOptions = true;
        props.optionsDense = true;
      }

      return props;
    },
  },
});
</script>
