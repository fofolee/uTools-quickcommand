<template>
  <div class="multi-params">
    <OperationCard
      v-if="hasFunctionSelector"
      :model-value="funcName"
      @update:model-value="funcName = $event"
      :options="localCommand.functionSelector?.options"
    />
    <ParamInput :configs="localConfig" :values="argvs" @update="updateArgv" />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import OperationCard from "components/composer/common/OperationCard.vue";
import ParamInput from "components/composer/common/ParamInput.vue";
import { stringifyArgv, parseFunction } from "js/composer/formatString";

export default defineComponent({
  name: "MultiParams",
  components: {
    OperationCard,
    ParamInput,
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
      required: true,
    },
  },
  emits: ["update:modelValue"],
  computed: {
    localCommand() {
      return this.modelValue;
    },
    localConfig() {
      return (this.modelValue.config || []).map((item) => {
        return {
          ...item,
          value: item.defaultValue,
        };
      });
    },
    defaultArgvs() {
      return this.localConfig.map((item) => item.value);
    },
    funcName: {
      get() {
        return this.modelValue.value;
      },
      set(value) {
        this.updateModelValue(value, this.defaultArgvs);
      },
    },
    argvs() {
      return (
        this.modelValue.argvs || this.parseCodeToArgvs(this.modelValue.code)
      );
    },
    hasFunctionSelector() {
      return !!this.localCommand.functionSelector;
    },
  },
  methods: {
    updateArgv(index, value) {
      const newArgvs = [...this.argvs];
      newArgvs[index] = value;

      this.updateModelValue(this.funcName, newArgvs);
    },
    generateCode(funcName, argvs) {
      const newArgvs = argvs
        .map((argv) => stringifyArgv(argv))
        .filter((item) => item != null && item !== "");
      return `${funcName}(${newArgvs.join(",")})`;
    },
    parseCodeToArgvs(code) {
      let argvs = window.lodashM.cloneDeep(this.defaultArgvs);
      if (!code) return argvs;

      const variableFormatPaths = [];
      this.localConfig.forEach((item, index) => {
        if (item.type === "varInput") {
          variableFormatPaths.push(`arg${index}`);
        } else if (item.type === "arrayEditor") {
          variableFormatPaths.push(`arg${index}[*]`);
        } else if (item.type === "dictEditor") {
          variableFormatPaths.push(`arg${index}.**`);
        }
      });
      try {
        argvs = parseFunction(code, { variableFormatPaths }).argvs;
      } catch (e) {
        console.log("解析参数失败:", e);
      }
      return argvs;
    },
    getSummary(argvs) {
      // 虽然header里对溢出做了处理，但是这里截断主要是为了节省存储空间
      const funcNameLabel = this.localCommand.functionSelector?.options.find(
        (option) => option.value === this.funcName
      )?.label;
      const subFeature = funcNameLabel ? `${funcNameLabel} ` : "";
      const allArgvs = argvs
        .filter((item) => item != null && item != "")
        .map((item) =>
          window.lodashM.truncate(stringifyArgv(item).toString(), {
            length: 30,
            omission: "...",
          })
        );
      return `${subFeature}${allArgvs.join(",")}`;
    },
    updateModelValue(funcName, argvs) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        value: funcName,
        argvs,
        summary: this.getSummary(argvs),
        code: this.generateCode(funcName, argvs),
      });
    },
    getColumnStyle(width = 12) {
      const columnWidth = (width / 12) * 100;
      return {
        width: `calc(${columnWidth}% - var(--grid-gap))`,
      };
    },
  },
  mounted() {
    if (!this.modelValue.argvs && !this.modelValue.code) {
      this.updateModelValue(this.funcName, this.defaultArgvs);
    }
  },
});
</script>

<style scoped>
.multi-params {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
</style>
