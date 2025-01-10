<template>
  <q-input
    type="number"
    v-model.number="localValue"
    dense
    filled
    :label="label"
    :placeholder="placeholder"
    :max="max"
    :min="min"
    class="number-input"
  >
    <template v-slot:prepend>
      <q-icon v-if="icon" :name="icon" />
    </template>
    <template v-slot:append>
      <!-- <q-icon name="pin" size="xs" /> -->
      <div class="column items-center number-controls">
        <q-btn
          flat
          dense
          icon="keyboard_arrow_up"
          size="xs"
          class="number-btn"
          @click="updateNumber(step)"
        />
        <q-btn
          flat
          dense
          icon="keyboard_arrow_down"
          size="xs"
          class="number-btn"
          @click="updateNumber(-step)"
        />
      </div>
    </template>
  </q-input>
</template>

<script>
import { defineComponent } from "vue";

/**
 * 数字输入框组件
 * @description 对加减按钮进行了美化的数字输入组件
 *
 * @property {Number} modelValue - 输入框的数值
 * @property {String} label - 输入框标签
 * @property {String} icon - 输入框图标
 */
export default defineComponent({
  name: "NumberInput",
  props: {
    modelValue: {
      type: Number,
    },
    label: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    max: {
      type: Number,
      default: 1000000000,
    },
    min: {
      type: Number,
      default: -1000000000,
    },
    step: {
      type: Number,
      default: 1,
    },
  },
  emits: ["update:modelValue"],
  computed: {
    localValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        if (value === null || value === undefined || value === "") {
          this.$emit("update:modelValue", null);
        } else {
          const numValue = Number(value);
          if (numValue > this.max) {
            this.$emit("update:modelValue", this.max);
          } else if (numValue < this.min) {
            this.$emit("update:modelValue", this.min);
          } else {
            this.$emit("update:modelValue", numValue);
          }
        }
      },
    },
  },
  methods: {
    updateNumber(delta) {
      const newValue = +((this.localValue || 0) + delta).toFixed(10);
      if (newValue > this.max) {
        this.$emit("update:modelValue", this.max);
      } else if (newValue < this.min) {
        this.$emit("update:modelValue", this.min);
      } else {
        this.$emit("update:modelValue", newValue);
      }
    },
  },
});
</script>

<style scoped>
/* 数字输入框样式 */
.number-input {
  width: 100%;
}

/* 隐藏默认的数字输入框箭头 - Chrome, Safari, Edge, Opera */
.number-input :deep(input[type="number"]::-webkit-outer-spin-button),
.number-input :deep(input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

.number-input :deep(.q-field__control) {
  padding-left: 8px;
  padding-right: 4px;
}

.number-controls {
  height: 100%;
  display: flex;
  width: 32px;
  flex-direction: column;
  justify-content: center;
}

.number-btn {
  opacity: 0.7;
  font-size: 12px;
  padding: 0;
  margin: 0;
  min-height: 16px;
  height: 16px;
  width: 20px;
}

.number-btn :deep(.q-icon) {
  font-size: 12px;
}

.number-btn:hover {
  opacity: 1;
  color: var(--q-primary);
}
</style>
