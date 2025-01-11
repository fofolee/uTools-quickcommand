<template>
  <component
    :is="!!label ? 'BorderLabel' : 'div'"
    :label="label"
    :icon="icon"
    :model-value="isCollapse"
  >
    <div class="param-grid">
      <div
        v-for="([key, config], index) in Object.entries(options)"
        :key="`${key}-${index}`"
        class="grid-item"
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
      return this.modelValue;
    },
  },
  methods: {
    updateOption(key, value) {
      this.$emit("update:modelValue", { ...this.localObject, [key]: value });
    },
    getColumnStyle(width = 12) {
      if (width === "auto") {
        return {
          flex: "1 1 0%",
          minWidth: "0",
        };
      }
      const columnWidth = (width / 12) * 100;
      return {
        width: `calc(${columnWidth}% - var(--grid-gap))`,
        flex: "0 0 auto",
      };
    },
    shouldShowQIcon(config) {
      return ["q-input", "q-select"].includes(config.component) && config.icon;
    },
  },
});
</script>

<style scoped>
.param-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--grid-gap);
  width: 100%;
  --grid-gap: 8px;
}

.grid-item {
  min-width: 50px;
  margin-bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.grid-item > * {
  flex: 1;
  min-width: 0;
}

/* 让开关、复选框和按钮组居中显示 */
.grid-item > .q-toggle,
.grid-item > .q-checkbox,
.grid-item > .q-btn-group {
  flex: 0 1 auto;
}

@media (max-width: 600px) {
  .grid-item {
    width: 100% !important;
    flex: 1 1 100% !important;
  }
}
</style>
