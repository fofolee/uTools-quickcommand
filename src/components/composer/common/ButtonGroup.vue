<template>
  <div class="button-group">
    <div
      v-for="opt in options"
      :key="opt.value"
      :class="['button-item', { active: modelValue === opt.value }]"
      @click="$emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ButtonGroup",
  props: {
    modelValue: {
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
  },
  emits: ["update:modelValue"],
});
</script>

<style scoped>
.button-group {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px;
  border-radius: 6px;
}

.button-item {
  flex: 1;
  min-width: 80px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 26px;
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
</style>
