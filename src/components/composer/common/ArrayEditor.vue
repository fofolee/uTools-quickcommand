<template>
  <component
    :is="!!topLabel ? 'BorderLabel' : 'div'"
    :label="topLabel"
    :icon="icon"
    :model-value="isCollapse"
  >
    <div class="array-editor">
      <div v-for="(row, index) in rows" :key="index" class="array-row">
        <div class="row-content row q-col-gutter-sm">
          <template v-if="!!columns">
            <div
              v-for="column in processedColumns"
              :key="column.key"
              :class="[column.width ? `col-${column.width}` : 'col']"
            >
              <VariableInput
                :model-value="row[column.key]"
                v-bind="column"
                @update:model-value="
                  (val) => updateColumn(index, column.key, val)
                "
              />
            </div>
          </template>
          <template v-else>
            <div class="col">
              <VariableInput
                :model-value="row"
                v-bind="$attrs"
                @update:model-value="(val) => updateValue(index, val)"
              />
            </div>
          </template>
        </div>

        <div class="btn-container">
          <template v-if="rows.length === 1">
            <q-btn
              flat
              dense
              size="sm"
              icon="add"
              class="center-btn"
              @click="addRow"
            />
          </template>
          <template v-else-if="index === rows.length - 1">
            <q-btn
              flat
              dense
              size="sm"
              icon="remove"
              class="top-btn"
              @click="removeRow(index)"
            />
            <q-btn
              flat
              dense
              size="sm"
              icon="add"
              class="bottom-btn"
              @click="addRow"
            />
          </template>
          <template v-else>
            <q-btn
              flat
              dense
              size="sm"
              icon="remove"
              class="center-btn"
              @click="removeRow(index)"
            />
          </template>
        </div>
      </div>
    </div>
  </component>
</template>

<script>
/**
 * 数组编辑器组件
 * @description 支持简单数组和对象数组的编辑
 *
 * @property {Array} modelValue - 绑定的数组值
 * @property {Object} columns - 列配置（可选）
 *
 * // 1. 简单数组（不传 columns）
 * // 值示例：
 * [
 *   newVarInputVal('str', '选项1'),
 *   newVarInputVal('str', '选项2')
 * ]
 *
 * 属性透传：
 * ArrayEditor属性全部透传给VariableInput
 *
 * 初始值：
 * 使用defaultValue属性设置初始值
 * 使用defaultRowValue属性设置新增行时的初始值
 *
 * // 2. 对象数组（传入 columns）
 * columns = {
 *   name: {
 *     label: '姓名',
 *     placeholder: '请输入姓名',
 *     width: 6,
 *     options: {
 *       items: ['张三', '李四', '王五']
 *     },
 *     defaultValue: newVarInputVal('str', '张三')
 *   },
 *   age: {
 *     label: '年龄',
 *     placeholder: '请输入年龄',
 *     width: 4,
 *     defaultValue: newVarInputVal('str', '18')
 *   }
 * }
 * // 值示例：
 * [
 *   {
 *     name: newVarInputVal('str', '张三'),
 *     age: newVarInputVal('str', '18')
 *   }
 * ]
 *
 * 属性透传：
 * columns的每一个对象的值的属性全部透传给VariableInput
 *
 * 初始值：
 * 使用defaultValue属性设置初始的每一行
 * columns的每一个对象的defaultValue属性设置新增行时的初始值
 */
import { defineComponent } from "vue";
import VariableInput from "./VariableInput.vue";
import { newVarInputVal } from "js/composer/varInputValManager";
import BorderLabel from "./BorderLabel.vue";

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
    columns: {
      type: Object,
      default: null,
    },
    defaultValue: {
      type: [Object, Array],
      default: null,
    },
    defaultRowValue: {
      type: [Object, String],
      default: null,
    },
    topLabel: {
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
  computed: {
    rows() {
      return this.modelValue.length ? this.modelValue : this.initializeRow();
    },
    processedColumns() {
      if (!this.columns) return null;

      return Object.entries(this.columns).map(([key, config]) => ({
        key,
        ...config,
        width: config.width || null,
        defaultValue: config.defaultValue || newVarInputVal("str"),
      }));
    },
  },
  methods: {
    initializeRow() {
      if (!this.columns) {
        // 简单数组模式：使用 defaultValue 或创建新的 VarInputVal
        return this.defaultValue || [newVarInputVal("str")];
      }

      // 对象数组模式
      if (this.defaultValue) {
        return [this.defaultValue];
      }

      const row = {};
      Object.entries(this.columns).forEach(([key, config]) => {
        row[key] = config.defaultValue || newVarInputVal("str");
      });
      return [row];
    },
    getNewRowValue() {
      if (!this.columns) {
        // 简单数组模式：使用 defaultRowValue 或创建新的 VarInputVal
        return this.defaultRowValue || newVarInputVal("str");
      }

      // 对象数组模式
      if (this.defaultRowValue) {
        return this.defaultRowValue;
      }

      const row = {};
      Object.entries(this.columns).forEach(([key, config]) => {
        row[key] = config.defaultValue || newVarInputVal("str");
      });
      return row;
    },
    addRow() {
      const newRows = [...this.rows, this.getNewRowValue()];
      this.$emit("update:modelValue", newRows);
    },
    removeRow(index) {
      const newRows = [...this.rows];
      newRows.splice(index, 1);
      if (newRows.length === 0) {
        newRows.push(this.initializeRow()[0]);
      }
      this.$emit("update:modelValue", newRows);
    },
    updateValue(index, value) {
      const newRows = [...this.rows];
      newRows[index] = value;
      this.$emit("update:modelValue", newRows);
    },
    updateColumn(index, columnKey, value) {
      // 创建一个新的行数组
      const newRows = this.rows.map((row, i) => {
        // 只更新指定索引的行
        if (i === index) {
          return {
            ...row,
            [columnKey]: value,
          };
        }
        return row;
      });

      this.$emit("update:modelValue", newRows);
    },
  },
});
</script>

<style scoped>
.array-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  /*消除q-gutter-sm为第一行带来的额外padding*/
  margin-top: -8px;
  margin-left: -8px;
}

.array-row {
  display: flex;
}

.row-content {
  flex: 1;
  margin: 0; /* 覆盖 Quasar 的默认 margin */
}

/* 防止输入框换行 */
.array-editor :deep(.q-field__native) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-container {
  position: relative;
  width: 16px;
  padding-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-container .q-btn {
  position: absolute;
  width: 16px;
  height: 16px;
  min-height: 16px;
  padding: 0;
  /*抵消array-editor的margin-left，顺便和左边保持距离*/
  margin-right: -8px;
}

.btn-container .center-btn {
  top: 18px;
}

.btn-container .top-btn {
  top: 8px;
}

.btn-container .bottom-btn {
  top: 28px;
}

.array-editor :deep(.q-btn .q-icon) {
  font-size: 14px;
}

.array-editor :deep(.q-btn.q-btn--dense) {
  padding: 0;
  min-height: 16px;
}
</style>
