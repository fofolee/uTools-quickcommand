export const systemCommands = {
  label: "系统操作",
  icon: "computer",
  defaultOpened: false,
  commands: [
    {
      value: "system",
      label: "执行系统命令",
      config: [
        {
          key: "command",
          label: "要执行的命令行",
          type: "input",
          defaultValue: "",
          icon: "terminal",
        },
      ],
    },
    {
      value: "copyTo",
      label: "将内容写入剪贴板",
      config: [
        {
          key: "content",
          label: "要写入剪切板的内容",
          type: "input",
          defaultValue: "",
          icon: "content_copy",
        },
      ],
    },
    {
      value: "electron.clipboard.readText",
      label: "获取剪贴板内容",
      config: [],
      allowEmptyArgv: true,
    },
  ],
};
