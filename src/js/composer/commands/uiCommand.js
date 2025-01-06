export const uiCommands = {
  label: "UI操作",
  icon: "web",
  defaultOpened: false,
  commands: [
    {
      value: "quickcommand.showButtonBox",
      label: "按钮组弹窗",
      isAsync: true,
      outputVariable: "{id,text}",
      saveOutput: true,
      config: [
        {
          label: "按钮组",
          type: "arrayEditor",
          defaultValue: [
            {
              value: "按钮1",
              isString: true,
              __varInputVal__: true,
            },
            {
              value: "按钮2",
              isString: true,
              __varInputVal__: true,
            },
          ],
        },
      ],
    },
  ],
};
