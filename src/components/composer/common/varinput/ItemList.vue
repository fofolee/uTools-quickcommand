<template>
  <!-- 选项下拉按钮 -->
  <q-btn-dropdown flat dense size="sm" dropdown-icon="menu" no-icon-animation>
    <q-list class="options-item-list">
      <template v-if="multiSelect">
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
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ItemList",
  emits: ["emitValue"],
  props: {
    items: {
      type: Array,
      required: true,
    },
    multiSelect: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectedItems: [],
    };
  },
  computed: {
    // 标准化选项格式
    normalizedItems() {
      if (!this.items) return [];
      return this.items.map((item) => {
        if (typeof item === "string") {
          return { label: item, value: item };
        }
        return item;
      });
    },
  },
  methods: {
    getItemLabel(item) {
      return typeof item === "string" ? item : item.label;
    },

    getItemValue(item) {
      return typeof item === "string" ? item : item.value;
    },

    selectItem(item) {
      if (this.multiSelect) {
        this.toggleSelectItem(item);
      } else {
        this.$emit("emitValue", "str", this.getItemValue(item));
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
        "emitValue",
        "var",
        JSON.stringify(this.selectedItems).replace(/,/g, ", ")
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
