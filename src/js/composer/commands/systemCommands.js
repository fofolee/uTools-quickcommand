export const systemCommands = {
  label: "系统操作",
  icon: "computer",
  defaultOpened: false,
  commands: [
    {
      value: "copyTo",
      label: "将内容写入剪贴板",
      config: [
        {
          key: "content",
          label: "要写入剪切板的内容",
          type: "varInput",
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
    {
      value: "quickcomposer.system.exec",
      label: "执行系统命令",
      desc: "执行系统命令并返回输出结果",
      config: [],
      component: "SystemCommandEditor",
      icon: "terminal",
    },
  ],
};
