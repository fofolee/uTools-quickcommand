<template>
  <div class="ubrowser-operations">
    <div class="row q-col-gutter-sm">
      <div class="col-12">
        <!-- 操作选择网格 -->
        <div class="row q-col-gutter-xs">
          <div
            v-for="[actionKey, action] in Object.entries(operationsMap)"
            :key="actionKey"
            class="col-2"
          >
            <q-card
              flat
              bordered
              class="action-card cursor-pointer"
              :class="{
                'action-selected': actionCount[actionKey] > 0,
              }"
              @click="addAction(actionKey)"
            >
              <div class="q-pa-xs text-caption text-wrap text-center">
                {{ action.label }}
                <q-badge v-if="actionCount[actionKey]" color="primary" floating>
                  {{ actionCount[actionKey] }}
                </q-badge>
              </div>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- 已选操作列表 -->
    <q-list separator class="operation-list q-mt-md">
      <div
        v-for="(selectedActionKey, index) in selectedActionKeys"
        :key="selectedActionKey"
        class="operation-item"
      >
        <div class="row items-center justify-between">
          <q-chip
            square
            removable
            @remove="removeAction(index)"
            class="text-caption q-mb-sm"
            :style="{
              paddingLeft: '7px',
            }"
          >
            <q-avatar color="primary">
              <q-icon
                color="white"
                :name="operationsMap[selectedActionKey].icon || 'touch_app'"
                size="14px"
              />
            </q-avatar>
            <div class="q-mx-sm">
              {{ operationsMap[selectedActionKey].label }}
            </div>
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
              v-show="index !== selectedActionKeys.length - 1"
              @click="moveAction(index, 1)"
              size="xs"
              class="move-btn"
            />
          </div>
        </div>
        <div
          v-if="operationsMap[selectedActionKey].config"
          class="operation-config"
        >
          <ParamInput
            :configs="operationsMap[selectedActionKey].config"
            :values="selectedActionArgs[index]"
            @update="
              (argvIndex, argvVal) =>
                updateActionArgs(argvIndex, argvVal, index)
            "
          />
        </div>
      </div>
    </q-list>
  </div>
</template>

<script>
import { ubrowserOperationConfigs } from "js/composer/ubrowserConfig";
import ParamInput from "components/composer/param/ParamInput.vue";

export default {
  name: "UBrowserOperations",
  components: {
    ParamInput,
  },
  props: {
    modelValue: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  emits: ["update:model-value"],
  data() {
    return {
      operationsMap: ubrowserOperationConfigs,
    };
  },
  computed: {
    selectedActionKeys() {
      return this.modelValue.map((x) => x.key || x.value);
    },
    selectedActionArgs() {
      return this.modelValue.map((x) => x.args);
    },
    actionCount() {
      const count = {};
      this.selectedActionKeys.forEach((key) => {
        count[key] = (count[key] || 0) + 1;
      });
      return count;
    },
  },
  methods: {
    moveAction(index, direction) {
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < this.selectedActionKeys.length) {
        const newOperation = [...this.modelValue];
        [newOperation[index], newOperation[newIndex]] = [
          newOperation[newIndex],
          newOperation[index],
        ];
        this.$emit("update:model-value", newOperation);
      }
    },
    addAction(actionKey) {
      let newOperation = [...this.modelValue];
      // 添加操作
      const { config, value } = this.operationsMap[actionKey];
      const args = config?.length
        ? config.map((field) => field.defaultValue)
        : [];

      const newOperationItem = { value, args };
      if (actionKey !== value) {
        newOperationItem.key = actionKey;
      }

      newOperation.push(newOperationItem);
      this.$emit("update:model-value", newOperation);
    },
    removeAction(index) {
      let newOperation = [...this.modelValue];
      newOperation.splice(index, 1);
      this.$emit("update:model-value", newOperation);
    },
    updateActionArgs(argvIndex, argvVal, actionIndex) {
      const newOperation = [...this.modelValue];
      const newArgs = [...newOperation[actionIndex].args];
      newArgs[argvIndex] = argvVal;
      newOperation[actionIndex].args = newArgs;
      this.$emit("update:model-value", newOperation);
    },
  },
};
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

.operation-config {
  width: 100%;
}

.move-btn {
  opacity: 0.6;
  transition: opacity 0.3s;
}

.operation-item:hover .move-btn {
  opacity: 1;
}

.action-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
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

.q-badge {
  font-size: 10px;
  padding: 2px 4px;
  right: -4px;
  top: -4px;
}
</style>
