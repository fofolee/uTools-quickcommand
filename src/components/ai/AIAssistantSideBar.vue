<template>
  <q-card class="ai-assistant">
    <div class="header">
      <div class="row items-center q-gutter-x-xs no-wrap">
        <q-icon name="smart_toy" size="20px" />
        <div class="text-subtitle1">AI 助手</div>
        <q-icon
          name="help"
          size="12px"
          @click="openAIAssistantHelp"
          class="cursor-pointer"
        />
        <AISelector v-model="selectedApi" :dense="true" />
      </div>
      <q-btn icon="close" size="sm" flat dense @click.stop="$emit('close')" />
    </div>

    <!-- 聊天记录区域 -->
    <AIChatHistory
      :messages="chatHistory"
      @update-code="(...event) => $emit('update-code', ...event)"
      :render-md="renderMd"
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
          :placeholder="`请描述需求，AI 将生成 ${language} 代码`"
          @keydown.enter.exact.prevent="handleSubmit"
          @keydown.shift.enter.prevent="prompt += '\n'"
        />
      </div>
      <div class="row items-center justify-between q-gutter-x-xs">
        <div class="row items-center q-gutter-x-xs">
          <q-btn
            flat
            dense
            size="sm"
            icon="html"
            :color="renderMd ? 'primary' : 'grey'"
            @click="renderMd = !renderMd"
          >
            <q-tooltip>
              是否渲染md为html<br />
              状态：{{ renderMd ? "已开启" : "已关闭" }}
            </q-tooltip>
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
              将当前代码提交给AI<br />
              状态：{{ sendCode ? "已开启" : "已关闭" }}
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
              自动更新代码<br />
              状态：{{ autoUpdateCode ? "已开启" : "已关闭" }}
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="language === 'quickcommand'"
            flat
            dense
            size="sm"
            icon="receipt_long"
            :color="submitDocs ? 'primary' : 'grey'"
            @click="submitDocs = !submitDocs"
          >
            <q-tooltip>
              让AI学习uTools和QuickCommand的文档<br />
              状态：{{ submitDocs ? "已开启" : "已关闭" }}<br />
              <span style="font-weight: bolder">注意：</span><br />
              1. 开启后，AI会生成功能更贴切的代码<br />
              2. 但会大幅提升上下文长度，增加代码生成时间<br />
              3. 能力较低的模型，可能无法正确处理<br />
              4. 计费的接口，会消耗 更多token<br />
            </q-tooltip>
          </q-btn>
        </div>
        <div class="row items-center q-gutter-x-xs">
          <q-btn flat dense size="sm" icon="clear_all" @click="clearHistory">
            <q-tooltip>清空对话</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            size="sm"
            :label="streamingResponse ? '停止' : '发送'"
            :disable="!streamingResponse && !prompt"
            :color="streamingResponse ? 'negative' : 'primary'"
            :icon="streamingResponse ? 'stop' : 'send'"
            @click="handleSubmit"
          >
            <q-tooltip v-if="!streamingResponse">
              Enter 发送，Shift+Enter 换行
            </q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import { defineComponent } from "vue";
import AISelector from "components/ai/AISelector.vue";
import AIChatHistory from "components/ai/AIChatHistory.vue";

const compressApi = (api) => {
  return api
    .replace(/\/\*[\s\S]*?\*\//g, (match) => {
      // 只替换包含2个以上换行符的注释
      return match.split("\n").length > 2 ? "" : match;
    })
    .replace(/\n/g, "")
    .replace(/\s+/g, " ");
};

const quickcommandApi = compressApi(
  require(`!raw-loader!plugins/monaco/types/quickcommand.api.d.ts`).default
);
const uToolsApi = compressApi(
  require(`!raw-loader!plugins/monaco/types/utools.api.d.ts`).default
);

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
      submitDocs: true,
      renderMd: true,
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
      if (this.streamingResponse) {
        this.stopStreaming();
        return;
      }

      this.prompt = this.prompt.trim();

      if (!this.prompt || !this.selectedApi) return;

      const code = this.code
        ? `这是当前代码：\n-----代码开始-----\n${this.code}\n-----代码结束-----\n`
        : "";

      const promptText = this.sendCode ? code + this.prompt : this.prompt;

      this.sendCode = false;

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

      const presetContext = this.getPresetContext();

      try {
        const response = await window.quickcommand.askAI(
          {
            prompt: promptText,
            context: [presetContext, ...this.chatHistory.slice(0, -2)],
          },
          this.selectedApi,
          {
            showProcessBar: false,
            onFetch: (controller) => {
              this.currentRequest = controller;
            },
            onStream: (text, done) => {
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
    getLanguagePrompt(language) {
      const languageMap = {
        quickcommand: "NodeJS",
        javascript: "NodeJS",
        webjavascript: "前端JavaScript",
        cmd: "windows 批处理脚本",
        shell: "liunx shell脚本",
      };
      const languageName = languageMap[language] || language;
      const commonInstructions = `接下来所有的对话中的需求都请通过编写${languageName}代码来实现，并请遵循以下原则：
   - 编写简洁、可读性强的代码
   - 遵循${languageName}最佳实践和设计模式
   - 使用恰当的命名规范和代码组织
   - 添加必要的错误处理和边界检查
   - 保持中文注释的准确性和专业性
   `;

      // 针对不同语言的特殊提示
      let languageSpecific = {
        javascript: `- 优先使用现代ES6+特性
   - 使用NodeJS原生API和模块`,
        python: `- 遵循PEP8规范`,
      };

      languageSpecific.quickcommand = languageSpecific.javascript;

      // 获取语言特定的提示，如果没有则使用空字符串
      const specificInstructions = languageSpecific[language] || "";

      const lastInstructions =
        "\n请直接提供MARKDOWN格式的代码（以```脚本语言开头，以```结尾），任何情况下都不需要做解释和说明";

      return commonInstructions + specificInstructions + lastInstructions;
    },
    getLanguageDocs(language) {
      if (language !== "quickcommand") return [];
      return [
        {
          name: "uTools",
          api: uToolsApi,
        },
        {
          name: "quickcommand",
          api: quickcommandApi,
        },
      ];
    },
    getPresetContext() {
      let finnalPrompt = ""

      const languagePrompt = this.getLanguagePrompt(this.language);

      finnalPrompt += languagePrompt;

      if (this.submitDocs && this.language === "quickcommand") {
        const docs = this.getLanguageDocs(this.language);

        finnalPrompt += `\n你现在使用的是一种特殊的环境，支持uTools和quickcommand两种特殊的接口，请优先使用uTools和quickcommand接口解决需求，然后再使用当前语言通用的解决方案`;

        docs.forEach((doc) => {
          finnalPrompt += `\n这是${doc.name}的API文档：\n${doc.api}`;
        });
      }

      return {
        role: "system",
        content: finnalPrompt,
      };
    },
    openAIAssistantHelp() {
      window.showUb.help("#KUCwm");
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

.body--dark .ai-assistant {
  background-color: #1e1e1e;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
}

.ai-assistant .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-bottom: 1px solid #e0e0e0;
}

.body--dark .ai-assistant .header {
  border-bottom: 1px solid #333;
}

.ai-assistant .input-container {
  flex-shrink: 0;
  background: var(--utools-bg-color);
  border-radius: 4px;
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
