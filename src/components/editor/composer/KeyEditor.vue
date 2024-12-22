<template>
  <div class="key-editor">
    <!-- 按键输入框 -->
    <q-input
      dense
      outlined
      readonly
      class="col"
    >
      <template v-slot:prepend>
        <!-- 修饰键 -->
        <div class="row items-center q-gutter-x-xs">
          <q-chip
            v-for="(active, key) in modifiers"
            :key="key"
            :color="active ? 'primary' : 'grey-4'"
            :text-color="active ? 'white' : 'grey-7'"
            dense
            clickable
            class="modifier-chip"
            @click="toggleModifier(key)"
          >
            {{ modifierLabels[key] }}
          </q-chip>
        </div>
      </template>

      <!-- 主按键显示 -->
      <template v-slot:default>
        <div class="main-key-container">
          <div class="main-key">
            {{ mainKeyDisplay }}
          </div>
        </div>
      </template>

      <template v-slot:append>
        <q-separator vertical inset />
        <!-- 选择按钮 -->
        <q-btn
          flat
          round
          dense
          icon="edit"
          @click="showKeySelect = true"
        >
          <q-tooltip>选择按键</q-tooltip>
        </q-btn>
        <q-separator vertical inset />
        <!-- 录制按钮 -->
        <q-btn
          flat
          round
          dense
          :icon="isRecording ? 'fiber_manual_record' : 'radio_button_unchecked'"
          :color="isRecording ? 'negative' : 'primary'"
          @click="toggleRecording"
        >
          <q-tooltip>{{ isRecording ? '停止录制' : '开始录制' }}</q-tooltip>
        </q-btn>
      </template>
    </q-input>

    <!-- 按键选择对话框 -->
    <q-dialog v-model="showKeySelect">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">选择按键</div>
        </q-card-section>
        <q-card-section class="q-gutter-y-md">
          <!-- 主按键选择 -->
          <q-select
            v-model="mainKey"
            :options="commonKeys"
            label="选择用按键"
            dense
            outlined
            emit-value
            map-options
          />
          <q-input
            v-model="customKey"
            label="或输入自定义按键"
            dense
            outlined
            @update:model-value="mainKey = $event"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="确定" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

// 检测操作系统
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

