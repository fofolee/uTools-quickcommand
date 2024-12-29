<template>
  <q-input
    v-if="!isNumber"
    v-model="localValue"
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
        @click="toggleStringType"
        v-if="!hasSelectedVariable"
      >
        <q-tooltip>{{
          isString
            ? "当前类型是：字符串，点击切换"
            : "当前类型是：变量、数字、表达式等，点击切换"
        }}</q-tooltip>
      </q-btn>

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
          <q-item-label header class="text-subtitle2">
            <q-icon name="functions" size="16px" class="q-mr-sm" />
            选择变量
          </q-item-label>

          <q-separator />

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
      <q-icon :name="command.icon || 'code'" />
    </template>
  </q-input>
  <!-- 强制为数字类型时，不支持切换类型 -->
  <q-input
    v-else
    type="number"
    v-model.number="localValue"
    dense
    filled
    :label="label"
    class="number-input"
  >
    <template v-slot:prepend>
      <q-icon v-if="command.icon" :name="command.icon" />
    </template>
    <template v-slot:append>
      <!-- <q-icon name="pin" size="xs" /> -->
      <div class="column items-center number-controls">
        <q-btn
          flat
          dense
          round
          icon="keyboard_arrow_up"
          size="xs"
          class="number-btn"
          @click="updateNumber(100)"
        />
        <q-btn
          flat
          dense
          round
          icon="keyboard_arrow_down"
          size="xs"
          class="number-btn"
          @click="updateNumber(-100)"
        />
      </div>
    </template>
  </q-input>
</template>

<script>
import { defineComponent, inject } from "vue";

export default defineComponent({
  name: "VariableInput",

  props: {
    modelValue: [String, Number],
    label: String,
    command: {
      type: Object,
      required: true,
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
      // 根据输入类型初始化字符串状态
      isString: this.command.inputType !== "number",
    };
  },

  computed: {
    localValue: {
      get() {
        // 数字类型直接返回原值
        if (this.isNumber) return this.modelValue;
        // 非数字类型时，根据isString状态决定是否显示引号
        const val = this.modelValue || "";
        return this.isString ? val.replace(/^"|"$/g, "") : val;
      },
      set(value) {
        this.$emit("update:modelValue", this.formatValue(value));
      },
    },

    // 判断是否有选中的变量，用于控制UI显示和行为
    hasSelectedVariable() {
      return this.selectedVariable !== null;
    },

    isNumber() {
      return this.command.inputType === "number";
    },
  },

  methods: {
    // 格式化值，处理引号的添加和移除
    formatValue(value) {
      // 空值、变量模式或数字类型时不处理
      if (!value || this.hasSelectedVariable || this.isNumber) return value;
      // 根据isString状态添加或移除引号
      return this.isString
        ? `"${value.replace(/^"|"$/g, "")}"`
        : value.replace(/^"|"$/g, "");
    },

    // 切换字符串/非字符串模式
    toggleStringType() {
      if (!this.hasSelectedVariable) {
        this.isString = !this.isString;
        // 有值时需要重新格式化
        if (this.modelValue) {
          this.$emit("update:modelValue", this.formatValue(this.modelValue));
        }
      }
    },

    // 外部调用的方法，用于设置字符串状态
    setIsString(value) {
      if (!this.hasSelectedVariable && this.isString !== value) {
        this.isString = value;
        // 有值时需要重新格式化
        if (this.modelValue) {
          this.$emit("update:modelValue", this.formatValue(this.modelValue));
        }
      }
    },

    // 插入变量时的处理
    insertVariable(variable) {
      this.selectedVariable = variable;
      this.isString = false; // 变量模式下不需要字符串处理
      this.$emit("update:modelValue", variable.name);
    },

    // 清除变量时的处理
    clearVariable() {
      this.selectedVariable = null;
      this.isString = true; // 恢复到字符串模式
      this.$emit("update:modelValue", "");
    },

    // 数字类型特有的增减处理
    updateNumber(delta) {
      const current = Number(this.localValue) || 0;
      this.$emit("update:modelValue", current + delta);
    },
  },

  watch: {
    // 解决通过外部传入值时，无法触发字符串处理的问题
    modelValue: {
      immediate: true,
      handler(newVal) {
        // 只在有值且非变量模式且非数字类型时处理
        if (newVal && !this.hasSelectedVariable && !this.isNumber) {
          const formattedValue = this.formatValue(newVal);
          // 只在值真正需要更新时才发更新
          if (formattedValue !== newVal) {
            this.$emit("update:modelValue", formattedValue);
          }
        }
      },
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
  opacity: 0.8;
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
  margin: 2px 0;
  transition: all 0.3s ease;
}

.variable-item:hover {
  background: var(--q-primary-opacity-10);
}

.variable-name {
  font-size: 13px;
  font-weight: 500;
}

.variable-source {
  font-size: 12px;
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

/* 数字输入框样式 */
.number-input {
  width: 100%;
}

/* 隐藏默认的数字输入框箭头 - Chrome, Safari, Edge, Opera */
.number-input :deep(input[type="number"]::-webkit-outer-spin-button),
.number-input :deep(input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

.number-input :deep(.q-field__control) {
  padding-left: 8px;
  padding-right: 4px;
}

.number-controls {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.number-btn {
  opacity: 0.7;
  font-size: 12px;
  padding: 0;
  margin: 0;
  min-height: 16px;
  height: 16px;
  width: 20px;
}

.number-btn :deep(.q-icon) {
  font-size: 12px;
}

.number-btn:hover {
  opacity: 1;
  color: var(--q-primary);
}
</style>
