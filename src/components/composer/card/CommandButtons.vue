<template>
  <div class="command-buttons q-pl-sm">
    <div class="row items-center no-wrap">
      <!-- 输出变量设置和按钮 -->
      <div
        class="output-section row items-center no-wrap"
        v-if="!isControlFlow"
      >
        <!-- 输出变量按钮 -->
        <q-icon
          name="output"
          v-if="!command.neverHasOutput"
          class="output-btn"
          :color="command.outputVariable ? 'primary' : ''"
          @click="showOutputEditor = true"
        >
          <q-tooltip>
            <div class="text-body2">配置命令输出变量</div>
            <div class="text-caption text-grey-5">
              将命令的输出保存为变量以供后续使用
            </div>
          </q-tooltip>
        </q-icon>
      </div>

      <!-- 操作按钮组 -->
      <div class="action-buttons row items-center no-wrap">
        <q-icon
          v-if="!isControlFlow"
          name="play_arrow"
          class="run-btn"
          @click="$emit('run')"
        >
          <q-tooltip>单独运行此命令并打印输出</q-tooltip>
        </q-icon>

        <!-- 更多操作按钮 -->
        <q-icon
          name="more_vert"
          class="more-btn"
          v-if="!isControlFlow || isFirstCommandInChain"
        >
          <q-menu>
            <q-list dense class="more-menu">
              <q-item dense clickable v-close-popup @click="$emit('copy')">
                <q-item-section avatar>
                  <q-icon size="xs" name="content_copy" />
                </q-item-section>
                <q-item-section>复制命令</q-item-section>
              </q-item>

              <q-item
                dense
                clickable
                v-close-popup
                @click="$emit('toggle-disable')"
              >
                <q-item-section avatar>
                  <q-icon
                    size="xs"
                    :name="command.disabled ? 'check_circle' : 'block'"
                  />
                </q-item-section>
                <q-item-section>{{
                  command.disabled ? "启用命令" : "禁用命令"
                }}</q-item-section>
              </q-item>

              <q-item
                dense
                clickable
                v-close-popup
                @click="$emit('add-print')"
                v-if="!isControlFlow"
              >
                <q-item-section avatar>
                  <q-icon size="xs" name="chat" />
                </q-item-section>
                <q-item-section>打印输出</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-icon>

        <q-icon
          name="close"
          @click="$emit('remove')"
          class="remove-btn"
          v-if="!isLastCommandInChain"
        >
          <q-tooltip>移除此命令</q-tooltip>
        </q-icon>
      </div>
    </div>

    <!-- 输出编辑器 -->
    <OutputEditor
      v-model="showOutputEditor"
      :command="command"
      @confirm="$emit('update:outputVariable', $event)"
    />
  </div>
</template>

<script>
import OutputEditor from "./OutputEditor.vue";

export default {
  name: "CommandButtons",
  components: {
    OutputEditor,
  },
  props: {
    command: {
      type: Object,
      required: true,
    },
    isCollapsed: {
      type: Boolean,
      default: false,
    },
    isControlFlow: {
      type: Boolean,
      default: false,
    },
    isFirstCommandInChain: {
      type: Boolean,
      default: false,
    },
    isLastCommandInChain: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showOutputEditor: false,
    };
  },
  emits: [
    "update:outputVariable",
    "run",
    "remove",
    "toggle-collapse",
    "copy",
    "toggle-disable",
    "add-print",
  ],
};
</script>

<style scoped>
.command-buttons {
  display: flex;
  align-items: center;
  height: 20px;
}

/* 输出部分样式 */
.output-section {
  gap: 8px;
}

/* 按钮样式 */
.output-btn,
.run-btn,
.remove-btn,
.more-btn {
  font-size: 18px;
  min-height: 25px;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.3s ease;
  padding: 0 4px;
}

.output-btn:hover,
.run-btn:hover,
.remove-btn:hover,
.more-btn:hover {
  opacity: 1;
  transform: scale(1.1) translateY(-1px);
  transition: all 0.3s ease;
}

.run-btn:hover {
  color: var(--q-positive);
}

.remove-btn:hover {
  color: var(--q-negative);
}

.output-btn.q-btn--active {
  color: var(--q-primary);
}

/* 暗色模式适配 */
.body--dark .output-btn {
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .output-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.more-menu {
  min-width: 120px;
  font-size: 12px;
  opacity: 0.8;
}

.more-menu :deep(.q-item) {
  min-height: 32px;
}

.more-menu :deep(.q-item__section--avatar) {
  min-width: 24px;
  padding: 0 4px;
}
</style>
