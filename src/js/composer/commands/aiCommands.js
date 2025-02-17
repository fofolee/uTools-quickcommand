import { newVarInputVal } from "js/composer/varInputValManager";

export const aiCommands = {
  label: "AI操作",
  icon: "smart_toy",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.ai.getModels",
      label: "获取可用模型",
      desc: "获取API支持的模型列表",
      asyncMode: "await",
      icon: "list",
      showLoading: true,
      config: [
        {
          label: "API配置",
          component: "OptionEditor",
          icon: "settings",
          width: 12,
          options: {
            modelType: {
              component: "ButtonGroup",
              width: 12,
              height: "26px",
              options: [
                { label: "OpenAI", value: "openai" },
                { label: "Ollama", value: "ollama" },
              ],
            },
            apiUrl: {
              label: "API地址",
              component: "VariableInput",
              icon: "link",
              width: 12,
              placeholder: "输入API地址",
            },
            apiToken: {
              label: "API令牌",
              component: "VariableInput",
              icon: "key",
              width: 12,
              placeholder: "ollama 则留空",
            },
          },
          defaultValue: {
            modelType: "openai",
            apiUrl: newVarInputVal("str", "https://api.openai.com/v1/models"),
          },
        },
      ],
      outputs: {
        label: "获取模型列表结果",
        suggestName: "modelListResult",
        structure: {
          success: {
            label: "是否成功",
            suggestName: "isSuccess",
          },
          result: {
            label: "模型列表",
            suggestName: "modelList",
          },
          error: {
            label: "错误信息",
            suggestName: "resultErrorInfo",
          },
        },
      },
    },
    {
      value: "quickcomposer.ai.chat",
      label: "AI对话",
      desc: "与AI助手进行对话",
      asyncMode: "await",
      icon: "chat",
      showLoading: true,
      config: [
        {
          label: "API配置",
          component: "OptionEditor",
          icon: "settings",
          width: 12,
          options: {
            modelType: {
              component: "ButtonGroup",
              width: 12,
              height: "26px",
              options: [
                { label: "OpenAI", value: "openai" },
                { label: "Ollama", value: "ollama" },
              ],
            },
            apiUrl: {
              label: "API地址",
              component: "VariableInput",
              icon: "link",
              width: 12,
              placeholder: "输入API地址",
            },
            apiToken: {
              label: "API令牌",
              component: "VariableInput",
              icon: "key",
              width: 6,
              placeholder: "ollama 则留空",
            },
            model: {
              label: "模型名称",
              component: "VariableInput",
              icon: "smart_toy",
              width: 6,
              placeholder: "如 gpt-3.5-turbo",
            },
          },
          defaultValue: {
            modelType: "openai",
            apiUrl: newVarInputVal(
              "str",
              "https://api.openai.com/v1/chat/completions"
            ),
            model: newVarInputVal("str", "gpt-3.5-turbo"),
          },
        },
        {
          label: "对话内容",
          component: "OptionEditor",
          icon: "chat",
          width: 12,
          options: {
            presetPrompt: {
              component: "ButtonGroup",
              width: 12,
              height: "26px",
              options: [
                { label: "自由对话", value: "" },
                { label: "翻译", value: "translate" },
                { label: "总结", value: "summarize" },
                { label: "生成SHELL命令", value: "shell" },
              ],
            },
            prompt: {
              label: "提示词",
              component: "VariableInput",
              icon: "edit",
              width: 12,
              placeholder: "输入要询问AI的内容",
            },
          },
          defaultValue: {
            presetPrompt: "",
          },
        },
      ],
      outputs: {
        label: "AI响应",
        suggestName: "aiResponse",
        structure: {
          success: {
            label: "是否成功",
            suggestName: "isAiResponseSuccess",
          },
          result: {
            label: "响应内容",
            suggestName: "aiResponseContent",
          },
          error: {
            label: "错误信息",
            suggestName: "aiResponseError",
          },
        },
      },
    },
  ],
};
