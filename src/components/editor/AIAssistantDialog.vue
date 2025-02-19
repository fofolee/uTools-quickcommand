<template>
  <q-card class="ai-dialog">
    <div class="header q-px-md q-py-sm">
      <q-icon name="smart_toy" size="24px" />
      <div class="text-h6">AI 助手</div>
      <AISelector v-model="selectedApi" />
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup size="md" />
    </div>

    <!-- 聊天记录区域 -->
    <q-scroll-area
      ref="scrollArea"
      class="chat-container"
      :vertical-thumb-style="{
        width: '5px',
      }"
    >
      <div class="chat-history q-px-md">
        <div
          v-for="(message, index) in chatHistory"
          :key="index"
          class="chat-message-wrapper"
        >
          <div :class="['chat-message', message.role]">
            <div class="avatar">
              <q-avatar size="28px">
                <q-icon
                  :name="message.role === 'user' ? 'person' : 'smart_toy'"
                  :color="message.role === 'user' ? 'white' : 'primary'"
                  size="20px"
                />
              </q-avatar>
            </div>
            <div class="message-bubble">
              <div
                v-if="message.role === 'assistant'"
                class="message-content markdown"
                v-html="getTrimContent(message.content)"
              />
              <div v-else class="message-content" v-text="message.content" />
            </div>
          </div>
        </div>
      </div>
    </q-scroll-area>

    <!-- 输入区域 -->
    <div class="input-container q-px-md q-py-sm">
      <q-input
        v-model="prompt"
        type="textarea"
        filled
        dense
        autogrow
        autofocus
        :max-rows="3"
        placeholder="请描述你的需求，Enter 发送，Shift+Enter 换行"
        @keydown.enter.exact.prevent="handleSubmit"
        @keydown.shift.enter.prevent="prompt += '\n'"
      >
        <template v-slot:append>
          <div class="row items-center q-gutter-x-md">
            <q-btn
              flat
              icon="delete_sweep"
              size="sm"
              dense
              :disable="chatHistory.length === 0"
              @click="clearHistory"
            >
              <q-tooltip>清空对话</q-tooltip>
            </q-btn>
            <q-btn
              @click="autoUpdateCode = !autoUpdateCode"
              :color="autoUpdateCode ? 'primary' : 'grey'"
              icon="auto_fix_high"
              size="sm"
              dense
              flat
            >
              <q-tooltip>
                {{
                  autoUpdateCode
                    ? "自动更新代码(已开启)"
                    : "自动更新代码(已关闭)"
                }}
              </q-tooltip>
            </q-btn>
            <q-btn
              :color="streamingResponse ? 'negative' : 'primary'"
              :icon="streamingResponse ? 'stop' : 'send'"
              size="sm"
              dense
              flat
              @click="handleSubmit"
            />
          </div>
        </template>
      </q-input>
    </div>
  </q-card>
</template>

<script>
import { defineComponent } from "vue";
import AISelector from "components/ai/AISelector.vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

const quickcommandApi =
  require(`!raw-loader!plugins/monaco/types/quickcommand.api.d.ts`)
    .default.replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\n/g, "");
const uToolsApi = require(`!raw-loader!plugins/monaco/types/utools.api.d.ts`)
  .default.replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\n/g, "");

