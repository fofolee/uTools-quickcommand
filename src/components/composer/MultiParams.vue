<template>
  <div class="multi-params">
    <OperationCard
      v-if="hasFunctionSelector"
      :model-value="funcName"
      @update:model-value="funcName = $event"
      :options="localCommand.functionSelector"
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
    // 通用参数配置
    commonConfig() {
      return this.modelValue.config || [];
    },
    // 特定函数独有参数配置
    functionConfig() {
      return this.getSelectFunction()?.config || [];
    },
    localConfig() {
      return [...this.commonConfig, ...this.functionConfig].map((item) => {
        const value =
          item.type === "varInput"
            ? item.defaultValue || {
                value: "",
                isString: true,
                __varInputVal__: true,
              }
            : // 其他类型情况复杂，不做判断，没有默认值返回undefined
              item.defaultValue;
        return {
          ...item,
          value,
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
        // 构建新的参数数组
        const newArgvs = [];

        // 保留通用配置的参数值
        this.commonConfig.forEach((_, index) => {
          newArgvs[index] = this.argvs[index];
        });

        // 使用新选择的函数独有配置的默认值
        this.getSelectFunction(value)?.config?.forEach((config, index) => {
          newArgvs[this.commonConfig.length + index] = config.defaultValue;
        });

        this.updateModelValue(value, newArgvs);
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
    getSelectFunction(funcName = this.funcName) {
      return this.modelValue.functionSelector?.find(
        (item) => item.value === funcName
      );
    },
    updateArgv(index, value) {
      const newArgvs = [...this.argvs];
      newArgvs[index] = value;

      this.updateModelValue(this.funcName, newArgvs);
    },
    generateCode(funcName, argvs) {
      console.log("argvs", argvs);
      /**
       * 字符串模式stringfiy后，null会变成'"null"', ''变成'""'
       * 变量模式stringify后，null变成'null', ''保持''
       */
      const stringifiedArgvs = argvs.map((argv) => stringifyArgv(argv));

      /* 空值处理：
       * 1. 去掉 undefined，'', null
       * 2. varInput在字符串模式下，留空为'""'，所以不会被处理
       * 3. 变量模式下，留空是'', 会被过滤
       * 4. 如果想传递空字符串，将varInput切为字符串模式并留空
       * 5. 如果不想传递对应参数，将varInput切为变量模式并留空
       * 6. 如果想传递空参数，将varInput切为变量模式并设置为null或undefined

       * [undefined, undefined] -> funcName()
       * [undefined, 1] -> ''
       * [1, undefined] -> funcName(1)
       * [null, 1] -> funcName(null, 1)
       * [1, 字符串模式下varInput留空] -> funcName(1, "")
       * [1, 变量模式下varInput留空] -> funcName(1)
       * [1, 变量模式下varInput设置为null] -> funcName(1, null)
       */
      // 空参数后面跟着非空参数，不生成代码
      const isEmpty = (v) => v === undefined || v === "" || v === null;
      for (let i = 0; i < stringifiedArgvs.length - 1; i++) {
        if (isEmpty(stringifiedArgvs[i]) && !isEmpty(stringifiedArgvs[i + 1])) {
          return "";
        }
      }

      // 过滤空参数，由于前面已经对处于非空参数中间的空参数做了处理，这里直接过滤空参数不会对参数顺序造成影响
      const finalArgvs = stringifiedArgvs.filter((v) => !isEmpty(v));

      return `${funcName}(${finalArgvs.join(",")})`;
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
      const funcNameLabel = this.getSelectFunction()?.label;
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
