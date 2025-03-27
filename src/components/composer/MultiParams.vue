<template>
  <div class="multi-params">
    <OperationCard
      v-if="hasSubCommands"
      :model-value="subCommand"
      @update:model-value="updateSubCommand($event)"
      :options="localCommand.subCommands"
    />
    <ParamInput :configs="localConfig" :values="argvs" @update="updateArgv" />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import OperationCard from "components/composer/common/OperationCard.vue";
import ParamInput from "components/composer/param/ParamInput.vue";
import { stringifyArgv } from "js/composer/formatString";
import {
  newVarInputVal,
  isVarInputVal,
  stringifyVarInputVal,
} from "js/composer/varInputValManager";

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
    // 特定函数独有参数配置，config格式和通用的config一致
    subCommandConfig() {
      return this.getSelectSubCommand()?.config || [];
    },
    localConfig() {
      return [...this.commonConfig, ...this.subCommandConfig].map((item) => {
        const value =
          item.component === "VariableInput"
            ? item.defaultValue || newVarInputVal("str")
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
    subCommand() {
      return this.modelValue.subCommand || this.modelValue.value;
    },
    argvs() {
      return (
        this.modelValue.argvs || window.lodashM.cloneDeep(this.defaultArgvs)
      );
    },
    hasSubCommands() {
      return !!this.localCommand.subCommands;
    },
  },
  methods: {
    getSelectSubCommand(subCommand = this.subCommand) {
      return this.modelValue.subCommands?.find(
        (item) => item.value === subCommand
      );
    },
    updateArgv(index, value) {
      const newArgvs = [...this.argvs];
      newArgvs[index] = value;

      this.updateModelValue(this.subCommand, newArgvs);
    },
    updateSubCommand(value) {
      // 构建新的参数数组
      const newArgvs = [];

      // 保留通用配置的参数值
      this.commonConfig.forEach((_, index) => {
        newArgvs[index] = this.argvs[index];
      });

      // 使用新选择的函数独有配置的默认值
      this.getSelectSubCommand(value)?.config?.forEach((config, index) => {
        // 有默认值时才更新
        if (!config.defaultValue) return;
        newArgvs[this.commonConfig.length + index] = config.defaultValue;
      });

      this.updateModelValue(value, newArgvs, true);
    },
    generateCode(subCommand, argvs) {
      if (this.localCommand.isExpression) {
        return argvs.join("");
      }
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

       * [undefined, undefined] -> subCommand()
       * [undefined, 1] -> ''
       * [1, undefined] -> subCommand(1)
       * [null, 1] -> subCommand(null, 1)
       * [1, 字符串模式下varInput留空] -> subCommand(1, "")
       * [1, 变量模式下varInput留空] -> subCommand(1)
       * [1, 变量模式下varInput设置为null] -> subCommand(1, null)
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

      return `${subCommand}(${finalArgvs.join(",")})`;
    },
    getAllInputValues(argvs) {
      const flatArgvs = [];
      if (!argvs) return flatArgvs;

      argvs.forEach((item) => {
        if (!item) return;

        if (isVarInputVal(item) && item.value) {
          flatArgvs.push(stringifyVarInputVal(item));
        } else if (typeof item === "number") {
          flatArgvs.push(item.toString());
        } else if (Array.isArray(item)) {
          flatArgvs.push(...this.getAllInputValues(item));
        } else if (typeof item === "object" && item !== null) {
          const values = Object.values(item);
          if (values.length > 0) {
            flatArgvs.push(...this.getAllInputValues(values));
          }
        }
      });
      return flatArgvs;
    },
    getSummary(subCommand, argvs) {
      // 虽然header里对溢出做了处理，但是这里截断主要是为了节省存储空间
      const subCommandLabel = this.getSelectSubCommand(subCommand)?.label;
      const subFeature = subCommandLabel ? `${subCommandLabel} ` : "";
      const allArgvs = this.getAllInputValues(argvs).map((item) =>
        window.lodashM.truncate(item, {
          length: 30,
          omission: "...",
        })
      );
      return `${subFeature}${allArgvs.join(",")}`;
    },
    updateModelValue(subCommand, argvs, resetOutputVariable = false) {
      const newModelValue = {
        ...this.modelValue,
        subCommand,
        argvs,
        summary: this.getSummary(subCommand, argvs),
        code: this.generateCode(subCommand, argvs),
      };
      if (resetOutputVariable) {
        newModelValue.outputVariable = {
          name: "",
          details: {},
        };
      }
      this.$emit("update:modelValue", newModelValue);
    },
    getColumnStyle(width = 12) {
      const columnWidth = (width / 12) * 100;
      return {
        width: `calc(${columnWidth}% - var(--grid-gap))`,
      };
    },
  },
  mounted() {
    if (Array.isArray(this.argvs)) {
      this.updateModelValue(this.subCommand, this.argvs);
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
