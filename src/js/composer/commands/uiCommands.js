import { newVarInputVal } from "js/composer/varInputValManager";

export const uiCommands = {
  label: "UI操作",
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
      ],
    },
    {
      value: "quickcommand.showSelectList",
      label: "选择列表",
      desc: "显示一个支持搜索的选项列表，可以动态更新选项",
      component: "SelectListEditor",
      isAsync: true,
    },
  ],
};
