<template>
  <div class="row q-col-gutter-sm">
    <!-- 控制区 -->
    <div class="col-12">
      <div class="row items-center q-gutter-sm">
        <!-- 选项类型选择 -->
        <div class="col model-type-select">
          <OperationCard
            v-model="argvs.optionType"
            :options="[
              { label: '纯文本', value: 'plaintext', icon: 'text_fields' },
              { label: 'HTML', value: 'html', icon: 'code' },
              { label: 'JSON', value: 'json', icon: 'data_object' },
            ]"
            square
            height="36px"
            @update:model-value="updateArgvs('optionType', $event)"
          />
        </div>

        <!-- 输入模式切换 -->
        <div class="col-2.5 input-mode-select">
          <q-select
            :model-value="argvs.inputMode"
            @update:model-value="updateArgvs('inputMode', $event)"
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
          :options="{
            keys: [
              {
                value: 'title',
                label: '标题',
              },
              {
                value: 'description',
                label: '描述',
              },
            ],
          }"
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

const jsonDefaultSelects = {
  selects: new Array(3).fill({
    title: {
      value: "",
      isString: true,
      __varInputVal__: true,
    },
    description: {
      value: "",
      isString: true,
      __varInputVal__: true,
    },
  }),
};

const textDefaultSelects = {
  selects: new Array(3).fill({
    value: "",
    isString: true,
    __varInputVal__: true,
  }),
};

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
        placeholder: {
          value: "搜索...",
          isString: true,
          __varInputVal__: true,
        },
        enableSearch: true,
        showCancelButton: false,
        closeOnSelect: true,
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
    updateArgvs(key, value) {
      const argvs = { ...this.argvs };
      const keys = key.split(".");
      const lastKey = keys.pop();
      const target = keys.reduce((obj, key) => obj[key], argvs);
      target[lastKey] = value;
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
          variableFormatPaths: ["arg0", "arg1.placeholder"],
        });
        if (!result) return this.defaultArgvs;

        const [selects, options = {}] = result.argvs;
        return {
          ...this.defaultArgvs,
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
  },
  mounted() {
    if (!this.modelValue.argvs && !this.modelValue.code) {
      this.updateModelValue(this.defaultArgvs);
    }
  },
  watch: {
    "argvs.optionType": {
      immediate: true,
      handler(newVal) {
        this.argvs.selects = defaultSelects[newVal];
      },
    },
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
