<template>
  <div class="regex-input">
    <div class="input-container">
      <!-- 语法提示 -->
      <div class="syntax-tooltip" v-if="selectedPattern && isFocused">
        <div class="tooltip-content">
          <div class="text-weight-medium">{{ syntaxHelp.title }}</div>
          <div class="text-caption q-mt-xs">{{ syntaxHelp.description }}</div>
          <div
            class="text-caption text-grey-5 q-mt-xs"
            v-if="syntaxHelp.example"
          >
            示例: {{ syntaxHelp.example }}
          </div>
        </div>
      </div>
      <!-- 前置图标 -->
      <div class="input-icon">
        <q-icon name="rule" size="18px" class="text-grey-7" />
      </div>
      <!-- 真实的输入框 -->
      <div
        ref="editor"
        class="editor"
        contenteditable="true"
        spellcheck="false"
        @input="handleInput"
        @keydown="handleKeydown"
        @select="handleSelect"
        @blur="handleBlur"
        @click="handleClick"
        :data-placeholder="placeholder"
      ></div>
      <!-- 高亮层 -->
      <div class="highlight" ref="highlight" @mousedown.stop @click.stop></div>
      <!-- 错误提示 -->
      <div class="error-message" v-if="error">
        {{ error }}
        <q-btn
          flat
          dense
          round
          size="xs"
          icon="close"
          class="close-error"
          @click="error = ''"
        />
      </div>
      <!-- 工具栏 -->
      <div class="input-toolbar">
        <q-btn
          flat
          dense
          size="sm"
          icon="clear"
          @click="clearInput"
          v-show="content"
        >
          <q-tooltip>清空</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          size="sm"
          icon="text_format"
          :color="flags.ignoreCase ? 'primary' : ''"
          @click="
            $emit('update:flags', { ...flags, ignoreCase: !flags.ignoreCase })
          "
        >
          <q-tooltip>忽略大小写 (i)</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          size="sm"
          icon="wrap_text"
          :color="flags.multiline ? 'primary' : ''"
          @click="
            $emit('update:flags', { ...flags, multiline: !flags.multiline })
          "
        >
          <q-tooltip>多行模式 (m)</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          size="sm"
          icon="repeat"
          :color="flags.global ? 'primary' : ''"
          @click="$emit('update:flags', { ...flags, global: !flags.global })"
        >
          <q-tooltip>全局匹配 (g)</q-tooltip>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "RegexInput",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    flags: {
      type: Object,
      required: true,
    },
    placeholder: {
      type: String,
      default: "输入正则表达式...",
    },
  },
  emits: ["update:modelValue", "update:flags"],
  data() {
    return {
      content: "",
      error: "",
      selectedPattern: "",
      syntaxHelp: {
        title: "",
        description: "",
        example: "",
      },
      isFocused: false,
    };
  },
  methods: {
    handleInput(e) {
      this.content = e.target.innerText;
      // 保存当前光标位置
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const start = range.startOffset;
      const end = range.endOffset;

      // 获取光标位置的字符，用于语法提示
      const cursorChar = this.content.charAt(start - 1);
      this.updateSyntaxHelp(cursorChar);

      // 更新内容和高亮
      this.$emit("update:modelValue", this.content);
      this.highlightSyntax();

      // 恢复光标位置
      this.$nextTick(() => {
        const newRange = document.createRange();
        const textNode = this.$refs.editor.firstChild || this.$refs.editor;
        newRange.setStart(textNode, start);
        newRange.setEnd(textNode, end);
        selection.removeAllRanges();
        selection.addRange(newRange);
      });
    },
    updateSyntaxHelp(char) {
      // 根据当前输入的字符更新语法提示
      // 获取当前光标位置的前一个字符
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const cursorPos = range.startOffset;
      const prevChar = this.content.charAt(cursorPos - 2);
      const currentChar = this.content.charAt(cursorPos - 1);

      if (currentChar === "\\") {
        this.selectedPattern = "\\"; // 转义字符提示
        this.syntaxHelp = {
          title: "转义字符",
          description: "用于转义特殊字符，使其失去特殊含义",
          example: "\\. 匹配普通的点号",
        };
      } else if (currentChar === "[") {
        this.selectedPattern = "["; // 字符集提示
        this.syntaxHelp = {
          title: "字符集",
          description: "匹配方括号中的任意一个字符",
          example: "[aeiou] 匹配任意一个元音字母",
        };
      } else if (currentChar === "(") {
        this.selectedPattern = "("; // 分组提示
        this.syntaxHelp = {
          title: "分组",
          description: "创建一个捕获组，可以被后面引用",
          example: "(\\w+) \\1 匹配重复的单词",
        };
      } else if ("?+*{".includes(currentChar)) {
        this.selectedPattern = currentChar; // 量词提示
        // 检查前面的字符是否是量词
        if (currentChar === "?" && "*+}".includes(prevChar)) {
          this.syntaxHelp = {
            title: "非贪婪量词",
            description: "使前面的量词变成非贪婪模式，尽可能少的匹配",
            example: ".*? 懒惰匹配，<.+?> 最小匹配HTML标签",
          };
        } else if (currentChar === "?") {
          this.syntaxHelp = {
            title: "可选量词",
            description: "匹配前面的模式零次或一次",
            example: "colou?r 匹配 color 或 colour",
          };
        } else {
          this.syntaxHelp = {
            title: "量词",
            description:
              currentChar === "?"
                ? "非贪婪匹配，尽可能少的匹配"
                : currentChar === "+"
                ? "一次或多次"
                : currentChar === "*"
                ? "零次或多次"
                : "指定次数",
            example:
              currentChar === "?"
                ? ".*? 懒惰匹配，<.+?>匹配HTML标签"
                : currentChar === "+"
                ? "\\d+ 匹配一个或多个数字"
                : currentChar === "*"
                ? "\\w* 匹配零个或多个字符"
                : "{2,3} 匹配2到3次",
          };
        }
      } else if ("|^$".includes(currentChar)) {
        this.selectedPattern = currentChar; // 特殊字符提示
        this.syntaxHelp = {
          title:
            currentChar === "|" ? "或" : currentChar === "^" ? "行首" : "行尾",
          description:
            currentChar === "|"
              ? "匹配多个模式之一"
              : currentChar === "^"
              ? "匹配行的开始"
              : "匹配行的结束",
          example:
            currentChar === "|"
              ? "cat|dog 匹配cat或dog"
              : currentChar === "^"
              ? "^\\w+ 匹配行首的单词"
              : "\\w+$ 匹配行尾的单词",
        };
      } else {
        // 如果不是特殊字符，检查前面的字符
        if (prevChar === "\\") {
          this.selectedPattern = "\\" + currentChar; // 转义序列提示
          this.syntaxHelp = {
            title: "转义序列",
            description: this.getEscapeSequenceHelp(currentChar),
            example: this.getEscapeSequenceExample(currentChar),
          };
        } else {
          this.selectedPattern = ""; // 清除提示
          this.syntaxHelp = {};
        }
      }
    },
    getEscapeSequenceHelp(char) {
      const helpMap = {
        d: "匹配任意数字字符 (0-9)",
        D: "匹配任意非数字字符",
        w: "匹配字母、数字、下划线",
        W: "匹配非单词字符",
        s: "匹配任意空白字符",
        S: "匹配非空白字符",
        b: "匹配单词边界",
        B: "匹配非单词边界",
      };
      return helpMap[char] || "特殊字符转义";
    },
    getEscapeSequenceExample(char) {
      const exampleMap = {
        d: "\\d+ 匹配一个或多个数字",
        D: "\\D+ 匹配一个或多个非数字字符",
        w: "\\w+ 匹配一个或多个单词字符",
        W: "\\W+ 匹配一个或多个非单词字符",
        s: "\\s+ 匹配一个或多个空白字符",
        S: "\\S+ 匹配一个或多个非空白字符",
        b: "\\bword\\b 精确匹配单词",
        B: "\\Bword\\B 匹配被其他字符包围的word",
      };
      return exampleMap[char] || `\\${char} 匹配字符 ${char}`;
    },
    handleKeydown(e) {
      // 处理Tab键
      if (e.key === "Tab") {
        e.preventDefault();
        document.execCommand("insertText", false, "  ");
      }
      // 处理特殊字符的自动补全
      else if (e.key === "[") {
        e.preventDefault();
        this.insertWithCursor("[]");
      } else if (e.key === "(") {
        e.preventDefault();
        this.insertWithCursor("()");
      } else if (e.key === "{") {
        e.preventDefault();
        this.insertWithCursor("{}");
      }
    },
    insertWithCursor(text) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      // 获取当前光标位置
      const cursorPos = range.startOffset;

      // 获取当前内容
      const currentText = this.$refs.editor.innerText;

      // 在光标位置插入新文本
      const newText =
        currentText.slice(0, cursorPos) + text + currentText.slice(cursorPos);

      // 更新内容
      this.$refs.editor.innerText = newText;

      // 设置光标位置到中间
      const textNode = this.$refs.editor.firstChild || this.$refs.editor;
      const newRange = document.createRange();
      newRange.setStart(textNode, cursorPos + 1); // 将光标放在插入的第一个字符后面
      newRange.setEnd(textNode, cursorPos + 1);
      selection.removeAllRanges();
      selection.addRange(newRange);

      // 触发内容更新
      this.content = this.$refs.editor.innerText;
      this.$emit("update:modelValue", this.content);
      this.highlightSyntax();
    },
    handleSelect() {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        this.selectedPattern = range.toString();
      }
    },
    clearInput() {
      this.content = "";
      this.$refs.editor.innerText = "";
      this.error = "";
      this.$emit("update:modelValue", "");
      this.highlightSyntax();
    },
    highlightSyntax() {
      const text = this.content;
      let html = text
        // 转义特殊字符
        .replace(
          /[<>&]/g,
          (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])
        )
        // 转义字符
        .replace(/\\(?:.|$)/g, '<span class="escape">$&</span>')
        // 字符集
        .replace(/\[([^\]]*)\]/g, '<span class="charset">[$1]</span>')
        // 量词
        .replace(/[?+*]|\{[^\}]+\}/g, '<span class="quantifier">$&</span>')
        // 分组
        .replace(/(\((?:\?[=!:])?[^)]*\))/g, '<span class="group">$1</span>')
        // 特殊字符
        .replace(/[|^$]/g, '<span class="special">$&</span>')
        // 锚点
        .replace(/\\[bBAZz]/g, '<span class="anchor">$&</span>');

      this.$refs.highlight.innerHTML = html;
    },
    syncScroll(e) {
      const { scrollTop, scrollLeft } = e.target;
      this.$refs.highlight.scrollTop = scrollTop;
      this.$refs.highlight.scrollLeft = scrollLeft;
    },
    handleBlur() {
      this.isFocused = false;
      this.selectedPattern = ""; // 清除语法提示
      try {
        new RegExp(this.content);
        this.error = "";
        this.$emit("update:modelValue", this.content);
        this.highlightSyntax();
      } catch (e) {
        // 提取更友好的错误信息
        let errorMsg = e.message;
        if (errorMsg.includes("Invalid regular expression")) {
          if (errorMsg.includes("Unterminated group")) {
            errorMsg = "括号未闭合";
          } else if (errorMsg.includes("Unterminated character class")) {
            errorMsg = "字符集未闭合";
          } else if (errorMsg.includes("Invalid escape")) {
            errorMsg = "无效的转义字符";
          } else if (errorMsg.includes("Nothing to repeat")) {
            errorMsg = "量词前缺少有效模式";
          } else {
            errorMsg = "无效的正则表达式";
          }
        }
        this.error = errorMsg;

        // 添加错误样式
        this.$refs.editor.classList.add("has-error");
        setTimeout(() => {
          this.$refs.editor.classList.remove("has-error");
        }, 1000);
      }
    },
    handleFocus() {
      this.isFocused = true;
    },
    handleClick() {
      this.selectedPattern = "";
      this.syntaxHelp = {};
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        this.content = val;
        this.$nextTick(() => {
          if (this.$refs.editor) {
            if (this.$refs.editor.innerText !== val) {
              this.$refs.editor.innerText = val;
            }
            this.highlightSyntax();
          }
        });
      },
    },
  },
  mounted() {
    if (this.modelValue) {
      this.$refs.editor.innerText = this.modelValue;
      this.highlightSyntax();
    }
    this.$refs.editor.addEventListener("scroll", this.syncScroll);
    this.$refs.editor.addEventListener("focus", this.handleFocus);
  },
  beforeUnmount() {
    this.$refs.editor.removeEventListener("scroll", this.syncScroll);
    this.$refs.editor.removeEventListener("focus", this.handleFocus);
  },
});
</script>

