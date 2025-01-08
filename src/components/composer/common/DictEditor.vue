<template>
  <component
    :is="!!label ? 'BorderLabel' : 'div'"
    :label="label"
    :icon="icon"
    :model-value="isCollapse"
  >
    <div class="dict-editor">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="row q-col-gutter-sm items-center"
      >
        <div class="col-4">
          <q-select
            v-if="options?.items"
            :model-value="item.key"
            :options="options.items"
            label="名称"
            dense
            filled
            use-input
            input-debounce="0"
            :hide-selected="!!inputValue"
            @filter="filterFn"
            @update:model-value="(val) => handleSelect(val, index)"
            @input-value="(val) => handleInput(val, index)"
            @blur="handleBlur"
          >
            <template v-slot:prepend>
              <q-icon name="code" />
            </template>
          </q-select>
          <q-input
            v-else
            :model-value="item.key"
            label="名称"
            dense
            filled
            @update:model-value="(val) => updateItemKey(val, index)"
          >
            <template v-slot:prepend>
              <q-icon name="code" />
            </template>
          </q-input>
        </div>
        <div class="col">
          <VariableInput
            :model-value="item.value"
            label="值"
            icon="code"
            class="col-grow"
            @update:model-value="(val) => updateItemValue(val, index)"
          />
        </div>
        <div class="col-auto">
          <div class="btn-container">
            <template v-if="items.length === 1">
              <q-btn
                flat
                dense
                size="sm"
                icon="add"
                class="center-btn"
                @click="addItem"
              />
            </template>
            <template v-else-if="index === items.length - 1">
              <q-btn
                flat
                dense
                size="sm"
                icon="remove"
                class="top-btn"
                @click="removeItem(index)"
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
                @click="removeItem(index)"
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
 * @property {String[]} [options.items] - 键名的下拉选择选项
 *
 * @example
 * // 基础字典对象
 * {
 *   key: newVarInputVal("str"),
 * }
 *
 * // 下拉选择模式
 * options.items = ['User-Agent', 'Content-Type', 'Accept']
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
    isCollapse: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    const modelEntries = Object.entries(this.modelValue || {});
    return {
      localItems: modelEntries.length
        ? modelEntries.map(([key, value]) => ({ key, value }))
        : [
            {
              key: "",
              value: newVarInputVal("str"),
            },
          ],
      filterOptions: this.options?.items || [],
      inputValue: "",
    };
  },
  computed: {
    items: {
      get() {
        return this.localItems;
      },
      set(newItems) {
        this.localItems = newItems;
        const dict = {};
        newItems.forEach((item) => {
          if (item.key) {
            dict[item.key] = item.value;
          }
        });
        this.$emit("update:modelValue", dict);
      },
    },
  },
  methods: {
    addItem() {
      this.items = [
        ...this.items,
        {
          key: "",
          value: newVarInputVal("str"),
        },
      ];
    },
    removeItem(index) {
      const newItems = [...this.items];
      newItems.splice(index, 1);
      if (newItems.length === 0) {
        newItems.push({
          key: "",
          value: newVarInputVal("str"),
        });
      }
      this.items = newItems;
    },
    updateItemKey(val, index) {
      const newItems = [...this.items];
      newItems[index].key = val;
      this.items = newItems;
    },
    updateItemValue(val, index) {
      const newItems = [...this.items];
      newItems[index].value = val;
      this.items = newItems;
    },
    handleInput(val, index) {
      this.inputValue = val;
      if (val && !this.filterOptions.includes(val)) {
        const newItems = [...this.items];
        newItems[index].key = val;
        this.items = newItems;
      }
    },
    handleSelect(val, index) {
      this.inputValue = "";
      const newItems = [...this.items];
      newItems[index].key = val;
      this.items = newItems;
    },
    handleBlur() {
      this.inputValue = "";
    },
    filterFn(val, update) {
      if (!this.options?.items) return;

      update(() => {
        if (val === "") {
          this.filterOptions = this.options.items;
        } else {
          const needle = val.toLowerCase();
          this.filterOptions = this.options.items.filter(
            (v) => v.toLowerCase().indexOf(needle) > -1
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
