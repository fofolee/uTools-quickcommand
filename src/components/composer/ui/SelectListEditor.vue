<template>
  <div class="row q-col-gutter-sm">
    <!-- 控制区 -->
    <div class="sub-command-card col-12">
      <OperationCard
        :model-value="argvs.subCommand"
        :options="subCommands"
        @update:model-value="handleSubCommandChange"
      />
    </div>
    <div class="col-12">
      <div class="row items-center q-gutter-sm">
        <!-- 选项类型选择 -->
        <div class="col model-type-select">
          <OperationCard
            :model-value="argvs.optionType"
            :options="optionTypes"
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
            options-dense
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
      </div>
    </div>

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
    <div class="col-12">
      <BorderLabel label="设置" icon="settings">
        <div class="row q-col-gutter-sm items-center">
          <!-- 搜索框占位符 -->
          <div class="col">
            <VariableInput
              :disabled="!argvs.enableSearch"
              :model-value="argvs.placeholder"
              :disable="!argvs.enableSearch"
              label="搜索框占位符"
              icon="search"
              dense
              @update:model-value="updateArgvs('placeholder', $event)"
            />
          </div>

          <!-- 开关选项 -->
          <q-toggle
            :model-value="argvs.enableSearch"
            label="启用搜索"
            dense
            class="toggle-option"
            @update:model-value="updateArgvs('enableSearch', $event)"
          />
          <q-toggle
            v-if="hasHtmlOption(argvs.subCommand)"
            :model-value="argvs.showCancelButton"
            label="关闭按钮"
            dense
            class="toggle-option"
            @update:model-value="updateArgvs('showCancelButton', $event)"
          />
          <q-toggle
            v-if="hasHtmlOption(argvs.subCommand)"
            :model-value="argvs.closeOnSelect"
            label="选择后关闭"
            dense
            class="toggle-option"
            @update:model-value="updateArgvs('closeOnSelect', $event)"
          />
        </div>
      </BorderLabel>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "components/composer/common/VariableInput.vue";
import ArrayEditor from "components/composer/common/ArrayEditor.vue";
import OperationCard from "components/composer/common/OperationCard.vue";
import BorderLabel from "components/composer/common/BorderLabel.vue";
import { stringifyArgv } from "js/composer/formatString";
import { newVarInputVal } from "js/composer/varInputValManager";

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
    BorderLabel,
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
      arrayEditorDefaultRowValue: {
        id: newVarInputVal("var"),
        title: newVarInputVal("str"),
        description: newVarInputVal("str"),
      },
      arrayEditorColumns: {
        id: {
          label: "id",
          width: 2,
          noIcon: true,
        },
        title: {
          label: "标题",
          noIcon: true,
          width: 4,
        },
        description: {
          label: "描述",
          noIcon: true,
          width: 6,
        },
      },
      subCommands: [
        {
          label: "插件内弹窗",
          value: "quickcommand.showSelectList",
          icon: "call_to_action",
        },
        {
          label: "系统弹窗",
          value: "quickcommand.showSystemSelectList",
          icon: "report",
        },
      ],
      defaultArgvs: {
        subCommand: "quickcommand.showSelectList",
        inputMode: "manual",
        selects: defaultSelects.json,
        optionType: "json",
        placeholder: newVarInputVal("str", "搜索..."),
        enableSearch: true,
        showCancelButton: false,
        closeOnSelect: true,
      },
    };
  },
  computed: {
    argvs() {
      return (
        this.modelValue.argvs || window.lodashM.cloneDeep(this.defaultArgvs)
      );
    },
    optionTypes() {
      return [
        { label: "纯文本", value: "plaintext", icon: "text_fields" },
        this.hasHtmlOption(this.argvs.subCommand)
          ? { label: "HTML", value: "html", icon: "html" }
          : "",
        { label: "JSON", value: "json", icon: "data_object" },
      ].filter(Boolean);
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
    hasHtmlOption(subCommand) {
      return subCommand === "quickcommand.showSelectList";
    },
    handleSubCommandChange(newSubCommand) {
      const newArgvs = { ...this.argvs, subCommand: newSubCommand };
      if (
        !this.hasHtmlOption(newSubCommand) &&
        this.argvs.optionType === "html"
      ) {
        newArgvs.optionType = "plaintext";
      }
      this.updateModelValue(newArgvs);
    },
    generateCode(argvs = this.argvs) {
      const {
        selects,
        optionType,
        placeholder,
        enableSearch,
        showCancelButton,
        closeOnSelect,
        subCommand,
      } = argvs;

      // 构建选项对象
      const options = {
        ...(enableSearch && placeholder?.value && { placeholder: placeholder }),
        ...(optionType !== "plaintext" && { optionType }),
        ...(enableSearch !== true && { enableSearch }),
        ...(showCancelButton &&
          hasHtmlOption(subCommand) && { showCancelButton }),
        ...(closeOnSelect !== true &&
          hasHtmlOption(subCommand) && { closeOnSelect }),
      };

      // 生成代码
      return `${subCommand}(${stringifyArgv(selects)}${
        Object.keys(options).length ? `, ${stringifyArgv(options)}` : ""
      })`;
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
    this.updateModelValue(this.argvs);
  },
});
</script>

<style scoped>
.toggle-option {
  font-size: 12px;
  margin-left: 8px;
}

.toggle-option :deep(.q-toggle__label) {
  font-size: inherit;
}
</style>
