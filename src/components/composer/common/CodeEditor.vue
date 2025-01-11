<template>
  <div class="code-editor" :style="{ height: height }">
    <div ref="editorContainer" class="editor-container"></div>
  </div>
</template>

<script>
import * as monaco from "monaco-editor";
import { toRaw } from "vue";

export default {
  name: "CodeEditor",
  props: {
    // v-model 绑定值
    modelValue: {
      type: String,
      default: "",
    },
    // 编程语言
    language: {
      type: String,
      default: "plaintext",
    },
    // 编辑器高度
    height: {
      type: String,
      default: "200px",
    },
    // 编辑器主题
    theme: {
      type: String,
      default: "vs",
    },
    // 编辑器选项
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:modelValue", "change"],
  data() {
    return {
      editor: null,
      value: null,
      resizeTimeout: null,
      defaultOptions: {
        value: "",
        // 自动布局
        automaticLayout: true,
        // 折叠策略
        foldingStrategy: "indentation",
        // 自动关闭括号
        autoClosingBrackets: true,
        // 制表符大小
        tabSize: 2,
        // 最小化
        minimap: {
          enabled: false,
        },
        // 自动格式化
        formatOnType: true,
        // 自动格式化
        formatOnPaste: true,
        // 自动缩进
        autoIndent: "full",
        // 滚动超出最后一行
        scrollBeyondLastLine: false,
        // 字体大小
        fontSize: 14,
        // 行号
        lineNumbers: "on",
        // 行号最小字符数
        lineNumbersMinChars: 3,
        // 行号
        renderLineNumbers: "on",
        // 行装饰宽度
        lineDecorationsWidth: 0,
        // 圆角
        roundedSelection: false,
        // 行高亮
        renderLineHighlight: "all",
        // 仅在聚焦时高亮行
        renderLineHighlightOnlyWhenFocus: true,
        // 隐藏光标
        hideCursorInOverviewRuler: true,
        // 隐藏概览边框
        overviewRulerBorder: false,
        // 隐藏概览线
        overviewRulerLanes: 0,
        // 滚动条
        scrollBars: {
          vertical: "visible",
          horizontal: "visible",
        },
        // 只读
        readOnly: false,
        // 光标样式
        cursorStyle: "line",
      },
    };
  },
  watch: {
    // 监听 v-model 值变化
    modelValue: {
      immediate: true,
      handler(newValue) {
        if (this.value !== newValue) {
          this.value = newValue;
          if (this.editor && this.editor.getValue() !== newValue) {
            this.editor.setValue(newValue || "");
          }
        }
      },
    },
    // 监听语言变化
    language: {
      immediate: true,
      handler(newValue) {
        if (this.editor) {
          monaco.editor.setModelLanguage(this.editor.getModel(), newValue);
        }
      },
    },
    "$q.dark.isActive": {
      immediate: true,
      handler(newValue) {
        monaco.editor.setTheme(newValue ? "vs-dark" : "vs");
      },
    },
  },
  mounted() {
    this.initEditor();
    // 手动监听窗口大小变化，解决Monaco自动调整大小时导致ResizeObserver loop limit exceeded错误
    window.addEventListener("resize", this.resizeEditor);
  },
  beforeUnmount() {
    this.destroyEditor();
  },
  methods: {
    // 初始化编辑器
    initEditor() {
      const options = {
        ...this.defaultOptions,
        ...this.options,
        value: this.value || "",
        language: this.language,
        theme: this.theme,
      };

      this.editor = monaco.editor.create(this.$refs.editorContainer, options);
      this.listenEditorValue();

      // 初始化完成后立即触发一次布局更新
      this.$nextTick(() => {
        this.resizeEditor();
      });
    },
    // 监听编辑器值变化
    listenEditorValue() {
      this.rawEditor().focus();
      this.rawEditor().onDidChangeModelContent(() => {
        this.value = this.getEditorValue();
        this.$emit("update:modelValue", this.value);
        this.$emit("change", this.value);
      });
    },
    // 处理窗口大小变化
    resizeEditor() {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = setTimeout(() => {
        this.rawEditor().layout();
      }, 50);
    },
    // 销毁编辑器
    destroyEditor() {
      if (this.editor) {
        window.removeEventListener("resize", this.resizeEditor);
        this.rawEditor().dispose();
        this.editor = null;
      }
    },
    // 获取原始编辑器实例
    rawEditor() {
      return toRaw(this.editor);
    },
    // 获取编辑器实例
    getEditor() {
      return this.editor;
    },
    // 设置编辑器内容
    setValue(value) {
      if (this.editor) {
        this.editor.setValue(value || "");
      }
    },
    // 获取编辑器内容
    getValue() {
      return this.editor ? this.editor.getValue() : "";
    },
    // 获取编辑器内容
    getEditorValue() {
      return this.rawEditor().getValue();
    },
    // 聚焦编辑器
    focus() {
      if (this.editor) {
        this.editor.focus();
      }
    },
  },
};
</script>

<style scoped>
.code-editor {
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  overflow: hidden;
}

.editor-container {
  width: 100%;
  height: 100%;
}
</style>
