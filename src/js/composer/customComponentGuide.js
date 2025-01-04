/**
 * Custom Component Creation Guide
 * 自定义组件创建指南
 */
const customComponentGuide = {
  description: "创建自定义命令组件的完整流程",
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
    "4. Component Development": {
      location: "src/components/composer/xxx/YourComponent.vue",
      basicStructure: {
        template: "组件模板，使用quasar组件库",
        script: "组件逻辑，使用Vue3 defineComponent",
        style: "组件样式，建议使用scoped",
      },
      keyPoints: {
        props: {
          modelValue: {
            description: "必需的属性，包含组件的完整配置",
            type: "Object",
            required: true,
            structure: {
              value: "组件对应的函数名",
              code: "生成的代码字符串",
              argvs: "解析后的参数对象",
            },
          },
        },
        computed: {
          argvs: {
            description: "处理参数的计算属性",
            implementation: `
              return this.modelValue.argvs ||
                     this.parseCodeToArgvs(this.modelValue.code) ||
                     this.defaultArgvs;
            `,
          },
        },
        data: {
          defaultArgvs: {
            description: "定义组件的默认参数结构",
            example: `{
              key: "",
              modifiers: {
                control: false,
                alt: false,
                shift: false,
                command: false,
              }
            }`,
          },
        },
        methods: {
          generateCode: {
            description: "生成代码字符串的方法",
            parameters: "argvs - 当前参数对象",
            implementation: {
              simpleCase: `
                // 简单参数的情况
                const args = [value, ...modifiers];
                return \`functionName("\${args.join('","')})\`;
              `,
              objectCase: `
                // 对象参数的情况
                const formattedConfig = stringifyObject(config);
                return \`functionName(\${formattedConfig})\`;
              `,
            },
          },
          parseCodeToArgvs: {
            description: "解析代码字符串为参数对象",
            parameters: "code - 要解析的代码字符串",
            implementation: {
              steps: [
                "1. 检查代码是否存在",
                "2. 定义需要使用variable格式的路径",
                "3. 使用parseFunction解析代码",
                "4. 处理解析结果并返回参数对象",
              ],
              example: `
                // 定义需要使用variable格式的路径
                const variableFormatPaths = [
                  'arg0', // url参数
                  'arg*.headers.**', // 所有headers字段
                  '!arg*.headers.Content-Type' // 排除Content-Type
                ];

                // 解析代码
                const result = parseFunction(code, { variableFormatPaths });
                if (!result) return this.defaultArgvs;

                // 处理解析结果
                const [url, config] = result.args;

                // 返回处理后的参数对象
                return {
                  ...this.defaultArgvs,
                  url,
                  ...config
                };
              `,
            },
          },
        },
        mounted: {
          description: "组件初始化时的处理",
          implementation: `
            // 如果没有 argvs 和 code，使用默认值初始化
            if (!this.modelValue.argvs && !this.modelValue.code) {
              this.$emit("update:modelValue", {
                ...this.modelValue,
                argvs: this.defaultArgvs,
                code: this.generateCode(this.defaultArgvs)
              });
            }
          `,
        },
        stringHandling: {
          stringifyObject: {
            description: "将对象转换为代码字符串",
            usage: "用于生成包含对象参数的代码",
            example: "将 {key: 'value'} 转换为 '{key:\"value\"}'",
          },
          parseFunction: {
            description: "解析函数调用代码为对象",
            usage: "用于解析函数调用代码，支持变量格式的路径匹配",
            parameters: {
              functionStr: "要解析的函数调用代码字符串",
              options: {
                variableFormatPaths: "需要使用variable格式的路径模式数组",
              },
            },
            pathPatterns: {
              paramPosition: {
                description: "参数位置匹配",
                examples: [
                  "arg0 - 第一个参数",
                  "arg1 - 第二个参数",
                  "arg* - 任意参数",
                ],
              },
              objectProps: {
                description: "对象属性匹配",
                examples: [
                  "arg0.headers - 精确匹配",
                  "arg1.data.* - 直接子属性",
                  "arg2.params.** - 所有嵌套属性",
                ],
              },
              wildcards: {
                description: "通配符使用",
                examples: [
                  "* - 单层匹配",
                  "** - 多层匹配",
                  "Accept* - 前缀匹配",
                ],
              },
              exclusions: {
                description: "排除规则",
                examples: [
                  "!arg*.headers.Content-Type",
                  "!arg*.headers.Cookie",
                ],
              },
            },
            example: `
              const result = parseFunction(
                'axios(url, { headers: { "User-Agent": ua } })',
                {
                  variableFormatPaths: [
                    'arg0',
                    'arg*.headers.**',
                    '!arg*.headers.Content-Type'
                  ]
                }
              );
            `,
            returns: {
              functionName: "函数名称",
              args: "解析后的参数数组，根据路径规则处理变量格式",
            },
          },
          stringifyWithType: {
            description: "将带类型的值转换为字符串",
            usage: "用于处理 VariableInput 类型的值",
            example:
              "将 {value: 'text', isString: true, __varInputVal__: true,} 转换为 '\"text\"'",
          },
          parseToHasType: {
            description: "将字符串解析为带类型的值",
            usage: "用于解析 VariableInput 类型的值",
            example:
              "将 '\"text\"' 解析为 {value: 'text', isString: true, __varInputVal__: true,}",
          },
        },
      },
    },
    "5. Component Registration": {
      location: "src/js/composer/cardComponents.js",
      description: "使用defineAsyncComponent注册组件",
      format:
        "export const YourComponent = defineAsyncComponent(() => import('path/to/component'))",
    },
    "6. Command Configuration": {
      location: "src/js/composer/commands/xxxCommands.js",
      requiredFields: {
        value: "quickcomposer.xxx.yyy",
        label: "显示名称",
        component: "组件名称",
      },
      optionalFields: {
        desc: "命令描述",
        isAsync: "是否异步命令",
        isControlFlow: "是否控制流命令",
        allowEmptyArgv: "是否允许空参数",
      },
    },
  },
  notes: {
    variableHandling: {
      description: "VariableInput 值的处理方式取决于参数类型",
      cases: {
        objectCase:
          "当值在对象中时，使用 formatJsonVariables 处理，如 AxiosConfigEditor",
        simpleCase: "当值是直接参数时，直接使用值本身，如 MultiParams",
      },
      tips: "formatJsonVariables 主要用于处理对象中的变量，避免对简单参数使用，以免产生不必要的引号",
    },
    asyncCommand: "后端使用异步函数时，命令配置需要设置isAsync: true",
    componentStructure: "参考现有组件的实现方式，保持一致的代码风格",
    errorHandling: "前后端都需要适当的错误处理和提示",
    typeChecking: "确保所有参数都有适当的类型检查",
    codeGeneration: {
      description: "代码生成的关键点",
      points: [
        "1. 使用 generateCode 方法生成标准格式的代码",
        "2. 确保生成的代码可以被正确解析回参数",
        "3. 处理特殊字符和引号",
        "4. 考虑不同类型参数的处理方式",
      ],
    },
    codeParsing: {
      description: "代码解析的关键点",
      points: [
        "1. 使用 parseCodeToArgvs 方法解析代码为参数",
        "2. 处理参数中的特殊字符和引号",
        "3. 正确识别参数类型",
        "4. 处理解析失败的情况",
      ],
    },
    componentLifecycle: {
      description: "组件生命周期管理",
      points: [
        "1. mounted 中初始化默认值",
        "2. 清理事件监听器",
        "3. 处理组件销毁",
      ],
    },
    codeStyle: {
      description: "代码风格规范",
      points: [
        "1. 保持代码结构清晰",
        "2. 使用有意义的变量名",
        "3. 添加必要的注释",
        "4. 遵循 Vue 组件命名规范",
      ],
    },
  },
  examples: {
    simpleComponent: "RegexEditor - 单一功能的组件",
    complexComponent: "AxiosConfigEditor - 多功能、多配置的组件",
    controlComponent: "ConditionalJudgment - 流程控制组件",
  },
};
