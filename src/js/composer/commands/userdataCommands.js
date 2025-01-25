export const userdataCommands = {
  label: "用户数据",
  icon: "folder_shared",
  defaultOpened: false,
  commands: [
    {
      value: "quickcommand.userData.get",
      label: "获取用户数据",
      icon: "database",
      config: [
        {
          label: "数据标识",
          component: "QInput",
          icon: "title",
        },
      ],
    },
    {
      value: "quickcommand.userData.all",
      label: "获取所有用户数据",
      icon: "database",
    },
    {
      value: "quickcommand.userData.put",
      label: "设置用户数据",
      icon: "database",
      config: [
        {
          label: "数据",
          component: "VariableInput",
          icon: "text_fields",
          width: 7,
        },
        {
          label: "数据标识",
          component: "QInput",
          icon: "title",
          width: 3,
        },
        {
          label: "不同步",
          component: "CheckButton",
          defaultValue: true,
          width: 2,
        },
      ],
    },
    {
      value: "quickcommand.userData.del",
      label: "删除用户数据",
      icon: "database",
      config: [
        {
          label: "数据标识",
          component: "QInput",
          icon: "title",
        },
      ],
    },
  ],
};
