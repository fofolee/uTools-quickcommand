/**
 * Common Component Creation Guide
 * 通用组件创建指南 - 使用 MultiParams 组件
 */
const commonComponentGuide = {
  description: "创建使用 MultiParams 组件的命令的完整流程",
  important: "创建过程中严禁删除、修改任何已有的函数或对象",
  steps: {
    "1. Backend Interface": {
      location: "plugin/lib/quickcomposer/xxx/yyy.js",
      description: "创建具体功能实现",
      requirements: {
        functionDefinition: "使用独立函数而非对象方法",
        asyncHandling: "使用 async/await 处理异步操作",
        errorHandling: "合理的错误捕获和提示",
        paramValidation: "检查必要参数是否存在",
      },
    },
    "2. Interface Export": {
      location: "plugin/lib/quickcomposer/xxx/index.js",
      description: "导出接口给quickcomposer使用",
      examples: {
        singleFunction: "module.exports = { operation }",
        multipleFunctions: "module.exports = { ...encoder, ...hash }",
      },
    },
    "3. Interface Registration": {
      location: "plugin/lib/quickcomposer.js",
      description: "将接口注册到quickcomposer对象",
      format: "quickcomposer.xxx = require('./quickcomposer/xxx')",
    },
    "4. Command Configuration": {
      location: "src/js/composer/commands/xxxCommands.js",
      description: "配置命令参数，使用 MultiParams 组件",
      requiredFields: {
        value: "必选，生成代码时使用的函数名，如 quickcomposer.xxx.yyy",
        label: "必选，命令的显示名称",
        config: {
          description: "必选，通用参数配置数组，每个元素是一个对象",
          properties: {
            label: "必选，参数标签",
            type: "必选，参数类型(varInput/numInput/select/checkbox等)",
            icon: "必选，参数图标",
            width: "可选，参数占用宽度(1-12或auto)",
            defaultValue: "可选，参数默认值",
            options: "可选，select等类型的选项",
          },
          example: `
            config: [
              {
                label: "域名",
                component: "VariableInput",
                icon: "dns",
                width: "auto"
              }
            ]
          `,
        },
        subCommands: {
          description:
            "可选，函数选择器配置，用于一个命令包含多个相关函数的情况",
          properties: {
            value: "必选，函数名",
            label: "必选，显示名称",
            icon: "可选，图标",
            config: "可选，函数特有的参数配置，格式同通用config",
            excludeConfig: "可选，要排除的通用参数索引数组",
          },
          example: `
            subCommands: [
              {
                label: "DNS查询",
                value: "quickcomposer.network.dns.lookupHost",
                icon: "search",
                config: [
                  {
                    label: "IP版本",
                    component: "q-select",
                    options: [
                      { label: "自动", value: 0 },
                      { label: "IPv4", value: 4 }
                    ],
                    defaultValue: 0
                  }
                ]
              },
              {
                value: "quickcomposer.network.dns.reverseResolve",
                label: "反向解析",
                icon: "swap_horiz",
                excludeConfig: [0],  // 排除第一个通用参数
                config: [
                  {
                    label: "IP地址",
                    component: "VariableInput",
                    icon: "router"
                  }
                ]
              }
            ]
          `,
        },
      },
      optionalFields: {
        desc: "命令描述",
        asyncMode: "async模式，可选值为await/then",
        icon: "命令图标",
      },
    },
  },
  notes: {
    bestPractices: {
      description: "最佳实践",
      tips: [
        "合理使用 width 属性布局参数",
        "相关参数尽量放在同一行",
        "使用 excludeConfig 禁用掉不需要的参数配置",
        "合理设置 defaultValue",
        "使用语义化的图标",
        "保持参数标签简洁明了",
      ],
    },
  },
  examples: {
    multiFunctionCommand: "多函数命令，如DNS操作",
  },
};
