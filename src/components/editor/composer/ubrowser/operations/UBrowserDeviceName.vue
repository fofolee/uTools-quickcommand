<template>
  <div class="row q-col-gutter-sm">
    <div class="col">
      <q-input
        :model-value="modelValue"
        :label="label"
        dense
        outlined
        @update:model-value="$emit('update:modelValue', $event)"
      >
        <template v-slot:prepend>
          <q-icon :name="icon" />
        </template>
      </q-input>
    </div>
    <div class="col-auto">
      <q-select
        v-model="selectedDevice"
        :options="deviceOptions"
        label="常用设备"
        dense
        outlined
        emit-value
        map-options
        options-dense
        style="min-width: 150px"
        @update:model-value="handleDeviceSelect"
      >
        <template v-slot:prepend>
          <q-icon name="list" />
        </template>
      </q-select>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "UBrowserDeviceName",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      selectedDevice: null,
      deviceOptions: [
        { label: "iPhone 11", value: "iPhone 11" },
        { label: "iPhone X", value: "iPhone X" },
        { label: "iPad", value: "iPad" },
        { label: "iPhone 6/7/8 Plus", value: "iPhone 6/7/8 Plus" },
        { label: "iPhone 6/7/8", value: "iPhone 6/7/8" },
        { label: "iPhone 5/SE", value: "iPhone 5/SE" },
        { label: "HUAWEI Mate10", value: "HUAWEI Mate10" },
        { label: "HUAWEI Mate20", value: "HUAWEI Mate20" },
        { label: "HUAWEI Mate30", value: "HUAWEI Mate30" },
        { label: "HUAWEI Mate30 Pro", value: "HUAWEI Mate30 Pro" },
      ],
    };
  },
  methods: {
    handleDeviceSelect(value) {
      if (value) {
        this.$emit("update:modelValue", value);
        this.selectedDevice = null;
      }
    },
  },
});
</script>
