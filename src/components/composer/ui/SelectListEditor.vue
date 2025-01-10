<template>
  <div class="row q-col-gutter-sm">
    <!-- 控制区 -->
    <div class="col-12">
      <div class="row items-center q-gutter-sm">
        <!-- 选项类型选择 -->
        <div class="col model-type-select">
          <OperationCard
            :model-value="argvs.optionType"
            :options="[
              { label: '纯文本', value: 'plaintext', icon: 'text_fields' },
              { label: 'HTML', value: 'html', icon: 'code' },
              { label: 'JSON', value: 'json', icon: 'data_object' },
            ]"
            square
            height="36px"
            @update:model-value="handleOptionTypeChange"
          />
        </div>

        <!-- 输入模式切换 -->
        <div class="col-2.5 input-mode-select">
          <q-select
            :model-value="argvs.inputMode"
            @update:model-value="handleInputModeChange"
            :options="[
              {
                label: '手动输入',
                value: 'manual',
                icon: 'edit',
              },
              {
                label: '变量输入',
                value: 'variable',
                icon: 'functions',
              },
            ]"
            dense
            filled
            emit-value
            map-options
            option-value="value"
            option-label="label"
          >
            <template v-slot:selected>
              <div class="row items-center">
                <q-icon
                  :name="argvs.inputMode === 'manual' ? 'edit' : 'functions'"
                  size="16px"
                  class="q-mr-xs"
                />
                {{ argvs.inputMode === "manual" ? "手动输入" : "变量输入" }}
              </div>
            </template>
          </q-select>
        </div>

        <!-- 设置按钮 -->
        <div class="col-auto">
          <q-btn
            flat
            round
            dense
            icon="settings"
            color="primary"
            @click="showSettings = !showSettings"
          >
            <q-tooltip>高级设置</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- 设置面板 -->
    <q-slide-transition>
      <div v-show="showSettings" class="row q-col-gutter-sm">
        <!-- 搜索框占位符 -->
        <div class="col">
          <VariableInput
            :disabled="!argvs.enableSearch"
            :model-value="argvs.placeholder"
            label="搜索框占位符"
            icon="search"
            dense
            @update:model-value="updateArgvs('placeholder', $event)"
          />
        </div>

        <!-- 开关选项 -->
        <div class="col-auto items-center row">
          <div class="row q-col-gutter-x-md">
            <q-checkbox
              :model-value="argvs.enableSearch"
              label="启用搜索"
              dense
              class="toggle-option"
              @update:model-value="updateArgvs('enableSearch', $event)"
            />
            <q-checkbox
              :model-value="argvs.showCancelButton"
              label="关闭按钮"
              dense
              class="toggle-option"
              @update:model-value="updateArgvs('showCancelButton', $event)"
            />
            <q-checkbox
              :model-value="argvs.closeOnSelect"
              label="选择后关闭"
              dense
              class="toggle-option"
              @update:model-value="updateArgvs('closeOnSelect', $event)"
            />
          </div>
        </div>
      </div>
    </q-slide-transition>

    <!-- 变量输入模式 -->
    <div v-if="argvs.inputMode === 'variable'" class="col-12">
      <VariableInput
        :model-value="argvs.selects"
        label="选项列表"
        icon="list"
        @update:model-value="updateArgvs('selects', $event)"
      />
    </div>

    <!-- 手动输入模式 -->
    <div v-else class="col-12">
      <template v-if="argvs.optionType === 'json'">
        <ArrayEditor
          :model-value="argvs.selects"
          :columns="arrayEditorColumns"
          :default-row-value="arrayEditorDefaultRowValue"
          @update:model-value="updateArgvs('selects', $event)"
        >
          <template #header>
            <div class="text-caption q-px-sm q-py-xs bg-grey-2">
              JSON选项列表
            </div>
          </template>
        </ArrayEditor>
      </template>
      <template v-else>
        <ArrayEditor
          :model-value="argvs.selects"
          @update:model-value="updateArgvs('selects', $event)"
        >
          <template #header>
            <div class="text-caption q-px-sm q-py-xs bg-grey-2">
              {{ argvs.optionType === "html" ? "HTML" : "文本" }}选项列表
            </div>
          </template>
        </ArrayEditor>
      </template>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "../common/VariableInput.vue";
import ArrayEditor from "../common/ArrayEditor.vue";
import OperationCard from "../common/OperationCard.vue";
import { parseFunction, stringifyArgv } from "js/composer/formatString";
import { newVarInputVal, isVarInputVal } from "js/composer/varInputValManager";

const jsonDefaultSelects = new Array(3).fill().map((_, index) => ({
  id: newVarInputVal("var", index),
  title: newVarInputVal("str"),
  description: newVarInputVal("str"),
}));

const textDefaultSelects = new Array(3).fill(newVarInputVal("str"));

const defaultSelects = {
  json: jsonDefaultSelects,
  plaintext: textDefaultSelects,
  html: textDefaultSelects,
};

