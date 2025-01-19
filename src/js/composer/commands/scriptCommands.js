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
      value: "(function(code){new Function(code)()})",
      label: "注入JS脚本",
      icon: "script",
      config: [
        {
          label: "JS脚本",
          component: "CodeEditor",
          width: 12,
        },
      ],
    },
    {
      value: "quickcommand.runAppleScript",
      label: "执行 AppleScript",
      icon: "script",
      outputVariable: "result",
      saveOutput: true,
      config: [
        {
          label: "脚本",
          component: "CodeEditor",
          width: 12,
        },
      ],
    },
  ],
};
