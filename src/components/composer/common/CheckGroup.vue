<template>
  <component
    :is="!!label ? 'BorderLabel' : 'div'"
    :label="label"
    :icon="icon"
    :model-value="isCollapse"
  >
    <div class="check-btn-group">
      <q-btn
        v-for="option in formattedOptions"
        :key="option.value"
        :color="isSelected(option.value) ? 'primary' : 'grey-7'"
        :flat="!isSelected(option.value)"
        :outline="isSelected(option.value)"
        dense
        :class="[
          'check-btn',
          { 'check-btn--selected': isSelected(option.value) },
        ]"
        :style="{
          flex: `1 0 calc(${100 / formattedOptions.length}% - ${
            (4 * (formattedOptions.length - 1)) / formattedOptions.length
          }px)`,
          height: height,
        }"
        @click="toggleOption(option.value)"
      >
        <template #default>
          <div class="row items-center full-width">
            <div class="check-btn-content row items-center">
              <div class="q-mr-sm" v-if="option.icon">
                <q-img
                  :src="option.icon"
                  width="24px"
                  v-if="option.icon.includes('.png')"
                />
                <q-icon :name="option.icon" v-else />
              </div>
              <div class="check-btn-label">{{ option.label }}</div>
            </div>
            <q-icon
              :name="
                isSelected(option.value)
                  ? 'check_circle'
                  : 'radio_button_unchecked'
              "
              size="14px"
              class="q-ml-xs check-btn-icon"
            />
          </div>
          <q-tooltip v-if="option.tooltip">{{ option.tooltip }}</q-tooltip>
        </template>
      </q-btn>
    </div>
  </component>
</template>

<script>
import { defineComponent } from "vue";
import BorderLabel from "components/composer/common/BorderLabel.vue";

export default defineComponent({
  name: "CheckGroup",
  components: { BorderLabel },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
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
      default: "36px",
    },
  },
  computed: {
    formattedOptions() {
      return this.options.map((opt) => {
        if (typeof opt === "string") {
          return {
            label: opt,
            value: opt,
          };
        }
        return {
          ...opt,
          value: opt.value ?? opt.name,
        };
      });
    },
  },
  emits: ["update:model-value"],
  methods: {
    isSelected(value) {
      return this.modelValue.includes(value);
    },
    toggleOption(value) {
      const newValue = [...this.modelValue];
      const index = newValue.indexOf(value);
      if (index === -1) {
        newValue.push(value);
      } else {
        newValue.splice(index, 1);
      }
      this.$emit("update:model-value", newValue);
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
  min-width: fit-content !important;
  max-width: 100% !important;
  font-size: 12px;
  padding: 0 8px;
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

/* 移除按钮组默认的边框合并样式 */
.check-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  border-color: var(--q-primary);
}

/* 暗色模式适配 */
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

/* 选中状态的按钮样式 */
.check-btn.q-btn--outline {
  opacity: 1;
  background-color: transparent;
}
</style>
