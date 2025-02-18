<template>
  <div>
    <q-select
      v-if="apiOptions.length > 0"
      :model-value="argvs.apiConfig"
      @update:model-value="updateArgvs('apiConfig', $event)"
      :options="apiOptions"
      map-options
      emit-value
      dense
      options-dense
      filled
      label="API模型"
      class="q-mb-sm"
    />
    <q-field filled dense v-else class="q-mb-sm">
      <template #control>
        <div class="flex items-center justify-center full-width text-warning">
          <q-icon name="warning" class="q-mr-sm" />
          <div>
            未配置API模型，配置方法：命令配置界面-右下角菜单按钮-API配置
          </div>
        </div>
      </template>
    </q-field>
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
import ButtonGroup from "components/composer/common/ButtonGroup.vue";
import { newVarInputVal } from "js/composer/varInputValManager";
import VariableInput from "components/composer/common/VariableInput.vue";
import { parseFunction, stringifyArgv } from "js/composer/formatString";
import { dbManager } from "js/utools.js";

export default defineComponent({
  name: "AskAIEditor",
  props: {
    modelValue: Object,
  },
  components: {
    VariableInput,
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
      apiOptions: [],
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
        const variableFormatPaths = ["arg0.prompt"];
        const params = parseFunction(code, { variableFormatPaths });
        return params;
      } catch (e) {
        console.error("解析参数失败:", e);
      }
      return argvs;
    },
    generateCode(argvs = this.argvs) {
      return `${this.modelValue.value}(${stringifyArgv(
        argvs.content
      )}, ${JSON.stringify(argvs.apiConfig)})`;
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
    const apiConfigs = dbManager.getStorage("cfg_aiConfigs");
    this.apiOptions = apiConfigs
      ? apiConfigs.map((config) => {
          return {
            label: config.name,
            value: config,
          };
        })
      : [];
    this.defaultArgvs.apiConfig = apiConfigs?.[0] || {};

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
