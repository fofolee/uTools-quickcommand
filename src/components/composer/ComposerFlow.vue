<template>
  <div class="composer-flow">
    <ChainStyles ref="chainStyles" :commands="commands" />
    <div class="section-header flow-header">
      <div class="flow-title">
        <q-icon name="timeline" size="20px" class="q-mx-sm text-primary" />
        <span class="text-subtitle1">命令流程</span>
      </div>
      <ComposerButtons
        :generate-code="generateCode"
        :is-all-collapsed="isAllCollapsed"
        :show-close-button="showCloseButton"
        @action="handleAction"
        class="flex-grow"
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
                  @run="handleRunCommand"
                  @add-branch="addBranch"
                  @toggle-collapse="(event) => handleControlFlowCollapse(event)"
                  @add-command="(event) => handleAddCommand(event, index)"
                  @toggle-disable="handleToggleDisable"
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
import ComposerButtons from "./flow/ComposerButtons.vue";
import ChainStyles from "./flow/ChainStyles.vue";
import EmptyFlow from "./flow/EmptyFlow.vue";
import DropArea from "./flow/DropArea.vue";
import { findCommandByValue } from "js/composer/composerConfig";
import { processVariable } from "js/composer/variableManager";

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
      default: () => [],
    },
    generateCode: {
      type: Function,
      required: true,
    },
    showCloseButton: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const getCurrentVariables = inject("getCurrentVariables");
    return { getCurrentVariables };
  },
  emits: ["update:modelValue", "add-command", "action"],
  data() {
    return {
      dragIndex: -1,
      isDragging: false,
      draggedCommand: null,
      collapsedRanges: [],
      isAllCollapsed: false,
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
      // 按chainId分组
      const chainGroups = commands.reduce((groups, cmd) => {
        if (cmd.chainId) {
          if (!groups[cmd.chainId]) {
            groups[cmd.chainId] = [];
          }
          groups[cmd.chainId].push(cmd);
        }
        return groups;
      }, {});

      // 如果没有链式命令，直接返回true
      if (Object.keys(chainGroups).length === 0) return true;

      // 检查每个链的命令顺序
      return Object.values(chainGroups).every((chainCommands) => {
        const commandChain = chainCommands[0].commandChain;
        const firstCommand = chainCommands[0];
        const lastCommand = chainCommands[chainCommands.length - 1];
        // 对于每个chain来说，第一个命令必须是chainCommands的第一个命令
        if (firstCommand.commandType !== commandChain[0]) return false;
        // 最后一个命令必须是chainCommands的最后一个命令
        if (lastCommand.commandType !== commandChain[commandChain.length - 1])
          return false;
        return true;
      });
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
      } catch (error) {}
    },
    createNewCommand(parsedAction) {
      const newCommand = {
        ...parsedAction,
        id: this.getUniqueId(),
      };
      if (newCommand.saveOutput && newCommand.outputVariable) {
        newCommand.outputVariable = processVariable({
          value: newCommand.outputVariable,
          existingVars: this.getCurrentVariables().map((v) => v.name),
        }).processedValue;
      }
      return newCommand;
    },
    getUniqueId() {
      return this.$root.getUniqueId();
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

      // 如果是控制流程的起始命令
      if (this.isFirstCommandInChain(command)) {
        // 显示确认对话框
        quickcommand
          .showButtonBox(["全部删除", "保留内部命令", "手抖👋🏻"])
          .then(({ id }) => {
            if (id !== 0 && id !== 1) return;
            const newCommands = [...this.commands];
            const chainId = command.chainId;
            const lastIndex = newCommands.findLastIndex(
              (cmd) => cmd.chainId === chainId
            );
            const startIndex = newCommands.findIndex(
              (cmd) => cmd.chainId === chainId
            );
            this.removeRangeCommand(
              startIndex,
              lastIndex,
              id === 0 ? null : chainId
            );
          });
      } else {
        // 如果不是控制流程的起始命令，直接删除
        this.removeRangeCommand(index);
      }
    },
    handleRunCommand(command) {
      // 创建一个临时的命令流程
      const tempFlow = [
        command,
        {
          //没有输出，则不打印
          code: `if(${command.outputVariable}!==undefined){console.log(${command.outputVariable})}`,
        },
      ];
      // 触发运行事件
      this.$emit("action", "run", tempFlow);
    },
    // 查找不可重复出现的分支
    findUniqueBranch(chainId, commandType) {
      const uniqueBranch = ["default", "catch", "finally"];
      if (!uniqueBranch.includes(commandType)) return false;
      return !!this.commands.find(
        (cmd) => cmd.chainId === chainId && cmd.commandType === commandType
      );
    },
    addBranch({ chainId, commandType, value }) {
      if (this.findUniqueBranch(chainId, commandType))
        return quickcommand.showMessageBox("该分支仅允许存在一个", "warning");
      const newCommands = [...this.commands];
      const branchCommand = {
        ...window.lodashM.cloneDeep(findCommandByValue(value)),
        id: this.getUniqueId(),
        chainId: chainId,
        commandType: commandType,
      };

      // 找到对应的 chainId 的最后一个命令位置
      const lastIndex = newCommands.findLastIndex(
        (cmd) => cmd.chainId === chainId
      );

      // 在最后一个命令之前插入新的分支命令
      if (lastIndex !== -1) {
        newCommands.splice(lastIndex, 0, branchCommand);
        this.$emit("update:modelValue", newCommands);
      }
    },
    handleControlFlowCollapse(event) {
      const chainId = event.chainId;
      const isCollapsed = !event.isCollapsed; // 取反，因为我们要切换状态
      if (!chainId) return;

      // 遍历commands找到相同chainId的第一个和最后一个命令的index
      const startIndex = this.commands.findIndex(
        (cmd) => cmd.chainId === chainId
      );
      const endIndex = this.commands.findLastIndex(
        (cmd) => cmd.chainId === chainId
      );

      if (startIndex === -1 || endIndex === -1) return;

      // 更新命令的折叠状态
      const newCommands = [...this.commands];
      newCommands[startIndex] = {
        ...newCommands[startIndex],
        isCollapsed,
      };

      this.$emit("update:modelValue", newCommands);

      if (isCollapsed) {
        // 折叠命令：添加新的折叠区间
        this.collapsedRanges.push({
          chainId,
          start: startIndex,
          end: endIndex,
        });
      } else {
        // 展开命令：移除对应的折叠区间
        const existingRangeIndex = this.collapsedRanges.findIndex(
          (range) => range.chainId === chainId
        );
        if (existingRangeIndex !== -1) {
          this.collapsedRanges.splice(existingRangeIndex, 1);
        }
      }
    },
    getCollapsedChainClass(index) {
      // 找出所有包含当前index的折叠区间
      const matchingRanges = this.collapsedRanges.filter(
        (range) => index >= range.start && index <= range.end
      );
      if (!matchingRanges.length) return {};
      // 检查是否是任意区间的中间或结束位置
      const isAnyMiddleEnd = matchingRanges.some(
        (range) => index > range.start && index <= range.end
      );
      // 只要在任何区间内部，无论是否是开始位置，都返回hidden样式，解决嵌套问题
      return isAnyMiddleEnd
        ? { "collapsed-chain-hidden": true }
        : { "collapsed-chain-start": true };
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
    getChainCommands(chainId) {
      const startIndex = this.commands.findIndex(
        (cmd) => cmd.chainId === chainId
      );
      const endIndex = this.commands.findLastIndex(
        (cmd) => cmd.chainId === chainId
      );
      return {
        chainCommands: this.commands.slice(startIndex, endIndex + 1),
        startIndex,
        endIndex,
      };
    },
    copyChainCommands(chainCommands) {
      // 生成新的chainId
      const newChainId = this.$root.getUniqueId();
      // 复制并修改每个命令
      const newChainCommands = [];
      chainCommands.forEach((cmd) => {
        const copiedCommand = window.lodashM.cloneDeep(cmd);
        copiedCommand.id = this.$root.getUniqueId();
        if (copiedCommand.chainId) copiedCommand.chainId = newChainId;
        newChainCommands.push(copiedCommand);
      });
      return newChainCommands;
    },
    handleAddCommand({ command, type }, index) {
      if (type === "chain") {
        // 如果是复制链式命令
        const { chainCommands, endIndex } = this.getChainCommands(
          command.chainId
        );
        const newChainCommands = this.copyChainCommands(chainCommands);
        const newCommands = [...this.commands];
        newCommands.splice(endIndex + 1, 0, ...newChainCommands);
        this.$emit("update:modelValue", newCommands);
      } else {
        // 单个命令的复制逻辑
        const newCommand = {
          ...command,
          id: this.$root.getUniqueId(),
        };
        const newCommands = [...this.commands];
        newCommands.splice(index + 1, 0, newCommand);
        this.$emit("update:modelValue", newCommands);
      }
    },
    handleToggleDisable({ chainId, disabled }) {
      console.log("handleToggleDisable", chainId, disabled);
      const { chainCommands } = this.getChainCommands(chainId);
      // 更新所有相关命令的禁用状态
      const newCommands = chainCommands.map((cmd) => {
        return { ...cmd, disabled };
      });
      this.$emit("update:modelValue", newCommands);
    },
    collapseAll() {
      const newCommands = this.commands.map((cmd) => ({
        ...cmd,
        isCollapsed: true,
      }));
      this.$emit("update:modelValue", newCommands);
      this.isAllCollapsed = true;
    },
    expandAll() {
      const newCommands = this.commands.map((cmd) => ({
        ...cmd,
        isCollapsed: false,
      }));
      this.$emit("update:modelValue", newCommands);
      this.isAllCollapsed = false;
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
  gap: 8px;
}

.flow-title {
  display: flex;
  align-items: center;
  flex-shrink: 0;
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
