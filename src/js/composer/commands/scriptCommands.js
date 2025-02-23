export const scriptCommands = {
  label: "编程相关",
  icon: "integration_instructions",
  commands: [
    {
      value: "injectJs",
      label: "注入代码",
      icon: "script",
      description: "注入的代码（js）将在流程对应的位置直接运行。",
      neverHasOutput: true,
      isExpression: true,
      config: [
        {
          component: "CodeEditor",
          language: "quickcommand",
          placeholder:
            "和当前流程共享上下文（变量、函数等），支持utools、quickcommand、quickcomposer、nodejs的接口",
          width: 12,
        },
      ],
    },
    {
      value: `((code) => {return new Function("return " + code)()})`,
      label: "eval代码",
      description: "eval代码（js），并返回结果",
      config: [
        {
          component: "CodeEditor",
          language: "quickcommand",
          placeholder:
            "和当前流程共享上下文（变量、函数等），支持utools、quickcommand、quickcomposer、nodejs的接口。",
          width: 12,
        },
      ],
      outputs: {
        label: "结果",
        suggestName: "evalResult",
        typeName: "字符串",
      },
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
