<template>
  <component
    :is="!!label ? 'BorderLabel' : 'div'"
    :label="label"
    :icon="icon"
    :model-value="isCollapse"
  >
    <div class="option-grid">
      <div
        v-for="([key, config], index) in Object.entries(options)"
        :key="`${key}-${index}`"
        class="option-item"
        :style="getColumnStyle(config.width)"
      >
        <ParamImporter
          :config="config"
          :model-value="localObject[key]"
          @update:model-value="updateOption(key, $event)"
        />
      </div>
    </div>
  </component>
</template>

<script>
import { defineComponent } from "vue";
import ParamImporter from "../param/ParamImporter.vue";
import BorderLabel from "./BorderLabel.vue";
export default defineComponent({
  name: "OptionEditor",
  components: {
    BorderLabel,
    ParamImporter,
  },
  emits: ["update:modelValue"],
  props: {
    label: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    isCollapse: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    localObject() {
      return this.modelValue || {};
    },
  },
  methods: {
    updateOption(key, value) {
      const newValue = { ...this.localObject, [key]: value };
      this.$emit("update:modelValue", newValue);
    },
    getColumnStyle(width = 12) {
      if (width === "auto") {
        return {
          flex: "1 1 0%",
          minWidth: "0",
        };
      }
      const columnWidth = (width / 12) * 100;
      const gapWidth = 8;
      return {
        width: `calc(${columnWidth}% - ${gapWidth * (1 - width / 12)}px)`,
        flex: "0 0 auto",
      };
    },
    shouldShowQIcon(config) {
      return ["q-input", "q-select"].includes(config.component) && config.icon;
    },
  },
  created() {
    // Initialize with empty object if modelValue is null/undefined
    if (!this.modelValue) {
      this.$emit("update:modelValue", {});
    }
  },
});
</script>

<style scoped>
.option-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--grid-gap);
  width: 100%;
  --grid-gap: 8px;
}

.option-item {
  min-width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.option-item > * {
  flex: 1;
  min-width: 0;
  width: 100%;
}

/* 让开关、复选框和按钮组居中显示 */
.option-item > .q-toggle,
.option-item > .q-checkbox,
.option-item > .q-btn-group {
  flex: 0 1 auto;
  width: auto;
}

@media (max-width: 600px) {
  .option-item {
    width: 100% !important;
    flex: 1 1 100% !important;
  }
}
</style>
