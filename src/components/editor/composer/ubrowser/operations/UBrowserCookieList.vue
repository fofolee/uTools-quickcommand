<template>
  <div>
    <div class="row q-col-gutter-sm">
      <div
        v-for="(cookie, index) in modelValue || [{}]"
        :key="index"
        class="col-12"
      >
        <div class="row items-center q-gutter-x-sm">
          <div class="col">
            <VariableInput
              :model-value="cookie.name"
              label="名称"
              :command="{ icon: 'label' }"
              @update:model-value="
                (value) => handleUpdate(index, 'name', value)
              "
            />
          </div>
          <div class="col">
            <VariableInput
              :model-value="cookie.value"
              label="值"
              :command="{ icon: 'edit' }"
              @update:model-value="
                (value) => handleUpdate(index, 'value', value)
              "
            />
          </div>
          <div class="col-auto">
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="remove"
              @click="removeCookie(index)"
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
      label="添加Cookie"
      @click="addCookie"
      class="q-mt-xs"
    />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "components/editor/composer/VariableInput.vue";

export default defineComponent({
  name: "UBrowserCookieList",
  components: {
    VariableInput,
  },
  props: {
    modelValue: {
      type: Array,
      default: () => [{ name: "", value: "" }],
    },
  },
  emits: ["update:modelValue"],
  methods: {
    addCookie() {
      const newValue = [...this.modelValue, { name: "", value: "" }];
      this.$emit("update:modelValue", newValue);
    },
    removeCookie(index) {
      const newValue = [...this.modelValue];
      newValue.splice(index, 1);
      if (newValue.length === 0) {
        newValue.push({ name: "", value: "" });
      }
      this.$emit("update:modelValue", newValue);
    },
    handleUpdate(index, field, value) {
      const newValue = [...this.modelValue];
      newValue[index] = { ...newValue[index], [field]: value };
      this.$emit("update:modelValue", newValue);
    },
  },
});
</script>
