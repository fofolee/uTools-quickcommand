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
        @click="isString = !isString"
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
</style>
