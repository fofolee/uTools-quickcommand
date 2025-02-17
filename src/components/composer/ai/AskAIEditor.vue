<template>
  <div>
    <div class="q-my-md">
      <BorderLabel label="API配置">
        <ButtonGroup
          :model-value="argvs.apiConfig.modelType"
          @update:modelValue="updateArgvs('apiConfig.modelType', $event)"
          :options="modelTypeOptions"
          height="26px"
          class="q-mb-sm"
        />
        <VariableInput
          :model-value="argvs.apiConfig.apiUrl"
          label="API地址"
          :placeholder="
            argvs.apiConfig.modelType === 'openai'
              ? '例：https://api.openai.com/v1'
              : '例：http://localhost:11434'
          "
          @update:modelValue="updateArgvs('apiConfig.apiUrl', $event)"
          class="q-mb-sm"
        />
        <div class="row q-gutter-sm">
          <VariableInput
            class="col"
            v-if="argvs.apiConfig.modelType === 'openai'"
            :model-value="argvs.apiConfig.apiToken"
            @update:modelValue="updateArgvs('apiConfig.apiToken', $event)"
            label="API密钥"
          />
          <VariableInput
            class="col"
            :model-value="argvs.apiConfig.model"
            @update:modelValue="updateArgvs('apiConfig.model', $event)"
            label="模型"
            :placeholder="
              argvs.apiConfig.modelType === 'openai'
                ? '例：gpt-4o'
                : '例：qwen2.5:32b'
            "
          />
        </div>
      </BorderLabel>
    </div>
    <ButtonGroup
      :model-value="argvs.content.presetPrompt"
      @update:modelValue="updateArgvs('content.presetPrompt', $event)"
      :options="presetPromptOptions"
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
</template>

<script>
import { defineComponent } from "vue";
import BorderLabel from "components/composer/common/BorderLabel.vue";
import ButtonGroup from "components/composer/common/ButtonGroup.vue";
import { newVarInputVal } from "js/composer/varInputValManager";
import VariableInput from "components/composer/common/VariableInput.vue";
import { parseFunction, stringifyArgv } from "js/composer/formatString";

export default defineComponent({
  name: "AskAIEditor",
  props: {
    modelValue: Object,
  },
  components: {
    VariableInput,
    BorderLabel,
    ButtonGroup,
  },
  emits: ["update:modelValue"],
  data() {
    return {
      defaultArgvs: {
        content: {
          prompt: newVarInputVal("str"),
          presetPrompt: "",
        },
        apiConfig: {},
      },
      presetPromptOptions: [
        { label: "自由问答", value: "" },
        { label: "翻译", value: "translate" },
        { label: "总结", value: "summarize" },
        { label: "执行shell命令", value: "shell" },
      ],
      modelTypeOptions: [
        { label: "OpenAI", value: "openai" },
        { label: "Ollama", value: "ollama" },
      ],
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
      try {
        const variableFormatPaths = [
          "arg0.prompt",
          "arg1.apiUrl",
          "arg1.apiToken",
          "arg1.model",
        ];
        const params = parseFunction(code, { variableFormatPaths });
        return {
          content: params.argvs[0],
          apiConfig: params.argvs[1],
        };
      } catch (e) {
        console.error("解析参数失败:", e);
      }
      return argvs;
    },
    generateCode(argvs = this.argvs) {
      return `${this.modelValue.value}(${stringifyArgv(
        argvs.content
      )}, ${stringifyArgv(argvs.apiConfig)})`;
    },
    getSummary(argvs) {
      return "问AI：" + argvs.content.prompt;
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
  mounted() {
    const aiConfig = this.$root.profile.aiConfig || {};
    console.log("aiConfig", aiConfig);
    this.defaultArgvs.apiConfig = {
      modelType: aiConfig.modelType || "openai",
      apiUrl: newVarInputVal("str", aiConfig.apiUrl || ""),
      apiToken: newVarInputVal("str", aiConfig.apiToken || ""),
      model: newVarInputVal("str", aiConfig.model || ""),
    };

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
