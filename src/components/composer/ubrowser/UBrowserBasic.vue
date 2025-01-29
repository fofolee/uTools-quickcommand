<template>
  <div class="ubrowser-basic">
    <div class="row q-col-gutter-sm">
      <!-- 基础配置 -->
      <div class="col-12">
        <div class="row q-col-gutter-sm">
          <div class="col-9">
            <VariableInput
              v-model="url"
              label="网址"
              icon="link"
              class="col"
              :options="{
                items: userAgentOptions,
              }"
            />
          </div>
          <div class="col-3">
            <NumberInput
              v-model="timeout"
              label="超时时间(ms)"
              icon="timer"
              :min="0"
              :step="1000"
            />
          </div>
        </div>
      </div>

      <!-- Headers配置 -->
      <div class="col-12">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <VariableInput
              v-model="userAgent"
              label="User-Agent"
              icon="devices"
              :options="{
                items: userAgentOptions,
              }"
            />
          </div>
          <div class="col-12">
            <DictEditor
              v-model="otherHeaders"
              label="其他请求头"
              :options="{
                optionKeys: commonHeaders,
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VariableInput from "components/composer/common/VariableInput.vue";
import NumberInput from "components/composer/common/NumberInput.vue";
import DictEditor from "components/composer/common/DictEditor.vue";
import { userAgent, commonHeaders } from "js/options/httpOptions";
import { newVarInputVal } from "js/composer/varInputValManager";

export default {
  name: "UBrowserBasic",
  components: {
    VariableInput,
    NumberInput,
    DictEditor,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:model-value"],
  data() {
    return {
      selectedUA: null,
      userAgentOptions: userAgent,
      commonHeaders: commonHeaders,
    };
  },
  computed: {
    url: {
      get() {
        return this.modelValue.url || newVarInputVal("str", "");
      },
      set(value) {
        this.updateField("url", value);
      },
    },
    userAgent: {
      get() {
        return (
          this.modelValue.headers?.["User-Agent"] || newVarInputVal("str", "")
        );
      },
      set(value) {
        this.updateHeaders("User-Agent", value);
      },
    },
    timeout: {
      get() {
        return this.modelValue.timeout || 60000;
      },
      set(value) {
        this.updateField("timeout", value);
      },
    },
    otherHeaders: {
      get() {
        if (!this.modelValue.headers) return {};
        const standardHeaders = ["User-Agent"];
        return Object.entries(this.modelValue.headers)
          .filter(([key]) => !standardHeaders.includes(key))
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});
      },
      set(value) {
        const userAgent = this.modelValue.headers?.["User-Agent"];
        const newHeaders = {
          ...(userAgent ? { "User-Agent": userAgent } : {}),
          ...value,
        };
        this.updateField("headers", newHeaders);
      },
    },
  },
  methods: {
    updateField(field, value) {
      this.$emit("update:model-value", {
        ...this.modelValue,
        [field]: value,
      });
    },
    updateHeaders(key, value) {
      const headers = {
        ...this.modelValue.headers,
        [key]: value,
      };
      this.updateField("headers", headers);
    },
    handleUAChange(value) {
      if (!value) return;
      this.updateHeaders("User-Agent", newVarInputVal("str", value));
      this.selectedUA = null;
    },
  },
};
</script>

<style scoped>
.ubrowser-basic {
  width: 100%;
}
</style>
