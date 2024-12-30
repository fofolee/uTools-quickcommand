export const notifyCommands = {
  label: "消息通知",
  icon: "notifications",
  defaultOpened: false,
  commands: [
    {
      value: "console.log",
      label: "打印消息",
      config: [
        {
          key: "message",
          label: "要打印的消息文本",
          type: "input",
          defaultValue: "",
          icon: "info",
        },
      ],
    },
    {
      value: "message",
      label: "发送系统消息",
      config: [
        {
          key: "message",
          label: "要发送的系统消息文本",
          type: "input",
          defaultValue: "",
          icon: "message",
        },
      ],
    },
    {
      value: "send",
      label: "发送文本到活动窗口",
      config: [
        {
          key: "text",
          label: "要发送到窗口的文本内容",
          type: "input",
          defaultValue: "",
          icon: "send",
        },
      ],
    },
  ],
};
