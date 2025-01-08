export const notifyCommands = {
  label: "输出消息",
  icon: "output",
  defaultOpened: false,
  commands: [
    {
      value: "console.log",
      label: "显示消息",
      config: [
        {
          key: "log",
          label: "要打印的消息文本",
          type: "varInput",
          icon: "info",
        },
      ],
    },
    {
      value: "utools.showNotification",
      label: "发送系统消息",
      config: [
        {
          key: "notification",
          label: "要发送的系统消息文本",
          type: "varInput",
          icon: "message",
        },
      ],
    },
  ],
};
