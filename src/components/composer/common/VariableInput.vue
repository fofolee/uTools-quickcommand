<template>
  <q-input
    v-model="inputValue"
    dense
    filled
    :label="label"
    :placeholder="placeholder"
    class="variable-input"
  >
    <template v-slot:append>
      <q-btn
        flat
        dense
        size="sm"
        class="string-toggle prepend-btn"
        :icon="isString ? 'format_quote' : 'data_object'"
        @click="toggleType"
      >
        <q-tooltip>{{ typeToggleTooltip }}</q-tooltip>
      </q-btn>
      <!-- 选项下拉按钮 -->
      <ItemList
        v-if="options.items"
        :items="options.items"
        :multiSelect="options.multiSelect"
        @emit-value="updateValBySelect"
        class="prepend-btn"
      />
      <!-- 文件选择按钮 -->
      <FileSelector
        v-if="options.dialog"
        :dialog="options.dialog"
        @emit-value="updateValBySelect"
        class="prepend-btn"
      />
      <!-- css选择按钮 -->
      <CssSelector
        v-if="options.cssSelector"
        @emit-value="updateValBySelect"
        class="prepend-btn"
      />
      <!-- 窗口选择按钮 -->
      <WindowSelector
        v-if="options.window"
        :window="options.window"
        @emit-value="updateValBySelect"
        class="prepend-btn"
      />
      <!-- 变量选择下拉 -->
      <VariableList
        @emit-value="updateValBySelect"
        :show-variable-list="true"
        :show-function-list="true"
        :show-global-variables="true"
        class="prepend-btn variable-list-btn"
      />
    </template>
    <template v-slot:prepend>
      <q-icon v-if="!noIcon" :name="icon || 'code'" />
    </template>
  </q-input>
</template>

<script>
import { defineComponent } from "vue";
import { newVarInputVal } from "js/composer/varInputValManager";
import ItemList from "./varinput/ItemList.vue";
import FileSelector from "./varinput/FileSelector.vue";
import VariableList from "./varinput/VariableList.vue";
import WindowSelector from "./varinput/WindowSelector.vue";
import CssSelector from "./varinput/CssSelector.vue";
/**
 * 变量输入框组件
 * @description 支持变量选择和字符串输入的输入框组件
 *
 * @property {Object} modelValue - 输入框的值对象
 * @property {String} label - 输入框标签
 * @property {String} icon - 输入框图标
 * @property {String} placeholder - 输入框占位文本
 * @property {Boolean} noIcon - 是否隐藏图标
 * @property {Boolean} disableToggleType - 是否禁用类型切换
 *
 * @property {Object} [options] - 可选的配置对象
 *
 * @property {Object} [options.items] - 选项列表配置
 * @property {Array<Object|String>} [options.items] - 选项数组，每项可以是字符串或对象
 * @property {String} [options.items[].label] - 选项显示文本(当选项为对象时)
 * @property {String} [options.items[].value] - 选项值(当选项为对象时)
 * @property {Boolean} [options.multiSelect] - 是否支持多选
 * @property {Boolean} [options.appendItem] - 是否将选中项追加到现有值后
 *
 * @property {Object} [options.dialog] - 文件选择对话框配置
 * @property {String} [options.dialog.type] - 对话框类型: 'open' 或 'save'
 * @property {Object} [options.dialog.options] - utools 对话框选项
 * @property {String} [options.dialog.options.title] - 对话框标题
 * @property {String} [options.dialog.options.defaultPath] - 默认路径
 * @property {Array<String>} [options.dialog.options.properties] - 对话框属性，如 ['openFile', 'multiSelections']
 *
 * @property {Object} [options.cssSelector] - CSS选择器配置
 * @property {Boolean} [options.cssSelector] - 设置为 true 启用CSS选择器功能
 *
 * @property {Object} [options.window] - 窗口选择器配置
 * @property {Object} [options.window.props] - 要获取的窗口属性
 * @property {Array<Object>} [options.window.props] - 属性列表，每项包含label和value
 * @property {String} [options.window.props[].label] - 属性显示名称
 * @property {String} [options.window.props[].value] - 属性访问路径，如 'bounds.x'
 *
 * @example
 * // 基础用法
 * <VariableInput
 *   v-model="value"
 *   label="输入框"
 *   icon="edit"
 *   placeholder="请输入"
 * />
 *
 * @example
 * // 带选项列表的输入框
 * <VariableInput
 *   v-model="value"
 *   :options="{
 *     items: ['选项1', '选项2', {label: '选项3', value: 'value3'}],
 *     multiSelect: true
 *   }"
 * />
 *
 * @example
 * // 文件选择输入框
 * <VariableInput
 *   v-model="value"
 *   :options="{
 *     dialog: {
 *       type: 'open',
 *       options: {
 *         title: '选择文件',
 *         defaultPath: '/',
 *         properties: ['openFile', 'multiSelections']
 *       }
 *     }
 *   }"
 * />
 *
 * @example
 * // CSS选择器输入框
 * <VariableInput
 *   v-model="value"
 *   :options="{
 *     cssSelector: true
 *   }"
 * />
 *
 * @example
 * // 窗口选择器输入框
 * <VariableInput
 *   v-model="value"
 *   :options="{
 *     window: {
 *       props: [
 *         {label: '窗口标题', value: 'title'},
 *         {label: 'X坐标', value: 'bounds.x'}
 *       ]
 *     }
 *   }"
 * />
 */