<style scoped>
.regex-input {
  width: 100%;
}

.input-container {
  flex: 1;
  position: relative;
  min-height: 36px;
  height: 36px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.03);
  padding: 0 0 0 32px; /* 只保留左侧图标的空间 */
}

.regex-input .input-icon {
  position: absolute;
  left: 9px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  display: flex;
  align-items: center;
}

.regex-input .input-icon :deep(.q-icon) {
  color: rgba(0, 0, 0, 0.6);
}

/* 暗色模式下的图标颜色 */
.body--dark .regex-input .input-icon :deep(.q-icon) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.input-toolbar {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  z-index: 3;
  background: linear-gradient(
    to right,
    transparent,
    rgba(244, 244, 244, 0.95) 15%,
    rgba(244, 244, 244, 1)
  );
  padding-left: 15px;
  padding-right: 5px;
}

.input-toolbar :deep(.q-btn) {
  opacity: 0.7;
  transition: all 0.3s ease;
}

.input-toolbar :deep(.q-btn:hover) {
  opacity: 1;
}

.input-toolbar :deep(.q-btn.text-primary) {
  opacity: 1;
}

.editor,
.highlight {
  padding: 8px 8px 8px 32px;
  margin: 0;
  border: none;
  width: 100%;
  height: 36px;
  position: absolute;
  top: 0;
  left: 0;
  font-family: monospace;
  font-size: 14px;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  box-sizing: border-box;
  border-radius: 4px;
  font-family: Consolas, Monaco, "Courier New";
  padding-right: 115px;
  transition: all 0.3s ease;
}

