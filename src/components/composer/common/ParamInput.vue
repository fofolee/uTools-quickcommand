<template>
  <div class="param-grid">
    <div
      v-for="(config, index) in configs"
      :key="index"
      class="grid-item"
      :style="getColumnStyle(config.width)"
    >
      <VariableInput
        v-if="config.type === 'varInput'"
        :model-value="values[index]"
        @update:model-value="$emit('update', index, $event)"
        :label="config.label"
        :icon="config.icon"
        :options="config.options"
      />
      <NumberInput
        v-else-if="config.type === 'numInput'"
        :model-value="values[index]"
        @update:model-value="$emit('update', index, $event)"
        :label="config.label"
        :icon="config.icon"
      />
      <ArrayEditor
        v-else-if="config.type === 'arrayEditor'"
        :model-value="values[index]"
        @update:model-value="$emit('update', index, $event)"
        :options="config.options"
      />
      <DictEditor
        v-else-if="config.type === 'dictEditor'"
        :model-value="values[index]"
        @update:model-value="$emit('update', index, $event)"
        :options="config.options"
      />
      <q-toggle
        v-else-if="config.type === 'switch'"
        :model-value="values[index]"
        @update:model-value="$emit('update', index, $event)"
        :label="config.label"
        :icon="config.icon"
      />
      <q-select
        v-else-if="config.type === 'select'"
        filled
        emit-value
        map-options
        :model-value="values[index]"
        @update:model-value="$emit('update', index, $event)"
        :options="config.options"
      >
        <template v-slot:prepend>
          <q-icon :name="config.icon || 'code'" />
        </template>
      </q-select>
      <q-input
        v-else-if="config.type === 'input'"
        filled
        :model-value="values[index]"
        @update:model-value="$emit('update', index, $event)"
        :label="config.label"
        :icon="config.icon"
      >
        <template v-slot:prepend>
          <q-icon :name="config.icon || 'code'" />
        </template>
      </q-input>
      <q-checkbox
        v-else-if="config.type === 'checkbox'"
        :model-value="values[index]"
        @update:model-value="$emit('update', index, $event)"
        :label="config.label"
        :icon="config.icon"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "./VariableInput.vue";
import NumberInput from "./NumberInput.vue";
import ArrayEditor from "./ArrayEditor.vue";
import DictEditor from "./DictEditor.vue";

/**
 * 参数输入组件
 * @description 统一处理各种类型的参数输入
 *
 * @property {Object} config - 参数配置对象
 * @property {String} config.type - 输入类型
 * @property {String} [config.label] - 标签文本
 * @property {String} [config.icon] - 图标
 * @property {Object} [config.options] - 配置选项
 * @property {any} value - 输入值
 */
export default defineComponent({
  name: "ParamInput",
  components: {
    VariableInput,
    NumberInput,
    ArrayEditor,
    DictEditor,
  },
  props: {
    configs: {
      type: Array,
      required: true,
    },
    values: {
      type: Array,
      required: true,
    },
  },
  emits: ["update"],
  methods: {
    getColumnStyle(width = 12) {
      if (width === "auto") {
        return {
          flex: "1 1 0%",
          minWidth: "0",
        };
      }
      const columnWidth = (width / 12) * 100;
      return {
        width: `calc(${columnWidth}% - var(--grid-gap))`,
        flex: "0 0 auto",
      };
    },
  },
});
</script>

<style scoped>
.param-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--grid-gap);
  width: 100%;
  --grid-gap: 8px;
}

.grid-item {
  min-width: 50px;
  margin-bottom: 0;
  display: flex;
}

.grid-item > * {
  flex: 1;
  min-width: 0;
}

@media (max-width: 600px) {
  .grid-item {
    width: 100% !important;
    flex: 1 1 100% !important;
  }
}
</style>
