<template>
  <div class="row" v-show="!!height">
    <div class="col">
      <div>
        <q-select
          dense
          standout="bg-primary text-white"
          square
          hide-bottom-space
          color="primary"
          transition-show="jump-down"
          transition-hide="jump-up"
          @update:model-value="updateProgram"
          :model-value="modelValue.program"
          :options="programLanguages"
          label="环境"
        >
          <template v-slot:append>
            <q-avatar size="lg" square>
              <img :src="$root.programs[modelValue.program].icon" />
            </q-avatar>
          </template>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <img width="32" :src="$root.programs[scope.opt].icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label v-html="scope.opt" />
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>
    <q-separator vertical />
    <div class="col-auto justify-end flex">
      <q-btn-group unelevated class="button-group">
        <template v-if="modelValue.program === 'quickcommand'">
          <q-btn
            v-for="(item, index) in [
              'keyboard',
              'rocket_launch',
              'help_center',
              'view_timeline',
            ]"
            :key="index"
            dense
            flat
            color="primary"
            class="settings-btn"
            :icon="item"
            @click="handleQuickCommandAction(index)"
          >
            <q-tooltip>
              {{ ["录制按键", "快捷动作", "查看文档", "可视化编排"][index] }}
            </q-tooltip>
          </q-btn>
        </template>

        <q-btn-dropdown
          v-else-if="modelValue.program !== 'html'"
          class="settings-btn"
          dense
          flat
          ref="settings"
          color="primary"
          icon="settings"
        >
          <q-list>
            <!-- 自定义解释器 -->
            <q-item
              v-for="(item, index) in Object.keys(modelValue.customOptions)"
              :key="index"
              v-show="modelValue.program === 'custom'"
            >
              <q-input
                stack-label
                autofocus
                dense
                outlined
                class="full-width"
                @blur="matchLanguage"
                :label="
                  [
                    '解释器路径，如：/opt/python',
                    '运行参数，如：-u',
                    '脚本后缀，不含点，如：py',
                  ][index]
                "
                :model-value="modelValue.customOptions[item]"
                @update:model-value="(val) => updateCustomOption(item, val)"
              >
                <template v-slot:prepend>
                  <q-icon name="code" />
                </template>
              </q-input>
            </q-item>
            <!-- 脚本参数 -->
            <q-item v-show="modelValue.program !== 'quickcommand'">
              <q-input
                dense
                stack-label
                outlined
                label="脚本参数"
                class="full-width"
                :model-value="modelValue.scptarg"
                @update:model-value="updateScptarg"
              >
                <template v-slot:prepend>
                  <q-icon name="input" />
                </template>
              </q-input>
            </q-item>
            <!-- 编码设置 -->
            <q-item
              v-for="(item, index) in Object.keys(modelValue.charset)"
              :key="index"
              v-show="modelValue.program !== 'quickcommand'"
            >
              <q-select
                dense
                outlined
                stack-label
                clearable
                class="full-width"
                :label="['脚本编码', '输出编码'][index]"
                :model-value="modelValue.charset[item]"
                @update:model-value="(val) => updateCharset(item, val)"
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
          class="action-btn run-btn"
          dense
          flat
          color="primary"
          icon="play_arrow"
          label="运行"
          @click="$emit('run')"
        ></q-btn>
        <q-btn
          class="action-btn save-btn"
          flat
          dense
          v-if="!isRunCodePage"
          :disable="!canCommandSave"
          :color="canCommandSave ? 'primary' : 'grey'"
          icon="save"
          label="保存"
          @click="$emit('save')"
        ></q-btn>
      </q-btn-group>
    </div>

    <!-- 移动对话框到这里 -->
    <q-dialog v-model="showActions">
      <QuickAction @addAction="addAction" />
    </q-dialog>
    <q-dialog v-model="showRecorder" position="bottom">
      <KeyRecorder @sendKeys="addAction" />
    </q-dialog>
    <q-dialog v-model="showComposer" maximized>
      <q-card class="full-height">
        <q-card-section class="q-pa-md full-height">
          <CommandComposer
            ref="composer"
            @run="handleComposerRun"
            @apply="handleComposerApply"
            @update:model-value="showComposer = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import QuickAction from "components/popup/QuickAction";