export default defineComponent({
  name: "AIAssistantDialog",
  components: {
    AISelector,
  },
  data() {
    return {
      prompt: "",
      selectedApi: {},
      streamingResponse: false,
      chatHistory: [],
      currentRequest: null,
      autoUpdateCode: true,
      scrollToBottomDebounce: null,
    };
  },
  props: {
    code: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "",
    },
  },
  emits: ["update-code"],
  methods: {
    scrollToBottom() {
      // 清除之前的定时器
      if (this.scrollToBottomDebounce) {
        clearTimeout(this.scrollToBottomDebounce);
      }

      // 设置新的定时器，延迟执行滚动
      this.scrollToBottomDebounce = setTimeout(() => {
        const scrollArea = this.$refs.scrollArea;
        if (scrollArea) {
          const scrollTarget = scrollArea.getScrollTarget();
          scrollArea.setScrollPosition(
            "vertical",
            scrollTarget.scrollHeight,
            300
          );
        }
      }, 100);
    },
    async handleSubmit() {
      if (this.streamingResponse) {
        this.stopStreaming();
        return;
      }

      const promptText = this.prompt.trim();
      if (!promptText || !this.selectedApi) return;

      // 添加用户消息到历史记录
      this.chatHistory.push(
        {
          role: "user",
          content: promptText,
        },
        {
          role: "assistant",
          content: "",
        }
      );

      // 添加消息后立即滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });

      this.streamingResponse = true;
      this.prompt = ""; // 清空输入框

      try {
        const response = await window.quickcommand.askAI(
          {
            prompt: promptText,
            role: this.getRolePrompt(this.language),
            context: this.chatHistory.slice(0, -2),
          },
          this.selectedApi,
          {
            showLoadingBar: false,
            stream: true,
            onStream: (text, controller, done) => {
              this.currentRequest = controller;
              if (text) {
                this.chatHistory[this.chatHistory.length - 1].content += text;
                this.$nextTick(() => {
                  this.scrollToBottom();
                });
              }

              if (done) {
                this.streamingResponse = false;
                if (this.autoUpdateCode) {
                  const response =
                    this.chatHistory[this.chatHistory.length - 1].content;
                  const code = response.match(
                    /```[a-z]*\n([\s\S]*?)\n```/
                  )?.[1];

                  if (!code) return;

                  this.$emit("update-code", code);
                }
              }
            },
          }
        );

        if (!response.success && !response.cancelled) {
          window.quickcommand.showMessageBox(response.error, "error");
        }
      } catch (error) {
        window.quickcommand.showMessageBox(error.message, "error");
        this.streamingResponse = false;
      }
    },
    stopStreaming() {
      this.streamingResponse = false;
      if (this.currentRequest) {
        this.currentRequest.abort();
        this.currentRequest = null;
      }
    },
    clearHistory() {
      this.chatHistory = [];
    },
    getTrimContent(content) {
      const markedContent = marked(content.trim());
      // 解决think标签被错误地包裹在<p>标签中
      const processedContent = markedContent
        .replace("<p><think>", "<think><p>")
        .replace("</think></p>", "</p></think>")
        // 去除空的think标签
        .replace("<think>\n\n</think>", "");
      const purifiedContent = DOMPurify.sanitize(processedContent, {
        ADD_TAGS: ["think"],
      });
      return purifiedContent;
    },
    getRolePrompt(language) {
      const languageMap = {
        quickcommand: "NodeJS",
        javascript: "NodeJS",
      };
      const commonInstructions = `请作为一名专业的开发专家，根据我的需求编写${languageMap[language]}代码，并请遵循以下原则：
   - 编写简洁、可读性强的代码
   - 遵循${language}最佳实践和设计模式
   - 使用恰当的命名规范和代码组织
   - 添加必要的错误处理和边界检查
   - 保持中文注释的准确性和专业性
   - 提供必要的使用说明
   `;

      // 针对不同语言的特殊提示
      let languageSpecific = {
        javascript: `- 优先使用现代ES6+特性
   - 使用NodeJS原生API和模块`,
        python: `- 遵循PEP8规范`,
      };
      languageSpecific.quickcommand = `${languageSpecific.javascript}
    - 支持使用以下uTools接口： ${uToolsApi}
    - 支持使用以下quickcommand接口： ${quickcommandApi}`;

      // 获取语言特定的提示，如果没有则使用空字符串
      const specificInstructions =
        languageSpecific[language.toLowerCase()] || "";

      const lastInstructions =
        "\n请直接生成代码，任何情况下都不需要做解释和说明";

      return commonInstructions + specificInstructions + lastInstructions;
    },
  },
});
</script>

<style scoped>
.ai-dialog {
  width: 800px;
  max-width: 90vw;
  height: 80vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-container {
  flex: 1 1 auto;
}

.chat-message-wrapper {
  margin-bottom: 1rem;
  animation: fadeIn 0.3s ease-in-out;
}

.chat-message {
  display: flex;
  gap: 8px;
  max-width: 85%;
}

.chat-message.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.chat-message .avatar {
  background: var(--q-primary);
  border-radius: 50%;
  padding: 2px;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-message.assistant .avatar {
  background: var(--transparent-bg-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chat-message.user .avatar {
  background: var(--q-primary);
}

.message-bubble {
  padding: 8px 12px;
  border-radius: 12px;
  position: relative;
}

.message-content :deep(think) {
  color: #8b8b8b;
  display: block;
  border-left: 4px solid #8b8b8b;
  padding-left: 10px;
  margin-bottom: 8px;
  font-size: 12px;
}

.chat-message.user .message-bubble {
  background-color: var(--q-primary);
  color: white;
  border-top-right-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.chat-message.assistant .message-bubble {
  background-color: var(--transparent-bg-color);
  border-top-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-content {
  font-size: 13px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 暗色模式适配 */
.body--dark .chat-message.assistant .message-bubble {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>
