<template>
  <q-card class="ai-assistant">
    <div class="row items-center justify-between q-pa-xs no-wrap">
      <div class="row items-center q-gutter-x-xs no-wrap">
        <q-icon name="smart_toy" size="20px" />
        <div class="text-subtitle1">AI 助手</div>
        <AISelector v-model="selectedApi" :dense="true" />
      </div>
      <q-btn icon="close" size="sm" flat dense @click.stop="$emit('close')" />
    </div>

    <!-- 聊天记录区域 -->
    <AIChatHistory
      :messages="chatHistory"
      @update-code="$emit('update-code', ...$event)"
    />

    <!-- 输入区域 -->
    <div class="input-container q-px-sm q-py-xs">
      <div class="prompt-input">
        <q-input
          v-model="prompt"
          type="textarea"
          borderless
          dense
          autogrow
          autofocus
          placeholder="请描述需求，Enter 发送，Shift+Enter 换行"
          @keydown.enter.exact.prevent="handleSubmit"
          @keydown.shift.enter.prevent="prompt += '\n'"
        />
      </div>
      <div class="row items-center justify-between q-gutter-x-xs">
        <div class="row items-center q-gutter-x-xs">
          <q-btn flat dense size="sm" icon="delete_sweep" @click="clearHistory">
            <q-tooltip>清空对话</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            size="sm"
            icon="code"
            :color="sendCode ? 'primary' : 'grey'"
            @click="sendCode = !sendCode"
          >
            <q-tooltip>
              {{
                sendCode
                  ? "将当前代码提交给AI(已开启)"
                  : "将当前代码提交给AI(已关闭)"
              }}
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            size="sm"
            icon="auto_fix_high"
            :color="autoUpdateCode ? 'primary' : 'grey'"
            @click="toggleAutoUpdate"
          >
            <q-tooltip>
              {{
                autoUpdateCode ? "自动更新代码(已开启)" : "自动更新代码(已关闭)"
              }}
            </q-tooltip>
          </q-btn>
        </div>
        <q-btn
          flat
          dense
          size="sm"
          :color="streamingResponse ? 'negative' : 'primary'"
          :icon="streamingResponse ? 'stop' : 'send'"
          @click="handleSubmit"
        />
      </div>
    </div>
  </q-card>
</template>

<script>
import { defineComponent } from "vue";
import AISelector from "components/ai/AISelector.vue";
import AIChatHistory from "components/ai/AIChatHistory.vue";

const quickcommandApi =
  require(`!raw-loader!plugins/monaco/types/quickcommand.api.d.ts`)
    .default.replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\n/g, "");
const uToolsApi = require(`!raw-loader!plugins/monaco/types/utools.api.d.ts`)
  .default.replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\n/g, "");

export default defineComponent({
  name: "AIAssistantSideBar",
  components: {
    AISelector,
    AIChatHistory,
  },
  data() {
    return {
      prompt: "",
      selectedApi: {},
      streamingResponse: false,
      chatHistory: [],
      currentRequest: null,
      autoUpdateCode: localStorage.getItem("ai_auto_update") !== "false",
      sendCode: false,
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
  emits: ["update-code", "close"],
  methods: {
    async handleSubmit() {
      const sendCode = this.sendCode;
      this.sendCode = false;

      if (this.streamingResponse) {
        this.stopStreaming();
        return;
      }

      const code = this.code
        ? `这是当前代码：\n-----代码开始-----\n${this.code}\n-----代码结束-----\n`
        : "";

      const promptText = sendCode
        ? code + this.prompt.trim()
        : this.prompt.trim();

      if (!promptText || !this.selectedApi) return;

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

      this.streamingResponse = true;
      this.prompt = "";

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

                  this.$emit("update-code", "replace", code);
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
      if (this.chatHistory.length === 0) return;
      this.chatHistory = [];
      localStorage.removeItem("ai_chat_history");
    },
    saveChatHistory() {
      localStorage.setItem("ai_chat_history", JSON.stringify(this.chatHistory));
    },
    loadChatHistory() {
      const history = localStorage.getItem("ai_chat_history");
      if (history) {
        try {
          this.chatHistory = JSON.parse(history);
        } catch (e) {
          console.error("Failed to parse chat history:", e);
          this.chatHistory = [];
        }
      }
    },
    toggleAutoUpdate() {
      this.autoUpdateCode = !this.autoUpdateCode;
      localStorage.setItem("ai_auto_update", this.autoUpdateCode);
    },
    getRolePrompt(language) {
      const languageMap = {
        quickcommand: "NodeJS",
        javascript: "NodeJS",
        cmd: "bat",
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
  mounted() {
    setTimeout(this.loadChatHistory);
  },
  beforeUnmount() {
    setTimeout(this.saveChatHistory);
  },
});
</script>

<style scoped>
.ai-assistant {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 5px;
}

.input-container {
  flex-shrink: 0;
  background: var(--utools-bg-color);
  border-radius: 8px;
}

.prompt-input {
  max-height: 120px;
  overflow-y: auto;
}

.prompt-input :deep(textarea) {
  font-size: 13px;
  padding: 2px 4px !important;
}
</style>
