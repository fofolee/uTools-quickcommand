export const notifyCommands = {
  label: "输出消息",
  icon: "output",
  defaultOpened: false,
  commands: [
    {
      value: "console.log",
      label: "显示消息",
      neverHasOutput: true,
      config: [
        {
          label: "要打印的消息文本",
          component: "VariableInput",
          icon: "info",
        },
      ],
    },
    {
      value: "utools.showNotification",
      label: "发送系统消息",
      neverHasOutput: true,
      config: [
        {
          label: "要发送的系统消息文本",
          component: "VariableInput",
          icon: "message",
        },
      ],
    },
  ],
};
