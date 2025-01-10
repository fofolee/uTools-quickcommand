<template>
  <div class="param-grid">
    <div
      v-for="(config, index) in configs"
      :key="index"
      class="grid-item"
      :style="getColumnStyle(config.width)"
    >
      <component
        :is="config.component"
        :model-value="values[index]"
        @update:model-value="$emit('update', index, $event)"
        v-bind="config"
        filled
        dense
        :emit-value="config.component === 'q-select'"
        :map-options="config.component === 'q-select'"
      >
        <template v-slot:prepend v-if="shouldShowQIcon(config)">
          <q-icon :name="config.icon" />
        </template>
      </component>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VariableInput from "./VariableInput.vue";
import NumberInput from "./NumberInput.vue";
import ArrayEditor from "./ArrayEditor.vue";
import DictEditor from "./DictEditor.vue";
import ButtonGroup from "./ButtonGroup.vue";
import ControlInput from "./ControlInput.vue";
import CheckGroup from "./CheckGroup.vue";
import OptionEditor from "./OptionEditor.vue";
import CheckButton from "./CheckButton.vue";

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
    ButtonGroup,
    ControlInput,
    CheckGroup,
    OptionEditor,
    CheckButton,
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
    shouldShowQIcon(config) {
      return ["q-input", "q-select"].includes(config.component) && config.icon;
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
  justify-content: center;
  align-items: center;
}

.grid-item > * {
  flex: 1;
  min-width: 0;
}

/* 让开关、复选框和按钮组居中显示 */
.grid-item > .q-toggle,
.grid-item > .q-checkbox,
.grid-item > .q-btn-group {
  flex: 0 1 auto;
}

@media (max-width: 600px) {
  .grid-item {
    width: 100% !important;
    flex: 1 1 100% !important;
  }
}
</style>
