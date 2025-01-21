<template>
  <div class="row items-center">
    <div class="col-2 return-label text-h6">return</div>
    <div class="col-10">
      <VariableInput
        :model-value="argvs.returnValue"
        @update:modelValue="updateArgvs('returnValue', $event)"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { newVarInputVal } from "js/composer/varInputValManager";
import VariableInput from "components/composer/common/VariableInput.vue";
import { parseFunction, stringifyArgv } from "js/composer/formatString";

export default defineComponent({
  name: "ReturnEditor",
  props: {
    modelValue: Object,
  },
  components: {
    VariableInput,
  },
  emits: ["update:modelValue"],
  data() {
    return {
      defaultArgvs: {
        returnValue: newVarInputVal("var"),
      },
    };
  },
  computed: {
    argvs() {
      return (
        this.modelValue.argvs || this.parseCodeToArgvs(this.modelValue.code)
      );
    },
  },
  methods: {
    parseCodeToArgvs(code) {
      const argvs = window.lodashM.cloneDeep(this.defaultArgvs);
      if (!code) return argvs;
      code = code.trim().replace(/^return\s(.*)/, "tempFunc($1)");
      try {
        const variableFormatPaths = ["arg0"];
        const params = parseFunction(code, { variableFormatPaths });
        return {
          returnValue: params.argvs[0],
        };
      } catch (e) {
        console.error("解析参数失败:", e);
      }
      return argvs;
    },
    generateCode(argvs = this.argvs) {
      return `${this.modelValue.value} ${stringifyArgv(argvs.returnValue)}`;
    },
    getSummary(argvs) {
      return "返回" + " " + argvs.returnValue.value;
    },
    updateArgvs(key, newValue) {
      this.argvs[key] = newValue;
      this.updateModelValue(this.argvs);
    },
    updateModelValue(argvs) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        summary: this.getSummary(argvs),
        argvs,
        code: this.generateCode(argvs),
      });
    },
  },
  mounted() {
    const argvs = this.modelValue.argvs || this.defaultArgvs;
    if (!this.modelValue.code) {
      this.updateModelValue(argvs);
    }
  },
});
</script>

<style scoped>
.return-label {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
