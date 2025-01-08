export const notifyCommands = {
  label: "消息通知",
  icon: "chat_bubble_outline",
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
