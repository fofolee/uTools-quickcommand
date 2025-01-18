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
      <!-- 窗口选择按钮 -->
      <WindowSelector
        v-if="options.window"
        :window="options.window"
        @emit-value="updateValBySelect"
        class="prepend-btn"
      />
      <!-- 变量选择下拉 -->
      <VariableList @emit-value="updateValBySelect" class="prepend-btn" />
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

/**

 * 变量输入框组件

 * @description 支持变量选择和字符串输入的输入框组件
 *
 * @property {Object} modelValue - 输入框的值对象
 * @property {String} label - 输入框标签
 * @property {String} icon - 输入框图标
 *
 * @property {Object} [options] - 可选的配置对象
 * @property {Array} [options.items] - 选项列表，默认单选，选中后，插入值且设置为字符模式
 * @property {Boolean} [options.multiSelect] - 选项列表支持多选，选中后，插入选择的数组且设置为变量模式
 *
 * @property {Boolean} [options.dialog] - 是否显示文件选择对话框
 * @property {Object} [options.dialog] - 文件选择对话框配置
 * @property {String} [options.dialog.type] - 对话框类型，open 或 save
 * @property {Object} [options.dialog.options] - 对话框选项，对应 utools.showOpenDialog 和 utools.showSaveDialog 的 options
 * @example
 * // modelValue 对象格式
 * {
 *   value: "", // 输入框的值
 *   isString: true, // 是否是字符串
 *   __varInputVal__: true // 用于标识是变量输入框
 * }
 * @example
 * // options 对象格式
 * {
 *   items: ["item1", "item2", "item3"], // 选项列表
 *   dialog: {
 *     type: "open", // 对话框类型，open 或 save
 *     options: {
 *       title: "选择文件",
 *       defaultPath: "/",
 *     },
 *   },
 * }
 */
export default defineComponent({
  name: "VariableInput",

  components: {
    ItemList,
    FileSelector,
    VariableList,
    WindowSelector,
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
        return this.modelValue.isString;
      },
      set(value) {
        this.$emit("update:modelValue", {
          ...this.modelValue,
          isString: value,
        });
      },
      typeToggleTooltip() {
        const currentType = this.isString ? "字符串" : "变量、数字、表达式等";
        const toggleText = this.disableToggleType ? "" : "，点击切换";
        return `当前类型是：${currentType}${toggleText}`;
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
</style>
