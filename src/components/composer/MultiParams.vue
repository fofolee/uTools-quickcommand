<template>
  <div class="flex-container">
    <div
      v-if="hasFunctionSelector"
      class="flex-item"
      :style="{ flex: localCommand.functionSelector.width || 3 }"
    >
      <div class="operation-cards">
        <div
          v-for="option in localCommand.functionSelector?.options"
          :key="option.value"
          :class="['operation-card', { active: funcName === option.value }]"
          :data-value="option.value"
          @click="funcName = option.value"
        >
          <q-icon
            :name="option.icon || localCommand.icon || 'functions'"
            size="16px"
            :color="funcName === option.value ? 'primary' : 'grey'"
          />
          <div class="text-caption">{{ option.label }}</div>
        </div>
      </div>
    </div>
    <div class="flex-container">
      <div
        v-for="(item, index) in localConfig"
        :key="index"
        class="flex-item"
        :style="{ flex: item.width || 12 }"
      >
        <div v-if="item.type === 'varInput'">
          <VariableInput
            :model-value="argvs[index]"
            @update:model-value="updateArgv(index, $event)"
            :label="item.label"
            :icon="item.icon"
          />
        </div>
        <div v-else-if="item.type === 'numInput'">
          <NumberInput
            :model-value="argvs[index]"
            @update:model-value="updateArgv(index, $event)"
            :label="item.label"
            :icon="item.icon"
          />
        </div>
        <div v-else-if="item.type === 'switch'">
          <q-toggle
            :model-value="argvs[index]"
            @update:model-value="updateArgv(index, $event)"
            :label="item.label"
            :icon="item.icon"
          />
        </div>
        <div v-else-if="item.type === 'arrayEditor'">
          <ArrayEditor :model-value="argvs[index]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "components/composer/common/VariableInput.vue";
import NumberInput from "components/composer/common/NumberInput.vue";
import ArrayEditor from "components/composer/common/ArrayEditor.vue";
import {
  stringifyArgv,
  parseToHasType,
  parseFunction,
} from "js/composer/formatString";

export default defineComponent({
  name: "MultiParams",
  components: {
    VariableInput,
    NumberInput,
    ArrayEditor,
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
      console.log(newArgvs);
      return `${funcName}(${newArgvs.join(",")})`;
    },
    parseCodeToArgvs(code) {
      const argvs = window.lodashM.cloneDeep(this.defaultArgvs);
      if (!code) return argvs;

      // 匹配函数名和参数
      const pattern = new RegExp(`^${this.funcName}\\((.*?)\\)$`);
      const match = code.match(pattern);
      if (match) {
        try {
          const paramStr = match[1].trim();
          if (!paramStr) return argvs;

          // 分割参数，考虑括号嵌套
          let params = [];
          let bracketCount = 0;
          let currentParam = "";

          for (let i = 0; i < paramStr.length; i++) {
            const char = paramStr[i];
            if (char === "," && bracketCount === 0) {
              params.push(currentParam.trim());
              currentParam = "";
              continue;
            }
            if (char === "{") bracketCount++;
            if (char === "}") bracketCount--;
            currentParam += char;
          }
          if (currentParam) {
            params.push(currentParam.trim());
          }

          // 根据配置处理每个参数
          params.forEach((param, index) => {
            if (index >= this.localConfig.length) return;

            const config = this.localConfig[index];
            if (config.type === "varInput") {
              // 对于 VariableInput 类型，解析为带有 __varInputVal__ 标记的对象
              argvs[index] = parseToHasType(param);
            } else if (config.type === "numInput") {
              // 对于 NumberInput 类型，转换为数字
              argvs[index] = Number(param) || 0;
            } else if (config.type === "arrayEditor") {
              let result = parseFunction(`${this.funcName}(${param})`, [
                "arg0[*]",
              ]);
              argvs[index] = result.argv;
            } else {
              // 其他类型直接使用值
              argvs[index] = param;
            }
          });

          return argvs;
        } catch (e) {
          console.error("解析参数失败:", e);
        }
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
        .map((item) =>
          item?.hasOwnProperty("__varInputVal__")
            ? window.lodashM.truncate(item.value, {
                length: 30,
                omission: "...",
              })
            : item
        )
        .filter((item) => item != null && item != "");
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
  },
  mounted() {
    if (!this.modelValue.argvs && !this.modelValue.code) {
      this.updateModelValue(this.funcName, this.defaultArgvs);
    }
  },
  watch: {
    funcName: {
      immediate: true,
      handler(newVal) {
        // 当操作卡片改变时，确保它在视图中可见
        this.$nextTick(() => {
          document
            .querySelector(`.operation-card[data-value="${newVal}"]`)
            ?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "nearest",
            });
        });
      },
    },
  },
});
</script>

<style scoped>
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.flex-item {
  min-width: 100px;
}

@media (max-width: 600px) {
  .flex-item {
    flex: 1 1 100% !important;
  }
}

.operation-cards {
  display: flex;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  padding: 1px;
  gap: 8px;
  border-radius: 8px;
}

.operation-cards::-webkit-scrollbar {
  display: none;
}

.operation-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  border-radius: 6px;
  min-width: 72px;
  padding: 2px 0;
  background: rgba(0, 0, 0, 0.05);
}

.body--dark .operation-card {
  background: rgba(0, 0, 0, 0.05);
}

.operation-card:hover {
  background: var(--q-primary-opacity-5);
  transform: translateY(-1px);
  border: 1px solid var(--q-primary-opacity-10);
}

.operation-card.active {
  border-color: var(--q-primary);
  background: var(--q-primary-opacity-5);
}

.body--dark .operation-card.active {
  border-color: var(--q-primary-opacity-50);
}
</style>
