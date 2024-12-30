<template>
  <div>
    <div class="row q-col-gutter-sm">
      <div
        v-for="(file, index) in modelValue || []"
        :key="index"
        class="col-12"
      >
        <div class="row q-col-gutter-sm">
          <div class="col">
            <VariableInput
              :model-value="modelValue[index]"
              label="文件路径"
              :command="{ icon: 'folder' }"
              @update:model-value="(value) => handleUpdate(index, value)"
            />
          </div>
          <div class="col-auto">
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="remove"
              @click="removeFile(index)"
            />
          </div>
        </div>
      </div>
    </div>
    <q-btn
      flat
      dense
      color="primary"
      icon="add"
      label="添加文件"
      @click="addFile"
      class="q-mt-xs"
    />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "components/composer/ui/VariableInput.vue";

export default defineComponent({
  name: "UBrowserFileList",
  components: {
    VariableInput,
  },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue"],
  methods: {
    addFile() {
      const newValue = [...(this.modelValue || []), ""];
      this.$emit("update:modelValue", newValue);
    },
    removeFile(index) {
      const newValue = [...this.modelValue];
      newValue.splice(index, 1);
      this.$emit("update:modelValue", newValue);
    },
    handleUpdate(index, value) {
      const newValue = [...this.modelValue];
      newValue[index] = value;
      this.$emit("update:modelValue", newValue);
    },
  },
});
</script>
