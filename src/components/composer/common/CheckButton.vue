<template>
  <div class="check-btn-group">
    <q-btn
      :color="modelValue ? 'primary' : 'grey-7'"
      :flat="!modelValue"
      :outline="modelValue"
      dense
      :class="['check-btn', { 'check-btn--selected': modelValue }]"
      @click="toggleValue"
    >
      <template #default>
        <div class="row items-center full-width">
          <div class="check-btn-content">
            <div class="check-btn-label">{{ label }}</div>
          </div>
          <q-icon
            :name="modelValue ? 'check_circle' : 'radio_button_unchecked'"
            size="14px"
            class="q-ml-xs check-btn-icon"
          />
        </div>
        <q-tooltip v-if="placeholder" max-width="300px">{{
          placeholder
        }}</q-tooltip>
      </template>
    </q-btn>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "CheckButton",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    isCollapse: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:model-value"],
  methods: {
    toggleValue() {
      this.$emit("update:model-value", !this.modelValue);
    },
  },
});
</script>

<style scoped>
.check-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  width: 100%;
}

.check-btn {
  min-width: 100%;
  max-width: 100% !important;
  height: auto !important;
  min-height: 36px;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 4px !important;
  transition: all 0.3s;
  background-color: rgba(0, 0, 0, 0.03);
}

.check-btn :deep(.q-btn__content) {
  min-width: 0;
  height: auto;
  white-space: normal;
}

.check-btn-content {
  flex: 1;
  min-width: 0;
  margin-right: 4px;
}

.check-btn-label {
  text-align: center;
  line-height: 1.2;
  word-break: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.check-btn-icon {
  flex: none;
  opacity: 0.8;
  transition: all 0.3s;
  margin-top: 2px;
}

.check-btn--selected .check-btn-icon {
  opacity: 1;
  transform: scale(1.1);
}

.check-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  border-color: var(--q-primary);
}

.body--dark .check-btn {
  background-color: rgba(255, 255, 255, 0.03);
}

.check-btn--selected {
  background-color: transparent !important;
  border-color: var(--q-primary) !important;
}

.check-btn.q-btn--flat {
  color: var(--q-primary);
  opacity: 0.8;
}

.body--dark .check-btn.q-btn--flat {
  color: rgba(255, 255, 255, 0.9);
}

.check-btn.q-btn--outline {
  opacity: 1;
  background-color: transparent;
}
</style>
