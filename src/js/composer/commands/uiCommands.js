import { newVarInputVal } from "js/composer/varInputValManager";

export const uiCommands = {
  label: "用户交互",
  icon: "web",
  defaultOpened: false,
  commands: [
    {
      value: "quickcommand.showButtonBox",
      label: "按钮组",
      isAsync: true,
      outputVariable: "{id,text}",
      saveOutput: true,
      config: [
        {
          label: "按钮组",
          type: "arrayEditor",
          defaultValue: [
            newVarInputVal("str", "是"),
            newVarInputVal("str", "否"),
          ],
        },
      ],
    },
    {
      value: "quickcommand.showInputBox",
      label: "输入框",
      isAsync: true,
      outputVariable: "[inputValue1]",
      saveOutput: true,
      config: [
        {
          label: "输入框",
          type: "arrayEditor",
          width: 12,
          options: {
            keys: [
              {
                label: "标签",
                value: "label",
              },
              {
                label: "默认值",
                value: "value",
              },
            ],
          },
          defaultValue: [
            {
              label: newVarInputVal("str", "请输入"),
              value: newVarInputVal("str"),
            },
          ],
        },
        {
          label: "标题",
          type: "varInput",
          defaultValue: newVarInputVal("str", "请选择"),
          width: 12,
        },
      ],
    },
    {
      value: "quickcommand.showSelectList",
      label: "选择列表",
      desc: "显示一个支持搜索的选项列表，可以动态更新选项",
      component: "SelectListEditor",
      isAsync: true,
    },
    {
      value: "quickcommand.showTextArea",
      label: "文本框",
      desc: "显示一个文本框，可以输入多行文本",
      isAsync: true,
      outputVariable: "textareaValue",
      saveOutput: true,
      config: [
        {
          label: "文本框占位符",
          type: "varInput",
          defaultValue: newVarInputVal("str", "请输入"),
          width: 6,
        },
        {
          label: "文本框默认值",
          type: "varInput",
          defaultValue: newVarInputVal("str"),
          width: 6,
        },
      ],
    },
    {
      value: "quickcommand.showMessageBox",
      label: "消息提示",
      desc: "显示一个自动消失的提示框",
      isAsync: true,
      config: [
        {
          label: "提示内容",
          type: "varInput",
          icon: "info",
          defaultValue: newVarInputVal("str", "这是一条提示消息"),
          width: 12,
        },
        {
          label: "图标类型",
          type: "select",
          defaultValue: "success",
          icon: "lightbulb",
          width: 6,
          options: [
            { label: "成功", value: "success" },
            { label: "错误", value: "error" },
            { label: "警告", value: "warning" },
            { label: "信息", value: "info" },
          ],
        },
        {
          label: "显示时间(ms)",
          type: "numInput",
          width: 6,
          placeholder: "0为手动关闭，留空按文本长度调整",
        },
      ],
    },
    {
      value: "quickcommand.showConfirmBox",
      label: "确认框",
      desc: "显示一个确认框，返回是否点击了确认",
      isAsync: true,
      outputVariable: "confirmed",
      saveOutput: true,
      config: [
        {
          label: "提示内容",
          type: "varInput",
          defaultValue: newVarInputVal("str", "确认要执行此操作吗？"),
          width: 12,
        },
        {
          label: "标题",
          type: "varInput",
          defaultValue: newVarInputVal("str", "提示"),
          width: 7,
        },
        {
          label: "支持HTML",
          type: "switch",
          defaultValue: false,
          width: 2,
        },
        {
          label: "宽度",
          type: "numInput",
          defaultValue: 450,
          width: 3,
          placeholder: "对话框宽度",
        },
      ],
    },
  ],
};
