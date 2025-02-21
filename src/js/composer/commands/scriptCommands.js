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
      description: "运行各种编程语言的代码，需要预安装对应的执行环境",
      asyncMode: "await",
      outputs: {
        label: "运行结果",
        suggestName: "runScriptResult",
        typeName: "字符串",
      },
    },
    {
      value: "createCodeSnippet",
      label: "新建代码片段",
      component: "ScriptEditor",
      description: "单纯将代码片段赋值到变量中，不会执行",
      outputs: {
        label: "代码片段",
        suggestName: "codeSnippet",
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
