<template>
  <div class="composer-flow">
    <ChainStyles ref="chainStyles" :commands="commands" />

    <q-scroll-area class="command-scroll" ref="scrollArea">
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
          :animation="0"
          :delay="50"
          handle=".drag-handle"
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
                  ...getCollapsedChainClass(index),
                  ...getChainGroupClass(index),
                }"
              >
                <ComposerCard
                  v-model="commands[index]"
                  :command-index="index"
                  @remove="removeCommand(index)"
                  @run="$emit('action', 'run', $event)"
                  @add-branch="addBranch"
                  @toggle-collapse="handleChainCollapse"
                  @add-command="handleAddCommand($event, index)"
                  @toggle-chain-disable="handleToggleChainDisable"
                />
              </div>
            </transition>
          </template>
        </draggable>
        <DropArea v-if="commands.length === 0" type="empty" />
        <DropArea v-else type="add" />
      </div>
    </q-scroll-area>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import draggable from "vuedraggable";
import ComposerCard from "./ComposerCard.vue";
import ChainStyles from "./flow/ChainStyles.vue";
import DropArea from "./flow/DropArea.vue";
import { findCommandByValue } from "js/composer/composerConfig";
import { getUniqueId } from "js/common/uuid";

// 拖拽前的命令列表，非响应式
let commandsBeforeDrag = [];

