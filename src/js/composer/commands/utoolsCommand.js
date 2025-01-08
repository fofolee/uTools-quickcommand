export const utoolsCommands = {
  label: "uTools功能",
  icon: "insights",
  commands: [
    {
      value: "utools.hideMainWindow",
      label: "隐藏主窗口",
      desc: "隐藏主窗口",
      icon: "visibility_off",
    },
    {
      value: "quickcommand.wakeUtools",
      label: "唤醒uTools",
      desc: "唤醒uTools",
      icon: "visibility",
    },
    {
      value: "utools.setExpendHeight",
      label: "设置uTools高度",
      desc: "设置uTools高度",
      icon: "height",
      config: [
        {
          key: "height",
          label: "高度",
          type: "numInput",
          icon: "straighten",
          width: 12,
        },
      ],
    },
    {
      value: "utools.outPlugin",
      label: "退出插件",
      desc: "退出插件",
      icon: "exit_to_app",
      config: [
        {
          key: "isKill",
          type: "select",
          options: [
            { label: "杀死插件进程", value: true },
            { label: "插件隐藏到后台", value: false },
          ],
          defaultValue: false,
          icon: "logout",
        },
      ],
    },
    {
      value: "utools.isDarkColors",
      label: "是否深色模式",
      desc: "是否深色模式",
      icon: "dark_mode",
      outputVariable: "isDark",
      saveOutput: true,
    },
    {
      value: "utools.getUser",
      label: "获取用户信息",
      desc: "获取用户信息",
      icon: "person",
      outputVariable: "{avatar,nickname,type}",
      saveOutput: true,
    },
    {
      value: "utools.redirect",
      label: "转至指定插件",
      config: [
        {
          key: "pluginName",
          label: "要跳转至的插件名称",
          type: "varInput",
          icon: "alt_route",
          width: 6,
        },
        {
          key: "payload",
          label: "传递给插件的文本",
          type: "varInput",
          icon: "alt_route",
          width: 6,
        },
      ],
    },
  ],
};
