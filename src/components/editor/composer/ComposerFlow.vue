<template>
  <div class="composer-flow">
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
                :available-outputs="getAvailableOutputs(index)"
                :placeholder="getPlaceholder(element, index)"
                @remove="removeCommand(index)"
                @toggle-output="toggleSaveOutput(index)"
                @update:argv="(val) => handleArgvChange(index, val)"
                @update:use-output="(val) => handleUseOutputChange(index, val)"
                @update:command="(val) => updateCommand(index, val)"
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
      <div v-else class="drop-area"></div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import draggable from "vuedraggable";
import ComposerCard from "./ComposerCard.vue";

export default defineComponent({
  name: "ComposerFlow",
  components: {
    draggable,
    ComposerCard,
  },
  props: {
    modelValue: {
      type: Array,
      required: true,
    },
  },
  emits: ["update:modelValue", "add-command"],
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
      const actionData = JSON.parse(event.dataTransfer.getData("action"));
      const newCommand = {
        ...actionData,
        id: Date.now(), // 或使用其他方式生成唯一ID
        argv: "",
        saveOutput: false,
        useOutput: null,
        cmd: actionData.value || actionData.cmd,
        value: actionData.value || actionData.cmd,
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
    },
    removeCommand(index) {
      const newCommands = [...this.commands];
      newCommands.splice(index, 1);
      this.$emit("update:modelValue", newCommands);
    },
    getAvailableOutputs(currentIndex) {
      return this.commands
        .slice(0, currentIndex)
        .map((cmd, index) => ({
          label: `${cmd.label} 的输出`,
          value: index,
          disable: !cmd.saveOutput,
        }))
        .filter((item) => !item.disable);
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
    handleUseOutputChange(index, value) {
      const newCommands = [...this.commands];
      newCommands[index].useOutput = value;
      if (value !== null) {
        newCommands[index].argv = "";
      }
      this.$emit("update:modelValue", newCommands);
    },
    getPlaceholder(element, index) {
      if (element.useOutput !== null) {
        return `使用 ${this.commands[element.useOutput].label} 的输出`;
      }
      return element.desc;
    },
    updateCommand(index, updatedCommand) {
      console.log("Command updated in flow:", updatedCommand);
      const newCommands = [...this.commands];
      newCommands[index] = {
        ...newCommands[index],
        ...updatedCommand,
      };
      this.$emit("update:modelValue", newCommands);
    },
  },
});
</script>

<style scoped>
.composer-flow {
  border-radius: 8px;
  height: 100%;
}

.command-flow-container {
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.body--dark .command-flow-container {
  background-color: rgba(32, 32, 32, 0.8);
}

.flow-list {
  min-height: 50px;
}

.drop-area {
  flex: 1;
  min-height: 100px;
}

.empty-flow {
  height: 100px;
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

/* 拖拽时的视觉反馈 */
.command-flow-container.drag-over {
  background-color: #f0f4ff;
  border-color: #2196f3;
}

.body--dark .command-flow-container.drag-over {
  background-color: #303132;
  border-color: #676666;
}

/* 滑动淡出�����画 */
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
</style>
