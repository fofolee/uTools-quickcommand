export const mathCommands = {
  label: "数学计算",
  icon: "calculate",
  defaultOpened: false,
  commands: [
    {
      value: "Math.sin",
      label: "数学计算",
      desc: "数学函数计算",
      icon: "calculate",
      outputVariable: "calculatedText",
      saveOutput: true,
      config: [
        {
          label: "要计算的数值",
          icon: "numbers",
          type: "numInput",
        },
      ],
      subCommands: [
        {
          label: "正弦(sin)",
          value: "Math.sin",
          icon: "functions",
        },
        {
          label: "余弦(cos)",
          value: "Math.cos",
          icon: "functions",
        },
        {
          label: "正切(tan)",
          value: "Math.tan",
          icon: "functions",
        },
        {
          label: "反正弦(asin)",
          value: "Math.asin",
          icon: "functions",
        },
        {
          label: "反余弦(acos)",
          value: "Math.acos",
          icon: "functions",
        },
        {
          label: "反正切(atan)",
          value: "Math.atan",
          icon: "functions",
        },
        {
          label: "平方根(sqrt)",
          value: "Math.sqrt",
          icon: "functions",
        },
        {
          label: "自然对数(ln)",
          value: "Math.log",
          icon: "functions",
        },
        {
          label: "10对数(log10)",
          value: "Math.log10",
          icon: "functions",
        },
        {
          label: "绝对值(abs)",
          value: "Math.abs",
          icon: "functions",
        },
        {
          label: "向上取整(ceil)",
          value: "Math.ceil",
          icon: "functions",
        },
        {
          label: "向下取整(floor)",
          value: "Math.floor",
          icon: "functions",
        },
        {
          label: "四舍五入(round)",
          value: "Math.round",
          icon: "functions",
        },
        {
          label: "幂运算(pow)",
          value: "Math.pow",
          icon: "functions",
        },
      ],
    },
    {
      value: "quickcomposer.math.random",
      label: "随机数",
      config: [
        {
          label: "整数",
          type: "switch",
          defaultValue: false,
          width: 2,
        },
        {
          label: "起始值",
          icon: "last_page",
          type: "numInput",
          width: 5,
        },
        {
          label: "结束值",
          icon: "first_page",
          type: "numInput",
          width: 5,
        },
      ],
      outputVariable: "randomNumber",
      saveOutput: true,
    },
  ],
};
