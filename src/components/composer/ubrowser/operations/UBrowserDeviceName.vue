<template>
  <div class="row q-col-gutter-sm">
    <div class="col">
      <VariableInput
        :command="{ icon: icon }"
        :model-value="modelValue"
        :label="label"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>
    <div class="col-auto">
      <q-select
        v-model="selectedDevice"
        :options="deviceOptions"
        label="常用设备"
        dense
        filled
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
import { deviceName } from "js/options/httpHeaders";
import VariableInput from "components/composer/ui/VariableInput.vue";

export default defineComponent({
  name: "UBrowserDeviceName",
  components: {
    VariableInput,
  },
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
      deviceOptions: deviceName,
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
