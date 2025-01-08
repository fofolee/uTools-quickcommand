export const otherCommands = {
  label: "其他功能",
  icon: "more_horiz",
  defaultOpened: false,
  commands: [
    {
      value: "quickcommand.sleep",
      label: "添加延时",
      config: [
        {
          key: "ms",
          label: "延迟的毫秒数",
          type: "numInput",
          icon: "schedule",
          defaultValue: 500,
        },
      ],
    },
  ],
};
