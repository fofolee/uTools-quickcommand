export const fileCommands = {
  label: "文件操作",
  icon: "folder",
  defaultOpened: true,
  commands: [
    {
      value: "quickcomposer.file.operation",
      label: "文件/文件夹操作",
      component: "FileOperationEditor",
      desc: "文件和文件夹的读写、删除、重命名等操作",
      isAsync: true,
    },
    {
      value: "utools.shellOpenItem",
      label: "默认程序打开",
      config: [
        {
          key: "path",
          label: "文件、文件夹或软件的绝对路径",
          type: "varInput",
          icon: "folder_open",
        },
      ],
    },
    {
      value: "utools.shellShowItemInFolder",
      label: "文件管理器中显示",
      config: [
        {
          key: "path",
          label: "文件、文件夹或软件的绝对路径",
          type: "varInput",
          icon: "location_on",
        },
      ],
    },
    {
      value: "utools.getFileIcon",
      label: "获取文件图标",
      config: [
        {
          key: "path",
          label: "文件或软件的绝对路径",
          type: "varInput",
          icon: "folder_open",
        },
      ],
    },
    {
      value: "quickcomposer.file.zlib",
      label: "压缩解压",
      desc: "使用 zlib 进行数据压缩和解压",
      component: "ZlibEditor",
      icon: "compress",
      isAsync: true,
    },
  ],
};
