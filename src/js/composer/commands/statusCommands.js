export const statusCommands = {
  label: "获取状态",
  icon: "task",
  commands: [
    {
      value: "utools.readCurrentFolderPath",
      label: "获取当前文件管理器路径",
      icon: "folder",
      isAsync: true,
    },
    {
      value: "utools.readCurrentBrowserUrl",
      label: "获取当前浏览器地址",
      icon: "language",
      isAsync: true,
    },
    {
      value: "quickcomposer.status.getSelectedText",
      label: "获取选中文本",
      icon: "text_fields",
      isAsync: true,
    },
    {
      value: "quickcomposer.status.getSelectedImage",
      label: "获取选中的图片",
      icon: "image",
      isAsync: true,
    },
    {
      value: "quickcomposer.status.getSelectedFiles",
      label: "获取选中的文件",
      icon: "file_present",
      isAsync: true,
    },
  ],
};
