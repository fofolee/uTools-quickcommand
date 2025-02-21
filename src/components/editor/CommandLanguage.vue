<template>
  <div class="command-language">
    <q-select
      class="q-pl-xs"
      dense
      options-dense
      borderless
      square
      hide-bottom-space
      color="primary"
      transition-show="jump-down"
      transition-hide="jump-up"
      :model-value="currentCommand.program"
      @update:model-value="handleProgramChange"
      :options="Object.keys(programs)"
    >
      <template v-slot:prepend>
        <q-badge
          label="环境"
          color="primary"
          text-color="white"
          class="q-ml-sm"
          style="height: 20px"
        />
      </template>
      <template v-slot:append>
        <q-avatar size="20px" square v-if="isRunCodePage">
          <img :src="programs[currentCommand.program].icon" />
        </q-avatar>
      </template>
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section avatar>
            <img width="32" :src="programs[scope.opt].icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label v-html="scope.opt" />
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <q-space />

    <q-btn-group unelevated class="button-group">
      <template v-if="currentCommand.program === 'quickcommand'">
        <q-btn
          v-for="(item, index) in ['help_center', 'view_timeline']"
          :key="index"
          dense
          flat
          color="primary"
          class="settings-btn"
          :label="['文档', '可视化'][index]"
          :icon="item"
          @click="handleQuickCommandAction(index)"
        >
        </q-btn>
      </template>

      <q-btn-dropdown
        v-model="isSettingsVisible"
        v-else-if="currentCommand.program !== 'html'"
        class="settings-btn"
        dense
        flat
        label="设置"
        color="primary"
        icon="settings"
      >
        <q-list dense>
          <!-- 自定义解释器 -->
          <q-item
            v-for="(item, index) in Object.keys(currentCommand.customOptions)"
            :key="index"
            v-show="currentCommand.program === 'custom'"
          >
            <q-input
              stack-label
              autofocus
              dense
              filled
              class="full-width"
              :label="
                [
                  '解释器路径，如：/opt/python',
                  '运行参数，如：-u',
                  '脚本后缀，不含点，如：py',
                ][index]
              "
              :model-value="currentCommand.customOptions[item]"
              @update:model-value="
                (val) => updateModelValue(`customOptions.${item}`, val)
              "
            >
              <template v-slot:prepend>
                <q-icon name="code" />
              </template>
            </q-input>
          </q-item>
          <!-- 脚本参数 -->
          <q-item v-show="currentCommand.program !== 'quickcommand'">
            <q-input
              dense
              stack-label
              filled
              label="脚本参数"
              class="full-width"
              :model-value="currentCommand.scptarg"
              @update:model-value="updateModelValue('scptarg', $event)"
            >
              <template v-slot:prepend>
                <q-icon name="input" />
              </template>
            </q-input>
          </q-item>
          <!-- 编码设置 -->
          <q-item
            v-for="(item, index) in Object.keys(currentCommand.charset)"
            :key="index"
            v-show="currentCommand.program !== 'quickcommand'"
          >
            <q-select
              dense
              filled
              stack-label
              options-dense
              clearable
              class="full-width"
              :label="['脚本编码', '输出编码'][index]"
              :model-value="currentCommand.charset[item]"
              @update:model-value="
                (val) => updateModelValue(`charset.${item}`, val)
              "
              :options="['GBK', 'utf8', 'Big5']"
              type="text"
            >
              <template v-slot:prepend>
                <q-icon :name="['format_size', 'output'][index]" />
              </template>
            </q-select>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-btn-group>
  </div>
</template>

<script>
import programs from "js/options/programs.js";

export default {
  name: "CommandLanguage",
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue", "action"],
  data() {
    return {
      programs,
      isSettingsVisible: false,
    };
  },
  computed: {
    currentCommand() {
      return this.modelValue;
    },
    isRunCodePage() {
      return this.$route.name === "code";
    },
  },
  methods: {
    handleProgramChange(newProgram) {
      const newCommand = { ...this.currentCommand };
      newCommand.program = newProgram;
      if (newProgram === "custom") {
        this.isSettingsVisible = true;
      }
      if (newProgram === "html") {
        newCommand.output = "html";
      } else if (this.isRunCodePage) {
        newCommand.output = "text";
      }
      const featuresIcon = this.currentCommand.features.icon || "";
      if (featuresIcon.slice(0, 10) !== "data:image") {
        newCommand.features.icon = this.programs[newProgram].icon;
      }
      this.$emit("update:modelValue", newCommand);
    },
    updateModelValue(keyPath, value) {
      const newModelValue = { ...this.modelValue };
      const keys = keyPath.split(".");
      const lastKey = keys.pop();
      const target = keys.reduce((obj, key) => obj[key], newModelValue);
      target[lastKey] = value;
      this.$emit("update:modelValue", newModelValue);
    },
    handleQuickCommandAction(index) {
      const actions = [
        () => this.showHelp(),
        () => this.$emit("action", "show-composer"),
      ];
      actions[index]();
    },
    showHelp() {
      window.showUb.docs();
    },
  },
};
</script>

<style scoped>
.command-language {
  flex: 1;
}

.command-language :deep(.q-field__control),
.command-language :deep(.q-field__control > *),
.command-language :deep(.q-field__native) {
  max-height: 30px;
  min-height: 30px;
}

.command-language {
  display: flex;
  align-items: center;
}
</style>
