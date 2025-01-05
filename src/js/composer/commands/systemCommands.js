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
      component: "SystemCommandEditor",
      icon: "terminal",
      isAsync: true,
    },
    {
      value: "quickcomposer.system.os",
      label: "系统信息",
      desc: "获取操作系统相关信息",
      component: "OsEditor",
      icon: "computer",
      isAsync: true,
    },
    {
      value: "quickcomposer.system.path",
      label: "路径操作",
      desc: "路径操作",
      component: "PathEditor",
      icon: "folder_path",
      isAsync: true,
    },
  ],
};
