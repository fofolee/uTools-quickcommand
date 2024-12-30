<template>
  <div class="composer-flow">
    <div class="section-header">
      <q-icon name="timeline" size="20px" class="q-mx-sm text-primary" />
      <span class="text-subtitle1">命令流程</span>
      <q-space />
      <ComposerButtons
        :generate-code="generateCode"
        @action="$emit('action', $event)"
      />
    </div>

    <q-scroll-area class="command-scroll">
      <div
        class="command-flow-container"
        @dragover.prevent="onDragOver"
        @drop="onDrop"
        @dragleave.prevent="onDragLeave"
      >
        <draggable
          v-model="commands"
          group="commands"
          item-key="id"
          class="flow-list"
          handle=".drag-handle"
          :animation="200"
          @start="onDragStart"
          @end="onDragEnd"
        >
          <template #item="{ element, index }">
            <transition name="slide-fade" mode="out-in" appear>
              <div
                :key="element.id"
                class="flow-item"
                :class="{
                  'insert-before': dragIndex === index,
                  'insert-after':
                    dragIndex === commands.length &&
                    index === commands.length - 1,
                }"
              >
                <ComposerCard
                  :command="element"
                  :placeholder="getPlaceholder(element, index)"
                  @remove="removeCommand(index)"
                  @toggle-output="toggleSaveOutput(index)"
                  @update:argv="(val) => handleArgvChange(index, val)"
                  @update:command="(val) => updateCommand(index, val)"
                  @run="handleRunCommand"
                />
              </div>
            </transition>
          </template>
        </draggable>
        <div v-if="commands.length === 0" class="empty-flow">
          <div class="text-center text-grey-6">
            <q-icon name="drag_indicator" size="32px" />
            <div class="text-body2 q-mt-sm">从左侧拖拽命令到这里开始编排</div>
          </div>
        </div>
        <div v-else class="drop-area">
          <q-icon name="add" size="32px" />
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script>
import { defineComponent, inject } from "vue";
import draggable from "vuedraggable";
import ComposerCard from "./ComposerCard.vue";
import ComposerButtons from "./ComposerButtons.vue";

