<template>
  <div
    class="logic-flow-card"
    @dragover.stop.prevent
    @drop.stop.prevent="onCardDrop"
  >
    <q-card class="logic-container">
      <q-card-section class="q-pa-sm">
        <!-- 标题栏 -->
        <div class="row items-center q-mb-sm">
          <div class="drag-handle cursor-move q-mr-sm">
            <q-icon name="drag_indicator" size="18px" class="text-grey-6" />
          </div>
          <div class="text-subtitle1">{{ command.label }}</div>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="$emit('remove')"
            size="sm"
          />
        </div>

        <!-- 条件输入 -->
        <q-input
          v-model="condition"
          dense
          outlined
          label="条件表达式"
          class="q-mb-md"
        >
          <template v-slot:prepend>
            <q-icon name="code" size="18px" />
          </template>
        </q-input>

        <!-- 分支流程 -->
        <div class="branch-flows q-gutter-y-md">
          <!-- IF 分支 -->
          <div class="branch-container">
            <div class="branch-header q-mb-sm">IF 分支</div>
            <div
              class="branch-drop-area"
              :class="{ 'is-active': isIfBranchActive }"
              @dragover.stop.prevent="onBranchDragOver('if', $event)"
              @drop.stop.prevent="onBranchDrop('if', $event)"
              @dragleave.prevent="onBranchDragLeave('if')"
            >
              <!-- 拖拽指示器 -->
              <div v-if="isIfBranchActive" class="branch-indicator">
                <q-icon name="add" size="24px" class="text-primary" />
                <div class="text-caption text-primary q-mt-xs">
                  添加到 IF 分支
                </div>
              </div>

              <draggable
                v-model="ifCommands"
                group="commands"
                item-key="id"
                handle=".drag-handle"
                :animation="200"
              >
                <template #item="{ element, index }">
                  <ComposerCard
                    :command="element"
                    :available-outputs="getAvailableOutputs(index, 'if')"
                    :placeholder="getPlaceholder(element, index, 'if')"
                    @remove="removeCommand('if', index)"
                    @toggle-output="toggleSaveOutput('if', index)"
                    @update:argv="(val) => handleArgvChange('if', index, val)"
                    @update:use-output="
                      (val) => handleUseOutputChange('if', index, val)
                    "
                  />
                </template>
              </draggable>
            </div>
          </div>

          <!-- ELSE 分支 -->
          <div class="branch-container">
            <div class="branch-header q-mb-sm">ELSE 分支</div>
            <div
              class="branch-drop-area"
              :class="{ 'is-active': isElseBranchActive }"
              @dragover.stop.prevent="onBranchDragOver('else', $event)"
              @drop.stop.prevent="onBranchDrop('else', $event)"
              @dragleave.prevent="onBranchDragLeave('else')"
            >
              <!-- 拖拽指示器 -->
              <div v-if="isElseBranchActive" class="branch-indicator">
                <q-icon name="add" size="24px" class="text-primary" />
                <div class="text-caption text-primary q-mt-xs">
                  添加到 ELSE 分支
                </div>
              </div>

              <draggable
                v-model="elseCommands"
                group="commands"
                item-key="id"
                handle=".drag-handle"
                :animation="200"
              >
                <template #item="{ element, index }">
                  <ComposerCard
                    :command="element"
                    :available-outputs="getAvailableOutputs(index, 'else')"
                    :placeholder="getPlaceholder(element, index, 'else')"
                    @remove="removeCommand('else', index)"
                    @toggle-output="toggleSaveOutput('else', index)"
                    @update:argv="(val) => handleArgvChange('else', index, val)"
                    @update:use-output="
                      (val) => handleUseOutputChange('else', index, val)
                    "
                  />
                </template>
              </draggable>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import draggable from "vuedraggable";
import ComposerCard from "./ComposerCard.vue";

