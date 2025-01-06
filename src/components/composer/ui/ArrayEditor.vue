<template>
  <div class="array-editor">
    <div v-for="(item, index) in items" :key="index" class="row items-center">
      <template v-if="optionsKeys">
        <div
          v-for="key in optionsKeys"
          :key="key"
          :class="['col', optionsKeys.length > 1 ? 'q-pr-sm' : '']"
        >
          <VariableInput
            :model-value="item[key]"
            :label="key"
            :icon="icon || 'code'"
            @update:model-value="(val) => updateItemKeyValue(index, key, val)"
          />
        </div>
      </template>
      <template v-else>
        <div class="col">
          <VariableInput
            :model-value="item"
            :label="`${label || '项目'} ${index + 1}`"
            :icon="icon || 'code'"
            :options="options"
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
 * @property {String[]} [optionsKeys] - 多键对象模式的键名列表
 * @property {String[]} [options] - 下拉选择模式的选项列表
 *
 * @example
 * // 基础数组
 * [
 *   {
 *     value: "张三",
 *     isString: true,
 *     __varInputVal__: true
 *   }
 * ]
 *
 * // 多键对象数组
 * optionsKeys = ['name', 'age', 'email']
 * [
 *   {
 *     name: { value: "张三", isString: true, __varInputVal__: true },
 *     age: { value: "18", isString: false, __varInputVal__: true },
 *     email: { value: "zhangsan@example.com", isString: true, __varInputVal__: true }
 *   }
 * ]
 *
 * // 下拉选择模式
 * options = ['选项1', '选项2', '选项3']
 * [
 *   {
 *     value: "选项1",
 *     isString: true,
 *     __varInputVal__: true
 *   }
 * ]
 */
import { defineComponent } from "vue";
import VariableInput from "components/composer/ui/VariableInput.vue";

export default defineComponent({
  name: "ArrayEditor",
  components: {
    VariableInput,
  },
  props: {
    modelValue: {
      type: Array,
      required: true,
    },
    label: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    options: {
      type: Array,
      default: null,
    },
    optionsKeys: {
      type: Array,
      default: null,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      // 本地维护的数组数据
      localItems: this.initializeItems(),
    };
  },
  computed: {
    items: {
      get() {
        return this.localItems;
      },
      set(newItems) {
        this.localItems = newItems;
        this.$emit("update:modelValue", newItems);
      },
    },
  },
  methods: {
    initializeItems() {
      if (this.modelValue.length) {
        return this.modelValue;
      }

      if (this.options?.keys) {
        const item = {};
        this.optionsKeys.forEach((key) => {
          item[key] = {
            value: "",
            isString: false,
            __varInputVal__: true,
          };
        });
        return [item];
      }

      return [
        {
          value: "",
          isString: false,
          __varInputVal__: true,
        },
      ];
    },
    /**
     * 添加新的数组项
     * 根据配置创建相应的数据结构
     */
    addItem() {
      if (this.optionsKeys) {
        const newItem = {};
        this.optionsKeys.forEach((key) => {
          newItem[key] = {
            value: "",
            isString: false,
            __varInputVal__: true,
          };
        });
        this.items = [...this.items, newItem];
      } else {
        this.items = [
          ...this.items,
          {
            value: "",
            isString: false,
            __varInputVal__: true,
          },
        ];
      }
    },
    /**
     * 移除指定索引的数组项
     * 如果移除后数组为空，则创建一个新的空项
     */
    removeItem(index) {
      const newItems = [...this.items];
      newItems.splice(index, 1);
      if (newItems.length === 0) {
        if (this.optionsKeys) {
          const newItem = {};
          this.optionsKeys.forEach((key) => {
            newItem[key] = {
              value: "",
              isString: false,
              __varInputVal__: true,
            };
          });
          newItems.push(newItem);
        } else {
          newItems.push({
            value: "",
            isString: false,
            __varInputVal__: true,
          });
        }
      }
      this.items = newItems;
    },
    /**
     * 更新单值模式下的值
     */
    updateItemValue(index, value) {
      const newItems = [...this.items];
      newItems[index] = value;
      this.items = newItems;
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
      this.items = newItems;
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
