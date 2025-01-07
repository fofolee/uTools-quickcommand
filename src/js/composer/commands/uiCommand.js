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
            {
              value: "是",
              isString: true,
              __varInputVal__: true,
            },
            {
              value: "否",
              isString: true,
              __varInputVal__: true,
            },
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
              label: {
                value: "请输入",
                isString: true,
                __varInputVal__: true,
              },
              value: {
                value: "",
                isString: true,
                __varInputVal__: true,
              },
            },
          ],
        },
      ],
    },
  ],
};