.editor {
  color: transparent;
  caret-color: black;
  z-index: 2;
  background: transparent;
  outline: none;
  resize: none;
}

.highlight {
  z-index: 1;
  pointer-events: none;
  background: transparent;
}

.highlight * {
  pointer-events: none;
}

.highlight :deep(.escape) {
  color: #e67e22; /* 橙色 */
}

.highlight :deep(.charset) {
  color: #2ecc71; /* 绿色 */
}

.highlight :deep(.quantifier) {
  color: #9b59b6; /* 紫色 */
}

.highlight :deep(.group) {
  color: #3498db; /* 蓝色 */
}

.highlight :deep(.special) {
  color: #e74c3c; /* 红色 */
}

.highlight :deep(.anchor) {
  color: #f1c40f; /* 黄色 */
}

.error-message {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  font-size: 12px;
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
  padding: 4px 28px 4px 28px;
  margin-left: 32px;
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  gap: 4px;
  animation: fadeIn 0.3s ease;
  z-index: 4;
  white-space: nowrap;
}

.close-error {
  position: absolute;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.6;
  transition: all 0.3s ease;
}

.close-error:hover {
  opacity: 1;
}

.error-message::before {
  content: "error";
  font-family: "Material Icons";
  position: absolute;
  left: 8px;
  font-size: 14px;
  opacity: 0.8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

/* 暗色模式适配 */
.body--dark .error-message {
  background: rgba(231, 76, 60, 0.15);
  color: #ff6b5b;
}

/* 输入框样式调整，为错误消息留出空间 */
.editor,
.highlight {
  padding: 8px 8px 8px 32px;
  margin: 0;
  border: none;
  width: 100%;
  height: 36px;
  position: absolute;
  top: 0;
  left: 0;
  font-family: monospace;
  font-size: 14px;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  box-sizing: border-box;
  border-radius: 4px;
  font-family: Consolas, Monaco, "Courier New";
  padding-right: 115px;
  transition: all 0.3s ease;
}

/* 当有错误时输入框的样式 */
.input-container:has(.error-message) .editor {
  border: 1px solid rgba(231, 76, 60, 0.3);
  background: rgba(231, 76, 60, 0.02);
}

.body--dark .input-container:has(.error-message) .editor {
  border: 1px solid rgba(231, 76, 60, 0.2);
  background: rgba(231, 76, 60, 0.05);
}

/* 暗色模式适配 */
.body--dark .input-container {
  background: rgba(255, 255, 255, 0.05);
}

.body--dark .editor {
  caret-color: white;
}

.body--dark .highlight :deep(.escape) {
  color: #f39c12;
}

.body--dark .highlight :deep(.charset) {
  color: #27ae60;
}

.body--dark .highlight :deep(.quantifier) {
  color: #8e44ad;
}

.body--dark .highlight :deep(.group) {
  color: #2980b9;
}

.body--dark .highlight :deep(.special) {
  color: #c0392b;
}

.body--dark .highlight :deep(.anchor) {
  color: #f39c12;
}

/* 添加占位符样式 */
.editor:empty:before {
  content: attr(data-placeholder);
  color: rgba(0, 0, 0, 0.6);
  font-size: 11px;
  font-family: Roboto;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 500;
}

/* 暗色模式下的占位符 */
.body--dark .editor:empty:before {
  color: rgb(192, 193, 181);
}

/* 暗色模式下的工具栏背景 */
.body--dark .input-toolbar {
  background: linear-gradient(
    to right,
    transparent,
    rgba(48, 49, 50, 0.95) 15%,
    rgba(48, 49, 50, 1)
  );
}

.regex-input ::-webkit-scrollbar {
  height: 1px;
}

.syntax-tooltip {
  position: absolute;
  top: -80px;
  left: 32px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 8px 12px;
  z-index: 5;
  max-width: 300px;
  pointer-events: none;
  opacity: 0.95;
  transition: all 0.3s ease;
}

.syntax-tooltip::after {
  content: "";
  position: absolute;
  bottom: -6px;
  left: 20px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid white;
}

/* 暗色模式适配 */
.body--dark .syntax-tooltip {
  background: #424242;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.body--dark .syntax-tooltip::after {
  border-top-color: #424242;
}

/* 错误动画效果 */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

.editor.has-error {
  animation: shake 0.2s ease-in-out 3;
}
</style>
