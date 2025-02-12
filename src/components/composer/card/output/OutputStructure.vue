<template>
  <div>
    <!-- 如果是嵌套对象 -->
    <div v-if="hasNestedFields">
      <BorderLabel :label="output.label || outputKey" :model-value="false">
        <div class="column q-col-gutter-sm">
          <div v-for="(subOutput, subKey) in getNestedFields" :key="subKey">
            <div class="output-item">
              <OutputField
                :model-value="modelValue[getFieldPath(subKey)]"
                @update:model-value="updateField(subKey, $event)"
                :label="subOutput.label"
                :placeholder="subOutput.placeholder"
                :suggest-name="subOutput.suggestName"
                :show-variable-list="true"
                autofocus
              />
            </div>
          </div>
        </div>
      </BorderLabel>
    </div>
    <!-- 如果是普通字段 -->
    <div v-else class="output-item">
      <OutputField
        :model-value="modelValue[getFieldPath()]"
        @update:model-value="updateField('', $event)"
        :label="output.label"
        :placeholder="output.placeholder"
        :suggest-name="output.suggestName"
        :show-variable-list="true"
        autofocus
      />
    </div>
  </div>
</template>

<script>
/**
 * 只处理一层嵌套，手动在配置文件中控制outputs结构不要太复杂
 * 第二层嵌套只嵌套对象，不嵌套数组
 * 最复杂的情况：
 * outputs: {
 *   label: "测试",
 *   structure: [
 *     {
 *       position: { label: "位置", {
 *         x: { label: "X坐标" },
 *         y: { label: "Y坐标" }
 *       }
 *     }
 *   ]
 * }
 *
 *
 */
import { defineComponent } from "vue";
import BorderLabel from "components/composer/common/BorderLabel.vue";
import OutputField from "./OutputField.vue";

export default defineComponent({
  name: "OutputStructure",
  components: {
    BorderLabel,
    OutputField,
  },
  props: {
    output: {
      type: Object,
      required: true,
    },
    outputKey: {
      type: String,
      required: true,
    },
    isArray: {
      type: Boolean,
      default: false,
    },
    arrayIndex: {
      type: Number,
      default: 0,
    },
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    fixedFields: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue"],
  computed: {
    hasNestedFields() {
      if (!this.output) return false;
      return Object.keys(this.output).some(
        (key) => !this.fixedFields.includes(key)
      );
    },
    getNestedFields() {
      const fields = {};
      Object.entries(this.output).forEach(([key, value]) => {
        if (!this.fixedFields.includes(key)) {
          fields[key] = value;
        }
      });
      return fields;
    },
  },
  methods: {
    getFieldPath(subKey = "") {
      const base = this.isArray
        ? `[${this.arrayIndex}]?.${this.outputKey}`
        : this.outputKey;
      return subKey ? `${base}.${subKey}` : base;
    },
    updateField(subKey, value) {
      const path = this.getFieldPath(subKey);
      const newValue = { ...this.modelValue };
      newValue[path] = value;
      this.$emit("update:modelValue", newValue);
    },
  },
});
</script>

<style scoped>
.output-item {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.output-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.body--dark .output-item:hover {
  background: rgba(255, 255, 255, 0.02);
}
</style>
