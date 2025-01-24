import programs from "js/options/programs";

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
          placeholder:
            "共享当前上下文，支持utools，quickcommand，quickcomposer等接口",
          width: 12,
        },
      ],
    },
    {
      value: "quickcommand.runCode",
      label: "执行代码",
      icon: "script",
      isAsync: true,
      outputVariable: "result",
      saveOutput: true,
      config: [
        {
          label: "脚本",
          component: "CodeEditor",
          placeholder: "需要本机安装了对应的解释器/编译器",
          width: 12,
        },
        {
          component: "OptionEditor",
          width: 12,
          options: {
            language: {
              label: "语言",
              component: "QSelect",
              icon: "language",
              options: Object.keys(programs).slice(2, -1),
              width: 8,
            },
            runInTerminal: {
              label: "终端运行",
              icon: "terminal",
              component: "CheckButton",
              width: 4,
            },
            args: {
              topLabel: "参数",
              icon: "data_array",
              component: "ArrayEditor",
              width: 12,
            },
            charset: {
              label: "编码",
              icon: "abc",
              component: "DictEditor",
              options: {
                optionKeys: ["scriptCode", "outputCode"],
              },
              width: 12,
            },
          },
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
