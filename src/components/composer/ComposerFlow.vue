<template>
  <div class="composer-flow">
    <ChainStyles ref="chainStyles" :commands="commands" />
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
          :list="commands"
          group="commands"
          item-key="id"
          class="flow-list"
          handle=".drag-handle"
          :animation="200"
          @start="onDragStart"
          @end="onDragEnd"
          @change="onDragChange"
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
                  ...getChainGroupClass(index),
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
                  @add-branch="(chainInfo) => addBranch(index, chainInfo)"
                />
              </div>
            </transition>
          </template>
        </draggable>
        <EmptyFlow v-if="commands.length === 0" />
        <DropArea v-else />
      </div>
    </q-scroll-area>
  </div>
</template>

<script>
import { defineComponent, inject } from "vue";
import draggable from "vuedraggable";
import ComposerCard from "./ComposerCard.vue";
import ComposerButtons from "./ComposerButtons.vue";
import ChainStyles from "./flow/ChainStyles.vue";
import EmptyFlow from "./flow/EmptyFlow.vue";
import DropArea from "./flow/DropArea.vue";

export default defineComponent({
  name: "ComposerFlow",
  components: {
    draggable,
    ComposerCard,
    ComposerButtons,
    ChainStyles,
    EmptyFlow,
    DropArea,
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
  setup() {
    const removeVariable = inject("removeVariable");
    return { removeVariable };
  },
  data() {
    return {
      dragIndex: -1,
      isDragging: false,
      draggedCommand: null,
    };
  },
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
  methods: {
    getChainGroupClass(index) {
      return this.$refs.chainStyles?.getChainGroupClass(index) || {};
    },
    getPlaceholder(element, index) {
      return element.desc;
    },
    onDragStart(event) {
      this.isDragging = true;
      this.draggedCommand = this.commands[event.oldIndex];
    },
    onDragEnd() {
      this.isDragging = false;
      this.dragIndex = -1;
      this.draggedCommand = null;
    },
    onDragChange(event) {
      let newCommands = [...this.commands];

      if (event.moved || event.added) {
        // 检查所有链式命令的顺序
        const isValidOrder = this.checkAllChainOrders(newCommands);

        if (!isValidOrder) {
          // 如果顺序无效，恢复原始状态
          if (event.moved) {
            const { oldIndex, newIndex } = event.moved;
            const [item] = newCommands.splice(newIndex, 1);
            newCommands.splice(oldIndex, 0, item);
          } else if (event.added) {
            const { newIndex } = event.added;
            newCommands.splice(newIndex, 1);
          }
        }
      }

      this.$emit("update:modelValue", newCommands);
    },
    onDragOver(event) {
      if (!this.isDragging) {
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
    checkAllChainOrders(commands) {
      // 获取所有不同的 chainId
      const chainIds = new Set(
        commands.filter((cmd) => cmd.chainId).map((cmd) => cmd.chainId)
      );

      // 检查每个链的命令顺序
      for (const chainId of chainIds) {
        // 获取当前链的所有命令的索引
        const indices = commands
          .map((cmd, index) => ({ cmd, index }))
          .filter((item) => item.cmd.chainId === chainId)
          .map((item) => item.index);

        // 获取 if、else、end 的位置
        const ifIndex = indices.find(
          (index) => commands[index].commandType === "if"
        );
        const endIndex = indices.find(
          (index) => commands[index].commandType === "end"
        );
        const elseIndices = indices.filter(
          (index) =>
            commands[index].commandType !== "if" &&
            commands[index].commandType !== "end"
        );

        // 验证顺序
        // 1. 必须有 if 和 end
        if (ifIndex === undefined || endIndex === undefined) return false;
        // 2. if 必须在所有其他命令前面
        if (indices.some((index) => index < ifIndex)) return false;
        // 3. end 必须在所有其他命令后面
        if (indices.some((index) => index > endIndex)) return false;
        // 4. else 必须在 if 和 end 之间
        if (elseIndices.some((index) => index < ifIndex || index > endIndex))
          return false;
      }

      return true;
    },
    onDrop(event) {
      try {
        const actionData = event.dataTransfer.getData("action");
        if (!actionData) return;

        const parsedAction = JSON.parse(actionData);
        const commandChain = parsedAction.commandChain;
        const newCommand = this.createNewCommand(parsedAction);
        let newCommands = [...this.commands];

        if (!commandChain) {
          // 处理单个命令
          if (this.dragIndex >= 0) {
            newCommands.splice(this.dragIndex, 0, newCommand);
          } else {
            newCommands.push(newCommand);
          }
        } else {
          // 处理链式命令
          const chainId = this.getUniqueId();
          let insertIndex =
            this.dragIndex >= 0 ? this.dragIndex : newCommands.length;

          // 按顺序插入命令
          for (const commandType of commandChain) {
            const commandItem = {
              ...newCommand,
              id: this.getUniqueId(),
              commandType,
              chainId,
            };
            newCommands.splice(insertIndex, 0, commandItem);
            insertIndex++; // 更新插入位置，确保命令按顺序排列
          }
        }

        this.$emit("update:modelValue", newCommands);
        this.dragIndex = -1;
      } catch (error) {
        console.debug("Internal drag & drop reorder", error);
      }
    },
    createNewCommand(parsedAction) {
      return {
        ...parsedAction,
        id: this.getUniqueId(),
        argv: "",
        saveOutput: false,
        useOutput: null,
        outputVariable: null,
        cmd: parsedAction.value || parsedAction.cmd,
        value: parsedAction.value || parsedAction.cmd,
      };
    },
    getUniqueId() {
      return this.$root.getUniqueId();
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
    addBranch(index, chainInfo) {
      const newCommands = [...this.commands];
      const branchCommand = {
        ...newCommands[index],
        id: this.getUniqueId(),
        chainId: chainInfo.chainId,
        commandType: chainInfo.commandType,
        argv: "",
      };

      // 找到对应的 chainId 的最后一个命令位置
      let lastIndex = -1;
      for (let i = index + 1; i < newCommands.length; i++) {
        if (newCommands[i].chainId === chainInfo.chainId) {
          lastIndex = i;
        }
      }

      // 在最后一个命令之前插入新的分支命令
      if (lastIndex !== -1) {
        newCommands.splice(lastIndex, 0, branchCommand);
        this.$emit("update:modelValue", newCommands);
      }
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
</style>
