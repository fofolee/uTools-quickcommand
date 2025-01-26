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
      outputs: {
        label: "数据值",
        suggestName: "userDataValue",
        typeName: "字符串",
      },
    },
    {
      value: "quickcommand.userData.all",
      label: "获取所有用户数据",
      icon: "database",
      outputs: {
        label: "所有用户数据",
        suggestName: "allUserData",
        structure: [
          {
            id: { label: "数据标识", suggestName: "userDataId" },
            isNative: { label: "是否是本地数据", suggestName: "isNativeData" },
            value: { label: "数据值", suggestName: "userDataValue" },
          },
        ],
      },
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
      outputs: {
        label: "是否成功",
        suggestName: "isSetUserDataSuccess",
        typeName: "布尔值",
      },
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
      outputs: {
        label: "是否成功",
        suggestName: "isDelUserDataSuccess",
        typeName: "布尔值",
      },
    },
  ],
};
