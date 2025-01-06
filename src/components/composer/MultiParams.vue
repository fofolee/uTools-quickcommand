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
        <VariableInput
          v-if="item.type === 'varInput'"
          :model-value="argvs[index]"
          @update:model-value="updateArgv(index, $event)"
          :label="item.label"
          :icon="item.icon"
          :options="item.options"
        />
        <NumberInput
          v-else-if="item.type === 'numInput'"
          :model-value="argvs[index]"
          @update:model-value="updateArgv(index, $event)"
          :label="item.label"
          :icon="item.icon"
        />
        <ArrayEditor
          v-else-if="item.type === 'arrayEditor'"
          :model-value="argvs[index]"
          @update:model-value="updateArgv(index, $event)"
          :options="item.options"
        />
        <DictEditor
          v-else-if="item.type === 'dictEditor'"
          :model-value="argvs[index]"
          @update:model-value="updateArgv(index, $event)"
          :options="item.options"
        />
        <q-toggle
          v-else-if="item.type === 'switch'"
          :model-value="argvs[index]"
          @update:model-value="updateArgv(index, $event)"
          :label="item.label"
          :icon="item.icon"
        />
        <q-select
          v-else-if="item.type === 'select'"
          :model-value="argvs[index]"
          @update:model-value="updateArgv(index, $event)"
          :options="item.options"
        >
          <template v-slot:prepend>
            <q-icon :name="item.icon" />
          </template>
        </q-select>
        <q-input
          v-else-if="item.type === 'input'"
          :model-value="argvs[index]"
          @update:model-value="updateArgv(index, $event)"
          :label="item.label"
          :icon="item.icon"
        >
          <template v-slot:prepend>
            <q-icon :name="item.icon" />
          </template>
        </q-input>
        <q-checkbox
          v-else-if="item.type === 'checkbox'"
          :model-value="argvs[index]"
          @update:model-value="updateArgv(index, $event)"
          :label="item.label"
          :icon="item.icon"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "components/composer/common/VariableInput.vue";
import NumberInput from "components/composer/common/NumberInput.vue";
import ArrayEditor from "components/composer/common/ArrayEditor.vue";
import DictEditor from "components/composer/common/DictEditor.vue";
import { stringifyArgv, parseFunction } from "js/composer/formatString";

export default defineComponent({
  name: "MultiParams",
  components: {
    VariableInput,
    NumberInput,
    ArrayEditor,
    DictEditor,
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
