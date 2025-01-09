export const fileCommands = {
  label: "文件操作",
  icon: "folder_open",
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
          options: {
            dialog: {
              type: "open",
              options: {},
            },
          },
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
          options: {
            dialog: {
              type: "open",
              options: {},
            },
          },
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
          options: {
            dialog: {
              type: "open",
              options: {
                filters: [{ extensions: ["exe", "app"] }],
                properties: ["openFile", "openDirectory"],
              },
            },
          },
        },
      ],
    },
    {
      value: "utools.shellTrashItem",
      label: "删除文件到回收站",
      icon: "delete",
      config: [
        {
          key: "path",
          label: "文件或文件夹的绝对路径",
          type: "varInput",
          icon: "folder_open",
          options: {
            dialog: {
              type: "open",
              options: {},
            },
          },
        },
      ],
    },
  ],
};
