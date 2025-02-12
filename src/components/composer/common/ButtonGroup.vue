<template>
  <component
    :is="!!label ? 'BorderLabel' : 'div'"
    :label="label"
    :icon="icon"
    :model-value="isCollapse"
  >
    <div class="button-group">
      <div
        v-for="opt in formattedOptions"
        :key="opt.value"
        :style="{
          height: height,
          flex: `1 0 calc(${100 / formattedOptions.length}% - ${
            (4 * (formattedOptions.length - 1)) / formattedOptions.length
          }px)`,
        }"
        :class="[
          'button-item',
          {
            active: modelValue === opt.value,
            disabled: opt.disabled,
          },
        ]"
        @click="$emit('update:modelValue', opt.value)"
      >
        <div class="q-mr-sm" v-if="opt.icon">
          <q-img
            :src="opt.icon"
            width="24px"
            v-if="opt.icon.includes('.png')"
          />
          <q-icon :name="opt.icon" v-else />
        </div>
        <div>{{ opt.label }}</div>
      </div>
    </div>
  </component>
</template>

<script>
import { defineComponent } from "vue";
import BorderLabel from "./BorderLabel.vue";

export default defineComponent({
  name: "ButtonGroup",
  components: {
    BorderLabel,
  },
  props: {
    modelValue: {
      required: true,
    },
    options: {
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
    isCollapse: {
      type: Boolean,
      default: false,
    },
    height: {
      type: String,
      default: "32px",
    },
  },
  emits: ["update:modelValue"],
  computed: {
    formattedOptions() {
      return this.options.map((opt) => ({
        ...opt,
        value: opt.value ?? opt.name,
      }));
    },
  },
});
</script>

<style scoped>
.button-group {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 4px;
}

.button-item {
  min-width: fit-content;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--q-primary-opacity-5);
  border: 1px solid var(--q-primary-opacity-5);
  color: var(--q-primary);
  white-space: nowrap;
  user-select: none;
}

.button-item:hover {
  transform: translateY(-1px);
}

.button-item.active {
  color: white;
  background: var(--q-primary);
  border-color: var(--q-primary);
}

.button-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  filter: grayscale(1);
}
</style>
