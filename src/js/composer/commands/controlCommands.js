export const controlCommands = {
  label: "流程控制",
  icon: "call_split",
  commands: [
    {
      value: "condition",
      label: "条件判断",
      component: "ConditionalJudgment",
      isControlFlow: true,
      commandChain: ["if", "end"],
    },
    {
      value: "loop",
      label: "循环",
      component: "LoopControl",
      isControlFlow: true,
      commandChain: ["loop", "end"],
    },
  ],
};
