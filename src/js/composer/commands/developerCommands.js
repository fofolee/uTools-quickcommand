export const developerCommands = {
  label: "开发相关",
  icon: "code",
  defaultOpened: true,
  commands: [
    {
      value: "quickcomposer.developer.buffer",
      label: "Buffer操作",
      desc: "Buffer创建、转换和操作",
      component: "BufferEditor",
      icon: "memory",
    },
  ],
};
