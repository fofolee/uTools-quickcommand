<template>
  <q-scroll-area
    ref="scrollArea"
    class="chat-container"
    :vertical-thumb-style="{
      width: '5px',
    }"
    :horizontal-thumb-style="{
      height: '5px',
    }"
  >
    <div class="chat-history">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="chat-message-wrapper"
      >
        <div :class="['chat-message', message.role]">
          <div class="message-bubble">
            <div
              v-if="message.role === 'assistant' && renderMd"
              class="message-content markdown"
              v-html="getAssistantMsg(message.content)"
            />
            <div
              v-else-if="message.role === 'assistant' && !renderMd"
              class="message-content pre-text"
              v-text="message.content"
            />
            <div
              v-else
              class="message-content pre-text"
              v-text="getUserMsg(message.content)"
            />
          </div>
        </div>
      </div>
    </div>
  </q-scroll-area>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "AIChatHistory",
  props: {
    messages: {
      type: Array,
      default: () => [],
    },
    renderMd: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update-code"],
  data() {
    return {
      timeoutId: null,
    };
  },
  methods: {
    debounce(fn) {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      this.timeoutId = setTimeout(fn, 500);
    },

    scrollToBottom() {
      const scrollArea = this.$refs.scrollArea;
      if (scrollArea) {
        const scrollTarget = scrollArea.getScrollTarget();
        scrollArea.setScrollPosition(
          "vertical",
          scrollTarget.scrollHeight,
          300
        );
      }
    },

    getAssistantMsg(content) {
      return window.aiResponseParser(content);
    },

    getUserMsg(content) {
      content = content.replace(
        /这是当前代码：\n-----代码开始-----([\s\S]*?)-----代码结束-----\n/g,
        "这是当前代码：(代码已隐藏)\n"
      );
      return content;
    },

    setupMessageActions() {
      const codeBlocks = document.querySelectorAll(".message-content pre code");
      codeBlocks.forEach((codeBlock) => {
        if (codeBlock.querySelector(".code-actions")) return;

        const actionGroup = document.createElement("div");
        actionGroup.className = "code-actions";

        const copyBtn = document.createElement("button");
        copyBtn.innerHTML = '<i class="material-icons">content_copy</i>';
        copyBtn.title = "复制代码";
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(codeBlock.textContent);
          window.quickcommand.showNotification("代码已复制到剪贴板");
        };

        const insertBtn = document.createElement("button");
        insertBtn.innerHTML = '<i class="material-icons">read_more</i>';
        insertBtn.title = "插入到光标位置";
        insertBtn.onclick = () => {
          this.$emit("update-code", "insert", codeBlock.textContent);
        };

        const applyBtn = document.createElement("button");
        applyBtn.innerHTML = '<i class="material-icons">done_all</i>';
        applyBtn.title = "替换当前代码";
        applyBtn.onclick = () => {
          this.$emit("update-code", "replace", codeBlock.textContent);
        };

        actionGroup.appendChild(copyBtn);
        actionGroup.appendChild(insertBtn);
        actionGroup.appendChild(applyBtn);
        codeBlock.parentNode.appendChild(actionGroup);
      });

      const links = document.querySelectorAll(".message-content a");
      links.forEach((link) => {
        if (link.hasAttribute("data-processed")) return;

        const href = link.getAttribute("href");
        if (href) {
          link.onclick = (e) => {
            e.preventDefault();
            window.utools.shellOpenExternal(href);
          };
          link.setAttribute("data-processed", "true");
        }
      });
    },

    updateView() {
      this.scrollToBottom();
      this.debounce(this.setupMessageActions);
    },
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.updateView();
        });
      },
      deep: true,
    },
  },
  beforeUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  },
});
</script>

<style scoped>
.chat-container {
  flex: 1;
  overflow: hidden;
}

.chat-container :deep(.q-scrollarea__content) {
  width: 100%;
}

.chat-history {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-message-wrapper {
  padding: 4px;
  border-bottom: 1px solid var(--border-color);
}

.chat-message {
  display: block;
  max-width: 100%;
}

.chat-message.user {
  margin-left: 0;
  flex-direction: column;
}

.chat-message.user .message-bubble {
  color: var(--q-primary);
}

.message-content {
  font-size: 12px;
  line-height: 1.5;
}

.message-content.pre-text {
  word-break: break-all;
  white-space: pre-wrap;
}

/* 代码块样式优化 */
.message-content :deep(pre) {
  margin: 4px 0;
  border-radius: 4px;
  padding: 4px 8px;
  max-width: 100%;
  overflow-x: auto;
  position: relative;
}

.message-content :deep(pre::-webkit-scrollbar) {
  height: 3px; /* 与 markdown.css 保持一致 */
}

.message-content :deep(code) {
  font-size: 12px;
  white-space: pre;
}

/* 代码块按钮样式 */
.message-content :deep(.code-actions) {
  position: absolute;
  top: 2px;
  right: 2px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  padding: 2px;
  border-radius: 4px;
}

.message-content :deep(pre:hover .code-actions) {
  opacity: 1;
}

.message-content :deep(.code-actions button) {
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--q-primary);
  background-color: var(--utools-bg-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.message-content :deep(.code-actions button:hover) {
  filter: brightness(0.9);
}

.message-content :deep(.code-actions button i) {
  font-size: 14px;
}

/* 链接样式 */
.message-content :deep(a) {
  color: var(--q-primary);
  text-decoration: none;
}

.message-content :deep(a:hover) {
  text-decoration: underline;
}

.message-content :deep(think) {
  display: block;
  color: #8b8b8b;
  display: block;
  border-left: 4px solid #8b8b8b;
  padding-left: 10px;
  font-size: 12px;
  margin-bottom: 5px;
}
</style>
