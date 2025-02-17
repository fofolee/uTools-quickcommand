import { newVarInputVal } from "js/composer/varInputValManager";

export const aiCommands = {
  label: "AI操作",
  icon: "smart_toy",
  defaultOpened: false,
  commands: [
    {
      value: "quickcommand.askAI",
      label: "AI问答",
      asyncMode: "await",
      icon: "chat",
      component: "AskAIEditor",
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
