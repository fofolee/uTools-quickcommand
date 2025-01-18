<template>
  <q-btn-dropdown
    flat
    dense
    stretch
    size="sm"
    class="variable-dropdown"
    @click="variables = getAvailableVariables()"
  >
    <q-list class="variable-list">
      <q-item-label header class="variable-label">
        <q-icon name="functions" />
        <span>选择变量</span>
      </q-item-label>

      <q-separator class="q-my-xs" />

      <template v-if="variables.length">
        <q-item
          v-for="variable in variables"
          :key="variable.name"
          clickable
          v-close-popup
          @click="insertVariable(variable)"
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
      </template>
      <template v-else>
        <q-item>
          <q-item-section>
            <q-item-label class="empty-variables-tip">
              <div class="q-gutter-md">
                <div class="row items-center justify-center text-grey-6">
                  <q-icon name="info" size="20px" class="q-mr-sm" />
                  <span>当前命令没有可用变量</span>
                </div>
                <div class="row items-center justify-center text-grey-7">
                  <div class="text-grey-7">点击其他命令卡片右上角的</div>
                  <q-icon name="output" size="16px" class="q-mx-xs" />
                  <div>按钮添加输出变量</div>
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
      return getCurrentVariables().filter(
        (variable) => variable.sourceCommand.index < commandIndex.value
      );
    };

    return {
      getAvailableVariables,
    };
  },
  data() {
    return {
      variables: [],
    };
  },
  methods: {
    insertVariable(variable) {
      this.$emit("emitValue", "var", variable.name);
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
  min-width: 200px;
  padding: 4px;
}

.variable-item {
  border-radius: 4px;
  padding: 0px 16px;
  transition: all 0.3s ease;
  min-height: 40px;
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
}

.variable-name {
  font-size: 12px;
  font-weight: 500;
}

.variable-source {
  font-size: 11px;
  opacity: 0.7;
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
