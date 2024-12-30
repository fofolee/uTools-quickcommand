export const fileCommands = {
  label: "文件操作",
  icon: "folder",
  commands: [
    {
      value: "open",
      label: "打开文件/文件夹/软件",
      config: [
        {
          key: "path",
          label: "文件、文件夹或软件的绝对路径",
          type: "input",
          defaultValue: "",
          icon: "folder_open",
        },
      ],
    },
    {
      value: "locate",
      label: "在文件管理器中定位文件",
      config: [
        {
          key: "path",
          label: "文件、文件夹或软件的绝对路径",
          type: "input",
          defaultValue: "",
          icon: "location_on",
        },
      ],
    },
  ],
};
