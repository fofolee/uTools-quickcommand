<template>
  <div>
    <div class="q-pt-sm">
      <AISelector
        :model-value="argvs.apiConfig"
        @update:modelValue="updateArgvs('apiConfig', $event)"
        class="q-mb-sm"
      />
      <ButtonGroup
        :model-value="argvs.content.role"
        @update:modelValue="updateArgvs('content.role', $event)"
        :options="roleOptions"
        height="26px"
        class="q-mb-sm"
      />
      <VariableInput
        :model-value="argvs.content.prompt"
        @update:modelValue="updateArgvs('content.prompt', $event)"
        label="提示词"
        type="textarea"
        autogrow
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import ButtonGroup from "components/composer/common/ButtonGroup.vue";
import { newVarInputVal } from "js/composer/varInputValManager";
import VariableInput from "components/composer/common/VariableInput.vue";
import { stringifyArgv } from "js/composer/formatString";
import AISelector from "components/ai/AISelector.vue";
export default defineComponent({
  name: "AskAIEditor",
  props: {
    modelValue: Object,
  },
  components: {
    VariableInput,
    ButtonGroup,
    AISelector,
  },
  emits: ["update:modelValue"],
  data() {
    return {
      showAIConfig: false,
      defaultArgvs: {
        content: {
          prompt: newVarInputVal("str"),
          role: "",
        },
        apiConfig: {},
      },
      roleOptions: [
        { label: "无", value: "" },
        { label: "翻译", value: "translate" },
        { label: "总结", value: "summarize" },
        { label: "润色", value: "polish" },
        { label: "扩写", value: "expand" },
        { label: "生成shell命令", value: "shell" },
      ],
      apiTypeOptions: [
        { label: "OpenAI", value: "openai" },
        { label: "Ollama", value: "ollama" },
      ],
    };
  },
  computed: {
    argvs() {
      return (
        this.modelValue.argvs || window.lodashM.cloneDeep(this.defaultArgvs)
      );
    },
  },
  methods: {
    generateCode(argvs = this.argvs) {
      return `${this.modelValue.value}(${stringifyArgv(
        argvs.content
      )}, ${JSON.stringify(argvs.apiConfig)})`;
    },
    getSummary(argvs) {
      return "问AI：" + stringifyArgv(argvs.content.prompt);
    },
    updateArgvs(keyPath, newValue) {
      const newArgvs = { ...this.argvs };
      const keys = keyPath.split(".");
      const lastKey = keys.pop();
      const target = keys.reduce((obj, key) => obj[key], newArgvs);
      target[lastKey] = newValue;
      this.updateModelValue(newArgvs);
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
});
</script>

<style scoped>
.return-label {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
