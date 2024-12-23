<template>
  <q-input
    v-model="inputValue"
    dense
    outlined
    :label="label"
    class="variable-input"
  >
    <template v-slot:prepend>
      <q-btn
        flat
        dense
        round
        :icon="isString ? 'format_quote' : 'format_quote'"
        size="sm"
        :class="{
          'text-primary': isString,
          'text-grey-6': !isString,
        }"
        class="string-toggle"
        @click="toggleStringType"
      >
        <q-tooltip>{{
          isString
            ? "当前类型是：字符串，点击切换"
            : "当前类型是：变量、数字、表达式等，点击切换"
        }}</q-tooltip>
      </q-btn>
    </template>

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

      <q-btn-dropdown
        flat
        dense
        :icon="hasSelectedVariable ? 'data_object' : 'functions'"
        :class="{
          'text-primary': hasSelectedVariable,
          'text-grey-6': !hasSelectedVariable,
        }"
        class="variable-dropdown"
        size="sm"
      >
        <q-list class="variable-list">
          <q-item-label header class="text-subtitle2">
            <q-icon name="functions" size="16px" class="q-mr-sm" />
            选择变量
          </q-item-label>

          <q-separator v-if="variables.length > 0" />

          <template v-if="variables.length > 0">
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

          <q-item v-else class="text-grey-6">
            <q-item-section class="text-center">
              <q-item-label>暂无可用变量</q-item-label>
              <q-item-label caption>
                点击命令卡片的「获取输出」按钮输入保存的变量名
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </template>
  </q-input>
</template>

<script>
import { defineComponent, inject, computed } from "vue";

export default defineComponent({
  name: "VariableInput",

  props: {
    modelValue: String,
    label: String,
  },

  emits: ["update:modelValue", "update:type"],

  setup() {
    const variables = inject("composerVariables", []);
    return { variables };
  },

  data() {
    return {
      isString: true,
      selectedVariable: null,
    };
  },

  computed: {
    inputValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    hasSelectedVariable() {
      return this.selectedVariable !== null;
    },
  },

  methods: {
    toggleStringType() {
      if (!this.hasSelectedVariable) {
        this.isString = !this.isString;
        this.$emit("update:type", this.isString ? "string" : "number");
      }
    },

    insertVariable(variable) {
      this.selectedVariable = variable;
      this.isString = false;
      this.$emit("update:type", "variable");
      this.$emit("update:modelValue", variable.name);
    },

    clearVariable() {
      this.selectedVariable = null;
      this.isString = true;
      this.$emit("update:type", "string");
      this.$emit("update:modelValue", "");
    },
  },

  watch: {
    modelValue(newVal) {
      if (this.selectedVariable && newVal !== this.selectedVariable.name) {
        this.selectedVariable = null;
        this.isString = true;
        this.$emit("update:type", "string");
      }
    },
  },

  mounted() {
    this.$emit("update:type", "string");
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
  background: rgba(var(--q-primary-rgb), 0.1);
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
</style>
