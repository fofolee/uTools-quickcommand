<template>
  <div class="key-sequence-editor">
    <!-- 录制控制区 -->
    <div class="row items-center justify-between q-mb-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn
          :color="isRecording ? 'negative' : 'primary'"
          :icon="isRecording ? 'stop' : 'fiber_manual_record'"
          :label="isRecording ? '停止' : '录制'"
          dense
          size="sm"
          class="recording-btn"
          @click="toggleRecording"
          :style="{
            height: '36px',
          }"
        >
          <q-tooltip>{{
            isRecording ? "停止录制" : "开始录制按键序列"
          }}</q-tooltip>
        </q-btn>
        <q-btn-group
          unelevated
          :style="{
            height: '36px',
          }"
        >
          <!-- 通用快捷键 -->
          <q-btn size="sm" flat color="primary" icon="keyboard">
            <q-tooltip>通用快捷键</q-tooltip>
            <q-menu anchor="bottom left" self="top left" :offset="[0, 4]">
              <q-list style="min-width: 150px">
                <q-item-label header class="text-primary"
                  >通用快捷键</q-item-label
                >
                <q-item
                  v-for="item in commonShortcuts"
                  :key="item.label"
                  clickable
                  dense
                  @click="appendSequence(item.sequence)"
                >
                  <q-item-section>{{ item.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Vim快捷键 -->
          <q-btn size="sm" flat color="primary" icon="code">
            <q-tooltip>Vim快捷键</q-tooltip>
            <q-menu anchor="bottom left" self="top left" :offset="[0, 4]">
              <q-list style="min-width: 150px">
                <q-item-label header class="text-primary"
                  >Vim快捷键</q-item-label
                >
                <q-item
                  v-for="item in vimShortcuts"
                  :key="item.label"
                  clickable
                  dense
                  @click="appendSequence(item.sequence)"
                >
                  <q-item-section>{{ item.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Tmux快捷键 -->
          <q-btn size="sm" flat color="primary" icon="terminal">
            <q-tooltip>Tmux快捷键</q-tooltip>
            <q-menu anchor="bottom left" self="top left" :offset="[0, 4]">
              <q-list style="min-width: 150px">
                <q-item-label header class="text-primary"
                  >Tmux快捷键</q-item-label
                >
                <q-item
                  v-for="item in tmuxShortcuts"
                  :key="item.label"
                  clickable
                  dense
                  @click="appendSequence(item.sequence)"
                >
                  <q-item-section>{{ item.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Chrome快捷键 -->
          <q-btn size="sm" flat color="primary" icon="public">
            <q-tooltip>Chrome快捷键</q-tooltip>
            <q-menu anchor="bottom left" self="top left" :offset="[0, 4]">
              <q-list style="min-width: 150px">
                <q-item-label header class="text-primary"
                  >Chrome快捷键</q-item-label
                >
                <q-item
                  v-for="item in chromeShortcuts"
                  :key="item.label"
                  clickable
                  v-close-popup
                  dense
                  @click="appendSequence(item.sequence)"
                >
                  <q-item-section>{{ item.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-btn-group>

        <number-input
          v-if="argvs.sequence.length > 1"
          :model-value="argvs.interval"
          label="间隔(ms)"
          icon="timer"
          class="q-ml-md interval-input"
          @update:model-value="updateInterval"
        />
      </div>

      <div class="row items-center" v-if="argvs.sequence.length > 0">
        <q-badge color="primary" text-color="white" class="q-mr-xs">
          {{ argvs.sequence.length }}
        </q-badge>
        <span class="text-grey-7 text-caption">个按键</span>
        <q-btn
          flat
          dense
          round
          size="sm"
          color="grey-7"
          icon="clear_all"
          class="q-ml-xs"
          @click="clearSequence"
        >
          <q-tooltip>清空序列</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- 序列显示区 -->
    <div v-if="argvs.sequence.length > 0" class="sequence-list q-mb-sm">
      <draggable
        v-model="argvs.sequence"
        item-key="id"
        handle=".drag-handle"
        :animation="200"
        ghost-class="ghost"
        class="row"
        style="column-gap: 8px"
        @change="updateValue"
      >
        <template #item="{ element, index }">
          <div class="q-py-xs" style="flex: 1">
            <div
              class="row items-center justify-between no-wrap hover-show-actions sequence-item"
            >
              <!-- 左侧区域 -->
              <div class="row items-center no-wrap">
                <!-- 拖拽手柄 -->
                <div class="col-auto q-mr-xs cursor-move drag-handle">
                  <q-icon name="drag_indicator" size="14px" color="grey-7" />
                </div>
                <!-- 序号 -->
                <div class="col-auto q-mr-xs text-grey-7 sequence-number">
                  {{ index + 1 }}.
                </div>
              </div>

              <!-- 中间区域 - 按键显示 -->
              <div class="row items-center justify-center no-wrap flex-1">
                <!-- 修饰键 - 始终显示所有修饰键 -->
                <q-chip
                  v-for="(active, key) in element.modifiers"
                  :key="key"
                  dense
                  square
                  :class="['modifier-chip', { 'modifier-inactive': !active }]"
                  @click.stop.prevent="toggleModifier(index, key)"
                  clickable
                >
                  {{ modifierLabels[key] }}
                </q-chip>
                <!-- 主按键 -->
                <q-chip
                  color="primary"
                  text-color="white"
                  dense
                  square
                  class="main-key"
                >
                  {{ formatMainKey(element.mainKey) }}
                </q-chip>
              </div>

              <!-- 右侧区域 - 操作按钮 -->
              <div class="col-auto action-buttons">
                <q-btn
                  flat
                  round
                  dense
                  size="xs"
                  color="grey-7"
                  icon="close"
                  @click="removeKey(index)"
                >
                  <q-tooltip>删除此按键</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import NumberInput from "../common/NumberInput.vue";
import draggable from "vuedraggable";

// 检测操作系统
const isMac = window.utools.isMacOs();

// 通用修饰键配置
const getDefaultModifier = (extraModifiers = {}) => {
  const baseModifiers = isMac ? { command: true } : { control: true };
  return { ...baseModifiers, ...extraModifiers };
};

// 通用快捷键 - 根据操作系统设置不同的快捷键
const commonShortcuts = [
  {
    label: "复制",
    sequence: [{ mainKey: "c", modifiers: getDefaultModifier() }],
  },
  {
    label: "粘贴",
    sequence: [{ mainKey: "v", modifiers: getDefaultModifier() }],
  },
  {
    label: "剪切",
    sequence: [{ mainKey: "x", modifiers: getDefaultModifier() }],
  },
  {
    label: "全选",
    sequence: [{ mainKey: "a", modifiers: getDefaultModifier() }],
  },
  {
    label: "撤销",
    sequence: [{ mainKey: "z", modifiers: getDefaultModifier() }],
  },
  {
    label: "重做",
    sequence: [
      { mainKey: "z", modifiers: getDefaultModifier({ shift: true }) },
    ],
  },
  {
    label: "保存",
    sequence: [{ mainKey: "s", modifiers: getDefaultModifier() }],
  },
  {
    label: "查找",
    sequence: [{ mainKey: "f", modifiers: getDefaultModifier() }],
  },
  {
    label: "替换",
    sequence: [{ mainKey: "h", modifiers: getDefaultModifier() }],
  },
  {
    label: "关闭窗口",
    sequence: [
      {
        mainKey: isMac ? "w" : "f4",
        modifiers: isMac ? { command: true } : { alt: true },
      },
    ],
  },
];

// Vim快捷键
const vimShortcuts = [
  {
    label: "保存",
    sequence: [
      { mainKey: "escape", modifiers: {} },
      { mainKey: ":", modifiers: { shift: true } },
      { mainKey: "w", modifiers: {} },
      { mainKey: "enter", modifiers: {} },
    ],
  },
  {
    label: "退出",
    sequence: [
      { mainKey: "escape", modifiers: {} },
      { mainKey: ":", modifiers: { shift: true } },
      { mainKey: "q", modifiers: {} },
      { mainKey: "enter", modifiers: {} },
    ],
  },
  {
    label: "强制退出",
    sequence: [
      { mainKey: "escape", modifiers: {} },
      { mainKey: ":", modifiers: { shift: true } },
      { mainKey: "q", modifiers: {} },
      { mainKey: "!", modifiers: { shift: true } },
      { mainKey: "enter", modifiers: {} },
    ],
  },
  {
    label: "删除整行",
    sequence: [
      { mainKey: "d", modifiers: {} },
      { mainKey: "d", modifiers: {} },
    ],
  },
  {
    label: "复制整行",
    sequence: [
      { mainKey: "y", modifiers: {} },
      { mainKey: "y", modifiers: {} },
    ],
  },
  {
    label: "粘贴",
    sequence: [{ mainKey: "p", modifiers: {} }],
  },
  {
    label: "行首",
    sequence: [{ mainKey: "0", modifiers: {} }],
  },
  {
    label: "行尾",
    sequence: [{ mainKey: "$", modifiers: { shift: true } }],
  },
  {
    label: "文件头",
    sequence: [
      { mainKey: "g", modifiers: {} },
      { mainKey: "g", modifiers: {} },
    ],
  },
  {
    label: "文件尾",
    sequence: [
      { mainKey: "g", modifiers: {} },
      { mainKey: "g", modifiers: {} },
    ],
  },
];

// Tmux快捷键
const tmuxShortcuts = [
  {
    label: "新建窗口",
    sequence: [
      { mainKey: "b", modifiers: { control: true } },
      { mainKey: "c", modifiers: {} },
    ],
  },
  {
    label: "水平分割",
    sequence: [
      { mainKey: "b", modifiers: { control: true } },
      { mainKey: '"', modifiers: { shift: true } },
    ],
  },
  {
    label: "垂直分割",
    sequence: [
      { mainKey: "b", modifiers: { control: true } },
      { mainKey: "%", modifiers: { shift: true } },
    ],
  },
  {
    label: "切换窗口",
    sequence: [
      { mainKey: "b", modifiers: { control: true } },
      { mainKey: "n", modifiers: {} },
    ],
  },
  {
    label: "关闭面板",
    sequence: [
      { mainKey: "b", modifiers: { control: true } },
      { mainKey: "x", modifiers: {} },
    ],
  },
];

// Chrome快捷键
const chromeShortcuts = [
  {
    label: "新标签页",
    sequence: [{ mainKey: "t", modifiers: { command: true } }],
  },
  {
    label: "关闭标签页",
    sequence: [{ mainKey: "w", modifiers: { command: true } }],
  },
  {
    label: "重新打开关闭的标签页",
    sequence: [{ mainKey: "t", modifiers: { command: true, shift: true } }],
  },
  {
    label: "切换到下一个标签页",
    sequence: [{ mainKey: "tab", modifiers: { control: true } }],
  },
  {
    label: "切换到上一个标签页",
    sequence: [{ mainKey: "tab", modifiers: { control: true, shift: true } }],
  },
];

export default defineComponent({
  name: "KeySequenceEditor",
  components: {
    NumberInput,
    draggable,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isRecording: false,
      defaultArgvs: {
        sequence: [],
        interval: 100,
      },
      modifierLabels: isMac
        ? {
            control: "⌃",
            alt: "⌥",
            shift: "⇧",
            command: "⌘",
          }
        : {
            control: "Ctrl",
            alt: "Alt",
            shift: "Shift",
            command: "Win",
          },
      commonShortcuts,
      vimShortcuts,
      tmuxShortcuts,
      chromeShortcuts,
    };
  },
  computed: {
    argvs() {
      return (
        this.modelValue.argvs || window.lodashM.cloneDeep(this.defaultArgvs)
      );
    },
  },
  methods: {
    toggleRecording() {
      if (!this.isRecording) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    },
    startRecording() {
      this.isRecording = true;

      this.recordEvent = (event) => {
        event.preventDefault();

        // 创建新的按键记录
        const keyRecord = {
          mainKey: "",
          modifiers: {
            control: false,
            alt: false,
            shift: false,
            command: false,
          },
          id: Date.now() + Math.random(),
        };

        // 设置修饰键状态
        if (isMac) {
          if (event.metaKey) keyRecord.modifiers.command = true;
          if (event.ctrlKey) keyRecord.modifiers.control = true;
        } else {
          if (event.ctrlKey) keyRecord.modifiers.control = true;
          if (event.metaKey || event.winKey) keyRecord.modifiers.command = true;
        }
        if (event.altKey) keyRecord.modifiers.alt = true;
        if (event.shiftKey) keyRecord.modifiers.shift = true;

        // 设置主按键
        let key = null;

        // 处理字母键
        if (event.code.startsWith("Key")) {
          key = event.code.slice(-1).toLowerCase();
        }
        // 处理数字键
        else if (event.code.startsWith("Digit")) {
          key = event.code.slice(-1);
        }
        // 处理功能键
        else if (event.code.startsWith("F") && !isNaN(event.code.slice(1))) {
          key = event.code.toLowerCase();
        }
        // 处理其他特殊键
        else {
          const keyMap = {
            ArrowUp: "up",
            ArrowDown: "down",
            ArrowLeft: "left",
            ArrowRight: "right",
            Enter: "enter",
            Space: "space",
            Escape: "escape",
            Delete: "delete",
            Backspace: "backspace",
            Tab: "tab",
            Home: "home",
            End: "end",
            PageUp: "pageup",
            PageDown: "pagedown",
          };
          key = keyMap[event.code] || event.key.toLowerCase();
        }

        // 忽略单独的修饰键
        if (!["control", "alt", "shift", "command", "meta"].includes(key)) {
          keyRecord.mainKey = key;
          this.argvs.sequence.push(keyRecord);
          this.updateValue();
        }
      };

      document.addEventListener("keydown", this.recordEvent);
    },
    stopRecording() {
      this.isRecording = false;
      document.removeEventListener("keydown", this.recordEvent);
    },
    removeKey(index) {
      this.argvs.sequence.splice(index, 1);
      this.updateValue();
    },
    clearSequence() {
      this.argvs.sequence = [];
      this.updateValue();
    },
    updateInterval(value) {
      this.argvs.interval = value;
      this.updateValue();
    },
    formatMainKey(key) {
      if (!key) return "";
      // 特殊按键映射表
      const specialKeyMap = {
        enter: "↵",
        tab: "⇥",
        space: "␣",
        backspace: "⌫",
        delete: "⌦",
        escape: "⎋",
        up: "↑",
        down: "↓",
        left: "←",
        right: "→",
      };
      return (
        specialKeyMap[key] ||
        (key.length === 1
          ? key.toUpperCase()
          : key.charAt(0).toUpperCase() + key.slice(1))
      );
    },
    generateCode(argvs = this.argvs) {
      if (!argvs.sequence.length) return;

      // 将每个按键记录转换为按键数组
      const keySequence = argvs.sequence.map((item) => {
        const activeModifiers = Object.entries(item.modifiers)
          .filter(([_, active]) => active)
          .map(([key]) => key)
          // 在非 Mac 系统上，将 command 换为 meta
          .map((key) => (!isMac && key === "command" ? "meta" : key));

        return [item.mainKey, ...activeModifiers];
      });

      // 生成代码
      const options =
        argvs.sequence.length > 1 ? { interval: argvs.interval } : {};
      if (Object.keys(options).length > 0) {
        return `${this.modelValue.value}(${JSON.stringify(
          keySequence
        )}, ${JSON.stringify(options)})`;
      }
      return `${this.modelValue.value}(${JSON.stringify(keySequence)})`;
    },
    updateValue(newArgvs = this.argvs) {
      const updatedModelValue = {
        ...this.modelValue,
        argvs: newArgvs,
        code: this.generateCode(newArgvs),
        summary: this.getSummary(newArgvs),
      };

      this.$emit("update:modelValue", updatedModelValue);
    },
    getSingleSummary(item) {
      const modifiers = Object.entries(item.modifiers)
        .filter(([_, active]) => active)
        .map(([key]) => this.modifierLabels[key])
        .join(" + ");
      return modifiers ? `${modifiers} + ${item.mainKey}` : item.mainKey;
    },
    getSummary(argvs) {
      return argvs.sequence.map(this.getSingleSummary).join("; ");
    },
    appendSequence(newSequence) {
      const startId = Date.now();
      this.argvs.sequence.push(
        ...newSequence.map((item, index) => ({
          ...item,
          id: startId + index,
        }))
      );
      this.updateValue();
    },
    toggleModifier(index, key) {
      // 创建新的 argvs 对象
      const newArgvs = {
        sequence: [...this.argvs.sequence],
        interval: this.argvs.interval,
      };

      // 修改对应按键的修饰键状态
      newArgvs.sequence[index] = {
        ...newArgvs.sequence[index],
        modifiers: {
          ...newArgvs.sequence[index].modifiers,
          [key]: !newArgvs.sequence[index].modifiers[key],
        },
      };
      // 更新 modelValue
      this.updateValue(newArgvs);
    },
  },
  mounted() {
    this.updateValue(this.argvs);
  },
});
</script>

<style scoped>
.key-sequence-editor {
  padding: 8px;
}

.recording-btn {
  min-width: 70px;
  height: 28px;
  font-size: 14px;
}

.recording-btn :deep(.q-icon.on-left) {
  margin-right: 2px;
}

.sequence-list {
  border: 1px solid var(--q-primary);
  border-radius: 4px;
  padding: 8px;
  max-height: 300px;
  overflow-y: auto;
}

/* 移除多余的嵌套 row */
.sequence-list :deep(.row.q-col-gutter-sm) {
  margin: -4px -8px;
  width: 100%;
}

.sequence-list :deep(.row.q-col-gutter-sm) > * {
  padding: 4px 8px;
}

.sequence-item {
  user-select: none;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  min-height: 28px;
  background-color: rgba(0, 0, 0, 0.02);
}

.body--dark .sequence-item {
  background-color: rgba(255, 255, 255, 0.02);
}

.sequence-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.body--dark .sequence-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.sequence-number {
  font-size: 11px;
  min-width: 14px;
  opacity: 0.7;
  margin-right: 8px;
}

.modifier-chip {
  height: 16px;
  font-size: 11px;
  margin: 0 1px;
  background-color: var(--q-primary);
  color: white;
  min-width: 32px;
  padding: 0 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.modifier-inactive {
  background-color: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.7);
}

.body--dark .modifier-inactive {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.modifier-chip:hover {
  opacity: 0.9;
  transform: scale(1.05);
}

.main-key {
  height: 16px;
  font-size: 11px;
  margin: 0 1px;
  min-width: 32px;
  padding: 0 4px;
}

.modifier-chip :deep(.q-chip__content),
.main-key :deep(.q-chip__content) {
  justify-content: center;
  text-align: center;
}

.hover-show-actions .action-buttons {
  opacity: 0;
  transition: opacity 0.2s;
}

.hover-show-actions:hover .action-buttons {
  opacity: 1;
}

.ghost {
  opacity: 0.5;
  background: var(--q-primary-opacity-20) !important;
}

/* 滚动条样式 */
.sequence-list::-webkit-scrollbar {
  width: 4px;
}

.sequence-list::-webkit-scrollbar-track {
  background: transparent;
}

.sequence-list::-webkit-scrollbar-thumb {
  background: var(--q-primary);
  border-radius: 2px;
}

.interval-input {
  width: 130px;
}

.drag-handle {
  cursor: grab;
  margin-right: 8px;
}
</style>
