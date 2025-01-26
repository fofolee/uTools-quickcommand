export const fileCommands = {
  label: "文件操作",
  icon: "folder_open",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.file.operation",
      label: "文件/文件夹操作",
      component: "FileOperationEditor",
      asyncMode: "await",
      outputs: {
        label: "文件/文件夹操作结果",
        suggestName: "fileOperationResult",
      },
    },
    {
      value: "utools.shellOpenItem",
      label: "默认程序打开",
      neverHasOutput: true,
      config: [
        {
          label: "文件、文件夹或软件的绝对路径",
          component: "VariableInput",
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
      neverHasOutput: true,
      config: [
        {
          label: "文件、文件夹或软件的绝对路径",
          component: "VariableInput",
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
          label: "文件或软件的绝对路径",
          component: "VariableInput",
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
      outputs: {
        label: "文件图标",
        suggestName: "fileIcon",
      },
    },
    {
      value: "quickcomposer.file.archive",
      label: "文件归档",
      icon: "archive",
      asyncMode: "await",
      config: [
        {
          label: "操作类型",
          component: "QSelect",
          icon: "settings",
          width: 6,
          defaultValue: "compress",
          options: [
            { label: "压缩", value: "compress" },
            { label: "解压", value: "extract" },
          ],
        },
        {
          label: "归档格式",
          component: "QSelect",
          icon: "format_shapes",
          width: 6,
          defaultValue: "zip",
          options: [
            { label: "ZIP", value: "zip" },
            { label: "TAR", value: "tar" },
            { label: "GZIP", value: "gzip" },
          ],
        },
        {
          label: "源文件/文件夹",
          component: "VariableInput",
          icon: "folder_open",
          width: 12,
          options: {
            dialog: {
              type: "open",
              options: {
                properties: ["openFile", "openDirectory", "multiSelections"],
              },
            },
          },
        },
        {
          label: "目标路径",
          component: "VariableInput",
          icon: "save",
          width: 12,
          options: {
            dialog: {
              type: "save",
              options: {},
            },
          },
        },
      ],
    },
    {
      value: "utools.shellTrashItem",
      label: "删除文件到回收站",
      icon: "delete",
      neverHasOutput: true,
      config: [
        {
          label: "文件或文件夹的绝对路径",
          component: "VariableInput",
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
