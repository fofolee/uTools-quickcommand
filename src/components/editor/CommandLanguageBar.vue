<template>
  <div class="command-language-bar">
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
    <q-btn-group unelevated class="button-group">
      <q-btn-dropdown
        class="special-var-btn"
        dense
        flat
        label="变量"
        color="primary"
        icon="data_object"
      >
        <q-list>
          <q-item
            v-for="(item, index) in Object.values(specialVars)"
            :key="index"
            clickable
            v-close-popup
            @click="handleSpecialVarClick(item)"
          >
            <q-item-section>
              <q-item-label class="row items-center justify-between">
                <div v-text="item.label" />
                <div v-if="item.onlyCmdTypes" class="row">
                  <q-badge color="grey-9" class="q-ml-xs"> 仅 </q-badge>
                  <q-badge
                    v-for="type in item.onlyCmdTypes"
                    :key="type"
                    class="q-ml-xs"
                    v-text="commandTypes[type].label"
                    color="grey-9"
                  />
                </div>
              </q-item-label>
              <q-tooltip v-if="item.tooltip">
                {{ item.tooltip }}
              </q-tooltip>
              <q-item-label caption>{{ item.desc }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

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
        <q-list>
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
              outlined
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
              outlined
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
              outlined
              stack-label
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
      <q-separator vertical inset />
      <q-btn
        v-if="!isRunCodePage"
        class="action-btn run-btn"
        dense
        flat
        color="primary"
        icon="arrow_back"
        label="退出"
        @click="$emit('action', 'back')"
      ></q-btn>
      <q-btn
        class="action-btn run-btn"
        dense
        flat
        color="primary"
        icon="play_arrow"
        label="运行"
        @click="$emit('action', 'run')"
      ></q-btn>
      <q-btn
        v-if="!isRunCodePage"
        :disable="!canCommandSave"
        :color="canCommandSave ? 'primary' : 'grey'"
        class="action-btn save-btn"
        flat
        dense
        icon="save"
        label="保存"
        @click="$emit('action', 'save')"
      ></q-btn>
    </q-btn-group>
    <q-dialog v-model="showUserData">
      <UserData
        @insertText="
          insertSpecialVar($event);
          showUserData = false;
        "
        :showInsertBtn="true"
      />
    </q-dialog>
  </div>
</template>

<script>
import programs from "js/options/programs.js";
import specialVars from "js/options/specialVars.js";
import commandTypes from "js/options/commandTypes.js";
import UserData from "components/popup/UserData.vue";

export default {
  name: "CommandLanguageBar",
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    canCommandSave: {
      type: Boolean,
      default: true,
    },
    isRunCodePage: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "action"],
  components: {
    UserData,
  },
  data() {
    return {
      programs,
      specialVars,
      commandTypes,
      isSettingsVisible: false,
      showUserData: false,
    };
  },
  computed: {
    currentCommand() {
      return this.modelValue;
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
    handleSpecialVarClick(item) {
      if (item.label === "{{usr:}}") this.showUserData = true;
      else this.insertSpecialVar(item.label);
    },
    insertSpecialVar(text) {
      if (!text) return;
      this.$emit("action", "insert-text", `"${text}"`);
    },
  },
};
</script>

<style scoped>
.button-group {
  padding: 0 5px;
}

.button-group :deep(.q-focus-helper) {
  display: none;
}

.button-group :deep(.q-btn__content) {
  font-size: 12px;
}

.button-group :deep(.q-btn-dropdown__arrow) {
  margin-left: 0;
}

.button-group .q-btn:hover {
  filter: brightness(1.2);
  transition: all 0.2s ease;
}

/* 运行按钮动画 */
.run-btn:hover :deep(.q-icon) {
  display: inline-block;
  animation: leftRight 1.5s infinite;
}

/* 保存按钮动画 */
.save-btn:not([disabled]):hover :deep(.q-icon) {
  display: inline-block;
  animation: upDown 1.2s infinite;
}

.command-language-bar {
  background-color: #fffffe;
  height: 30px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.body--dark .command-language-bar {
  background-color: #1e1e1e;
}

.command-language-bar :deep(.q-field__control),
.command-language-bar :deep(.q-field__control > *),
.command-language-bar :deep(.q-field__native) {
  max-height: 30px;
  min-height: 30px;
}
</style>
