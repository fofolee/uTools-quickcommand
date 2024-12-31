<template>
  <div class="row q-col-gutter-sm ubrowser-function-input">
    <div class="col-12">
      <div class="row q-col-gutter-sm">
        <div class="col-3">
          <q-select
            v-model="localParams"
            use-input
            use-chips
            multiple
            dense
            borderless
            hide-dropdown-icon
            options-dense
            input-debounce="0"
            new-value-mode="add-unique"
            label="参数"
            @update:model-value="updateParams"
            @input-value="handleInput"
            @blur="handleBlur"
            ref="paramSelect"
          >
            <template v-slot:prepend>
              <div class="text-primary func-symbol">(</div>
            </template>
            <template v-slot:append>
              <div class="text-primary func-symbol">)</div>
            </template>
          </q-select>
        </div>
        <div class="col-9">
          <q-input
            v-model="localFunction"
            :label="label"
            type="textarea"
            dense
            borderless
            style="font-family: Consolas, Monaco, 'Courier New'"
            autogrow
            @update:model-value="updateFunction"
          >
            <template v-slot:prepend>
              <div class="text-primary func-symbol">=> {</div>
            </template>
            <template v-slot:append>
              <div class="text-primary func-symbol">}</div>
            </template>
          </q-input>
        </div>
      </div>
    </div>
    <template v-if="localParams.length">
      <div v-for="param in localParams" :key="param" class="col-12">
        <div class="row q-col-gutter-sm items-center">
          <div class="col-3">
            <q-chip
              dense
              color="primary"
              text-color="white"
              removable
              @remove="removeParam(param)"
            >
              {{ param }}
            </q-chip>
          </div>
          <div class="col-9">
            <q-input
              v-model="paramValues[param]"
              :label="`传递给参数 ${param} 的值`"
              dense
              filled
              @update:model-value="updateParamValue(param, $event)"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "UBrowserFunctionInput",
  props: {
    function: {
      type: String,
      default: "",
    },
    args: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: "函数内容",
    },
    icon: {
      type: String,
      default: "code",
    },
  },
  emits: ["update:function", "update:args"],
  data() {
    return {
      localFunction: "",
      localParams: [],
      paramValues: {},
      newParamName: "",
    };
  },
  created() {
    // 初始化本地数据
    this.localFunction = this.function;
    this.localParams = this.args?.map((arg) => arg.name) || [];
    this.paramValues = Object.fromEntries(
      this.args?.map((arg) => [arg.name, arg.value]) || []
    );
  },
  methods: {
    updateFunction(value) {
      this.localFunction = value;
      this.emitUpdate();
    },
    updateParams(value) {
      this.localParams = value;
      this.emitUpdate();
    },
    removeParam(param) {
      const index = this.localParams.indexOf(param);
      if (index > -1) {
        this.localParams.splice(index, 1);
        delete this.paramValues[param];
        this.emitUpdate();
      }
    },
    updateParamValue(param, value) {
      this.paramValues[param] = value;
      this.emitUpdate();
    },
    emitUpdate() {
      this.$emit("update:function", this.localFunction);
      this.$emit(
        "update:args",
        this.localParams.map((name) => ({
          name,
          value: this.paramValues[name] || "",
        }))
      );
    },
    handleInput(val) {
      if (!val) return;
      this.newParamName = val;

      if (val.includes(",") || val.includes(" ")) {
        const params = val
          .split(/[,\s]+/)
          .map((p) => p.trim())
          .filter((p) => p);
        params.forEach((param) => {
          if (param && !this.localParams.includes(param)) {
            this.localParams = [...this.localParams, param];
            this.paramValues[param] = "";
          }
        });
        this.newParamName = "";
        this.emitUpdate();
        this.$refs.paramSelect.updateInputValue("");
      }
    },
    handleBlur() {
      if (this.newParamName && !this.localParams.includes(this.newParamName)) {
        this.localParams = [...this.localParams, this.newParamName];
        this.paramValues[this.newParamName] = "";
        this.newParamName = "";
        this.emitUpdate();
        this.$refs.paramSelect.updateInputValue("");
      }
    },
  },
  watch: {
    function: {
      handler(newValue) {
        this.localFunction = newValue;
      },
    },
    args: {
      deep: true,
      handler(newValue) {
        this.localParams = newValue?.map((arg) => arg.name) || [];
        this.paramValues = Object.fromEntries(
          newValue?.map((arg) => [arg.name, arg.value]) || []
        );
      },
    },
  },
});
</script>

<style scoped>
.ubrowser-function-input :deep(.q-field__control) .text-primary.func-symbol {
  font-size: 24px !important;
}

.ubrowser-function-input :deep(.q-select__input) {
  display: flex !important;
  flex-wrap: nowrap !important;
  overflow-x: auto !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.ubrowser-function-input :deep(.q-select .q-field__native) {
  display: flex !important;
  flex-wrap: nowrap !important;
  overflow-x: auto !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.ubrowser-function-input :deep(.q-select .q-field__native > div) {
  display: flex !important;
  flex-wrap: nowrap !important;
  flex: 0 0 auto !important;
}

.ubrowser-function-input :deep(.q-select .q-chip) {
  flex: 0 0 auto !important;
  margin-right: 4px !important;
}

.ubrowser-function-input :deep(.q-select__input::-webkit-scrollbar),
.ubrowser-function-input :deep(.q-select .q-field__native::-webkit-scrollbar) {
  display: none !important;
}
</style>
