<template>
  <component
    :is="!!label ? 'BorderLabel' : 'div'"
    :label="label"
    :icon="icon"
    :model-value="isCollapse"
  >
    <div class="array-editor">
      <div v-for="(item, index) in items" :key="index" class="row items-center">
        <template v-if="optionsKeys.length">
          <div
            v-for="key in optionsKeys"
            :key="key.value"
            :class="[
              key.width ? `col-${key.width}` : 'col',
              optionsKeys.length > 1 ? 'q-pr-sm' : '',
            ]"
          >
            <VariableInput
              :model-value="item[key.value]"
              :label="key.label"
              :no-icon="true"
              @update:model-value="
                (val) => updateItemKeyValue(index, key.value, val)
              "
            />
          </div>
        </template>
        <template v-else>
          <div class="col">
            <VariableInput
              :model-value="item"
              :label="`${label || '项目'} ${index + 1}`"
              :icon="icon || 'code'"
              :options="{
                items: options.items,
              }"
              @update:model-value="(val) => updateItemValue(index, val)"
            />
          </div>
        </template>
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
/**
 * 数组编辑器组件
 * @description 支持单值数组和多键对象数组的编辑
 *
 * @property {Array} modelValue - 绑定的数组值
 * @property {String} label - 输入框标签
 * @property {String} icon - 输入框图标
 * @property {Object} options - 配置选项
 * @property {String[]} [options.keys] - 多键对象模式的键名列表
 * @property {String[]} [options.items] - 下拉选择模式的选项列表
 *
 * @example
 * // 基础数组
 * [
 *   newVarInputVal("str", "张三")
 * ]
 *
 * // 多键对象数组
 * options.keys = ['name', 'age', 'email']
 * [
 *   {
 *     name: newVarInputVal("str", "张三"),
 *     age: newVarInputVal("str", "18"),
 *     email: newVarInputVal("str", "zhangsan@example.com")
 *   }
 * ]
 *
 * // 下拉选择模式
 * options.items = ['选项1', '选项2', '选项3']
 * [
 *   newVarInputVal("str", "选项1"),
 *   newVarInputVal("str", "选项2"),
 *   newVarInputVal("str", "选项3")
 * ]
 */
import { defineComponent } from "vue";
import VariableInput from "components/composer/common/VariableInput.vue";
import { newVarInputVal } from "js/composer/varInputValManager";
import BorderLabel from "components/composer/common/BorderLabel.vue";

export default defineComponent({
  name: "ArrayEditor",
  components: {
    VariableInput,
    BorderLabel,
  },
  props: {
    modelValue: {
      type: Array,
      required: true,
      default: () => [],
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
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:modelValue"],
  computed: {
    items() {
      return this.modelValue.length ? this.modelValue : this.initializeItems();
    },
    optionsKeys() {
      return (
        this.options?.keys?.map((key) => {
          return {
            value: key.value || key,
            label: key.label || key,
            width: key.width,
          };
        }) || []
      );
    },
  },
  methods: {
    initializeItems() {
      if (this.optionsKeys?.length) {
        const item = {};
        this.optionsKeys.forEach((key) => {
          item[key] = newVarInputVal("str");
        });
        return [item];
      }

      return [newVarInputVal("str")];
    },
    /**
     * 添加新的数组项
     * 根据配置创建相应的数据结构
     */
    addItem() {
      let newItems = [];
      if (this.options.keys) {
        const newItem = {};
        this.options.keys.forEach((key) => {
          newItem[key] = newVarInputVal("str");
        });
        newItems = [...this.items, newItem];
      } else {
        newItems = [...this.items, newVarInputVal("str")];
      }
      this.$emit("update:modelValue", newItems);
    },
    /**
     * 移除指定索引的数组项
     * 如果移除后数组为空，则创建一个新的空项
     */
    removeItem(index) {
      const newItems = [...this.items];
      newItems.splice(index, 1);
      if (newItems.length === 0) {
        if (this.options.keys) {
          const newItem = {};
          this.options.keys.forEach((key) => {
            newItem[key] = newVarInputVal("str");
          });
          newItems.push(newItem);
        } else {
          newItems.push(newVarInputVal("str"));
        }
      }
      this.$emit("update:modelValue", newItems);
    },
    /**
     * 更新单值模式下的值
     */
    updateItemValue(index, value) {
      const newItems = [...this.items];
      newItems[index] = value;
      this.$emit("update:modelValue", newItems);
    },
    /**
     * 更新多键模式下指定键的值
     */
    updateItemKeyValue(index, key, value) {
      const newItems = [...this.items];
      newItems[index] = {
        ...newItems[index],
        [key]: value,
      };
      this.$emit("update:modelValue", newItems);
    },
  },
});
</script>

<style scoped>
.array-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 防止输入框换行 */
.array-editor :deep(.q-field__native) {
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

.array-editor :deep(.q-btn .q-icon) {
  font-size: 14px;
}

.array-editor :deep(.q-btn.q-btn--dense) {
  padding: 0;
  min-height: 16px;
}
</style>
