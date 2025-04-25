export const controlCommands = {
  label: "流程控制",
  icon: "call_split",
  commands: [
    {
      value: "condition",
      label: "条件判断",
      component: "ControlCommand",
      isControlFlow: true,
      commandChain: ["if", "end"],
      subCommands: [
        {
          label: "如果满足",
          value: "if",
          codeTemplate: "if (${condition}) {",
          config: [
            {
              name: "condition",
              label: "条件",
              component: "ControlInput",
              placeholder: "表达式",
              defaultValue: "true",
            },
          ],
        },
        {
          label: "否则满足",
          value: "else if",
          icon: "fork_right",
          codeTemplate: "} else if (${condition}) {",
          config: [
            {
              name: "condition",
              label: "条件",
              component: "ControlInput",
              placeholder: "表达式",
            },
          ],
        },
        {
          label: "否则",
          value: "else",
          icon: "airline_stops",
          codeTemplate: "} else {",
        },
        {
          label: "结束",
          value: "end",
          codeTemplate: "};",
        },
      ],
    },
    {
      value: "loop",
      label: "循环执行",
      component: "ControlCommand",
      isControlFlow: true,
      commandChain: ["loop", "end"],
      subCommands: [
        {
          label: "循环执行",
          value: "loop",
          icon: "loop",
          codeTemplate:
            "for (let ${indexVar} = ${startValue}; ${indexVar} <= ${endValue}; ${indexVar} += ${stepValue}) {",
          config: [
            {
              name: "indexVar",
              label: "变量",
              component: "ControlInput",
              defaultValue: "i",
              width: 3,
            },
            {
              name: "startValue",
              label: "从",
              component: "ControlInput",
              icon: "first_page",
              defaultValue: "0",
              width: 3,
            },
            {
              name: "endValue",
              label: "到",
              component: "ControlInput",
              icon: "last_page",
              defaultValue: "10",
              width: 3,
            },
            {
              name: "stepValue",
              label: "步进",
              component: "ControlInput",
              icon: "trending_up",
              defaultValue: "1",
              width: 3,
            },
          ],
        },
        {
          label: "继续循环",
          value: "continue",
          icon: "skip_next",
          codeTemplate: "continue;",
        },
        {
          label: "终止循环",
          value: "break",
          icon: "stop",
          codeTemplate: "break;",
        },
        {
          label: "结束",
          value: "end",
          codeTemplate: "};",
        },
      ],
    },
    {
      value: "forEach",
      label: "遍历数组",
      component: "ControlCommand",
      isControlFlow: true,
      commandChain: ["forEach", "end"],
      subCommands: [
        {
          label: "遍历数组",
          value: "forEach",
          icon: "list",
          codeTemplate:
            "for (let [${indexVar}, ${itemVar}] of ${arrayVar}.entries()) {",
          config: [
            {
              name: "indexVar",
              label: "索引",
              component: "ControlInput",
              defaultValue: "index",
              width: 4,
            },
            {
              name: "itemVar",
              label: "元素",
              component: "ControlInput",
              defaultValue: "item",
              width: 4,
            },
            {
              name: "arrayVar",
              label: "数组",
              component: "ControlInput",
              icon: "list",
              defaultValue: "array",
              width: 4,
            },
          ],
        },
        {
          label: "继续循环",
          value: "continue",
          icon: "skip_next",
          codeTemplate: "continue;",
        },
        {
          label: "终止循环",
          value: "break",
          icon: "stop",
          codeTemplate: "break;",
        },
        {
          label: "结束",
          value: "end",
          codeTemplate: "};",
        },
      ],
    },
    {
      value: "forIn",
      label: "遍历对象",
      component: "ControlCommand",
      isControlFlow: true,
      commandChain: ["forIn", "end"],
      subCommands: [
        {
          label: "遍历对象",
          value: "forIn",
          icon: "data_object",
          codeTemplate:
            "for (const ${keyVar} in ${objectVar}) { const ${valueVar} = ${objectVar}[${keyVar}];",
          config: [
            {
              name: "keyVar",
              label: "键名",
              component: "ControlInput",
              defaultValue: "key",
              width: 4,
            },
            {
              name: "valueVar",
              label: "值",
              component: "ControlInput",
              defaultValue: "value",
              width: 4,
            },
            {
              name: "objectVar",
              label: "对象",
              component: "ControlInput",
              defaultValue: "object",
              width: 4,
            },
          ],
        },
        {
          label: "继续循环",
          value: "continue",
          icon: "skip_next",
          codeTemplate: "continue;",
        },
        {
          label: "终止循环",
          value: "break",
          icon: "stop",
          codeTemplate: "break;",
        },
        {
          label: "结束",
          value: "end",
          codeTemplate: "};",
        },
      ],
    },
    {
      value: "while",
      label: "条件循环",
      component: "ControlCommand",
      isControlFlow: true,
      commandChain: ["while", "end"],
      subCommands: [
        {
          label: "条件循环",
          value: "while",
          icon: "loop",
          codeTemplate: "while (${condition}) {",
          config: [
            {
              name: "condition",
              label: "条件",
              component: "ControlInput",
              placeholder: "表达式",
              defaultValue: "true",
            },
          ],
        },
        {
          label: "继续循环",
          value: "continue",
          icon: "skip_next",
          codeTemplate: "continue;",
        },
        {
          label: "终止循环",
          value: "break",
          icon: "stop",
          codeTemplate: "break;",
        },
        {
          label: "结束",
          value: "end",
          codeTemplate: "};",
        },
      ],
    },
    {
      value: "switch",
      label: "条件分支",
      component: "ControlCommand",
      isControlFlow: true,
      commandChain: ["switch", "case", "end"],
      subCommands: [
        {
          label: "条件分支",
          value: "switch",
          icon: "call_split",
          codeTemplate: "switch (${expression}) {",
          config: [
            {
              name: "expression",
              label: "变量",
              component: "ControlInput",
              placeholder: "变量或表达式",
              defaultValue: "expression",
            },
          ],
        },
        {
          label: "匹配分支",
          value: "case",
          icon: "fork_right",
          codeTemplate: "case ${value}:",
          config: [
            {
              name: "value",
              label: "值",
              component: "ControlInput",
            },
          ],
        },
        {
          label: "中断",
          value: "break",
          icon: "stop",
          codeTemplate: "break;",
        },
        {
          label: "默认分支",
          value: "default",
          icon: "airline_stops",
          codeTemplate: "default:",
        },
        {
          label: "结束",
          value: "end",
          codeTemplate: "};",
        },
      ],
    },
    {
      value: "tryCatch",
      label: "异常处理",
      component: "ControlCommand",
      isControlFlow: true,
      commandChain: ["try", "catch", "end"],
      subCommands: [
        {
          label: "尝试执行",
          value: "try",
          icon: "play_circle",
          codeTemplate: "try {",
        },
        {
          label: "捕获异常",
          value: "catch",
          icon: "priority_high",
          codeTemplate: "} catch (${errorVar}) {",
          config: [
            {
              name: "errorVar",
              label: "错误",
              component: "ControlInput",
              defaultValue: "error",
            },
          ],
        },
        {
          label: "最后执行",
          value: "finally",
          icon: "done_all",
          codeTemplate: "} finally {",
        },
        {
          label: "结束",
          value: "end",
          codeTemplate: "};",
        },
      ],
    },
  ],
};
