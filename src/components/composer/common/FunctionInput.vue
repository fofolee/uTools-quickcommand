<template>
  <div class="row q-col-gutter-sm function-input">
    <div class="col-12">
      <div class="row q-col-gutter-sm">
        <div class="col-3">
          <q-select
            :model-value="params"
            use-input
            use-chips
            multiple
            dense
            borderless
            hide-dropdown-icon
            options-dense
            input-debounce="0"
            new-value-mode="add-unique"
            label="参数"
            @update:model-value="updateParams"
            @input-value="handleInput"
            @blur="handleBlur"
            ref="paramSelect"
          >
            <template v-slot:prepend>
              <div class="text-primary func-symbol">(</div>
            </template>
            <template v-slot:append>
              <div class="text-primary func-symbol">)</div>
            </template>
          </q-select>
        </div>
        <div class="col-9">
          <q-input
            :model-value="funcContent"
            :label="label"
            type="textarea"
            dense
            borderless
            :placeholder="placeholder"
            style="font-family: Consolas, Monaco, 'Courier New'"
            autogrow
            @update:model-value="updateContent"
          >
            <template v-slot:prepend>
              <div class="text-primary func-symbol">=> {</div>
            </template>
            <template v-slot:append>
              <div class="text-primary func-symbol">}</div>
            </template>
          </q-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { newVarInputVal } from "src/js/composer/varInputValManager";

export default defineComponent({
  name: "FunctionInput",
  props: {
    modelValue: {
      type: Object,
      default: newVarInputVal("var", ""),
    },
    label: {
      type: String,
      default: "函数内容",
    },
    icon: {
      type: String,
      default: "code",
    },
    placeholder: {
      type: String,
      default: "",
    },
  },
  emits: ["update:model-value"],
  computed: {
    funcStr() {
      return this.modelValue.value;
    },
    params() {
      const match = this.funcStr.match(/^\((.*?)\)/);
      if (!match) return [];
      return match[1]
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);
    },
    funcContent() {
      const match = this.funcStr.match(/\{([\s\S]*)\}/);
      if (!match) return "";
      return match[1].trim();
    },
  },
  methods: {
    updateParams(newParams) {
      const functionStr = `(${newParams.join(", ")}) => { ${
        this.funcContent
      } }`;
      this.updateModelValue(functionStr);
    },
    updateContent(newContent) {
      const functionStr = `(${this.params.join(", ")}) => { ${newContent} }`;
      this.updateModelValue(functionStr);
    },
    handleInput(val) {
      if (!val) return;

      if (val.includes(",") || val.includes(" ")) {
        const newParams = val
          .split(/[,\s]+/)
          .map((p) => p.trim())
          .filter((p) => p);

        const allParams = [...new Set([...this.params, ...newParams])];
        this.updateParams(allParams);
        this.$refs.paramSelect.updateInputValue("");
      }
    },
    handleBlur() {
      const inputValue = this.$refs.paramSelect.inputValue;
      if (inputValue && !this.params.includes(inputValue)) {
        const newParams = [...this.params, inputValue];
        this.updateParams(newParams);
        this.$refs.paramSelect.updateInputValue("");
      }
    },
    updateModelValue(newVal) {
      this.$emit("update:model-value", newVarInputVal("var", newVal));
    },
  },
});
</script>

<style scoped>
.function-input :deep(.q-field__control) .text-primary.func-symbol {
  font-size: 24px !important;
}

.function-input :deep(.q-select__input) {
  display: flex !important;
  flex-wrap: nowrap !important;
  overflow-x: auto !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.function-input :deep(.q-select .q-field__native) {
  display: flex !important;
  flex-wrap: nowrap !important;
  overflow-x: auto !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.function-input :deep(.q-select .q-field__native > div) {
  display: flex !important;
  flex-wrap: nowrap !important;
  flex: 0 0 auto !important;
}

.function-input :deep(.q-select .q-chip) {
  flex: 0 0 auto !important;
  margin-right: 4px !important;
}

.function-input :deep(.q-select__input::-webkit-scrollbar),
.function-input :deep(.q-select .q-field__native::-webkit-scrollbar) {
  display: none !important;
}
</style>
