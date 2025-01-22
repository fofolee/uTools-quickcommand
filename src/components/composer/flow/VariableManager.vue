<template>
  <div class="variable-manager" :class="{ 'is-visible': modelValue }">
    <div class="variable-content">
      <div class="variable-header">
        <div class="header-title">变量管理</div>
        <q-btn
          flat
          dense
          round
          icon="close"
          size="sm"
          @click="$emit('update:modelValue', false)"
        />
      </div>
      <!-- 参数管理部分 -->
      <div class="section" v-if="!isMainFlow">
        <div class="section-header">
          <div class="section-title">
            <q-icon name="functions" size="16px" />
            <div>函数参数</div>
          </div>
          <q-btn
            flat
            dense
            round
            icon="add"
            size="sm"
            @click="addVariable('param')"
          />
        </div>
        <div class="var-list">
          <div
            v-for="(variable, index) in paramVariables"
            :key="index"
            class="var-item"
          >
            <q-input
              v-model="variable.name"
              dense
              borderless
              class="var-input"
              @blur="validateVariable(variable, 'param')"
              @keydown.enter="validateVariable(variable, 'param')"
            />
            <q-btn
              flat
              dense
              round
              icon="close"
              size="xs"
              @click="removeVariable(index, 'param')"
            />
          </div>
        </div>
      </div>

      <!-- 手动变量管理部分 -->
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <q-icon name="data_object" size="16px" />
            <div>局部变量</div>
          </div>
          <q-btn
            flat
            dense
            round
            icon="add"
            size="sm"
            @click="addVariable('var')"
          />
        </div>
        <div class="var-list">
          <div
            v-for="(variable, index) in customVars"
            :key="index"
            class="var-item"
          >
            <div class="var-inputs">
              <q-input
                v-model="variable.name"
                dense
                borderless
                class="var-input"
                placeholder="变量名"
                @blur="validateVariable(variable, 'var')"
                @keydown.enter="validateVariable(variable, 'var')"
              />
              <q-separator vertical />
              <q-input
                v-model="variable.value"
                dense
                borderless
                class="var-input"
                placeholder="变量值"
              />
            </div>
            <q-btn
              flat
              dense
              round
              icon="close"
              size="xs"
              @click="removeVariable(index, 'var')"
            />
          </div>
        </div>
      </div>

      <!-- 输出变量展示部分 -->
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <q-icon name="output" size="16px" />
            <div>来自输出</div>
          </div>
        </div>
        <div class="var-list">
          <div
            v-for="(variable, index) in outputVariables"
            :key="index"
            class="var-item output-var"
          >
            <div class="var-name">{{ variable.name }}</div>
            <div class="var-source">{{ variable.sourceCommand.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "VariableManager",
  props: {
    modelValue: {
      type: Boolean,
      required: true,
      default: false,
    },
    isMainFlow: {
      type: Boolean,
      default: false,
    },
    variables: {
      type: Array,
      required: true,
      default: () => [],
    },
    outputVariables: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  emits: ["update:modelValue", "update:variables"],
  computed: {
    customVariables: {
      get() {
        return this.variables || [];
      },
      set(value) {
        this.$emit("update:variables", value);
      },
    },
    paramVariables() {
      return this.customVariables.filter((v) => v.type === "param");
    },
    customVars() {
      return this.customVariables.filter((v) => v.type === "var");
    },
  },
  methods: {
    addVariable(type) {
      const prefix = type === "param" ? "param_" : "var_";
      const count = this.customVariables.filter((v) => v.type === type).length;
      this.customVariables = [
        ...this.customVariables,
        {
          name: prefix + (count + 1),
          type,
          value: type === "var" ? "" : undefined,
        },
      ];
    },
    removeVariable(index, type) {
      const typeVars = this.customVariables.filter((v) => v.type === type);
      const globalIndex = this.customVariables.indexOf(typeVars[index]);
      if (globalIndex > -1) {
        const newVars = [...this.customVariables];
        newVars.splice(globalIndex, 1);
        this.customVariables = newVars;
      }
    },
    validateVariable(variable, type) {
      if (!variable.name) {
        const prefix = type === "param" ? "param_" : "var_";
        const count = this.customVariables.filter(
          (v) => v.type === type
        ).length;
        variable.name = prefix + count;
      }
    },
  },
});
</script>

<style scoped>
.variable-manager {
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: rgba(255, 255, 255, 0.95);
  border-left: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  overflow: hidden;
  border-radius: 0 0 8px 0;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

.variable-manager.is-visible {
  width: 200px;
}

.body--dark .variable-manager {
  background: rgba(35, 35, 35, 0.95);
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
}

.variable-content {
  opacity: 0;
  transition: opacity 0.2s ease;
  min-width: 200px;
  padding: 8px;
  height: 100%;
  overflow-y: auto;
  visibility: hidden;
}

.variable-manager.is-visible .variable-content {
  opacity: 1;
  visibility: visible;
}

.variable-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin: -8px -8px 8px -8px;
}

.header-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--q-primary);
}

.section {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.8;
}

.var-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 4px;
}

.var-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.02);
  transition: background-color 0.2s ease;
  min-height: 32px;
}

.var-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.body--dark .var-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.var-inputs {
  display: flex;
  flex: 1;
  gap: 8px;
  height: 20px;
}

.var-input {
  width: 0;
  flex: 1 1 50%;
}

.var-input :deep(.q-field__control) {
  height: 20px;
  min-height: 20px;
}

.var-input :deep(.q-field__native) {
  padding: 0;
  font-size: 12px;
  line-height: 20px;
}

.var-input :deep(.q-field__native::placeholder) {
  color: rgba(0, 0, 0, 0.3);
}

.body--dark .var-input :deep(.q-field__native::placeholder) {
  color: rgba(255, 255, 255, 0.3);
}

.output-var {
  padding: 6px 8px;
  font-size: 12px;
}

.var-name {
  font-weight: 500;
}

.var-source {
  margin-left: auto;
  font-size: 11px;
  opacity: 0.7;
}
</style>
