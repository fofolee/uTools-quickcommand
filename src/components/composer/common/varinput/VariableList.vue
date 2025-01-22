<template>
  <q-btn-dropdown
    flat
    dense
    stretch
    size="sm"
    class="variable-dropdown"
    @click="({ variables, functions } = getAvailableVariablesAndFunctions())"
  >
    <q-list class="variable-list">
      <template v-if="variables.length || functions.length">
        <div v-if="variables.length">
          <q-item-label header class="variable-label">
            <q-separator class="separator-left" />
            <div class="label-content">
              <span>变量</span>
            </div>
            <q-separator class="separator-right" />
          </q-item-label>
          <q-item
            v-for="variable in variables"
            :key="variable.name"
            clickable
            v-close-popup
            @click="insertValue(variable.name)"
            class="variable-item"
          >
            <q-item-section>
              <q-item-label class="variable-name">
                {{ variable.name }}
              </q-item-label>
              <q-item-label caption class="variable-source">
                来自: {{ variable.sourceCommand.label }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <div v-if="functions.length">
          <q-item-label header class="variable-label">
            <q-separator class="separator-left" />
            <div class="label-content">
              <span>函数</span>
            </div>
            <q-separator class="separator-right" />
          </q-item-label>
          <q-item
            v-for="func in functions"
            :key="func.id"
            clickable
            v-close-popup
            @click="insertValue(func.value + getInsertFunctionParams(func.id))"
            class="variable-item"
          >
            <q-item-section>
              <q-item-label class="variable-name">
                {{ func.value }}
              </q-item-label>
              <q-item-label caption class="variable-source">
                {{ func.label }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </template>
      <template v-else>
        <q-item>
          <q-item-section>
            <q-item-label class="empty-variables-tip">
              <div class="q-gutter-md">
                <div class="row items-center justify-center text-grey-6">
                  <q-icon name="info" size="20px" class="q-mr-sm" />
                  <span>当前命令没有可用变量或函数</span>
                </div>
                <div class="row items-center justify-center text-grey-7">
                  <div>点击其他命令右上角</div>
                  <q-icon name="output" size="16px" class="q-mx-xs" />
                  <div>按钮添加变量</div>
                </div>
                <div class="row items-center justify-center text-grey-7">
                  <div>或点击主流程右边的</div>
                  <q-icon name="add" size="16px" class="q-mx-xs" />
                  <div>按钮添加函数</div>
                </div>
              </div>
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </q-btn-dropdown>
</template>

<script>
import { defineComponent, inject } from "vue";

export default defineComponent({
  name: "VariableList",
  emits: ["emitValue"],
  setup() {
    const getCurrentVariables = inject("getCurrentVariables");
    const commandIndex = inject("commandIndex", null);

    const getAvailableVariables = () => {
      const variables = getCurrentVariables();
      return variables.filter((variable) =>
        // 输出变量只显示在当前命令之前的
        variable.type === "output"
          ? variable.sourceCommand.index < commandIndex.value
          : // 参数和局部变量显示所有
            true
      );
    };

    const getCurrentFunctions = inject("getCurrentFunctions");

    const getAvailableVariablesAndFunctions = () => {
      return {
        variables: getAvailableVariables(),
        functions: getCurrentFunctions(),
      };
    };

    const getFunctionParams = inject("getFunctionParams");

    return {
      getAvailableVariablesAndFunctions,
      getFunctionParams,
    };
  },
  data() {
    return {
      variables: [],
      functions: [],
    };
  },
  methods: {
    insertValue(value) {
      this.$emit("emitValue", "var", value);
    },
    getInsertFunctionParams(funcId) {
      return (
        "(" +
        this.getFunctionParams(funcId)
          .map((p) => p.name)
          .join(", ") +
        ")"
      );
    },
  },
});
</script>

<style scoped>
.variable-dropdown {
  background-color: rgba(0, 0, 0, 0.02);
}
.body--dark .variable-dropdown {
  background-color: rgba(255, 255, 255, 0.02);
}
/* 变量列表样式 */
.variable-list {
  padding: 4px;
}

.variable-item {
  border-radius: 4px;
  padding: 0px 16px;
  transition: all 0.3s ease;
  min-height: 32px;
  text-align: center;
}

.variable-item:hover {
  background-color: var(--q-primary-opacity-10);
}

.variable-label {
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  position: relative;
}

.separator-left {
  min-width: 16px;
  flex: 1;
}

.separator-right {
  min-width: 16px;
  flex: 1;
}

.label-content {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  white-space: nowrap;
}

.variable-name {
  font-size: 12px;
  font-weight: 500;
}

.variable-source {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 0;
}

/* 暗色模式适配 */
.body--dark .variable-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.empty-variables-tip {
  text-align: center;
  font-size: 13px;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.empty-variables-tip:hover {
  opacity: 1;
}
</style>
