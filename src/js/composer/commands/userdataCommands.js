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
          component: "q-input",
        },
      ],
      outputVariable: "userData",
      saveOutput: true,
    },
    {
      value: "quickcommand.userData.all",
      label: "获取所有用户数据",
      icon: "database",
      outputVariable: "userDatas",
      saveOutput: true,
    },
    {
      value: "quickcommand.userData.put",
      label: "设置用户数据",
      icon: "database",
      config: [
        {
          label: "数据",
          component: "VariableInput",
          width: 7,
        },
        {
          label: "数据标识",
          component: "q-input",
          width: 3,
        },
        {
          label: "不同步",
          component: "q-checkbox",
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
          component: "q-input",
        },
      ],
    },
  ],
};
