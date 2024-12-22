<template>
  <div class="composer-flow">
    <div
      class="command-flow-container"
      @dragover.prevent
      @drop="onDrop"
    >
      <draggable
        v-model="commands"
        group="commands"
        item-key="id"
        class="flow-list"
        handle=".drag-handle"
        :animation="200"
      >
        <template #item="{ element, index }">
          <transition
            name="slide-fade"
            mode="out-in"
            appear
          >
            <div :key="element.id" class="flow-item">
              <ComposerCard
                :command="element"
                :has-output="hasOutput(element)"
                :can-use-output="canUseOutput(element, index)"
                :available-outputs="getAvailableOutputs(index)"
                :placeholder="getPlaceholder(element, index)"
                @remove="removeCommand(index)"
                @toggle-output="toggleSaveOutput(index)"
                @update:argv="(val) => handleArgvChange(index, val)"
                @update:use-output="(val) => handleUseOutputChange(index, val)"
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
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import draggable from 'vuedraggable'
import ComposerCard from './ComposerCard.vue'
import { commandsWithOutput, commandsAcceptOutput } from './composerConfig'

export default defineComponent({
  name: 'ComposerFlow',
  components: {
    draggable,
    ComposerCard
  },
  props: {
    modelValue: {
      type: Array,
      required: true
    }
  },
  emits: ['update:modelValue', 'add-command'],
  computed: {
    commands: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  methods: {
    onDrop(event) {
      const actionData = JSON.parse(event.dataTransfer.getData('action'))
      this.$emit('add-command', actionData)
      document.querySelectorAll('.dragging').forEach(el => {
        el.classList.remove('dragging')
      })
    },
    removeCommand(index) {
      const newCommands = [...this.commands]
      newCommands.splice(index, 1)
      this.$emit('update:modelValue', newCommands)
    },
    hasOutput(command) {
      return commandsWithOutput[command.value] || false
    },
    canUseOutput(command, index) {
      return commandsAcceptOutput[command.value] && this.getAvailableOutputs(index).length > 0
    },
    getAvailableOutputs(currentIndex) {
      return this.commands
        .slice(0, currentIndex)
        .map((cmd, index) => ({
          label: `${cmd.label} 的输出`,
          value: index,
          disable: !cmd.saveOutput
        }))
        .filter(item => !item.disable)
    },
    toggleSaveOutput(index) {
      const newCommands = [...this.commands]
      newCommands[index].saveOutput = !newCommands[index].saveOutput
      if (!newCommands[index].saveOutput) {
        newCommands.forEach((cmd, i) => {
          if (i > index && cmd.useOutput === index) {
            cmd.useOutput = null
          }
        })
      }
      this.$emit('update:modelValue', newCommands)
    },
    handleArgvChange(index, value) {
      const newCommands = [...this.commands]
      newCommands[index].argv = value
      this.$emit('update:modelValue', newCommands)
    },
    handleUseOutputChange(index, value) {
      const newCommands = [...this.commands]
      newCommands[index].useOutput = value
      if (value !== null) {
        newCommands[index].argv = ''
      }
      this.$emit('update:modelValue', newCommands)
    },
    getPlaceholder(element, index) {
      if (element.useOutput !== null) {
        return `使用 ${this.commands[element.useOutput].label} 的输出`
      }
      return element.desc
    }
  }
})
</script>

<style scoped>
.composer-flow {
  background-color: white;
  border-radius: 8px;
}

.command-flow-container {
  min-height: 100px;
  padding: 8px;
  background-color: #fafafa;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.command-flow-container:empty {
  border: 2px dashed #e0e0e0;
}

.flow-list {
  min-height: 50px;
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
}

.empty-flow:hover {
  border-color: #bdbdbd;
  background-color: #fafafa;
}

/* 拖拽时的视觉反馈 */
.command-flow-container.drag-over {
  background-color: #f0f4ff;
  border-color: #2196f3;
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

.flow-item {
  transition: all 0.3s ease;
}
</style>
