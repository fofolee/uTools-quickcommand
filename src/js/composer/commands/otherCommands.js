export const otherCommands = {
  label: "其他功能",
  icon: "more_horiz",
  defaultOpened: false,
  commands: [
    {
      value: "utools.redirect",
      label: "转至指定插件",
      config: [
        {
          key: "pluginName",
          label: "要跳转至的插件名称",
          type: "input",
          defaultValue: "",
          icon: "alt_route",
        },
      ],
    },
    {
      value: "quickcommand.sleep",
      label: "添加延时",
      config: [
        {
          key: "ms",
          label: "延迟的毫秒数",
          type: "input",
          inputType: "number",
          defaultValue: "",
          icon: "schedule",
        },
      ],
    },
  ],
};