export default defineComponent({
  name: "ComposerFlow",
  components: {
    draggable,
    ComposerCard,
    ComposerButtons,
  },
  props: {
    modelValue: {
      type: Array,
      required: true,
    },
    generateCode: {
      type: Function,
      required: true,
    },
  },
  emits: ["update:modelValue", "add-command", "action"],
  computed: {
    commands: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
  setup() {
    const removeVariable = inject("removeVariable");

    return {
      removeVariable,
    };
  },
  data() {
    return {
      dragIndex: -1,
      isDragging: false,
    };
  },
  methods: {
    onDragStart() {
      this.isDragging = true;
    },

    onDragEnd() {
      this.isDragging = false;
      this.dragIndex = -1;
    },

    onDragOver(event) {
      if (!this.isDragging) {
        const rect = event.currentTarget.getBoundingClientRect();
        const items = this.$el.querySelectorAll(".flow-item");
        const mouseY = event.clientY;

        // 找到最近的插入位置
        let closestIndex = -1;
        let minDistance = Infinity;

        items.forEach((item, index) => {
          const itemRect = item.getBoundingClientRect();
          const itemCenter = itemRect.top + itemRect.height / 2;
          const distance = Math.abs(mouseY - itemCenter);

          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        });

        // 如果鼠标在最后一个元素下方，则设置为末尾
        const lastItem = items[items.length - 1];
        if (lastItem && mouseY > lastItem.getBoundingClientRect().bottom) {
          closestIndex = this.commands.length;
        }

        this.dragIndex = closestIndex;
      }
    },

    onDragLeave() {
      if (!this.isDragging) {
        this.dragIndex = -1;
      }
    },

    onDrop(event) {
      try {
        // 尝试获取拖拽数据
        const actionData = event.dataTransfer.getData("action");

        // 如果没有action数据，说明是内部排序，直接返回
        if (!actionData) {
          return;
        }

        // 解析外部拖入的新命令数据
        const parsedAction = JSON.parse(actionData);

        const newCommand = {
          ...parsedAction,
          id: Date.now(),
          argv: "",
          saveOutput: false,
          useOutput: null,
          outputVariable: null,
          cmd: parsedAction.value || parsedAction.cmd,
          value: parsedAction.value || parsedAction.cmd,
        };

        const newCommands = [...this.commands];
        if (this.dragIndex >= 0) {
          newCommands.splice(this.dragIndex, 0, newCommand);
        } else {
          newCommands.push(newCommand);
        }

        this.$emit("update:modelValue", newCommands);
        this.dragIndex = -1;

        document.querySelectorAll(".dragging").forEach((el) => {
          el.classList.remove("dragging");
        });
      } catch (error) {
        // 忽略内部拖动排序的错误
        console.debug("Internal drag & drop reorder", error);
      }
    },
    removeCommand(index) {
      const command = this.commands[index];
      // 如果命令有输出变量，需要先清理
      if (command.outputVariable) {
        this.removeVariable(command.outputVariable);
      }
      const newCommands = [...this.commands];
      newCommands.splice(index, 1);
      this.$emit("update:modelValue", newCommands);
    },
    getPlaceholder(element, index) {
      return element.desc;
    },
    toggleSaveOutput(index) {
      const newCommands = [...this.commands];
      newCommands[index].saveOutput = !newCommands[index].saveOutput;
      if (!newCommands[index].saveOutput) {
        newCommands.forEach((cmd, i) => {
          if (i > index && cmd.useOutput === index) {
            cmd.useOutput = null;
          }
        });
      }
      this.$emit("update:modelValue", newCommands);
    },
    handleArgvChange(index, value) {
      const newCommands = [...this.commands];
      newCommands[index] = {
        ...newCommands[index],
        argv: value,
      };
      this.$emit("update:modelValue", newCommands);
    },
    updateCommand(index, updatedCommand) {
      const newCommands = [...this.commands];
      newCommands[index] = {
        ...newCommands[index],
        ...updatedCommand,
      };
      this.$emit("update:modelValue", newCommands);
    },
    handleRunCommand(command) {
      // 创建一个临时的命令流程
      const tempFlow = [
        command,
        {
          value: "console.log",
          argv: command.outputVariable,
        },
      ];
      // 触发运行事件
      this.$emit("action", "run", tempFlow);
    },
  },
});
</script>

<style scoped>
.composer-flow {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 10px;
}

.section-header {
  flex-shrink: 0;
  padding: 0 8px;
  height: 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.command-scroll {
  flex: 1;
  overflow: hidden;
  border-radius: 10px;
}

.command-flow-container {
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
}

.body--dark .command-flow-container {
  background-color: rgba(32, 32, 32, 0.8);
}

/* .flow-list {
  min-height: 50px;
} */

.drop-area {
  flex: 1;
  min-height: 50px;
  border-radius: 8px;
  margin: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9994;
  border: 2px dashed #9994;
}

.body--dark .drop-area {
  color: #6664;
  border: 2px dashed #6664;
}

.empty-flow {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e0e0e0;
  border-radius: 4px;
  margin: 8px 0;
  transition: all 0.3s ease;
  flex: 1;
}

.body--dark .empty-flow {
  border: 2px dashed #676666;
}

.empty-flow:hover {
  border-color: #bdbdbd;
  background-color: #fafafa;
}

.body--dark .empty-flow:hover {
  border-color: #676666;
  background-color: #303132;
}

/* 滑动淡出动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 拖拽指示器基础样式 */
.flow-item::before,
.flow-item::after {
  content: "";
  position: absolute;
  left: 12px;
  right: 12px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 0, 0, 0.08) 10%,
    rgba(0, 0, 0, 0.15) 50%,
    rgba(0, 0, 0, 0.08) 90%,
    transparent
  );
  opacity: 0;
  transform: scaleX(0.95) translateY(0);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  filter: blur(0.2px);
  z-index: 1;
}

.flow-item::before {
  top: -1px;
}

.flow-item::after {
  bottom: -1px;
}

/* 激活状态 - 插入到元素之前 */
.flow-item.insert-before::before {
  opacity: 1;
  transform: scaleX(1) translateY(0);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.03), 0 0 4px rgba(0, 0, 0, 0.05);
}

/* 激活状态 - 插入到最后 */
.flow-item.insert-after::after {
  opacity: 1;
  transform: scaleX(1) translateY(0);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.03), 0 0 4px rgba(0, 0, 0, 0.05);
}

/* 拖拽时的卡片效果 */
.flow-item {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.flow-item.insert-before {
  transform: translateY(3px);
}

.flow-item.insert-after {
  transform: translateY(-3px);
}

/* 拖拽时相邻元素的间距调整 */
.flow-item.insert-before + .flow-item {
  transform: translateY(3px);
}

/* 暗色模式适配 */
.body--dark .flow-item::before,
.body--dark .flow-item::after {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.08) 10%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.08) 90%,
    transparent
  );
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.03),
    0 0 4px rgba(255, 255, 255, 0.05);
}

.body--dark .section-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}
</style>
