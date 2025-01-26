/**
 * Custom Component Creation Guide
 * 自定义组件创建指南
 */
const customComponentGuide = {
  description: "创建自定义命令组件的完整流程",
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
                const formattedConfig = stringifyArgv(config);
                return \`functionName(\${formattedConfig})\`;
              `,
            },
          },
          parseCodeToArgvs: {
            description: "解析代码字符串为参数对象，严禁使用eval",
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
                const [url, config] = result.argvs;

                // 返回处理后的参数对象
                return {
                  ...this.defaultArgvs,
                  url,
                  ...config
                };
              `,
            },
          },
          getSummary: {
            description: "生成命令的简短描述，用于在命令列表中显示",
            parameters: "argvs - 当前参数对象",
            implementation: {
              simpleCase: `
                // 返回操作类型的标签
                return this.operations.find(op => op.value === argvs.operation).label;
              `,
              complexCase: `
                // 返回关键参数的值
                return argvs.command.value;
              `,
            },
            notes: [
              "返回值应该简洁明了，帮助用户快速识别命令的功能",
              "对于复杂命令，应该返回最关键的参数信息",
              "返回的文本长度应该适中，避免过长",
            ],
          },
          updateModelValue: {
            description: "更新组件的值并触发更新事件",
            parameters: "argvs - 当前参数对象",
            implementation: `
              this.$emit("update:modelValue", {
                ...this.modelValue,
                summary: this.getSummary(argvs),
                code: this.generateCode(argvs),
                argvs,
              });
            `,
            notes: [
              "必须保留原有的 modelValue 属性",
              "必须包含 summary、code 和 argvs 三个字段",
              "summary 用于在命令列表中显示",
              "code 是生成的代码字符串",
              "argvs 是当前的参数对象",
            ],
            usage: [
              "在 mounted 钩子中初始化组件值",
              "在 argvs setter 中更新组件值",
              "在任何需要更新组件值的地方调用",
            ],
          },
        },
        mounted: {
          description: "组件初始化时的处理",
          implementation: `
            // 如果没有 argvs 和 code，使用默认值初始化
            const argvs = this.modelValue.argvs || this.defaultArgvs;
            if (!this.modelValue.code) {
              this.$emit("update:modelValue", {
                ...this.modelValue,
                argvs,
                code: this.generateCode(argvs),
              });
            }
          `,
        },
        stringHandling: {
          stringifyArgv: {
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
          parseToHasType: {
            description: "将字符串解析为带类型的值",
            usage: "用于解析 VariableInput 类型的值",
            example: "将 '\"text\"' 解析为 newVarInputVal('str', 'text')",
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
        asyncMode: "async模式，可选值为await/then",
        isControlFlow: "是否控制流命令",
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
    commonComponents: {
      description: "常用组件的使用说明",
      components: {
        VariableInput: {
          description: "变量输入组件",
          usage: "用于输入可能包含变量的字符串",
          props: [
            "model-value - 输入值，需要包含 value、isString、__varInputVal__ 属性, 通过 varInputValManager 的 newVarInputVal 创建",
            "label - 输入框标签",
            "icon - 输入框图标",
          ],
        },
        DictEditor: {
          description: "键值对编辑组件",
          usage: "用于编辑对象类型的配置，如 headers、env 等",
          features: [
            "自带添加/删除按钮",
            "支持键值对编辑",
            "值部分默认使用 VariableInput",
            "支持下拉选项（通过 options.items 配置）",
          ],
          notes: [
            "初始值应该是一个对象，如 {}",
            "支持通过 options 属性配置下拉选项",
          ],
        },
        NumberInput: {
          description: "数字输入组件",
          usage: "用于输入数字类型的配置",
          props: [
            "model-value - 数字值",
            "label - 输入框标签",
            "icon - 输入框图标",
          ],
        },
      },
    },
    dataFlow: {
      description: "数据流转说明",
      patterns: {
        modelValue: {
          description: "组件数据结构",
          structure: {
            value: "函数名，来自命令配置",
            code: "生成的代码字符串",
            argvs: "解析后的参数对象",
          },
        },
        updateFlow: {
          description: "数据更新流程",
          steps: [
            "1. 用户输入触发 update:model-value 事件",
            "2. 组件内部更新 argvs",
            "3. argvs 更新触发 generateCode",
            "4. 发送完整的 modelValue 给父组件",
          ],
        },
      },
    },
    bestPractices: {
      description: "最佳实践",
      tips: [
        "使用现有组件而不是重新开发",
        "参考 axios 等成熟组件的实现",
        "保持数据流的清晰和一致",
        "合理使用计算属性和方法",
        "避免直接修改 props",
        "正确处理默认值",
      ],
    },
    commonPitfalls: {
      description: "自定义组件开发中的常见错误和最佳实践",
      componentRegistration: {
        description: "组件注册相关注意事项",
        tips: [
          "组件名使用 PascalCase 命名，如 SystemCommandEditor",
          "在 cardComponents.js 中注册时使用字符串形式，如 component: 'SystemCommandEditor'",
          "不要在配置文件中导入组件",
          "不要在配置文件中定义 defaultArgvs，这应该只在组件内部定义",
        ],
      },
      codeGeneration: {
        description: "代码生成相关注意事项",
        tips: [
          "使用 modelValue.value 获取函数名，避免硬编码",
          "在 generateCode 中正确处理默认值的移除",
          "正确定义 variableFormatPaths 以处理变量格式",
        ],
      },
      dataManagement: {
        description: "数据管理相关注意事项",
        tips: [
          "使用 updateArgvs(key, value) 方法显式更新数据",
          "在模板中使用 :model-value 和 @update:model-value 而不是 v-model",
          "在 emit 时不需要提交 value 字段，因为这在 command 配置里已定义",
          "使用 getter/setter 形式的 argvs 计算属性",
          "在 mounted 和 updateArgvs 中保留原始字段 ...this.modelValue",
          "处理嵌套对象更新时需要正确处理路径，如 'options.encoding' 需要分别更新 options 对象",
          "更新嵌套对象时要保持对象的响应性，使用解构运算符复制对象",
        ],
      },
      performance: {
        description: "性能优化相关注意事项",
        tips: [
          "避免使用过多的 watch 属性，容易造成性能问题",
          "使用 computed 代替复杂的 watch",
          "减少不必要的数据更新和重渲染",
          "保持简单的 getter/setter 模式，避免复杂的嵌套对象更新",
        ],
      },
      componentStructure: {
        description: "组件结构相关注意事项",
        tips: [
          "使用 data() 而不是 setup 来定义组件数据",
          "在配置文件中的 value 应该包含完整路径，如 quickcomposer.system.exec",
          "组件内部保持简单清晰的结构，避免过度复杂的逻辑",
        ],
      },
    },
  },
  examples: {
    simpleComponent: "RegexEditor - 单一功能的组件",
    complexComponent: "AxiosConfigEditor - 多功能、多配置的组件",
    controlComponent: "ConditionalJudgment - 流程控制组件",
  },
};
