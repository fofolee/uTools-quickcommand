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
        v-if="hasSelectedVariable"
        flat
        dense
        icon="close"
        size="sm"
        class="clear-btn prepend-btn"
        @click="clearVariable"
      >
        <q-tooltip>清除选中的变量</q-tooltip>
      </q-btn>
      <q-btn
        flat
        dense
        :icon="isString ? 'format_quote' : 'data_object'"
        size="sm"
        class="string-toggle prepend-btn"
        @click="toggleType"
        v-if="!hasSelectedVariable"
      >
        <q-tooltip>{{
          (isString
            ? "当前类型是：字符串"
            : "当前类型是：变量、数字、表达式等") +
          (disableToggleType ? "" : "，点击切换")
        }}</q-tooltip>
      </q-btn>
      <!-- 选项下拉按钮 -->
      <q-btn-dropdown
        v-if="options.items && !hasSelectedVariable"
        flat
        dense
        size="sm"
        dropdown-icon="menu"
        no-icon-animation
        class="options-dropdown prepend-btn"
      >
        <q-list class="options-item-list">
          <template v-if="options.multiSelect">
            <q-item
              v-for="item in normalizedItems"
              :key="getItemValue(item)"
              clickable
              class="option-item"
              @click="toggleSelectItem(item)"
            >
              <q-checkbox
                size="xs"
                :model-value="isItemSelected(item)"
                @update:model-value="toggleSelectItem(item)"
              />
              <div class="option-item-label">{{ getItemLabel(item) }}</div>
            </q-item>
            <q-separator />
            <q-item
              clickable
              class="option-item"
              @click="confirmMultiSelect"
              v-close-popup
            >
              <q-item-section class="text-primary">
                确定 (已选择 {{ selectedItems.length }} 项)
              </q-item-section>
            </q-item>
          </template>
          <template v-else>
            <q-item
              v-for="item in normalizedItems"
              :key="getItemValue(item)"
              clickable
              v-close-popup
              @click="selectItem(item)"
              class="option-item"
            >
              <q-item-section>
                {{ getItemLabel(item) }}
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-btn-dropdown>
      <q-btn
        v-if="!hasSelectedVariable && options.dialog"
        flat
        dense
        icon="file_open"
        size="sm"
        class="prepend-btn"
        @click="handleFileOpen(options.dialog)"
      >
        <q-tooltip>选择文件</q-tooltip>
      </q-btn>
      <!-- 变量选择下拉 -->
      <q-btn-dropdown
        flat
        dense
        stretch
        class="variable-dropdown prepend-btn"
        size="sm"
        @click="variables = getAvailableVariables()"
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
          <template v-else>
            <q-item>
              <q-item-section>
                <q-item-label class="empty-variables-tip">
                  <div class="q-gutter-md">
                    <div class="row items-center justify-center text-grey-6">
                      <q-icon name="info" size="20px" class="q-mr-sm" />
                      <span>当前命令没有可用变量</span>
                    </div>
                    <div class="row items-center justify-center text-grey-7">
                      <div class="text-grey-7">点击其他命令卡片右上角的</div>
                      <q-icon name="output" size="16px" class="q-mx-xs" />
                      <div>按钮添加输出变量</div>
                    </div>
                  </div>
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-btn-dropdown>
    </template>
    <template v-slot:prepend>
      <q-icon v-if="!noIcon" :name="icon || 'code'" />
    </template>
  </q-input>
</template>

<script>
import { defineComponent, inject } from "vue";
import { newVarInputVal } from "js/composer/varInputValManager";
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
  setup() {
    const getCurrentVariables = inject("getCurrentVariables");
    const commandIndex = inject("commandIndex", null);

    const getAvailableVariables = () => {
      // commandIndex 是响应式的，所以需要使用 value 来获取其值
      return getCurrentVariables().filter(
        (variable) => variable.sourceCommand.index < commandIndex.value
      );
    };

    return {
      getAvailableVariables,
    };
  },

  data() {
    return {
      selectedVariable: null,
      variables: [],
      selectedItems: [],
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
    normalizedItems() {
      if (!this.options.items) return [];
      return this.options.items.map((item) => {
        if (typeof item === "string") {
          return { label: item, value: item };
        }
        return item;
      });
    },
  },

  methods: {
    // 插入变量时的处理
    insertVariable(variable) {
      this.selectedVariable = variable;
      this.isString = false; // 变量模式下不需要字符串处理
      this.$emit("update:modelValue", newVarInputVal("var", variable.name));
    },

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

    getItemLabel(option) {
      return typeof option === "string" ? option : option.label;
    },

    getItemValue(option) {
      return typeof option === "string" ? option : option.value;
    },

    selectItem(option) {
      if (this.options.multiSelect) {
        this.toggleSelectItem(option);
      } else {
        const value = this.getItemValue(option);
        this.$emit("update:modelValue", newVarInputVal("str", value));
      }
    },
    handleFileOpen(dialog) {
      let { type, options } = window.lodashM.cloneDeep(dialog);
      if (!type) type = "open";
      if (type === "open") {
        const files = utools.showOpenDialog(options);
        if (!files) return;
        if (files.length > 1) {
          this.$emit("update:modelValue", newVarInputVal("var", files));
        } else if (files.length === 1) {
          this.$emit("update:modelValue", newVarInputVal("str", files[0]));
        }
      } else {
        const file = utools.showSaveDialog(options);
        if (!file) return;
        this.$emit("update:modelValue", newVarInputVal("str", file));
      }
    },

    // 新增：判断选项是否被选中
    isItemSelected(item) {
      return this.selectedItems.includes(this.getItemValue(item));
    },

    // 新增：切换选项选中状态
    toggleSelectItem(item) {
      const value = this.getItemValue(item);
      const index = this.selectedItems.indexOf(value);
      if (index === -1) {
        this.selectedItems.push(value);
      } else {
        this.selectedItems.splice(index, 1);
      }
    },

    // 新增：确认多选
    confirmMultiSelect() {
      if (this.selectedItems.length === 0) return;
      this.$emit(
        "update:modelValue",
        newVarInputVal(
          "var",
          JSON.stringify(this.selectedItems).replace(/,/g, ", ")
        )
      );
      this.selectedItems = []; // 清空选择
    },
  },

  // 在组件销毁时清空选择
  beforeUnmount() {
    this.selectedItems = [];
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

.variable-dropdown.prepend-btn {
  background-color: rgba(0, 0, 0, 0.02);
}

.body--dark .variable-dropdown.prepend-btn {
  background-color: rgba(255, 255, 255, 0.02);
}

.clear-btn:hover {
  color: var(--q-negative);
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
  background-color: var(--q-primary-opacity-10);
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

.options-item-list {
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
  background-color: var(--q-primary-opacity-10);
}

.option-item-label {
  text-align: center;
  flex: 1;
}

/* 暗色模式适配 */
.body--dark .option-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.empty-variables-tip {
  text-align: center;
  font-size: 13px;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.empty-variables-tip:hover {
  opacity: 1;
}

/* 多选确认按钮样式 */
.option-item.text-primary {
  justify-content: center;
  font-weight: 500;
}

/* 多选项样式 */
.option-item .q-checkbox {
  margin-right: 4px;
}
</style>