export default defineComponent({
  name: "ComposerFlow",
  components: {
    draggable,
    ComposerCard,
    ChainStyles,
    DropArea,
  },
  props: {
    modelValue: {
      type: Array,
      required: true,
      default: () => [],
    },
    showCloseButton: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:modelValue", "add-command", "action"],
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
    // 拖拽开始
    onDragStart(event) {
      // 保存拖拽前的命令列表
      commandsBeforeDrag = [...this.commands];
      this.isDragging = true;
      // 拖拽的命令
      this.draggedCommand = this.commands[event.oldIndex];
      // 如果是链式命令的拖拽，先折叠
      if (this.isFirstCommandInChain(this.draggedCommand)) {
        this.handleChainCollapse({
          chainId: this.draggedCommand.chainId,
          isCollapsed: false,
        });
      }
    },
    // 拖拽结束
    onDragEnd() {
      this.isDragging = false;
      this.dragIndex = -1;
      this.draggedCommand = null;
      commandsBeforeDrag = [];
    },
    // 拖拽生效
    onDragChange(event) {
      const oldCommands = [...commandsBeforeDrag];
      let newCommands = [...this.commands];

      if (event.moved) {
        const { oldIndex, newIndex } = event.moved;
        const draggedCommand = oldCommands[oldIndex];

        // 检查新位置是否在折叠的链中
        let adjustedNewIndex = newIndex;
        for (let i = 0; i < newCommands.length; i++) {
          const cmd = newCommands[i];
          if (cmd?.chainId && cmd.isCollapsed) {
            const { startIndex, endIndex } = this.getChainIndex(
              cmd.chainId,
              newCommands
            );
            // 如果新位置在折叠的链中间，调整到链的后面
            if (newIndex > startIndex && newIndex <= endIndex) {
              adjustedNewIndex = endIndex + 1;
              break;
            }
          }
        }

        if (draggedCommand.chainId) {
          newCommands = this.handleChainCommandDrag(
            draggedCommand,
            oldCommands,
            adjustedNewIndex
          );
        } else {
          // 处理普通命令的拖拽
          newCommands = oldCommands.filter(
            (cmd) => cmd.id !== draggedCommand.id
          );
          newCommands.splice(adjustedNewIndex, 0, draggedCommand);
        }
      }

      this.$emit("update:modelValue", newCommands);
    },
    // 拖拽经过
    onDragOver(event) {
      if (!this.isDragging) {
        const items = this.$el.querySelectorAll(".flow-item");
        const mouseY = event.clientY;

        // 找到最近的插入位置
        let closestIndex = -1;
        let minDistance = Infinity;
        let lastVisibleIndex = -1;

        items.forEach((item, index) => {
          // 跳过隐藏的命令
          if (item.classList.contains("collapsed-chain-hidden")) {
            return;
          }

          const itemRect = item.getBoundingClientRect();
          const itemCenter = itemRect.top + itemRect.height / 2;
          const distance = Math.abs(mouseY - itemCenter);

          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
          lastVisibleIndex = index;
        });

        // 如果最近的是折叠的链式命令
        if (closestIndex !== -1) {
          const command = this.commands[closestIndex];
          if (command?.chainId && command.isCollapsed) {
            // 找到这个链的结束位置
            const { endIndex } = this.getChainIndex(command.chainId);
            // 如果鼠标在链式命令的下半部分，将插入位置设置到链的后面
            const closestItem = items[closestIndex];
            const itemRect = closestItem.getBoundingClientRect();
            const itemCenter = itemRect.top + itemRect.height / 2;
            if (mouseY > itemCenter) {
              closestIndex = endIndex + 1;
            }
          }
        }

        // 如果鼠标在最后一个可见元素下方，则设置为末尾
        const lastVisibleItem = items[lastVisibleIndex];
        if (
          lastVisibleItem &&
          mouseY > lastVisibleItem.getBoundingClientRect().bottom
        ) {
          closestIndex = this.commands.length;
        }

        this.dragIndex = closestIndex;
      }
    },
    // 拖拽离开
    onDragLeave() {
      if (!this.isDragging) {
        this.dragIndex = -1;
      }
    },
    // 从命令列表拖到命令流程的事件，非命令流程内部拖拽
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
          const chainId = getUniqueId();
          let insertIndex =
            this.dragIndex >= 0 ? this.dragIndex : newCommands.length;

          // 按顺序插入命令
          for (const commandType of commandChain) {
            const commandItem = {
              ...newCommand,
              id: getUniqueId(),
              commandType,
              chainId,
            };
            newCommands.splice(insertIndex, 0, commandItem);
            insertIndex++; // 更新插入位置，确保命令按顺序排列
          }
        }

        this.$emit("update:modelValue", newCommands);
        this.dragIndex = -1;
      } catch (error) {}
    },
    createNewCommand(parsedAction) {
      const newCommand = {
        ...parsedAction,
        id: getUniqueId(),
      };
      return newCommand;
    },
    isFirstCommandInChain(command) {
      if (!command.commandChain) return false;
      return command.commandType === command.commandChain?.[0];
    },
    removeRangeCommand(startIndex, endIndex, chainId) {
      if (!endIndex) endIndex = startIndex;
      const newCommands = [...this.commands];
      // 从后往前删除，避免索引变化
      for (let i = endIndex; i >= startIndex; i--) {
        const cmd = newCommands[i];
        // 如果chainId不为空，则只删除指定chainId的命令
        if (chainId && cmd.chainId !== chainId) continue;
        newCommands.splice(i, 1);
      }
      this.$emit("update:modelValue", newCommands);
    },
    removeCommand(index) {
      const command = this.commands[index];

      // 如果是链式命令的起始命令
      if (this.isFirstCommandInChain(command)) {
        // 显示确认对话框
        quickcommand
          .showButtonBox(["全部删除", "保留内部命令", "手抖👋"])
          .then(({ id }) => {
            if (id !== 0 && id !== 1) return;
            const chainId = command.chainId;
            const { startIndex, endIndex } = this.getChainIndex(chainId);
            this.removeRangeCommand(
              startIndex,
              endIndex,
              id === 0 ? null : chainId
            );
          });
      } else {
        // 如果不是链式命令的起始命令，直接删除
        this.removeRangeCommand(index);
      }
    },
    // 查找不可重复出现的分支
    findUniqueBranch(chainId, commandType) {
      const uniqueBranch = ["default", "catch", "finally"];
      if (!uniqueBranch.includes(commandType)) return false;
      return !!this.commands.find(
        (cmd) => cmd.chainId === chainId && cmd.commandType === commandType
      );
    },
    // 链式命令添加分支命令
    addBranch({ chainId, commandType, value }) {
      if (this.findUniqueBranch(chainId, commandType))
        return quickcommand.showMessageBox("该分支仅允许存在一个", "warning");
      const newCommands = [...this.commands];
      const branchCommand = {
        ...window.lodashM.cloneDeep(findCommandByValue(value)),
        id: getUniqueId(),
        chainId: chainId,
        commandType: commandType,
      };

      // 找到对应的 chainId 的最后一个命令位置
      const { endIndex } = this.getChainIndex(chainId);

      // 在最后一个命令之前插入新的分支命令
      if (endIndex !== -1) {
        newCommands.splice(endIndex, 0, branchCommand);
        this.$emit("update:modelValue", newCommands);
      }
    },
    // 获取链式命令的折叠样式
    getCollapsedChainClass(index) {
      const command = this.commands[index];

      // 检查当前命令是否在某个折叠的链中
      for (let i = index - 1; i >= 0; i--) {
        const prevCommand = this.commands[i];
        if (!prevCommand?.chainId) continue;

        // 找到链式命令
        const { startIndex, endIndex } = this.getChainIndex(
          prevCommand.chainId
        );
        if (i === startIndex && prevCommand.isCollapsed) {
          // 如果这个链式命令是折叠的，且当前命令在这个链的范围内
          if (index > startIndex && index <= endIndex) {
            return { "collapsed-chain-hidden": true };
          }
        }
      }

      // 只有当命令不在任何折叠的链中时，才检查它自己的折叠状态
      if (
        command?.chainId &&
        this.isFirstCommandInChain(command) &&
        command.isCollapsed
      ) {
        return { "collapsed-chain-start": true };
      }

      return {};
    },
    handleAction(action, payload) {
      if (action === "collapseAll") {
        this.collapseAll();
      } else if (action === "expandAll") {
        this.expandAll();
      } else {
        this.$emit("action", action, payload);
      }
    },
    getChainIndex(chainId, commands = this.commands) {
      const startIndex = commands.findIndex((cmd) => cmd.chainId === chainId);
      const endIndex = commands.findLastIndex((cmd) => cmd.chainId === chainId);
      return { startIndex, endIndex };
    },
    copyCommands(commands) {
      // 生成新的chainId
      const newChainId = getUniqueId();
      // 复制并修改每个命令
      const newCommands = [];
      commands.forEach((cmd) => {
        const copiedCommand = window.lodashM.cloneDeep(cmd);
        copiedCommand.id = getUniqueId();
        if (copiedCommand.chainId) copiedCommand.chainId = newChainId;
        newCommands.push(copiedCommand);
      });
      return newCommands;
    },
    handleAddCommand(event, index) {
      const { command, type } = event;
      if (type === "function") {
        // 如果是创建新函数的事件，传递给FlowTabs处理
        this.$emit("action", "addFlow", command);
      } else {
        // 原有的复制命令逻辑保持不变
        if (type === "chain") {
          // 如果是复制链式命令
          const { startIndex, endIndex } = this.getChainIndex(command.chainId);
          const chainCommands = this.commands.slice(startIndex, endIndex + 1);
          const newChainCommands = this.copyCommands(chainCommands);
          const newCommands = [...this.commands];
          newCommands.splice(endIndex + 1, 0, ...newChainCommands);
          this.$emit("update:modelValue", newCommands);
        } else {
          // 单个命令的复制逻辑
          const newCommand = {
            ...command,
            id: getUniqueId(),
          };
          const newCommands = [...this.commands];
          newCommands.splice(index + 1, 0, newCommand);
          this.$emit("update:modelValue", newCommands);
        }
      }
    },
    handleToggleChainDisable({ chainId, disabled }) {
      // 禁用时折叠链式命令
      if (disabled) {
        this.handleChainCollapse({ chainId, isCollapsed: false });
      }

      const { startIndex, endIndex } = this.getChainIndex(chainId);
      const newCommands = [...this.commands];
      newCommands.forEach((cmd, idx) => {
        if (idx >= startIndex && idx <= endIndex) {
          cmd.disabled = disabled;
        }
      });
      this.$emit("update:modelValue", newCommands);
    },
    collapseAll() {
      // 遍历所有命令，设置折叠状态
      const newCommands = this.commands.map((cmd) => ({
        ...cmd,
        isCollapsed: true,
      }));
      this.$emit("update:modelValue", newCommands);
    },
    expandAll() {
      // 遍历所有命令，展开状态
      const newCommands = this.commands.map((cmd) => ({
        ...cmd,
        isCollapsed: false,
      }));
      this.$emit("update:modelValue", newCommands);
    },
    // 检查链式命令的顺序
    checkChainOrders(commands, chainId) {
      // 获取该链的起始和结束位置
      const { startIndex, endIndex } = this.getChainIndex(chainId, commands);

      // 如果没有找到命令，返回true
      if (startIndex === -1 || endIndex === -1) return true;

      // 获取该链的所有命令
      const chainCommands = commands.slice(startIndex, endIndex + 1);
      const commandChain = chainCommands[0].commandChain;
      const firstCommand = chainCommands[0];
      const lastCommand = chainCommands[chainCommands.length - 1];

      // 第一个命令必须是chainCommands的第一个命令
      if (firstCommand.commandType !== commandChain[0]) return false;
      // 最后一个命令必须是chainCommands的最后一个命令
      if (lastCommand.commandType !== commandChain[commandChain.length - 1])
        return false;
      return true;
    },
    // 处理链式命令的拖拽
    handleChainCommandDrag(draggedCommand, oldCommands, newIndex) {
      let newCommands = [...this.commands];

      if (this.isFirstCommandInChain(draggedCommand)) {
        const { startIndex, endIndex } = this.getChainIndex(
          draggedCommand.chainId,
          oldCommands
        );

        const chainCommands = oldCommands.slice(startIndex, endIndex + 1);
        newCommands = oldCommands.filter(
          (cmd) => !chainCommands.some((chainCmd) => chainCmd.id === cmd.id)
        );
        newCommands.splice(newIndex, 0, ...chainCommands);
      } else {
        // 检查当前链的命令顺序
        const isValidOrder = this.checkChainOrders(
          newCommands,
          draggedCommand.chainId
        );
        if (!isValidOrder) {
          newCommands = [...oldCommands];
        }
      }

      return newCommands;
    },
    // 链式命令折叠
    handleChainCollapse(event) {
      const chainId = event.chainId;
      const isCollapsed = !event.isCollapsed; // 取反，因为我们要切换状态
      if (!chainId) return;

      // 遍历commands找到相同chainId的第一个命令的index
      const { startIndex } = this.getChainIndex(chainId);
      if (startIndex === -1) return;

      // 更新命令的折叠状态
      const newCommands = [...this.commands];
      newCommands[startIndex] = {
        ...newCommands[startIndex],
        isCollapsed,
      };

      this.$emit("update:modelValue", newCommands);
    },
  },
  mounted() {
    // 当高度超过1000时，会出现非预期的自动滚动，暂时找不到原因，先强制滚动到顶部
    this.$nextTick(() => {
      this.$refs.scrollArea.setScrollPosition("vertical", 0);
    });
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

.flex-grow {
  flex-grow: 1;
}

.command-scroll {
  flex: 1;
  overflow: hidden;
  border-radius: 10px;
}

.command-flow-container {
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
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

/* 流程卡片 */
.flow-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin: 3px 0;
  border-radius: 5px;
  display: grid;
  grid-template-rows: 1fr;
}

/* 隐藏的链式命令 */
.collapsed-chain-hidden {
  grid-template-rows: 0fr !important;
  margin: 0 !important;
  padding: 0 !important;
  opacity: 0 !important;
  pointer-events: none !important;
  overflow: hidden !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.collapsed-chain-hidden > * {
  min-height: 0;
  overflow: hidden;
}

.flow-item.chain-start {
  border-radius: 5px 5px 0 0;
  margin: 0;
}

.flow-item.chain-start.collapsed-chain-start {
  border-radius: 5px;
}

.flow-item.chain-middle {
  border-radius: 0;
  margin: 0;
}

.flow-item.chain-end {
  border-radius: 0 0 5px 5px;
  margin: 0;
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

.flow-item.sortable-ghost {
  opacity: 0.5;
  border: 1px solid var(--q-primary);
}
</style>
