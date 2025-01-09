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
              key: "condition",
              label: "条件",
              type: "controlInput",
              placeholder: "表达式",
              defaultValue: "true",
            },
          ],
        },
        {
          label: "否则",
          value: "else",
          icon: "fork_left",
          codeTemplate: "} else {",
        },
        {
          label: "否则满足",
          value: "else if",
          icon: "fork_left",
          codeTemplate: "} else if (${condition}) {",
          config: [
            {
              key: "condition",
              label: "条件",
              type: "controlInput",
              placeholder: "表达式",
            },
          ],
        },
        {
          label: "结束",
          value: "end",
          codeTemplate: "}",
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
              key: "indexVar",
              label: "变量",
              type: "controlInput",
              defaultValue: "i",
              width: 3,
            },
            {
              key: "startValue",
              label: "从",
              type: "controlInput",
              icon: "first_page",
              defaultValue: "0",
              width: 3,
            },
            {
              key: "endValue",
              label: "到",
              type: "controlInput",
              icon: "last_page",
              defaultValue: "10",
              width: 3,
            },
            {
              key: "stepValue",
              label: "步进",
              type: "controlInput",
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
          codeTemplate: "}",
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
              key: "itemVar",
              label: "元素",
              type: "controlInput",
              defaultValue: "item",
              width: 4,
            },
            {
              key: "indexVar",
              label: "索引",
              type: "controlInput",
              defaultValue: "i",
              width: 4,
            },
            {
              key: "arrayVar",
              label: "数组",
              type: "controlInput",
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
          codeTemplate: "}",
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
              key: "keyVar",
              label: "键名",
              type: "controlInput",
              defaultValue: "key",
              width: 4,
            },
            {
              key: "valueVar",
              label: "值",
              type: "controlInput",
              defaultValue: "value",
              width: 4,
            },
            {
              key: "objectVar",
              label: "对象",
              type: "controlInput",
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
          codeTemplate: "}",
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
              key: "condition",
              label: "条件",
              type: "controlInput",
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
          codeTemplate: "}",
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
              key: "expression",
              label: "变量",
              type: "controlInput",
              placeholder: "变量或表达式",
              defaultValue: "expression",
            },
          ],
        },
        {
          label: "匹配分支",
          value: "case",
          icon: "check",
          codeTemplate: "case ${value}:",
          config: [
            {
              key: "value",
              label: "值",
              type: "controlInput",
            },
          ],
        },
        {
          label: "默认分支",
          value: "default",
          icon: "last_page",
          codeTemplate: "default:",
        },
        {
          label: "结束",
          value: "end",
          codeTemplate: "}",
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
          icon: "error",
          codeTemplate: "} catch (${errorVar}) {",
          config: [
            {
              key: "errorVar",
              label: "错误",
              type: "controlInput",
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
          codeTemplate: "}",
        },
      ],
    },
  ],
};
