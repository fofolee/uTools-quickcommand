export const scriptCommands = {
  label: "编程相关",
  icon: "integration_instructions",
  commands: [
    {
      value: "injectJs",
      label: "注入JS代码",
      icon: "script",
      neverHasOutput: true,
      isExpression: true,
      config: [
        {
          label: "JS脚本",
          component: "CodeEditor",
          language: "quickcommand",
          placeholder:
            "共享当前上下文，支持utools，quickcommand，quickcomposer等接口",
          width: 12,
        },
      ],
    },
    {
      value: "quickcommand.runCode",
      label: "运行脚本",
      component: "ScriptEditor",
      desc: "运行各种编程语言的代码",
      asyncMode: "await",
      outputs: {
        label: "运行结果",
        suggestName: "runScriptResult",
        typeName: "字符串",
      },
    },
    {
      value: "return",
      label: "函数返回",
      neverHasOutput: true,
      component: "ReturnEditor",
    },
  ],
};