export default defineComponent({
  name: "VariableInput",

  components: {
    ItemList,
    FileSelector,
    VariableList,
    WindowSelector,
    CssSelector,
  },

  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => newVarInputVal("str"),
    },
    label: String,
    placeholder: String,
    icon: String,
    noIcon: Boolean,
    options: {
      type: Object,
      default: () => ({}),
    },
    disableToggleType: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:modelValue"],

  data() {
    return {
      selectedVariable: null,
    };
  },

  computed: {
    isString: {
      get() {
        return this.modelValue?.isString;
      },
      set(value) {
        this.$emit("update:modelValue", {
          ...this.modelValue,
          isString: value,
        });
      },
    },

    typeToggleTooltip() {
      const currentType = this.isString
        ? "字符串"
        : "变量、数字、表达式、函数等";
      const toggleText = this.disableToggleType ? "" : "，点击切换";
      return `当前类型是：${currentType}${toggleText}`;
    },

    inputValue: {
      get() {
        return this.modelValue?.value;
      },
      set(value) {
        this.$emit("update:modelValue", {
          ...this.modelValue,
          value,
        });
      },
    },
  },

  methods: {
    // 清除变量时的处理
    clearVariable() {
      this.selectedVariable = null;
      this.isString = true; // 恢复到字符串模式
      this.$emit("update:modelValue", newVarInputVal("str"));
    },

    // 切换类型
    toggleType() {
      if (this.disableToggleType) return;
      this.$emit("update:modelValue", {
        ...this.modelValue,
        isString: !this.modelValue.isString,
      });
    },

    updateValBySelect(type, value) {
      const newValue = this.options.appendItem
        ? this.inputValue + value
        : value;
      this.$emit("update:modelValue", newVarInputVal(type, newValue));
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
  padding-right: 0px;
}

.variable-input :deep(.q-field__append) {
  padding-left: 0;
}

.prepend-btn {
  max-width: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  transition: all 0.6s ease;
}

.string-toggle.prepend-btn {
  transform: translateX(14px);
  max-width: 0;
  margin-left: 0;
  opacity: 0;
}

.variable-input:hover .string-toggle.prepend-btn {
  max-width: 14px;
  opacity: 1;
  transform: translateX(0);
  margin-left: 5px;
  transition: all 0.6s ease;
}

/* 暗色模式 */
.variable-list-btn {
  background: rgba(0, 0, 0, 0.02);
}

.body--dark .variable-list-btn {
  background: rgba(255, 255, 255, 0.02);
}
</style>
