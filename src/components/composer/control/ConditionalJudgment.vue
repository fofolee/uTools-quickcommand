<template>
  <div class="row items-center no-wrap">
    <!-- 下拉按钮 -->
    <q-btn-dropdown
      dense
      flat
      class="condition-type-btn"
      :class="{ 'text-primary': type !== 'end' }"
    >
      <q-list>
        <q-item
          v-for="option in options"
          :key="option.value"
          clickable
          v-close-popup
          @click="handleTypeChange(option.value)"
          :active="type === option.value"
        >
          <q-item-section>
            <q-item-label>{{ option.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <!-- 显示选中的类型文本 -->
    <div class="condition-type-text q-mx-sm">
      {{ getTypeLabel }}
    </div>

    <!-- 条件表达式输入框和按钮 -->
    <template v-if="type !== 'end'">
      <template v-if="type === 'else'">
        <!-- 否则的条件按钮 -->
        <q-btn
          v-if="!showElseCondition"
          dense
          flat
          size="sm"
          class="condition-add-btn"
          icon="add"
          @click="showElseCondition = true"
        >
          <q-tooltip>添加条件</q-tooltip>
        </q-btn>
        <!-- 否则的条件输入框 -->
        <q-input
          v-else
          v-model="condition"
          dense
          filled
          class="col condition-input"
          placeholder="请输入条件表达式"
          @update:model-value="handleConditionChange"
        >
          <template v-slot:prepend>
            <q-icon name="code" />
          </template>
          <template v-slot:append>
            <q-btn dense flat round icon="close" @click="clearElseCondition" />
          </template>
        </q-input>
      </template>
      <!-- 如果的条件输入框 -->
      <q-input
        v-else
        v-model="condition"
        dense
        filled
        class="col condition-input"
        placeholder="请输入条件表达式"
        @update:model-value="handleConditionChange"
      >
        <template v-slot:prepend>
          <q-icon name="code" />
        </template>
      </q-input>
    </template>
    <!-- 结束如果时的占位 -->
    <div v-else class="col"></div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ConditionalJudgment",

  props: {
    modelValue: {
      type: String,
      default: "",
    },
    command: {
      type: Object,
      required: true,
    },
  },

  emits: ["update:modelValue"],

  data() {
    return {
      options: [
        { label: "如果", value: "if" },
        { label: "否则", value: "else" },
        { label: "结束判断", value: "end" },
      ],
      type: "if",
      condition: "",
      showElseCondition: false,
    };
  },

  computed: {
    getTypeLabel() {
      switch (this.type) {
        case "if":
          return "如果满足：";
        case "else":
          return this.showElseCondition ? "否则，满足：" : "否则：";
        case "end":
          return "结束条件判断";
        default:
          return "";
      }
    },
  },

  created() {
    // 解析初始值
    if (this.modelValue) {
      const match = this.modelValue.match(
        /^(if|else if|else|end)(?:\((.*)\))?$/
      );
      if (match) {
        if (match[1] === "else if") {
          this.type = "else";
          this.condition = match[2] || "";
          this.showElseCondition = true;
        } else {
          this.type = match[1];
          this.condition = match[2] || "";
          this.showElseCondition = false;
        }
      }
    }
  },

  methods: {
    generateCode() {
      switch (this.type) {
        case "if":
          return `if (${this.condition}) {`;
        case "else":
          return this.condition
            ? `} else if (${this.condition}) {`
            : "} else {";
        case "end":
          return "}";
        default:
          return "";
      }
    },

    handleTypeChange(value) {
      this.type = value;
      if (this.type === "end") {
        this.condition = "";
        this.showElseCondition = false;
      }
      this.$emit("update:modelValue", this.generateCode());
    },

    handleConditionChange() {
      this.$emit("update:modelValue", this.generateCode());
    },

    clearElseCondition() {
      this.condition = "";
      this.showElseCondition = false;
      this.$emit("update:modelValue", this.generateCode());
    },
  },
});
</script>

<style scoped>
.condition-type-btn {
  min-width: 32px;
  width: 32px;
  height: 36px;
  padding: 0;
}

.condition-type-btn :deep(.q-btn__content) {
  padding: 0;
}

.condition-type-btn :deep(.q-icon) {
  font-size: 20px;
}

.condition-type-text {
  font-size: 14px;
  color: var(--q-primary);
  white-space: nowrap;
}

.condition-add-btn {
  margin-left: 4px;
  opacity: 0.7;
  height: 36px;
  color: var(--q-primary);
}

.condition-add-btn:hover {
  opacity: 1;
  background: rgba(var(--q-primary-rgb), 0.1);
}

.condition-input {
  transition: all 0.3s ease;
}

.condition-input :deep(.q-field__control) {
  padding-right: 8px;
}

/* 暗色模式适配 */
.body--dark .condition-type-text {
  color: var(--q-primary);
}
</style>