export default defineComponent({
  name: 'KeyEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isRecording: false,
      showKeySelect: false,
      mainKey: '',
      customKey: '',
      modifiers: {
        control: false,
        alt: false,
        shift: false,
        command: false
      },
      modifierLabels: isMac ? {
        control: '⌃',
        alt: '⌥',
        shift: '⇧',
        command: '⌘'
      } : {
        control: 'Ctrl',
        alt: 'Alt',
        shift: 'Shift',
        command: 'Win'
      },
      commonKeys: [
        { label: 'Enter ↵', value: 'enter' },
        { label: 'Tab ⇥', value: 'tab' },
        { label: 'Space', value: 'space' },
        { label: 'Backspace ⌫', value: 'backspace' },
        { label: 'Delete ⌦', value: 'delete' },
        { label: 'Escape ⎋', value: 'escape' },
        { label: '↑', value: 'up' },
        { label: '↓', value: 'down' },
        { label: '←', value: 'left' },
        { label: '→', value: 'right' },
        { label: 'Home', value: 'home' },
        { label: 'End', value: 'end' },
        { label: 'Page Up', value: 'pageup' },
        { label: 'Page Down', value: 'pagedown' }
      ]
    }
  },
  computed: {
    mainKeyDisplay() {
      if (!this.mainKey) return ''
      // 特殊按键映射表
      const specialKeyMap = {
        'enter': '↵',
        'tab': '⇥',
        'space': '␣',
        'backspace': '⌫',
        'delete': '⌦',
        'escape': '⎋',
        'up': '↑',
        'down': '↓',
        'left': '←',
        'right': '→'
      }
      return specialKeyMap[this.mainKey] ||
        (this.mainKey.length === 1 ? this.mainKey.toUpperCase() :
        this.mainKey.charAt(0).toUpperCase() + this.mainKey.slice(1))
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (val) {
          this.parseKeyString(val)
        }
      }
    }
  },
  methods: {
    toggleModifier(key) {
      this.modifiers[key] = !this.modifiers[key]
      this.updateValue()
    },
    toggleRecording() {
      if (!this.isRecording) {
        this.startRecording()
      } else {
        this.stopRecording()
      }
    },
    startRecording() {
      this.isRecording = true
      let lastKeyTime = 0
      let lastKey = null

      this.recordEvent = (event) => {
        event.preventDefault()
        const currentTime = Date.now()

        // 重置所有修饰键状态
        Object.keys(this.modifiers).forEach(key => {
          this.modifiers[key] = false
        })

        // 根据操作系统设置修饰键
        if (isMac) {
          if (event.metaKey) this.modifiers.command = true
          if (event.ctrlKey) this.modifiers.control = true
        } else {
          if (event.ctrlKey) this.modifiers.control = true
          if (event.metaKey || event.winKey) this.modifiers.command = true
        }
        if (event.altKey) this.modifiers.alt = true
        if (event.shiftKey) this.modifiers.shift = true

        // 设置主按键
        let key = null

        // 处理字母键
        if (event.code.startsWith('Key')) {
          key = event.code.slice(-1).toLowerCase()
        }
        // 处理数字键
        else if (event.code.startsWith('Digit')) {
          key = event.code.slice(-1)
        }
        // 处理功能键
        else if (event.code.startsWith('F') && !isNaN(event.code.slice(1))) {
          key = event.code.toLowerCase()
        }
        // 处理其他特殊键
        else {
          const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'Enter': 'enter',
            'Space': 'space',
            'Escape': 'escape',
            'Delete': 'delete',
            'Backspace': 'backspace',
            'Tab': 'tab',
            'Home': 'home',
            'End': 'end',
            'PageUp': 'pageup',
            'PageDown': 'pagedown',
            'Control': 'control',
            'Alt': 'alt',
            'Shift': 'shift',
            'Meta': 'command'
          }
          key = keyMap[event.code] || event.key.toLowerCase()
        }

        // 处理双击修饰键
        if (['control', 'alt', 'shift', 'command'].includes(key)) {
          if (key === lastKey && (currentTime - lastKeyTime) < 500) {
            this.mainKey = key
            this.modifiers[key] = false // 清除修饰键状态
            this.stopRecording()
            this.updateValue()
            return
          }
          lastKey = key
          lastKeyTime = currentTime
          return
        }

        // 处理空格键和其他按键
        if (key === 'space' || !['meta', 'control', 'shift', 'alt', 'command'].includes(key)) {
          this.mainKey = key
          this.stopRecording()
          this.updateValue()
        }
      }
      document.addEventListener('keydown', this.recordEvent)
    },
    stopRecording() {
      this.isRecording = false
      document.removeEventListener('keydown', this.recordEvent)
    },
    updateValue() {
      if (!this.mainKey) return
      const activeModifiers = Object.entries(this.modifiers)
        .filter(([_, active]) => active)
        .map(([key]) => key)
        // 在非 Mac 系统上，将 command 转换为 meta
        .map(key => !isMac && key === 'command' ? 'meta' : key)

      const args = [this.mainKey, ...activeModifiers]
      this.$emit('update:modelValue', args.join('","'))
    },
    parseKeyString(val) {
      try {
        const args = val.split('","')
        if (args.length > 0) {
          this.mainKey = args[0]
          Object.keys(this.modifiers).forEach(key => {
            // 在非 Mac 系统上，将 meta 转换为 command
            const modKey = !isMac && args.includes('meta') ? 'command' : key
            this.modifiers[key] = args.includes(modKey)
          })
        }
      } catch (e) {
        console.error('Failed to parse key string:', e)
      }
    }
  }
})
</script>

<style scoped>
.key-editor {
  padding: 4px 0;
}

.modifier-chip {
  height: 24px;
  font-size: 13px;
  margin: 0 2px;
}

.main-key-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 60px;
}

.main-key {
  font-size: 13px;
  font-weight: 500;
  color: var(--q-primary);
  line-height: 24px;
  padding: 0 8px;
}

:deep(.q-field__control) {
  padding: 0 8px;
  min-height: 36px;
}

:deep(.q-field__prepend) {
  padding-right: 0;
}

:deep(.q-field__native) {
  display: none;
}

:deep(.q-field__control-container) {
  padding: 0;
  display: flex;
  align-items: center;
}
</style>