export default defineComponent({
  name: "LogicFlowCard",
  components: {
    draggable,
    ComposerCard,
  },
  props: {
    command: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: Object,
      default: () => ({
        condition: "",
        if: [],
        else: [],
      }),
    },
  },
  emits: ["update:modelValue", "remove"],
  data() {
    return {
      isIfBranchActive: false,
      isElseBranchActive: false,
    };
  },
  computed: {
    condition: {
      get() {
        return this.modelValue.condition;
      },
      set(value) {
        this.$emit("update:modelValue", {
          ...this.modelValue,
          condition: value,
        });
      },
    },
    ifCommands: {
      get() {
        return this.modelValue.if;
      },
      set(value) {
        this.$emit("update:modelValue", {
          ...this.modelValue,
          if: value,
        });
      },
    },
    elseCommands: {
      get() {
        return this.modelValue.else;
      },
      set(value) {
        this.$emit("update:modelValue", {
          ...this.modelValue,
          else: value,
        });
      },
    },
  },
  methods: {
    // 分支拖拽相关方法
    onBranchDragOver(branch, event) {
      // 检查是否有有效的拖拽数据
      try {
        const types = event.dataTransfer.types;
        if (!types.includes("application/json")) {
          return;
        }
      } catch (e) {
        return;
      }

      event.stopPropagation();
      if (branch === "if") {
        this.isIfBranchActive = true;
      } else {
        this.isElseBranchActive = true;
      }
    },

    onBranchDragLeave(branch) {
      if (branch === "if") {
        this.isIfBranchActive = false;
      } else {
        this.isElseBranchActive = false;
      }
    },

    onBranchDrop(branch, event) {
      event.stopPropagation();

      let actionData;
      try {
        const data = event.dataTransfer.getData("application/json");
        if (!data) {
          console.warn("No valid drag data found");
          return;
        }
        actionData = JSON.parse(data);
      } catch (e) {
        console.error("Failed to parse drag data:", e);
        return;
      }

      // 确保有效的命令数据
      if (!actionData || !actionData.value) {
        console.warn("Invalid command data");
        return;
      }

      const newCommand = {
        ...actionData,
        id: Date.now(),
        argv: "",
        saveOutput: false,
        useOutput: null,
        cmd: actionData.value || actionData.cmd,
        value: actionData.value || actionData.cmd,
      };

      const commands =
        branch === "if" ? [...this.ifCommands] : [...this.elseCommands];
      commands.push(newCommand);

      this.$emit("update:modelValue", {
        ...this.modelValue,
        [branch]: commands,
      });

      // 重置拖拽状态
      if (branch === "if") {
        this.isIfBranchActive = false;
      } else {
        this.isElseBranchActive = false;
      }

      // 清除拖拽样式
      document.querySelectorAll(".dragging").forEach((el) => {
        el.classList.remove("dragging");
      });
    },

    // 卡片拖拽方法 - 用于整个逻辑卡片的拖拽
    onCardDrop(event) {
      // 不处理，让父组件处理卡片级别的拖拽
      return;
    },

    // 命令操作方法
    removeCommand(branch, index) {
      const commands =
        branch === "if" ? [...this.ifCommands] : [...this.elseCommands];
      commands.splice(index, 1);
      this.$emit("update:modelValue", {
        ...this.modelValue,
        [branch]: commands,
      });
    },

    getAvailableOutputs(currentIndex, branch) {
      // 获取当前分支的命令列表
      const commands = branch === "if" ? this.ifCommands : this.elseCommands;

      return commands
        .slice(0, currentIndex)
        .map((cmd, index) => ({
          label: `${cmd.label} 的输出`,
          value: index,
          disable: !cmd.saveOutput,
        }))
        .filter((item) => !item.disable);
    },

    toggleSaveOutput(branch, index) {
      const commands =
        branch === "if" ? [...this.ifCommands] : [...this.elseCommands];
      commands[index].saveOutput = !commands[index].saveOutput;

      // 如果取消保存输出，清除所有使用此输出的命令
      if (!commands[index].saveOutput) {
        commands.forEach((cmd, i) => {
          if (i > index && cmd.useOutput === index) {
            cmd.useOutput = null;
          }
        });
      }

      this.$emit("update:modelValue", {
        ...this.modelValue,
        [branch]: commands,
      });
    },

    handleArgvChange(branch, index, value) {
      const commands =
        branch === "if" ? [...this.ifCommands] : [...this.elseCommands];
      commands[index].argv = value;
      this.$emit("update:modelValue", {
        ...this.modelValue,
        [branch]: commands,
      });
    },

    handleUseOutputChange(branch, index, value) {
      const commands =
        branch === "if" ? [...this.ifCommands] : [...this.elseCommands];
      commands[index].useOutput = value;
      if (value !== null) {
        commands[index].argv = "";
      }
      this.$emit("update:modelValue", {
        ...this.modelValue,
        [branch]: commands,
      });
    },

    getPlaceholder(element, index, branch) {
      if (element.useOutput !== null) {
        const commands = branch === "if" ? this.ifCommands : this.elseCommands;
        return `使用 ${commands[element.useOutput].label} 的输出`;
      }
      return element.desc;
    },
  },
});
</script>

<style scoped>
.logic-flow-card {
  margin-bottom: 8px;
}

.logic-container {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.branch-container {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  padding: 12px;
}

.branch-header {
  font-weight: 500;
  color: var(--q-primary);
  font-size: 14px;
}

.branch-drop-area {
  min-height: 50px;
  border: 1px dashed rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  transition: all 0.3s ease;
  padding: 4px;
  position: relative;
}

.branch-drop-area.is-active {
  border-color: var(--q-primary);
  background: rgba(var(--q-primary-rgb), 0.03);
}

/* 拖拽指示器样式 */
.branch-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: indicator-fade-in 0.3s ease;
}

@keyframes indicator-fade-in {
  from {
    opacity: 0;
    transform: translate(-50%, -40%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.body--dark .logic-container {
  background: rgba(34, 34, 34, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.body--dark .branch-container {
  background: rgba(255, 255, 255, 0.03);
}

.body--dark .branch-drop-area {
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .branch-indicator {
  background: rgba(0, 0, 0, 0.7);
}
</style>
