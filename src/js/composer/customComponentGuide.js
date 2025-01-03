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
        variableInput: {
          scenarios: [
            "需要支持变量输入的文本框",
            "数字输入框（设置inputType='number'）",
            "需要自动处理引号的输入",
          ],
          props: {
            vModel: "双向绑定值",
            command: "配置图标和输入类型",
            label: "输入框标签",
          },
          events: {
            description: "需要监听的事件",
            list: ["@update:model-value='updateConfig' - 监听值变化并更新代码"],
          },
        },
        selectInput: {
          description: "选择框组件",
          component: "q-select",
          props: {
            "v-model": "双向绑定值",
            options: "选项列表",
            label: "标签文本",
            "emit-value": "true - 使用选项的value作为值",
            "map-options": "true - 启用选项映射",
          },
          events: {
            "@update:model-value": "必须监听此事件以触发代码更新",
          },
          tips: "所有影响代码生成的输入组件都必须在值变化时触发updateConfig",
        },
        codeGeneration: {
          tool: "使用formatJsonVariables处理变量",
          params: {
            config: "完整的配置对象",
            variableFields: "需要处理的字段列表",
          },
          formats: {
            objectParams: {
              description: "当参数是对象时的处理方式",
              example:
                "`quickcomposer.xxx.yyy(${formatJsonVariables(config, variableFields)})`",
              reference: "参考 AxiosConfigEditor.vue",
            },
            simpleParams: {
              description: "当参数是简单值时的处理方式",
              example: "`${functionName}(${args.join(',')})`",
              reference: "参考 MultiParams.vue",
            },
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
  },
  examples: {
    simpleComponent: "RegexEditor - 单一功能的组件",
    complexComponent: "AxiosConfigEditor - 多功能、多配置的组件",
    controlComponent: "ConditionalJudgment - 流程控制组件",
  },
};
