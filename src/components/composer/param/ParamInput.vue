<template>
  <div class="param-grid">
    <div
      v-for="(config, index) in configs"
      :key="index"
      :class="{
        'grid-item': config.component !== 'OptionEditor',
        'option-container': config.component === 'OptionEditor',
      }"
      :style="getColumnStyle(config.width)"
    >
      <OptionEditor
        v-if="config.component === 'OptionEditor'"
        v-bind="config"
        :model-value="values[index]"
        @update:model-value="$emit('update', index, $event)"
      />
      <ParamImporter
        v-else
        :config="config"
        :model-value="values[index]"
        @update:model-value="$emit('update', index, $event)"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import ParamImporter from "components/composer/param/ParamImporter.vue";
import OptionEditor from "components/composer/common/OptionEditor.vue";

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
    ParamImporter,
    OptionEditor,
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
      const gapWidth = 8; // 与 CSS 中的 --grid-gap 保持一致
      return {
        width: `calc(${columnWidth}% - ${gapWidth * (1 - width / 12)}px)`,
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
  gap: 8px;
  width: 100%;
  --grid-gap: 8px;
}

.grid-item {
  min-width: 50px;
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
  width: auto;
}

@media (max-width: 600px) {
  .grid-item {
    width: 100% !important;
    flex: 1 1 100% !important;
  }
}

.option-container {
  min-width: 50px;
  width: 100%;
  display: flex;
}

.option-container > * {
  flex: 1;
  min-width: 0;
}
</style>
