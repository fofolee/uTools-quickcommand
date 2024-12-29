<template>
  <div class="key-editor">
    <div class="row items-center q-gutter-x-sm full-width">
      <!-- 按键选择/输入区域 -->
      <q-select
        v-model="mainKey"
        :options="commonKeys"
        dense
        filled
        use-input
        hide-dropdown-icon
        new-value-mode="add-unique"
        input-debounce="0"
        emit-value
        map-options
        options-dense
        behavior="menu"
        class="col q-px-sm"
        placeholder="选择或输入按键"
        @filter="filterFn"
        @update:model-value="handleKeyInput"
        @input="handleInput"
      >
        <template v-slot:prepend>
          <!-- 修饰键 -->
          <div class="row items-center q-gutter-x-xs no-wrap">
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
        <!-- 添加自定义选中值显示 -->
        <template v-slot:selected>
          <q-badge
            v-if="mainKey"
            color="primary"
            text-color="white"
            class="main-key"
          >
            {{ mainKeyDisplay }}
          </q-badge>
        </template>
      </q-select>
      <!-- 录制按钮 -->
      <q-btn
        flat
        round
        dense
        :icon="isRecording ? 'fiber_manual_record' : 'radio_button_unchecked'"
        :color="isRecording ? 'negative' : 'primary'"
        @click="toggleRecording"
      >
        <q-tooltip>{{ isRecording ? "停止录制" : "开始录制" }}</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

// 检测操作系统
const isMac = window.utools.isMacOs();

export default defineComponent({
  name: "KeyEditor",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      isRecording: false,
      showKeySelect: false,
      mainKey: "",
      modifiers: {
        control: false,
        alt: false,
        shift: false,
        command: false,
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
      commonKeys: [
        { label: "Enter ↵", value: "enter" },
        { label: "Tab ⇥", value: "tab" },
        { label: "Space", value: "space" },
        { label: "Backspace ⌫", value: "backspace" },
        { label: "Delete ⌦", value: "delete" },
        { label: "Escape ⎋", value: "escape" },
        { label: "↑", value: "up" },
        { label: "↓", value: "down" },
        { label: "←", value: "left" },
        { label: "→", value: "right" },
        { label: "Home", value: "home" },
        { label: "End", value: "end" },
        { label: "Page Up", value: "pageup" },
        { label: "Page Down", value: "pagedown" },
      ],
    };
  },
  computed: {
    mainKeyDisplay() {
      if (!this.mainKey) return "";
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
        specialKeyMap[this.mainKey] ||
        (this.mainKey.length === 1
          ? this.mainKey.toUpperCase()
          : this.mainKey.charAt(0).toUpperCase() + this.mainKey.slice(1))
      );
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (val) {
          this.parseKeyString(val);
        }
      },
    },
  },
  methods: {
    toggleModifier(key) {
      this.modifiers[key] = !this.modifiers[key];
      this.updateValue();
    },
    toggleRecording() {
      if (!this.isRecording) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    },
    startRecording() {
      this.isRecording = true;
      let lastKeyTime = 0;
      let lastKey = null;

      this.recordEvent = (event) => {
        event.preventDefault();
        const currentTime = Date.now();

        // 重置所有修饰键状态
        Object.keys(this.modifiers).forEach((key) => {
          this.modifiers[key] = false;
        });

        // 根据操作系统设置修饰键
        if (isMac) {
          if (event.metaKey) this.modifiers.command = true;
          if (event.ctrlKey) this.modifiers.control = true;
        } else {
          if (event.ctrlKey) this.modifiers.control = true;
          if (event.metaKey || event.winKey) this.modifiers.command = true;
        }
        if (event.altKey) this.modifiers.alt = true;
        if (event.shiftKey) this.modifiers.shift = true;

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
            Control: "control",
            Alt: "alt",
            Shift: "shift",
            Meta: "command",
          };
          key = keyMap[event.code] || event.key.toLowerCase();
        }

        // 处理双击修饰键
        if (["control", "alt", "shift", "command"].includes(key)) {
          if (key === lastKey && currentTime - lastKeyTime < 500) {
            this.mainKey = key;
            this.modifiers[key] = false; // 清除修饰键状态
            this.stopRecording();
            this.updateValue();
            return;
          }
          lastKey = key;
          lastKeyTime = currentTime;
          return;
        }

        // 处理空格键和其他按键
        if (
          key === "space" ||
          !["meta", "control", "shift", "alt", "command"].includes(key)
        ) {
          this.mainKey = key;
          this.stopRecording();
          this.updateValue();
        }
      };
      document.addEventListener("keydown", this.recordEvent);
    },
    stopRecording() {
      this.isRecording = false;
      document.removeEventListener("keydown", this.recordEvent);
    },
    updateValue() {
      if (!this.mainKey) return;
      const activeModifiers = Object.entries(this.modifiers)
        .filter(([_, active]) => active)
        .map(([key]) => key)
        // 在非 Mac 系统上，将 command 换为 meta
        .map((key) => (!isMac && key === "command" ? "meta" : key));

      const args = [this.mainKey, ...activeModifiers];
      // 为每个参数添加引号
      this.$emit("update:modelValue", `"${args.join('","')}"`);
    },
    parseKeyString(val) {
      try {
        // 移除开头和结尾的引号
        const cleanVal = val.replace(/^"|"$/g, "");
        // 分割并移除每个参数的引号
        const args = cleanVal
          .split('","')
          .map((arg) => arg.replace(/^"|"$/g, ""));
        if (args.length > 0) {
          this.mainKey = args[0];
          Object.keys(this.modifiers).forEach((key) => {
            // 在非 Mac 系统上，将 meta 转换为 command
            const modKey = !isMac && args.includes("meta") ? "command" : key;
            this.modifiers[key] = args.includes(modKey);
          });
        }
      } catch (e) {
        console.error("Failed to parse key string:", e);
      }
    },
    filterFn(val, update, abort) {
      // 如果是直接输入（长度为1），则中止过滤
      if (val.length === 1) {
        abort();
        return;
      }

      // 否则只在输入内容匹配预设选项时显示下拉列表
      update(() => {
        const needle = val.toLowerCase();
        const matchedOptions = this.commonKeys.filter(
          (key) =>
            key.value === needle || key.label.toLowerCase().includes(needle)
        );
      });
    },
    handleKeyInput(val) {
      if (val === null) {
        this.mainKey = "";
      } else if (typeof val === "string") {
        // 检查是否是预设选项
        const matchedOption = this.commonKeys.find(
          (key) => key.value === val.toLowerCase()
        );
        if (matchedOption) {
          this.mainKey = matchedOption.value;
        } else {
          this.mainKey = val.charAt(0).toLowerCase();
        }
      }
      this.updateValue();
    },
    handleInput(val) {
      // 直接输入时，取第一个字符并更新值
      if (val) {
        this.mainKey = val.charAt(0).toLowerCase();
        this.updateValue();
      }
    },
  },
});
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

.main-key {
  height: 24px;
  font-size: 13px;
  margin: 0 2px;
}
</style>
