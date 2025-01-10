<template>
  <component
    :is="!!label ? 'BorderLabel' : 'div'"
    :label="label"
    :icon="icon"
    :model-value="isCollapse"
  >
    <div class="dict-editor">
      <div
        v-for="(item, index) in allItems"
        :key="`${item.type}-${index}`"
        class="row q-col-gutter-sm items-center"
      >
        <div class="col-4">
          <template v-if="item.type === 'fixed'">
            <q-input
              :model-value="item.key"
              :label="getKeyLabel(item.key)"
              dense
              filled
              readonly
              disable
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
            </q-input>
          </template>
          <template v-else>
            <q-select
              v-if="options?.optionKeys"
              :model-value="item.key"
              :options="normalizedOptionKeys"
              label="名称"
              dense
              filled
              use-input
              input-debounce="0"
              :hide-selected="!!inputValue"
              @filter="filterFn"
              @update:model-value="
                (val) => handleSelect(val, getEditableIndex(index))
              "
              @input-value="(val) => handleInput(val, getEditableIndex(index))"
              @blur="handleBlur"
            >
              <template v-slot:prepend>
                <q-icon name="code" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    {{ getKeyLabel(scope.opt) }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-input
              v-else
              :model-value="item.key"
              label="名称"
              dense
              filled
              @update:model-value="
                (val) => updateItemKey(val, getEditableIndex(index))
              "
            >
              <template v-slot:prepend>
                <q-icon name="code" />
              </template>
            </q-input>
          </template>
        </div>
        <div class="col">
          <VariableInput
            :model-value="item.value"
            label="值"
            icon="code"
            class="col-grow"
            @update:model-value="
              (val) => updateItemValue(val, index, item.type === 'fixed')
            "
          />
        </div>
        <div
          v-if="item.type !== 'fixed' && !options?.disableAdd"
          class="col-auto"
        >
          <div class="btn-container">
            <template v-if="editableItems.length === 1">
              <q-btn
                flat
                dense
                size="sm"
                icon="add"
                class="center-btn"
                @click="addItem"
              />
            </template>
            <template
              v-else-if="getEditableIndex(index) === editableItems.length - 1"
            >
              <q-btn
                flat
                dense
                size="sm"
                icon="remove"
                class="top-btn"
                @click="removeItem(getEditableIndex(index))"
              />
              <q-btn
                flat
                dense
                size="sm"
                icon="add"
                class="bottom-btn"
                @click="addItem"
              />
            </template>
            <template v-else>
              <q-btn
                flat
                dense
                size="sm"
                icon="remove"
                class="center-btn"
                @click="removeItem(getEditableIndex(index))"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </component>
</template>

<script>
import { defineComponent } from "vue";
import { newVarInputVal } from "js/composer/varInputValManager";
import VariableInput from "components/composer/common/VariableInput.vue";
import BorderLabel from "components/composer/common/BorderLabel.vue";

/**
 * 字典编辑器组件
 * @description 支持键值对编辑，键支持变量选择和字符串输入，值为VariableInput特有对象
 *
 * @property {Object} modelValue - 绑定的字典对象
 * @property {Object} options - 配置选项
 * @property {String[]|Object[]} [options.optionKeys] - 可选键名
 * @property {String[]|Object[]} [options.fixedKeys] - 固定键名
 * @property {Boolean} [options.disableAdd] - 禁止添加新的键值对
 *
 * @example
 * // 基础字典对象
 * {
 *   key: newVarInputVal("str"),
 * }
 *
 * // 下拉选择模式
 * options.optionKeys = ['User-Agent', 'Content-Type', 'Accept']
 * {
 *   "User-Agent": newVarInputVal("str", "Mozilla/5.0"),
 *   "Content-Type": newVarInputVal("str", "text/html"),
 *   "Accept": newVarInputVal("str", "text/html")
 * }
 */
export default defineComponent({
  name: "DictEditor",
  components: {
    VariableInput,
    BorderLabel,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    label: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    isCollapse: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      inputValue: "",
    };
  },
  computed: {
    editableItems: {
      get() {
        return this.localItems;
      },
      set(newItems) {
        this.localItems = newItems;
        this.updateModelValue();
      },
    },
    normalizedOptionKeys() {
      return this.filterOptions;
    },
    // 规范化的固定键列表
    normalizedFixedKeys() {
      return this.normalizeKeys(this.options?.fixedKeys || []);
    },
    // 从 modelValue 中提取的所有条目
    modelEntries() {
      return Object.entries(this.modelValue || {});
    },
    // 固定键项
    fixedItems() {
      return this.normalizedFixedKeys.map((key) => ({
        type: "fixed",
        key: key.value,
        value:
          this.modelEntries.find(([k]) => k === key.value)?.[1] ||
          newVarInputVal("str"),
      }));
    },
    // 可编辑项
    localItems() {
      // 过滤出不在固定键中的条目
      const editableEntries = this.modelEntries.filter(
        ([key]) => !this.normalizedFixedKeys.some((k) => k.value === key)
      );

      return editableEntries.length || this.options?.disableAdd
        ? editableEntries.map(([key, value]) => ({
            type: "editable",
            key,
            value,
          }))
        : [{ type: "editable", key: "", value: newVarInputVal("str") }];
    },
    // 所有项目的组合
    allItems() {
      return [...this.fixedItems, ...this.localItems];
    },
    // 过滤选项
    filterOptions() {
      return this.normalizeKeys(this.options?.optionKeys || []);
    },
  },
  methods: {
    normalizeKeys(keys) {
      return keys.map((key) => {
        if (typeof key === "string") {
          return { value: key, label: key };
        }
        return key;
      });
    },

    getKeyLabel(key) {
      if (typeof key === "object") return key.label;
      const allKeys = [...this.normalizedFixedKeys, ...this.filterOptions];
      return allKeys.find((k) => k.value === key)?.label || key;
    },

    getEditableIndex(index) {
      return index - this.fixedItems.length;
    },

    updateModelValue() {
      const dict = {};
      // 先添加固定键
      this.fixedItems.forEach((item) => {
        if (item.key) {
          dict[item.key] = item.value;
        }
      });
      // 再添加可编辑键
      this.localItems.forEach((item) => {
        if (item.key) {
          dict[item.key] = item.value;
        }
      });
      this.$emit("update:modelValue", dict);
    },

    updateItemValue(val, index, isFixed = false) {
      const dict = { ...this.modelValue };
      const item = this.allItems[index];
      if (item.key) {
        dict[item.key] = val;
        this.$emit("update:modelValue", dict);
      }
    },

    addItem() {
      if (this.options?.disableAdd) return;
      const dict = { ...this.modelValue };
      dict[""] = newVarInputVal("str");
      this.$emit("update:modelValue", dict);
    },

    removeItem(index) {
      if (this.options?.disableAdd) return;
      const dict = { ...this.modelValue };
      const item = this.localItems[index];
      if (item.key) {
        delete dict[item.key];
        this.$emit("update:modelValue", dict);
      }
    },

    updateItemKey(val, index) {
      const dict = { ...this.modelValue };
      const oldItem = this.localItems[index];
      if (oldItem.key) {
        delete dict[oldItem.key];
      }
      dict[val] = oldItem.value;
      this.$emit("update:modelValue", dict);
    },

    handleInput(val, index) {
      this.inputValue = val;
      if (val) {
        this.updateItemKey(val, index);
      }
    },

    handleSelect(val, index) {
      this.inputValue = "";
      this.updateItemKey(val.value || val, index);
    },

    handleBlur() {
      this.inputValue = "";
    },

    filterFn(val, update) {
      if (!this.options?.optionKeys) return;

      update(() => {
        if (val === "") {
          this.filterOptions = this.normalizeKeys(this.options.optionKeys);
        } else {
          const needle = val.toLowerCase();
          this.filterOptions = this.normalizeKeys(
            this.options.optionKeys
          ).filter(
            (v) =>
              v.label.toLowerCase().indexOf(needle) > -1 ||
              v.value.toLowerCase().indexOf(needle) > -1
          );
        }
      });
    },
  },
});
</script>

<style scoped>
.dict-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 防止输入框换行 */
:deep(.q-field__native) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-container {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-container .q-btn {
  position: absolute;
  width: 16px;
  height: 16px;
  min-height: 16px;
  padding: 0;
}

.btn-container .center-btn {
  position: relative;
}

.btn-container .top-btn {
  top: 0;
}

.btn-container .bottom-btn {
  bottom: 0;
}

:deep(.q-btn .q-icon) {
  font-size: 14px;
}

:deep(.q-btn.q-btn--dense) {
  padding: 0;
  min-height: 16px;
}
</style>
