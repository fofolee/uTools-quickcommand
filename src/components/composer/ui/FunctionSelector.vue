<template>
  <div class="row q-col-gutter-sm">
    <div class="col">
      <VariableInput
        :model-value="inputValue"
        :label="inputLabel"
        :command="command"
        @update:model-value="handleInputChange"
      />
    </div>
    <div class="col-4">
      <q-select
        v-model="selectedFunction"
        :options="options"
        :label="selectLabel"
        dense
        filled
        emit-value
        map-options
        @update:model-value="handleFunctionChange"
      >
        <template v-slot:prepend>
          <q-icon :name="command.icon || 'functions'" />
        </template>
      </q-select>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "components/composer/ui/VariableInput.vue";

export default defineComponent({
  name: "FunctionSelector",
  components: {
    VariableInput,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    command: {
      type: Object,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    inputLabel: {
      type: String,
      default: "输入值",
    },
    selectLabel: {
      type: String,
      default: "选择函数",
    },
  },
  emits: ["update:model-value"],
  data() {
    return {
      selectedFunction: this.options[0]?.value || "",
      inputValue: "",
    };
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (!val) {
          this.selectedFunction = this.options[0]?.value || "";
          this.inputValue = "";
          return;
        }
        // 从代码字符串解析出函数名和参数
        const match = val.match(/(.+?)\((.*)\)/);
        if (match) {
          this.selectedFunction = match[1];
          this.inputValue = match[2];
        }
      },
    },
  },
  methods: {
    generateCode() {
      if (!this.selectedFunction || !this.inputValue) return "";
      return `${this.selectedFunction}(${this.inputValue})`;
    },
    handleInputChange(value) {
      this.inputValue = value;
      this.$emit("update:model-value", this.generateCode());
    },
    handleFunctionChange(value) {
      this.selectedFunction = value;
      this.$emit("update:model-value", this.generateCode());
    },
  },
});
</script>
