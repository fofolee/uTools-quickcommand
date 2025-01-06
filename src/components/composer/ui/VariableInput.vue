<template>
  <q-input
    v-model="inputValue"
    dense
    filled
    :label="label"
    class="variable-input"
  >
    <template v-slot:append>
      <q-btn
        v-if="hasSelectedVariable"
        flat
        dense
        round
        icon="close"
        size="sm"
        class="clear-btn q-mr-xs"
        @click="clearVariable"
      >
        <q-tooltip>清除选中的变量</q-tooltip>
      </q-btn>
      <q-btn
        flat
        dense
        round
        :icon="isString ? 'format_quote' : 'data_object'"
        size="sm"
        class="string-toggle"
        @click="toggleType"
        v-if="!hasSelectedVariable"
      >
        <q-tooltip>{{
          isString
            ? "当前类型是：字符串，点击切换"
            : "当前类型是：变量、数字、表达式等，点击切换"
        }}</q-tooltip>
      </q-btn>
      <!-- 选项下拉按钮 -->
      <q-btn-dropdown
        v-if="options && !hasSelectedVariable"
        flat
        dense
        size="sm"
        dropdown-icon="menu"
        no-icon-animation
        class="options-dropdown"
      >
        <q-list class="options-list">
          <q-item
            v-for="option in normalizedOptions"
            :key="getOptionValue(option)"
            clickable
            v-close-popup
            @click="selectOption(option)"
            class="option-item"
          >
            <q-item-section>
              {{ getOptionLabel(option) }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <!-- 变量选择下拉 -->
      <q-btn-dropdown
        flat
        dense
        :class="{
          'text-primary': hasSelectedVariable,
          'text-grey-6': !hasSelectedVariable,
        }"
        class="variable-dropdown"
        size="sm"
        v-if="variables.length"
      >
        <q-list class="variable-list">
          <q-item-label header class="variable-label">
            <q-icon name="functions" size="15px" />
            选择变量
          </q-item-label>

          <q-separator class="q-my-xs" />

          <template v-if="variables.length">
            <q-item
              v-for="variable in variables"
              :key="variable.name"
              clickable
              v-close-popup
              @click="insertVariable(variable)"
              class="variable-item"
            >
              <q-item-section>
                <q-item-label class="variable-name">
                  {{ variable.name }}
                </q-item-label>
                <q-item-label caption class="variable-source">
                  来自: {{ variable.sourceCommand.label }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-btn-dropdown>
    </template>
    <template v-slot:prepend>
      <q-icon :name="icon || 'code'" />
    </template>
  </q-input>
</template>

<script>
import { defineComponent, inject } from "vue";

/**
 * 变量输入框组件
 * @description 支持变量选择和字符串输入的输入框组件
 *
 * @property {Object} modelValue - 输入框的值对象
 * @property {String} label - 输入框标签
 * @property {String} icon - 输入框图标
 * @property {String[]} [options] - 可选的下拉选项列表
 *
 * @example
 * // modelValue 对象格式
 * {
 *   value: "", // 输入框的值
 *   isString: true, // 是否是字符串
 *   __varInputVal__: true // 用于标识是变量输入框
 * }
 */
export default defineComponent({
  name: "VariableInput",

  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => ({
        value: "",
        isString: true,
        __varInputVal__: true,
      }),
    },
    label: String,
    icon: String,
    options: {
      type: Array,
      default: null,
      validator(value) {
        if (!value) return true;
        // 检查数组中的每一项是否符合格式要求
        return value.every((item) => {
          return (
            typeof item === "string" || // ["xxx", "yyy"]
            (typeof item === "object" && "label" in item && "value" in item) // [{label: "xxx", value: "yyy"}]
          );
        });
      },
    },
  },

  emits: ["update:modelValue"],
  setup() {
    const variables = inject("composerVariables", []);
    return { variables };
  },

  data() {
    return {
      selectedVariable: null,
    };
  },

  computed: {
    // 判断是否有选中的变量，用于控制UI显示和行为
    hasSelectedVariable() {
      return this.selectedVariable !== null;
    },

    isString: {
      get() {
        return this.modelValue.isString;
      },
      set(value) {
        this.$emit("update:modelValue", {
          ...this.modelValue,
          isString: value,
        });
      },
    },

    inputValue: {
      get() {
        return this.modelValue.value;
      },
      set(value) {
        this.$emit("update:modelValue", {
          ...this.modelValue,
          value,
        });
      },
    },

    // 标准化选项格式
    normalizedOptions() {
      console.log(this.options);
      if (!this.options) return [];
      return this.options.map((option) => {
        if (typeof option === "string") {
          return { label: option, value: option };
        }
        return option;
      });
    },
  },

  methods: {
    // 插入变量时的处理
    insertVariable(variable) {
      this.selectedVariable = variable;
      this.isString = false; // 变量模式下不需要字符串处理
      this.$emit("update:modelValue", {
        isString: false,
        value: variable.name,
        __varInputVal__: true,
      });
    },

    // 清除变量时的处理
    clearVariable() {
      this.selectedVariable = null;
      this.isString = true; // 恢复到字符串模式
      this.$emit("update:modelValue", {
        isString: true,
        value: "",
        __varInputVal__: true,
      });
    },

    // 切换类型
    toggleType() {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        isString: !this.modelValue.isString,
      });
    },

    getOptionLabel(option) {
      return typeof option === "string" ? option : option.label;
    },

    getOptionValue(option) {
      return typeof option === "string" ? option : option.value;
    },

    selectOption(option) {
      const value = this.getOptionValue(option);
      this.$emit("update:modelValue", {
        value,
        isString: true,
        __varInputVal__: true,
      });
    },
  },
});
</script>

<style scoped>
.variable-input {
  width: 100%;
}

.variable-input :deep(.q-field__control) {
  padding-left: 8px;
  padding-right: 8px;
}

/* 字符串切换按钮样式 */
.string-toggle {
  min-width: 24px;
  padding: 4px;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.string-toggle:hover {
  opacity: 1;
  transform: scale(1.05);
}

/* 变量下拉框样式 */
.variable-dropdown {
  min-width: 32px;
  padding: 4px;
  opacity: 0.8;
  transition: all 0.3s ease;
  margin-left: 4px;
}

.variable-dropdown:hover {
  opacity: 1;
  transform: scale(1.05);
}

/* 变量列表样式 */
.variable-list {
  min-width: 200px;
  padding: 4px;
}

.variable-item {
  border-radius: 4px;
  padding: 0px 16px;
  transition: all 0.3s ease;
  min-height: 40px;
}

.variable-item:hover {
  background: var(--q-primary-opacity-10);
}

.variable-label {
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.variable-name {
  font-size: 12px;
  font-weight: 500;
}

.variable-source {
  font-size: 11px;
  opacity: 0.7;
}

/* 暗色模式适配 */
.body--dark .variable-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 清空按钮样式 */
.clear-btn {
  opacity: 0.6;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  opacity: 1;
  transform: scale(1.1);
  color: var(--q-negative);
}

/* 选项下拉框样式 */
.options-dropdown {
  min-width: 32px;
  padding: 4px;
  opacity: 0.8;
  transition: all 0.3s ease;
  margin-left: 4px;
}

.options-dropdown:hover {
  opacity: 1;
  transform: scale(1.05);
}

.options-list {
  min-width: 120px;
  padding: 4px;
}

.option-item {
  border-radius: 4px;
  padding: 0px 16px;
  transition: all 0.3s ease;
  min-height: 40px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.option-item:hover {
  background: var(--q-primary-opacity-10);
}

/* 暗色模式适配 */
.body--dark .option-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
