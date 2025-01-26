export const otherCommands = {
  label: "其他功能",
  icon: "more_horiz",
  defaultOpened: false,
  commands: [
    {
      value: "quickcommand.asyncSleep",
      label: "添加延时",
      asyncMode: "await",
      config: [
        {
          label: "延迟的毫秒数",
          component: "NumberInput",
          min: 0,
          step: 100,
          icon: "schedule",
          defaultValue: 500,
        },
      ],
    },
  ],
};