import KeyRecorder from "components/popup/KeyRecorder";
import CommandComposer from "components/editor/composer/CommandComposer.vue";

export default {
  name: "CommandLanguageBar",
  components: {
    QuickAction,
    KeyRecorder,
    CommandComposer,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    height: {
      type: Number,
      default: 40,
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
  data() {
    return {
      showActions: false,
      showRecorder: false,
      showComposer: false,
    };
  },
  emits: [
    "update:modelValue",
    "program-changed",
    "run",
    "save",
    "show-recorder",
    "show-actions",
    "show-help",
    "add-action",
  ],
  computed: {
    programLanguages() {
      return Object.keys(this.$root.programs);
    },
  },
  methods: {
    updateProgram(value) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        program: value,
      });
      this.programChanged(value);
    },
    updateCustomOption(key, value) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        customOptions: {
          ...this.modelValue.customOptions,
          [key]: value,
        },
      });
    },
    updateScptarg(value) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        scptarg: value,
      });
    },
    updateCharset(key, value) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        charset: {
          ...this.modelValue.charset,
          [key]: value,
        },
      });
    },
    programChanged(value) {
      this.$emit("program-changed", value);
      if (value === "custom") {
        this.$refs.settings.show();
      }
    },
    matchLanguage() {
      if (!this.modelValue.customOptions.ext) return;
      let language = Object.values(this.$root.programs).filter(
        (program) => program.ext === this.modelValue.customOptions.ext
      );
      if (language.length) {
        this.$emit("program-changed", language[0].name);
      }
    },
    handleQuickCommandAction(index) {
      const actions = [
        () => (this.showRecorder = true),
        () => (this.showActions = true),
        () => this.showHelp(),
        () => (this.showComposer = true),
      ];
      actions[index]();
    },
    addAction(text) {
      this.$emit("add-action", text);
    },
    showHelp() {
      window.showUb.docs();
    },
    handleComposerRun(code) {
      this.$emit('add-action', code);
    },
    handleComposerApply(code) {
      this.$emit('add-action', code);
      this.showComposer = false;
    },
    applyComposerCommands() {
      if (this.$refs.composer) {
        const code = this.$refs.composer.generateCode();
        this.$emit('add-action', code);
      }
      this.showComposer = false;
    }
  },
};
</script>

<style scoped>
.button-group {
  .action-btn {
    padding: 0 10px;
  }
}

/* 运行按钮动画 */
.run-btn:hover :deep(.q-icon) {
  display: inline-block;
  animation: slideRight 1.5s infinite;
}

/* 保存按钮动画 */
.save-btn:not([disabled]):hover :deep(.q-icon) {
  display: inline-block;
  animation: saveAnimation 1.2s infinite;
}

/* 设置按钮动画 */
.settings-btn :deep(.q-icon:first-child) {
  display: inline-block;
  transform: scale(1);
  transition: transform 0.5s ease;
}

.settings-btn:hover :deep(.q-icon:first-child) {
  transform: scale(1.05);
}

@keyframes slideRight {
  0% {
    transform: translateX(-2px);
    opacity: 0.7;
  }
  50% {
    transform: translateX(2px);
    opacity: 1;
  }
  100% {
    transform: translateX(-2px);
    opacity: 0.7;
  }
}

@keyframes saveAnimation {
  0% {
    transform: translateY(-1px);
    opacity: 1;
  }
  50% {
    transform: translateY(1px);
    opacity: 0.6;
  }
  75% {
    transform: translateY(0.5px);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-1px);
    opacity: 1;
  }
}

.settings-btn:hover :deep(.q-icon) {
  display: inline-block;
}
</style>
