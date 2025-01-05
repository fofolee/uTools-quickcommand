<template>
  <div class="key-editor">
    <div class="row items-center q-gutter-x-sm full-width">
      <!-- 按键选择/输入区域 -->
      <q-select
        ref="mainKeyInput"
        v-model="argvs.mainKey"
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
        @update:model-value="handleKeyInput"
        @input="handleInput"
      >
        <template v-slot:prepend>
          <!-- 修饰键 -->
          <div class="row items-center q-gutter-x-xs no-wrap">
            <q-chip
              v-for="(active, key) in argvs.modifiers"
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
            v-if="argvs.mainKey"
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
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isRecording: false,
      showKeySelect: false,
      defaultArgvs: {
        mainKey: "",
        modifiers: {
          control: false,
          alt: false,
          shift: false,
          command: false,
        },
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
    argvs() {
      return (
        this.modelValue.argvs || this.parseCodeToArgvs(this.modelValue.code)
      );
    },
    mainKeyDisplay() {
      if (!this.argvs.mainKey) return "";
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
        specialKeyMap[this.argvs.mainKey] ||
        (this.argvs.mainKey.length === 1
          ? this.argvs.mainKey.toUpperCase()
          : this.argvs.mainKey.charAt(0).toUpperCase() +
            this.argvs.mainKey.slice(1))
      );
    },
  },
  methods: {
    toggleModifier(key) {
      const newModifier = !this.argvs.modifiers[key];
      this.argvs.modifiers[key] = newModifier;
      this.updateValue({
        modifiers: {
          ...this.argvs.modifiers,
          [key]: newModifier,
        },
      });
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
        Object.keys(this.argvs.modifiers).forEach((key) => {
          this.argvs.modifiers[key] = false;
        });

        // 根据操作系统设置修饰键
        if (isMac) {
          if (event.metaKey) this.argvs.modifiers.command = true;
          if (event.ctrlKey) this.argvs.modifiers.control = true;
        } else {
          if (event.ctrlKey) this.argvs.modifiers.control = true;
          if (event.metaKey || event.winKey)
            this.argvs.modifiers.command = true;
        }
        if (event.altKey) this.argvs.modifiers.alt = true;
        if (event.shiftKey) this.argvs.modifiers.shift = true;

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
            this.argvs.mainKey = key;
            this.argvs.modifiers[key] = false; // 清除修饰键状态
            this.stopRecording();
            this.updateValue({
              modifiers: {
                ...this.argvs.modifiers,
                [key]: false,
              },
              mainKey: key,
            });
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
          this.argvs.mainKey = key;
          this.stopRecording();
          this.updateValue({
            mainKey: key,
          });
        }
      };
      document.addEventListener("keydown", this.recordEvent);
    },
    stopRecording() {
      this.isRecording = false;
      document.removeEventListener("keydown", this.recordEvent);
    },
    generateCode(argvs = this.argvs) {
      if (!argvs.mainKey) return;
      const activeModifiers = Object.entries(argvs.modifiers)
        .filter(([_, active]) => active)
        .map(([key]) => key)
        // 在非 Mac 系统上，将 command 换为 meta
        .map((key) => (!isMac && key === "command" ? "meta" : key));

      const args = [argvs.mainKey, ...activeModifiers];
      return `${this.modelValue.value}("${args.join('","')}")`;
    },
    updateValue(argv) {
      const newArgvs = {
        ...this.argvs,
        ...argv,
      };
      this.$emit("update:modelValue", {
        ...this.modelValue,
        argvs: newArgvs,
        code: this.generateCode(newArgvs),
      });
    },
    parseCodeToArgvs(code) {
      const argvs = window.lodashM.cloneDeep(this.defaultArgvs);
      if (!code) return argvs;
      try {
        // 移除 keyTap 和引号
        const cleanVal = val.replace(/^keyTap\("/, "").replace(/"\)$/, "");
        // 分割并移除每个参数的引号
        const args = cleanVal
          .split('","')
          .map((arg) => arg.replace(/^"|"$/g, ""));
        if (args.length > 0) {
          argvs.mainKey = args[0];
          Object.keys(argvs.modifiers).forEach((key) => {
            // 在非 Mac 系统上，将 meta 转换为 command
            const modKey = !isMac && args.includes("meta") ? "command" : key;
            argvs.modifiers[key] = args.includes(modKey);
          });
          return argvs;
        }
      } catch (e) {
        console.error("Failed to parse key string:", e);
      }
    },
    handleKeyInput(val) {
      let newMainKey;
      if (val === null) {
        newMainKey = "";
      } else if (typeof val === "string") {
        // 检查是否是预设选项
        const matchedOption = this.commonKeys.find(
          (key) => key.value === val.toLowerCase()
        );
        if (matchedOption) {
          newMainKey = matchedOption.value;
        } else {
          newMainKey = val.charAt(0).toLowerCase();
        }
      }
      this.argvs.mainKey = newMainKey;
      this.updateValue({ mainKey: newMainKey });
    },
    handleInput(val) {
      // 直接输入时，取第一个字符并更新值
      if (val) {
        this.argvs.mainKey = val.data;
        this.$refs.mainKeyInput.blur();
        this.updateValue({ mainKey: val.data });
      }
    },
  },
  mounted() {
    if (!this.modelValue.code && !this.modelValue.argvs) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        argvs: this.defaultArgvs,
        code: this.generateCode(this.defaultArgvs),
      });
    }
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
