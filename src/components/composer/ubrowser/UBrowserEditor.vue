<template>
  <div class="ubrowser-editor">
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="left"
      narrow-indicator
      no-caps
      inline-label
      outside-arrows
      mobile-arrows
    >
      <q-tab name="1" label="基础配置" icon="link" class="q-px-sm" />
      <q-tab name="2" label="操作配置" icon="touch_app" class="q-px-sm" />
      <q-tab name="3" label="运行配置" icon="settings" class="q-px-sm" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" class="ubrowser-panels" animated>
      <q-tab-panel name="1" class="panel-content">
        <UBrowserBasic
          v-model="argvs.goto"
          @update:model-value="updateArgvs('goto', $event)"
        />
      </q-tab-panel>

      <q-tab-panel name="2" class="panel-content">
        <UBrowserOperations
          v-model="argvs.operations"
          @update:model-value="updateArgvs('operations', $event)"
        />
      </q-tab-panel>

      <q-tab-panel name="3" class="panel-content">
        <UBrowserRun
          v-model="argvs.run"
          @update:model-value="updateArgvs('run', $event)"
        />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import UBrowserBasic from "components/composer/ubrowser/UBrowserBasic.vue";
import UBrowserOperations from "components/composer/ubrowser/UBrowserOperations.vue";
import UBrowserRun from "components/composer/ubrowser/UBrowserRun.vue";
import { generateUBrowserCode } from "js/composer/generateUBrowserCode";
import { stringifyArgv } from "src/js/composer/formatString";

export default {
  name: "UBrowserEditor",
  components: {
    UBrowserBasic,
    UBrowserOperations,
    UBrowserRun,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:model-value"],
  data() {
    return {
      tab: "1",
      defaultArgvs: {
        goto: [],
        operations: [],
        run: {},
      },
    };
  },
  computed: {
    configs() {
      return this.modelValue;
    },
    argvs() {
      return this.modelValue.argvs || this.defaultArgvs;
    },
    summary() {
      const goto = stringifyArgv(this.argvs.goto?.url || "");
      return `访问 ${goto}`;
    },
  },
  mounted() {
    this.initializeConfigs();
  },
  methods: {
    initializeConfigs() {
      if (!this.modelValue.argvs) {
        this.updateModelValue(this.defaultArgvs);
      }
    },
    generateCode() {
      return generateUBrowserCode(this.argvs);
    },
    updateArgvs(key, value) {
      const newArgvs = { ...this.argvs };
      newArgvs[key] = value;
      this.updateModelValue(newArgvs);
    },
    updateModelValue(argvs) {
      this.$emit("update:model-value", {
        ...this.modelValue,
        argvs,
        summary: this.summary,
        code: this.generateCode(),
      });
    },
  },
};
</script>

<style scoped>
.ubrowser-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.ubrowser-panels {
  flex: 1;
  overflow: hidden;
  background-color: transparent;
  display: flex;
  flex-direction: column;
}

.ubrowser-panels :deep(.q-tab-panel) {
  padding: 0;
  flex: 1;
  overflow: auto;
}

.ubrowser-editor :deep(.panel-content) {
  padding: 8px 0 0 0;
  height: 100%;
  overflow: auto;
}

.ubrowser-editor :deep(.q-tabs) {
  min-height: 36px;
  padding: 0 8px;
}

.ubrowser-editor :deep(.q-tab--active) {
  opacity: 1;
}

.ubrowser-editor :deep(.q-tab__icon) {
  font-size: 16px;
  margin-right: 4px;
}

.ubrowser-editor :deep(.q-tab__indicator) {
  height: 2px;
}

.ubrowser-editor :deep(.q-tab__label) {
  font-size: 13px;
}
</style>
