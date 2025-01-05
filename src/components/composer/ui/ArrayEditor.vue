<template>
  <div class="array-editor">
    <div v-for="(item, index) in items" :key="index" class="row items-center">
      <!-- 如果传入options.keys，则生成多键对象
        示例：
        options: {
          keys: ['name', 'age', 'email']
        }
          生成数据结构示例：
          [
            {
              name: { value: "张三", isString: true, __varInputVal__: true },
              age: { value: "18", isString: false, __varInputVal__: true },
              email: { value: "zhangsan@example.com", isString: true, __varInputVal__: true }
            }
          ]
      -->
      <template v-if="options?.keys">
        <div
          v-for="key in options.keys"
          :key="key"
          :class="['col', options.keys.length > 1 ? 'q-pr-sm' : '']"
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
          <!-- 如果传入options.items，则生成下拉选择
            示例：
            options: {
              items: ['选项1', '选项2', '选项3']
            }
          -->
          <template v-if="options?.items">
            <q-select
              :model-value="item.value"
              :options="filterOptions"
              :label="`${label || '项目'} ${index + 1}`"
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
                <q-icon :name="icon || 'code'" />
              </template>
            </q-select>
          </template>
          <!-- 不传options情况下，生成单值对象
            生成数据结构示例：
            [
              "张三",
              "李四",
              "王五"
            ]
          -->
          <template v-else>
            <VariableInput
              :model-value="item"
              :label="`${label || '项目'} ${index + 1}`"
              :icon="icon || 'code'"
              @update:model-value="(val) => updateItemValue(index, val)"
            />
          </template>
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
    /**
     * 配置选项，支持两种模式：
     * 1. 选项模式：通过 items 提供选项列表
     *    数组的每个元素都可以从选项中选择值
     *
     * 2. 多键模式：通过 keys 定义每个数组元素包含的键
     *    数组的每个元素都是一个对象，包含指定的键，每个键对应一个输入框
     */
    options: {
      type: Object,
      default: null,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      // 本地维护的数组数据
      localItems: this.initializeItems(),
      // 选项模式下的过滤选项
      filterOptions: this.options?.items || [],
      // 选项模式下的输入值
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
        this.$emit("update:modelValue", newItems);
      },
    },
  },
  methods: {
    /**
     * 初始化数组项
     * 1. 如果传入了初始值，直接使用
     * 2. 如果配置了 keys，创建包含所有键的对象
     * 3. 默认创建单值对象
     */
    initializeItems() {
      if (this.modelValue.length) {
        return this.modelValue;
      }

      if (this.options?.keys) {
        const item = {};
        this.options.keys.forEach((key) => {
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
      if (this.options?.keys) {
        const newItem = {};
        this.options.keys.forEach((key) => {
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
        if (this.options?.keys) {
          const newItem = {};
          this.options.keys.forEach((key) => {
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
    /**
     * 选项模式下的输入处理
     * 当输入的值不在选项中时，创建新值
     */
    handleInput(val, index) {
      this.inputValue = val;
      if (val && !this.filterOptions.includes(val)) {
        const newItems = [...this.items];
        newItems[index] = {
          value: val,
          isString: false,
          __varInputVal__: true,
        };
        this.items = newItems;
      }
    },
    /**
     * 选项模式下的选择处理
     */
    handleSelect(val, index) {
      this.inputValue = "";
      const newItems = [...this.items];
      newItems[index] = {
        value: val,
        isString: false,
        __varInputVal__: true,
      };
      this.items = newItems;
    },
    /**
     * 选项模式下的失焦处理
     */
    handleBlur() {
      this.inputValue = "";
    },
    /**
     * 选项模式下的过滤处理
     * 根据输入值过滤可选项
     */
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