export default defineComponent({
  name: "SelectListEditor",
  components: {
    VariableInput,
    ArrayEditor,
    OperationCard,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      showSettings: false,
      optionTypes: [
        { label: "纯文本", value: "plaintext" },
        { label: "HTML", value: "html" },
        { label: "JSON", value: "json" },
      ],
      defaultArgvs: {
        inputMode: "manual",
        selects: defaultSelects.json,
        optionType: "json",
        placeholder: newVarInputVal("str", "搜索..."),
        enableSearch: true,
        showCancelButton: false,
        closeOnSelect: true,
      },
      arrayEditorDefaultRowValue: {
        id: newVarInputVal("var"),
        title: newVarInputVal("str"),
        description: newVarInputVal("str"),
      },
      arrayEditorColumns: {
        id: {
          label: "id",
          width: 3,
          noIcon: true,
        },
        title: {
          label: "标题",
          noIcon: true,
        },
        description: {
          label: "描述",
          noIcon: true,
          width: 4,
        },
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
    /**
     * 更新参数
     * @param {string|string[]} keys - 键名
     * @param {string|string[]} values - 值
     */
    updateArgvs(keys, values) {
      if (typeof keys === "string") {
        keys = [keys];
        values = [values];
      }
      const argvs = { ...this.argvs };
      // 更新每一个键
      keys.forEach((key, index) => {
        // 支持嵌套对象的键值
        const subKeys = key.split(".");
        const lastKey = subKeys.pop();
        const target = subKeys.reduce((obj, key) => obj[key], argvs);
        target[lastKey] = values[index];
      });
      this.updateModelValue(argvs);
    },
    generateCode(argvs = this.argvs) {
      const {
        selects,
        optionType,
        placeholder,
        enableSearch,
        showCancelButton,
        closeOnSelect,
      } = argvs;

      // 构建选项对象
      const options = {
        ...(enableSearch && placeholder?.value && { placeholder: placeholder }),
        ...(optionType !== "plaintext" && { optionType }),
        ...(enableSearch !== true && { enableSearch }),
        ...(showCancelButton && { showCancelButton }),
        ...(closeOnSelect !== true && { closeOnSelect }),
      };

      // 生成代码
      return `${this.modelValue.value}(${stringifyArgv(selects)}${
        Object.keys(options).length ? `, ${stringifyArgv(options)}` : ""
      })`;
    },
    parseCodeToArgvs(code) {
      if (!code) return this.defaultArgvs;

      try {
        const result = parseFunction(code, {
          variableFormatPaths: ["arg0", "arg0[*]", "arg1.placeholder"],
        });

        if (!result) return this.defaultArgvs;

        const [selects, options = {}] = result.argvs;
        const inputMode = isVarInputVal(selects) ? "variable" : "manual";
        return {
          ...this.defaultArgvs,
          inputMode,
          selects,
          ...options,
        };
      } catch (e) {
        console.warn("选择列表参数解析失败:", code);
        return this.defaultArgvs;
      }
    },
    getSummary(argvs) {
      const count = Array.isArray(argvs.selects) ? argvs.selects.length : "?";
      return `显示${count}个${
        argvs.optionType === "json"
          ? "JSON"
          : argvs.optionType === "html"
          ? "HTML"
          : "文本"
      }选项`;
    },
    updateModelValue(argvs) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        summary: this.getSummary(argvs),
        code: this.generateCode(argvs),
        argvs,
      });
    },
    handleOptionTypeChange(newOptionType) {
      const oldOptionType = this.argvs.optionType;
      // 原地点击不处理
      if (oldOptionType === newOptionType) return;
      // 变量输入模式不需要处理 selects
      if (this.argvs.inputMode === "variable") {
        this.updateArgvs("optionType", newOptionType);
        return;
      }
      const oldSelects = this.argvs.selects;
      let newSelects = oldSelects;
      // 从JSON转换为非JSON时，取title或description
      if (oldOptionType === "json") {
        newSelects = oldSelects.map(
          (item) => item.title || item.description || newVarInputVal("str")
        );
      } else if (newOptionType === "json") {
        // 从非JSON转换为JSON时，添加title和description
        newSelects = oldSelects.map((item) => ({
          title: item,
          description: item,
        }));
      }
      this.updateArgvs(["optionType", "selects"], [newOptionType, newSelects]);
    },
    handleInputModeChange(newInputMode) {
      let newSelects = this.argvs.selects;
      if (newInputMode === "variable") {
        newSelects = newVarInputVal("var");
      } else {
        newSelects = defaultSelects[this.argvs.optionType];
      }
      this.updateArgvs(["inputMode", "selects"], [newInputMode, newSelects]);
    },
  },
  mounted() {
    if (!this.modelValue.argvs && !this.modelValue.code) {
      this.updateModelValue(this.defaultArgvs);
    }
  },
});
</script>

<style scoped>
.toggle-option {
  font-size: 12px;
}

.toggle-option :deep(.q-toggle__label) {
  font-size: inherit;
}
</style>
