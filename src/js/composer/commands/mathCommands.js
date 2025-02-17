import { newVarInputVal } from "js/composer/varInputValManager";

export const mathCommands = {
  label: "数学计算",
  icon: "calculate",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.math.basic.evaluate",
      label: "基础运算",
      icon: "exposure",
      config: [
        {
          label: "表达式",
          component: "VariableInput",
          icon: "functions",
          width: "auto",
          defaultValue: newVarInputVal("var", ""),
          disableToggleType: true,
        },
      ],
      subCommands: [
        {
          value: "quickcomposer.math.basic.evaluate",
          label: "计算表达式",
          icon: "calculate",
        },
        {
          value: "quickcomposer.math.basic.round",
          label: "四舍五入",
          icon: "exposure",
          config: [
            {
              label: "小数位数",
              component: "NumberInput",
              icon: "pin",
              width: 4,
              min: 0,
              defaultValue: 2,
            },
          ],
        },
        {
          value: "quickcomposer.math.basic.floor",
          label: "向下取整",
          icon: "arrow_downward",
        },
        {
          value: "quickcomposer.math.basic.ceil",
          label: "向上取整",
          icon: "arrow_upward",
        },
        {
          value: "quickcomposer.math.basic.abs",
          label: "绝对值",
          icon: "unfold_more",
        },
        {
          value: "quickcomposer.math.basic.factorial",
          label: "阶乘",
          icon: "functions",
        },
      ],
    },
    {
      value: "quickcomposer.math.random.number",
      label: "随机数",
      icon: "casino",
      config: [
        {
          label: "最小值",
          component: "NumberInput",
          icon: "arrow_downward",
          width: 6,
          defaultValue: 0,
        },
        {
          label: "最大值",
          component: "NumberInput",
          icon: "arrow_upward",
          width: 6,
          defaultValue: 100,
        },
        {
          label: "生成数量",
          component: "NumberInput",
          icon: "format_list_numbered",
          width: 6,
          min: 1,
          defaultValue: 1,
        },
        {
          label: "小数位数",
          component: "NumberInput",
          icon: "pin",
          width: 6,
          min: 0,
          defaultValue: 0,
        },
      ],
      subCommands: [
        {
          value: "quickcomposer.math.random.number",
          label: "随机数",
          icon: "casino",
          outputs: {
            label: "随机数",
            suggestName: "randomNumber",
            typeName: "数字",
          },
        },
        {
          value: "quickcomposer.math.random.integer",
          label: "随机整数",
          icon: "casino",
          outputs: {
            label: "随机整数",
            suggestName: "randomInteger",
            typeName: "数字",
          },
        },
      ],
    },
    {
      value: "quickcomposer.math.statistics.mean",
      label: "统计计算",
      icon: "bar_chart",
      config: [
        {
          label: "数据集合",
          component: "VariableInput",
          icon: "dataset",
          width: 12,
          placeholder: "数字数组，如:[1,2,3,4,5]",
          defaultValue: newVarInputVal("var", ""),
          disableToggleType: true,
        },
      ],
      subCommands: [
        {
          value: "quickcomposer.math.statistics.mean",
          label: "平均值",
          icon: "horizontal_rule",
        },
        {
          value: "quickcomposer.math.statistics.median",
          label: "中位数",
          icon: "align_vertical_center",
        },
        {
          value: "quickcomposer.math.statistics.mode",
          label: "众数",
          icon: "stacked_bar_chart",
        },
        {
          value: "quickcomposer.math.statistics.variance",
          label: "方差",
          icon: "analytics",
        },
        {
          value: "quickcomposer.math.statistics.stddev",
          label: "标准差",
          icon: "ssid_chart",
        },
        {
          value: "quickcomposer.math.statistics.sum",
          label: "求和",
          icon: "add",
        },
        {
          value: "quickcomposer.math.statistics.product",
          label: "求积",
          icon: "close",
        },
        {
          value: "quickcomposer.math.statistics.max",
          label: "最大值",
          icon: "keyboard_double_arrow_up",
        },
        {
          value: "quickcomposer.math.statistics.min",
          label: "最小值",
          icon: "keyboard_double_arrow_down",
        },
        {
          value: "quickcomposer.math.statistics.range",
          label: "极差",
          icon: "height",
        },
      ],
    },
    {
      value: "quickcomposer.math.geometry.circle",
      label: "几何计算",
      icon: "architecture",
      subCommands: [
        {
          value: "quickcomposer.math.geometry.circle",
          label: "圆形计算",
          icon: "circle",
          config: [
            {
              label: "半径",
              component: "VariableInput",
              icon: "radio_button_checked",
              width: 12,
              disableToggleType: true,
              defaultValue: newVarInputVal("var"),
            },
          ],
        },
        {
          value: "quickcomposer.math.geometry.rectangle",
          label: "矩形计算",
          icon: "rectangle",
          config: [
            {
              label: "宽度",
              component: "VariableInput",
              icon: "swap_horiz",
              width: 6,
              disableToggleType: true,
              defaultValue: newVarInputVal("var"),
            },
            {
              label: "高度",
              component: "VariableInput",
              icon: "height",
              width: 6,
              disableToggleType: true,
              defaultValue: newVarInputVal("var"),
            },
          ],
        },
        {
          value: "quickcomposer.math.geometry.triangle",
          label: "三角形计算",
          icon: "change_history",
          config: [
            {
              label: "边长a",
              component: "VariableInput",
              icon: "straighten",
              width: 4,
              disableToggleType: true,
              defaultValue: newVarInputVal("var"),
            },
            {
              label: "边长b",
              component: "VariableInput",
              icon: "straighten",
              width: 4,
              disableToggleType: true,
              defaultValue: newVarInputVal("var"),
            },
            {
              label: "边长c",
              component: "VariableInput",
              icon: "straighten",
              width: 4,
              disableToggleType: true,
              defaultValue: newVarInputVal("var"),
            },
          ],
        },
      ],
    },
    {
      value: "quickcomposer.math.trigonometry.sin",
      label: "三角函数",
      icon: "show_chart",
      config: [
        {
          label: "角度值",
          component: "VariableInput",
          icon: "rotate_right",
          width: 12,
          disableToggleType: true,
          defaultValue: newVarInputVal("var"),
        },
      ],
      subCommands: [
        {
          value: "quickcomposer.math.trigonometry.sin",
          label: "正弦(sin)",
          icon: "show_chart",
        },
        {
          value: "quickcomposer.math.trigonometry.cos",
          label: "余弦(cos)",
          icon: "show_chart",
        },
        {
          value: "quickcomposer.math.trigonometry.tan",
          label: "正切(tan)",
          icon: "show_chart",
        },
        {
          value: "quickcomposer.math.trigonometry.asin",
          label: "反正弦(arcsin)",
          icon: "show_chart",
        },
        {
          value: "quickcomposer.math.trigonometry.acos",
          label: "反余弦(arccos)",
          icon: "show_chart",
        },
        {
          value: "quickcomposer.math.trigonometry.atan",
          label: "反正切(arctan)",
          icon: "show_chart",
        },
      ],
    },
    {
      value: "quickcomposer.math.conversion.base",
      label: "进制转换",
      icon: "swap_horiz",
      outputs: {
        label: "转换结果",
        suggestName: "convertedResult",
        typeName: "字符串",
      },
      config: [
        {
          label: "数值",
          component: "VariableInput",
          icon: "pin",
          width: 12,
          defaultValue: newVarInputVal("var", ""),
        },
        {
          label: "从",
          component: "ButtonGroup",
          icon: "input",
          width: 6,
          options: [
            { label: "十进制", value: "decimal" },
            { label: "二进制", value: "binary" },
            { label: "八进制", value: "octal" },
            { label: "十六进制", value: "hex" },
          ],
          defaultValue: "decimal",
        },
        {
          label: "到",
          component: "ButtonGroup",
          icon: "output",
          width: 6,
          options: [
            { label: "十进制", value: "decimal" },
            { label: "二进制", value: "binary" },
            { label: "八进制", value: "octal" },
            { label: "十六进制", value: "hex" },
          ],
          defaultValue: "hex",
        },
      ],
    },
  ],
};
