<template>
  <div class="row q-col-gutter-sm">
    <div :class="fullWidth ? 'col-12' : 'col-' + width">
      <q-input
        :value="modelValue"
        v-bind="$attrs"
        filled
        square
        :dense="!large"
        @update:modelValue="handleInput"
      >
        <template v-if="$slots.prepend" v-slot:prepend>
          <slot name="prepend" />
        </template>
        <template v-else-if="icon" v-slot:prepend>
          <q-icon :name="icon" />
        </template>
        <template v-if="$slots.append" v-slot:append>
          <slot name="append" />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "UBrowserInput",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number],
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    width: {
      type: [Number, String],
      default: 12,
    },
    fullWidth: {
      type: Boolean,
      default: true,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    large: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  methods: {
    handleInput(value) {
      this.$emit("update:modelValue", value);
    },
  },
});
</script>
