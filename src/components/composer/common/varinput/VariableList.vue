<template>
  <q-btn-dropdown
    flat
    dense
    stretch
    size="sm"
    :dropdown-icon="icon"
    :no-icon-animation="icon !== 'arrow_drop_down'"
    @click="({ variables, functions } = getAvailableVariablesAndFunctions())"
  >
    <template #label>
      <div class="variable-label" v-if="!!label">
        <span>{{ label }}</span>
      </div>
    </template>
    <q-list class="variable-list">
      <template v-if="variables.length || functions.length">
        <div v-if="variables.length && showVariableList">
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
              <q-item-label
                caption
                class="variable-source"
                v-if="variable.sourceCommand"
              >
                <span>
                  {{ variable.type === "global" ? "全局变量：" : "来自：" }}
                </span>
                <span>{{ variable.sourceCommand.label }}</span>
              </q-item-label>
            </q-item-section>
            <q-tooltip
              anchor="center left"
              self="center end"
              v-if="variable.description"
            >
              <div
                v-text="variable.description"
                class="variable-description"
              ></div>
            </q-tooltip>
          </q-item>
        </div>
        <div v-if="functions.length && showFunctionList">
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
            @click="insertValue(func.name + getInsertFunctionParams(func.id))"
            class="variable-item"
          >
            <q-item-section>
              <q-item-label class="variable-name">
                {{ func.name }}
              </q-item-label>
              <q-item-label caption class="row item">
                {{ func.label }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </template>
      <template v-else>
        <q-item dense>
          <q-item-section>
            <div class="empty-tip">
              <!-- 主要提示 -->
              <div class="tip-header">
                <q-icon name="info" size="16px" class="text-grey-6" />
                <span>当前没有可用的变量或函数</span>
              </div>

              <q-separator spaced />

              <!-- 添加方法提示 -->
              <div class="tip-content">
                <!-- 变量添加方法 -->
                <div class="tip-section">
                  <div class="section-title">
                    <q-icon
                      name="data_object"
                      size="16px"
                      class="text-primary"
                    />
                    <span>添加变量</span>
                  </div>
                  <div class="section-items">
                    <div class="item">
                      <span>命令右上角</span>
                      <q-badge color="primary">
                        <q-icon name="output" size="10px" />
                      </q-badge>
                      <span>按钮</span>
                    </div>
                    <div class="item">
                      <span>标签栏右侧</span>
                      <q-badge color="primary">
                        <q-icon name="settings" size="10px" />
                      </q-badge>
                      <span>按钮</span>
                    </div>
                  </div>
                </div>

                <q-separator vertical spaced />

                <!-- 函数添加方法 -->
                <div class="tip-section">
                  <div class="section-title">
                    <q-icon name="functions" size="16px" class="text-primary" />
                    <span>添加函数</span>
                  </div>
                  <div class="section-items">
                    <div class="item">
                      <span>主流程右侧</span>
                      <q-badge color="primary">
                        <q-icon name="add" size="10px" />
                      </q-badge>
                      <span>按钮</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
  setup(props) {
    const getCurrentVariables = inject("getCurrentVariables");
    const commandIndex = inject("commandIndex", null);

    const getAvailableVariables = () => {
      let variables = getCurrentVariables();
      if (!props.showGlobalVariables) {
        variables = variables.filter((variable) => variable.type !== "global");
      }
      const usableVariables = variables.filter((variable) =>
        // 输出变量只显示在当前命令之前的
        variable.type === "output"
          ? variable.sourceCommand.index < commandIndex.value
          : // 参数和局部变量显示所有
            true
      );
      // 去除名称重复的变量，只保留最新的
      return [...new Map(usableVariables.map((v) => [v.name, v])).values()];
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
  props: {
    showGlobalVariables: {
      type: Boolean,
      default: true,
    },
    showVariableList: {
      type: Boolean,
      default: true,
    },
    showFunctionList: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
      default: "arrow_drop_down",
    },
    label: {
      type: String,
      default: "",
    },
  },
});
</script>

<style scoped>
/* 基础样式 */
.variable-list {
  padding: 4px;
}

/* 变量列表项 */
.variable-item {
  border-radius: 4px;
  padding: 0 16px;
  min-height: 32px;
  text-align: center;
  transition: all 0.3s ease;
}

.variable-item:hover {
  background: var(--q-primary-opacity-10);
}

/* 变量标签 */
.variable-label {
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.label-content {
  padding: 0 8px;
  white-space: nowrap;
}

.separator-left,
.separator-right {
  min-width: 32px;
  flex: 1;
}

/* 变量名称和来源 */
.variable-name {
  font-size: 12px;
  font-weight: 500;
}

.variable-source {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 0;
}

/* 空状态提示 */
.empty-tip {
  padding: 6px;
  min-width: 260px;
  font-size: 12px;
}

.tip-header {
  padding: 2px 6px;
  color: var(--q-grey-7);
}

.tip-content {
  padding: 0 6px;
  gap: 12px;
}

.tip-section {
  flex: 1;
}

/* 通用布局 */
.tip-header,
.tip-content,
.section-title,
.item {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
}

.tip-content {
  align-items: flex-start;
}

.section-title {
  padding: 4px;
  color: var(--q-primary);
  font-weight: 500;
}

.section-items {
  padding-left: 4px;
}

.item {
  padding: 2px 0;
  color: var(--q-grey-7);
}

.body--dark .variable-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.body--dark .item {
  color: var(--q-grey-5);
}

.empty-tip .q-separator {
  opacity: 0.2;
}

.variable-description {
  word-break: break-all;
  white-space: pre-wrap;
  font-size: 11px;
}
</style>
