<template>
  <div
    class="composer-card q-pa-xs"
    :class="{ 'can-drop': canDrop }"
    v-bind="$attrs"
  >
    <q-card class="command-item">
      <q-card-section class="q-pa-sm">
        <div class="col">
          <!-- 命令标题和描述 -->
          <div class="row items-center q-mb-sm">
            <!-- 拖拽手柄 -->
            <div class="drag-handle cursor-move q-mr-sm">
              <q-icon name="drag_indicator" size="18px" class="text-grey-6" />
            </div>
            <div class="text-subtitle1">{{ command.label }}</div>
            <q-space />
            <!-- 输出开关 -->
            <q-toggle
              v-if="hasOutput"
              v-model="saveOutputLocal"
              label="保存输出"
              dense
            />
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="$emit('remove')"
              size="sm"
            />
          </div>

          <!-- 参数输入 -->
          <div class="row items-center">
            <!-- 使用上一个命令的输出 -->
            <template v-if="canUseOutput && availableOutputs.length > 0">
              <q-select
                v-model="useOutputLocal"
                :options="availableOutputs"
                dense
                outlined
                class="col"
                emit-value
                map-options
                clearable
                :label="placeholder"
                @clear="handleClearOutput"
              >
                <template v-slot:prepend>
                  <q-icon name="input" />
                </template>
                <template v-slot:selected-item="scope">
                  <div class="row items-center">
                    <q-icon
                      name="output"
                      color="primary"
                      size="xs"
                      class="q-mr-xs"
                    />
                    {{ scope.opt.label }}
                  </div>
                </template>
              </q-select>
            </template>
            <!-- 按键编辑器 -->
            <template v-else-if="command.hasKeyRecorder">
              <KeyEditor v-model="argvLocal" class="col" />
            </template>
            <!-- UBrowser编辑器 -->
            <template v-else-if="command.hasUBrowserEditor">
              <UBrowserEditor
                v-model="argvLocal"
                class="col"
              />
            </template>
            <!-- 普通参数输入 -->
            <template v-else>
              <q-input
                v-model="argvLocal"
                dense
                outlined
                class="col"
                :label="placeholder"
              >
                <template v-slot:prepend>
                  <q-icon name="text_fields" size="18px" />
                </template>
              </q-input>
            </template>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import KeyEditor from "./KeyEditor.vue";
import UBrowserEditor from './ubrowser/UBrowserEditor.vue';

export default defineComponent({
  name: "ComposerCard",
  components: {
    KeyEditor,
    UBrowserEditor
  },
  props: {
    command: {
      type: Object,
      required: true,
    },
    hasOutput: {
      type: Boolean,
      default: false,
    },
    canUseOutput: {
      type: Boolean,
      default: false,
    },
    availableOutputs: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: "",
    },
    canDrop: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showKeyRecorder: false,
    };
  },
  emits: ["remove", "toggle-output", "update:argv", "update:use-output"],
  computed: {
    saveOutputLocal: {
      get() {
        return this.command.saveOutput;
      },
      set(value) {
        this.$emit("toggle-output");
      },
    },
    argvLocal: {
      get() {
        return this.command.argv;
      },
      set(value) {
        this.$emit("update:argv", value);
      },
    },
    useOutputLocal: {
      get() {
        return this.command.useOutput;
      },
      set(value) {
        this.$emit("update:use-output", value);
      },
    },
  },
  methods: {
    handleClearOutput() {
      this.$emit("update:use-output", null);
    },
    handleKeyRecord(keys) {
      this.showKeyRecorder = false;
      // 从keyTap("a","control")格式中提取参数
      const matches = keys.match(/keyTap\((.*)\)/);
      if (matches && matches[1]) {
        this.$emit("update:argv", matches[1]);
      }
    },
  },
  mounted() {
    this.$el.classList.add("composer-card-enter-from");
    requestAnimationFrame(() => {
      this.$el.classList.remove("composer-card-enter-from");
    });
  },
});
</script>

<style scoped>
.composer-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 进入动画 */
.composer-card-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.composer-card-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* 移除动画 */
.composer-card-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
}

.composer-card-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* 拖拽动画 */
/* .composer-card:active { */
  /* transform: scale(1.02); */
  /* transition: transform 0.2s; */
/* } */

.command-item {
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.command-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.composer-card :deep(.q-field__label) {
  font-size: 13px;
}

/* 可放置状态动画 */
.can-drop {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.can-drop .command-item {
  border: 2px dashed var(--q-primary);
  background: rgba(var(--q-primary-rgb), 0.05);
}

/* 暗色模式适配 */
.body--dark .command-item {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.body--dark .command-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.body--dark .can-drop {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.drag-handle {
  display: flex;
  align-items: center;
  padding: 0 4px;
}

.drag-handle:hover {
  color: var(--q-primary);
}
</style>
