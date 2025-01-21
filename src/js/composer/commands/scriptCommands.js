export const scriptCommands = {
  label: "编程相关",
  icon: "integration_instructions",
  commands: [
    {
      value: "",
      label: "赋值",
      icon: "script",
      outputVariable: "value",
      saveOutput: true,
      config: [
        {
          label: "值或表达式",
          component: "VariableInput",
          width: 12,
        },
      ],
    },
    {
      value: "injectJs",
      label: "注入JS脚本",
      icon: "script",
      neverHasOutput: true,
      isExpression: true,
      config: [
        {
          label: "JS脚本",
          component: "CodeEditor",
          width: 12,
        },
      ],
    },
    {
      value: "quickcommand.runCode",
      label: "执行代码",
      icon: "script",
      outputVariable: "result",
      config: [
        {
          label: "脚本",
          component: "CodeEditor",
          width: 12,
        },
      ],
    },
    {
      value: "return",
      label: "函数返回",
      neverHasOutput: true,
      component: "ReturnEditor",
    },
  ],
};
