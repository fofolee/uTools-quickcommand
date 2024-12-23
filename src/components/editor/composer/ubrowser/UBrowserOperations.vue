<template>
  <div class="row q-col-gutter-sm">
    <div class="col-12">
      <!-- 操作选择网格 -->
      <div class="row q-col-gutter-xs">
        <div
          v-for="[actionName, { label }] in Object.entries(
            ubrowserOperationConfigs
          )"
          :key="actionName"
          class="col-2"
        >
          <q-card
            flat
            bordered
            class="action-card cursor-pointer"
            :class="{
              'action-selected': selectedActions.some(
                (a) => a.value === actionName
              ),
            }"
            @click="toggleAction({ value: actionName, label: label })"
          >
            <div class="q-pa-xs text-caption text-wrap text-center">
              {{ label }}
            </div>
          </q-card>
        </div>
      </div>

      <!-- 已选操作列表 -->
      <q-list separator class="operation-list q-mt-md">
        <div
          v-for="(action, index) in selectedActions"
          :key="action.id"
          class="operation-item"
        >
          <div class="row items-center justify-between">
            <q-chip
              square
              removable
              @remove="$emit('remove-action', action)"
              class="text-caption q-mx-none q-mb-sm"
            >
              <q-avatar color="primary">
                <q-icon
                  color="white"
                  :name="
                    ubrowserOperationConfigs[action.value].icon || 'touch_app'
                  "
                  size="14px"
                />
              </q-avatar>
              <div class="q-mx-sm">{{ action.label }}</div>
            </q-chip>
            <div class="row items-start q-gutter-xs">
              <q-btn
                round
                dense
                color="primary"
                icon="north"
                v-show="index !== 0"
                @click="moveAction(index, -1)"
                size="xs"
                class="q-mb-xs move-btn"
              />
              <q-btn
                round
                dense
                color="primary"
                icon="south"
                v-show="index !== selectedActions.length - 1"
                @click="moveAction(index, 1)"
                size="xs"
                class="move-btn"
              />
            </div>
          </div>
          <div v-if="ubrowserOperationConfigs[action.value].config">
            <UBrowserOperation
              :configs="configs"
              :action="action.value"
              :fields="ubrowserOperationConfigs[action.value].config"
              @update:configs="$emit('update:configs', $event)"
            />
          </div>
        </div>
      </q-list>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { ubrowserOperationConfigs } from "js/composer/composerConfig";
import UBrowserOperation from "./operations/UBrowserOperation.vue";

export default defineComponent({
  name: "UBrowserOperations",
  components: {
    UBrowserOperation,
  },
  props: {
    configs: {
      type: Object,
      required: true,
    },
    selectedActions: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      ubrowserOperationConfigs: ubrowserOperationConfigs,
    };
  },
  emits: ["remove-action", "update:selectedActions", "update:configs"],
  methods: {
    moveAction(index, direction) {
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < this.selectedActions.length) {
        const actions = [...this.selectedActions];
        const temp = actions[index];
        actions[index] = actions[newIndex];
        actions[newIndex] = temp;
        this.$emit("update:selectedActions", actions);
      }
    },
    toggleAction(action) {
      const index = this.selectedActions.findIndex(
        (a) => a.value === action.value
      );
      if (index === -1) {
        // 添加操作
        this.$emit("update:selectedActions", [
          ...this.selectedActions,
          {
            ...action,
            id: Date.now(),
            argv: "",
            saveOutput: false,
            useOutput: null,
            cmd: action.value || action.cmd,
            value: action.value || action.cmd,
          },
        ]);

        // 初始化配置对象
        const { config } = this.ubrowserOperationConfigs[action.value];
        if (config) {
          const newConfigs = { ...this.configs };
          if (!newConfigs[action.value]) {
            newConfigs[action.value] = {};
          }
          // 设置默认值
          config.forEach((field) => {
            if (field.defaultValue !== undefined) {
              newConfigs[action.value][field.key] = field.defaultValue;
            }
          });
          this.$emit("update:configs", newConfigs);
        }
      } else {
        // 移除操作
        const newActions = [...this.selectedActions];
        newActions.splice(index, 1);
        this.$emit("update:selectedActions", newActions);
      }
    },
  },
});
</script>

<style scoped>
.operation-list {
  min-height: 50px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.operation-list :deep(.q-field) div,
.operation-list :deep(div.q-checkbox__label) {
  font-size: 12px !important;
}

.operation-item {
  transition: all 0.3s;
  border-radius: 4px;
  margin: 0;
  padding: 2px 4px;
  border-color: rgba(0, 0, 0, 0.15);
}

.operation-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.body--dark .operation-item:hover {
  background: rgba(0, 0, 0, 0.25);
}

.move-btn {
  opacity: 0.6;
  transition: opacity 0.3s;
}

.operation-item:hover .move-btn {
  opacity: 1;
}

.delete-btn {
  opacity: 0.6;
  transition: opacity 0.3s;
}

.operation-item:hover .delete-btn {
  opacity: 1;
}

.text-subtitle2 {
  font-size: 0.9rem;
  font-weight: 500;
}

.q-item-section {
  transition: all 0.3s;
}

.operation-item:hover .q-item-section {
  opacity: 1;
}

.action-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  /* min-height: 42px; */
}

.action-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  background: var(--q-primary-opacity-5);
}

.action-selected {
  border-color: var(--q-primary);
  background: var(--q-primary-opacity-10);
}

.body--dark .action-selected {
  background: var(--q-primary-opacity-40);
}

.body--dark .action-card {
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .action-card:hover {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  background: var(--q-primary-opacity-20);
}

.text-caption {
  font-size: 11px;
  line-height: 1.1;
}

.q-card__section {
  padding: 4px !important;
}

.row.q-col-gutter-xs {
  margin: -2px;
}

.row.q-col-gutter-xs > * {
  padding: 2px;
}
</style>
