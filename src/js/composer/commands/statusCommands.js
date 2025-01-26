export const statusCommands = {
  label: "获取状态",
  icon: "task",
  commands: [
    {
      value: "utools.readCurrentFolderPath",
      label: "获取当前文件管理器路径",
      icon: "folder",
      asyncMode: "await",
      outputs: {
        label: "当前文件管理器路径",
        suggestName: "currentFolderPath",
        typeName: "字符串",
      },
    },
    {
      value: "utools.readCurrentBrowserUrl",
      label: "获取当前浏览器地址",
      icon: "language",
      asyncMode: "await",
      outputs: {
        label: "当前浏览器地址",
        suggestName: "currentBrowserUrl",
        typeName: "字符串",
      },
    },
    {
      value: "quickcomposer.status.getSelectedText",
      label: "获取选中文本",
      icon: "text_fields",
      asyncMode: "await",
      outputs: {
        label: "选中文本",
        suggestName: "selectedText",
        typeName: "字符串",
      },
    },
    {
      value: "quickcomposer.status.getSelectedImage",
      label: "获取选中的图片",
      icon: "image",
      asyncMode: "await",
      outputs: {
        label: "选中图片DataUrl",
        suggestName: "selectedImageDataUrl",
        typeName: "字符串",
      },
    },
    {
      value: "quickcomposer.status.getSelectedFiles",
      label: "获取选中的文件",
      icon: "file_present",
      asyncMode: "await",
      outputs: {
        label: "选中的文件列表",
        suggestName: "selectedFiles",
        structure: [
          {
            isFile: { label: "是否是文件", suggestName: "isSelectedFile" },
            isDirectory: { label: "是否是目录", suggestName: "isSelectedDirectory" },
            name: { label: "文件名", suggestName: "selectedFileName" },
            path: { label: "文件路径", suggestName: "selectedFilePath" },
          },
        ],
      },
    },
  ],
};
