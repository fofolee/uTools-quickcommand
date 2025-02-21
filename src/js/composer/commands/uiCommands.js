import { newVarInputVal } from "js/composer/varInputValManager";

const SAVE_DIALOG_PROPERTIES = {
  component: "CheckGroup",
  icon: "settings",
  label: "选项",
  width: 12,
  options: [
    { label: "显示隐藏文件", value: "showHiddenFiles" },
    { label: "允许创建文件夹（Mac）", value: "createDirectory" },
    {
      label: "将.App作为目录（Mac）",
      value: "treatPackageAsDirectory",
    },
    {
      label: "显示覆盖确认（Linux）",
      value: "showOverwriteConfirmation",
    },
    { label: "不添加到最近（Win）", value: "dontAddToRecent" },
  ],
};

const OPEN_DIALOG_PROPERTIES = {
  ...SAVE_DIALOG_PROPERTIES,
  options: [
    { label: "选择文件", value: "openFile" },
    { label: "选择文件夹", value: "openDirectory" },
    { label: "允许多选", value: "multiSelections" },
    { label: "显示隐藏文件", value: "showHiddenFiles" },
    { label: "提示新建路径（Win）", value: "promptToCreate" },
    { label: "不添加到最近（Win）", value: "dontAddToRecent" },
    { label: "允许创建文件夹（Mac）", value: "createDirectory" },
    { label: "不解析符号链接（Mac）", value: "noResolveAliases" },
    {
      label: "将.App作为目录（Mac）",
      value: "treatPackageAsDirectory",
    },
  ],
};

const DIALOG_CONFIG = {
  options: {
    title: {
      label: "标题",
      component: "VariableInput",
      icon: "title",
      width: 6,
    },
    defaultPath: {
      label: "默认路径",
      component: "VariableInput",
      icon: "folder",
      width: 6,
    },
    buttonLabel: {
      label: "按钮文本",
      component: "VariableInput",
      icon: "text_fields",
      width: 6,
    },
    message: {
      label: "提示信息",
      component: "VariableInput",
      icon: "info",
      width: 6,
    },
    filters: {
      topLabel: "过滤器",
      component: "ArrayEditor",
      icon: "filter_list",
      width: 12,
      defaultRowValue: [newVarInputVal("str"), newVarInputVal("var", "")],
      columns: {
        name: {
          label: "文件类型",
          noIcon: true,
          width: 4,
        },
        extensions: {
          label: "扩展名",
          noIcon: true,
          disableToggleType: true,
          options: {
            items: ["*", "jpg", "png", "gif", "txt", "json", "exe"],
            multiSelect: true,
          },
        },
      },
    },
  },
  defaultValue: {
    title: newVarInputVal("str", "请选择"),
    defaultPath: newVarInputVal("str"),
    buttonLabel: newVarInputVal("str", "选择"),
    message: newVarInputVal("str", "请选择"),
    filters: [
      {
        name: newVarInputVal("str", "file"),
        extensions: newVarInputVal("var", '["*"]'),
      },
    ],
    properties: ["openFile", "showHiddenFiles"],
  },
};

export const uiCommands = {
  label: "用户交互",
  icon: "web",
  defaultOpened: false,
  commands: [
    {
      value: "quickcommand.showMessageBox",
      label: "消息提示",
      asyncMode: "await",
      config: [
        {
          label: "提示内容",
          component: "VariableInput",
          icon: "info",
          defaultValue: newVarInputVal("str", "这是一条提示消息"),
          width: 12,
        },
      ],
      subCommands: [
        {
          value: "quickcommand.showMessageBox",
          icon: "call_to_action",
          label: "插件内弹窗",
          config: [
            {
              label: "图标类型",
              component: "QSelect",
              defaultValue: "success",
              icon: "lightbulb",
              width: 6,
              options: [
                { label: "成功", value: "success" },
                { label: "错误", value: "error" },
                { label: "警告", value: "warning" },
                { label: "信息", value: "info" },
              ],
            },
            {
              label: "显示时间(ms)",
              component: "NumberInput",
              min: 0,
              step: 100,
              width: 6,
              placeholder: "0为手动关闭，留空按文本长度调整",
            },
          ],
        },
        {
          value: "quickcommand.showSystemMessageBox",
          icon: "report",
          label: "系统弹窗",
          config: [
            {
              label: "标题",
              component: "VariableInput",
              defaultValue: newVarInputVal("str", "提示"),
              width: 12,
            },
          ],
        },
      ],
    },
    {
      value: "quickcommand.showConfirmBox",
      label: "确认框",
      asyncMode: "await",
      outputs: {
        label: "是否确认",
        suggestName: "isConfirmed",
        typeName: "布尔值",
      },
      config: [
        {
          label: "提示内容",
          component: "VariableInput",
          defaultValue: newVarInputVal("str", "确认要执行此操作吗？"),
          width: 12,
        },
        {
          label: "标题",
          component: "VariableInput",
          defaultValue: newVarInputVal("str", "提示"),
          width: 12,
        },
      ],
      subCommands: [
        {
          value: "quickcommand.showConfirmBox",
          icon: "call_to_action",
          label: "插件内弹窗",
          config: [
            {
              label: "支持HTML",
              component: "CheckButton",
              defaultValue: false,
              width: 6,
            },
            {
              label: "宽度",
              component: "NumberInput",
              min: 0,
              step: 100,
              defaultValue: 450,
              width: 6,
              placeholder: "对话框宽度",
            },
          ],
        },
        {
          value: "quickcommand.showSystemConfirmBox",
          icon: "report",
          label: "系统弹窗",
        },
      ],
    },
    {
      value: "quickcommand.showButtonBox",
      label: "按钮组",
      asyncMode: "await",
      width: 12,
      outputs: {
        label: "选择的按钮",
        suggestName: "selectedButton",
        structure: {
          id: {
            label: "按钮序号",
            suggestName: "buttonId",
            placeholder: "按钮的序号，从0开始",
          },
          text: {
            label: "按钮文本",
            suggestName: "buttonText",
          },
        },
      },
      config: [
        {
          label: "按钮",
          component: "ArrayEditor",
          defaultValue: [
            newVarInputVal("str", "是"),
            newVarInputVal("str", "否"),
          ],
          defaultRowValue: newVarInputVal("str"),
        },
        {
          label: "标题",
          component: "VariableInput",
          defaultValue: newVarInputVal("str", "请选择"),
          width: 12,
        },
      ],
      subCommands: [
        {
          value: "quickcommand.showButtonBox",
          icon: "call_to_action",
          label: "插件内弹窗",
        },
        {
          value: "quickcommand.showSystemButtonBox",
          icon: "report",
          label: "系统弹窗",
        },
      ],
    },
    {
      value: "quickcommand.showInputBox",
      label: "输入框",
      asyncMode: "await",
      outputs: {
        label: "输入框值",
        suggestName: "inputValues",
        structure: [
          { label: "第一个输入框的值", suggestName: "inputValue1" },
          { label: "第二个输入框的值", suggestName: "inputValue2" },
          { label: "第三个输入框的值", suggestName: "inputValue3" },
        ],
      },
      config: [
        {
          label: "输入框",
          component: "ArrayEditor",
          width: 12,
          columns: {
            label: {
              label: "标签",
            },
            value: {
              label: "默认值",
            },
          },
          defaultValue: [
            {
              label: newVarInputVal("str", "请输入"),
              value: newVarInputVal("str"),
            },
          ],
        },
      ],
      subCommands: [
        {
          value: "quickcommand.showInputBox",
          icon: "call_to_action",
          label: "插件内弹窗",
        },
        {
          value: "quickcommand.showSystemInputBox",
          icon: "report",
          label: "系统弹窗",
        },
      ],
    },
    {
      value: "quickcommand.showSelectList",
      label: "选择列表",
      component: "SelectListEditor",
      asyncMode: "await",
      outputs: {
        label: "选择结果",
        suggestName: "selectedItem",
        structure: {
          id: {
            label: "选项序号",
            suggestName: "itemId",
            placeholder: "选项的序号，从0开始",
          },
          text: {
            label: "选项文本",
            suggestName: "itemText",
            placeholder: "纯文本模式时选项的文本",
          },
          title: {
            label: "选项标题",
            suggestName: "itemTitle",
            placeholder: "JSON模式时选项的标题",
          },
          description: {
            label: "选项描述",
            suggestName: "itemDescription",
            placeholder: "JSON模式时选项的描述",
          },
        },
      },
    },
    {
      value: "quickcommand.showTextArea",
      label: "文本框",
      asyncMode: "await",
      outputs: {
        label: "文本框内容",
        suggestName: "textAreaContent",
        typeName: "字符串",
      },
      config: [
        {
          label: "文本框占位符",
          component: "VariableInput",
          defaultValue: newVarInputVal("str", "请输入"),
          width: 6,
        },
        {
          label: "文本框默认值",
          component: "VariableInput",
          defaultValue: newVarInputVal("str"),
          width: 6,
        },
      ],
      subCommands: [
        {
          value: "quickcommand.showTextArea",
          icon: "call_to_action",
          label: "插件内弹窗",
        },
        {
          value: "quickcommand.showSystemTextArea",
          icon: "report",
          label: "系统弹窗",
        },
      ],
    },
    {
      value: "quickcommand.showSystemWaitButton",
      label: "等待操作按钮",
      asyncMode: "await",
      outputs: {
        label: "是否点击按钮",
        suggestName: "isWaitButtonClicked",
        typeName: "布尔值",
      },
      config: [
        {
          component: "OptionEditor",
          options: {
            text: {
              label: "按钮文本",
              component: "VariableInput",
              width: 6,
            },
            position: {
              label: "按钮位置",
              component: "QSelect",
              width: 3,
              options: [
                { label: "屏幕左上角", value: "top-left" },
                { label: "屏幕右上角", value: "top-right" },
                { label: "屏幕左下角", value: "bottom-left" },
                { label: "屏幕右下角", value: "bottom-right" },
              ],
            },
            showCancel: {
              label: "显示取消按钮",
              component: "CheckButton",
              width: 3,
            },
          },
          defaultValue: {
            text: newVarInputVal("str", "点击继续"),
            position: "bottom-right",
            showCancel: true,
          },
        },
      ],
    },
    {
      value: "quickcommand.showProcessBar",
      label: "显示进度条",
      description:
        "显示一个带有暂停、恢复、关闭回调功能的进度条，支持动态更新进度，注意，即使设置等待运行完毕，显示进度条的过程中也不会阻塞后续运行，请通过关闭回调来处理关闭事件。",
      asyncMode: "await",
      outputs: {
        label: "进度条对象",
        suggestName: "processBar",
      },
      config: [
        {
          component: "OptionEditor",
          options: {
            text: {
              label: "文本",
              component: "VariableInput",
              width: 4,
            },
            value: {
              label: "初始进度值(0-100)",
              component: "VariableInput",
              placeholder: "留空则显示加载动画",
              disableToggleType: true,
              width: 4,
            },
            position: {
              label: "位置",
              component: "QSelect",
              width: 4,
              options: [
                { label: "屏幕左上角", value: "top-left" },
                { label: "屏幕右上角", value: "top-right" },
                { label: "屏幕左下角", value: "bottom-left" },
                { label: "屏幕右下角", value: "bottom-right" },
              ],
            },
            onClose: {
              label: "关闭按钮回调函数",
              component: "VariableInput",
              disableToggleType: true,
              width: 4,
            },
            onPause: {
              label: "暂停按钮回调函数",
              component: "VariableInput",
              disableToggleType: true,
              width: 4,
              placeholder: "必须和恢复回调一起配置",
            },
            onResume: {
              label: "恢复按钮回调函数",
              component: "VariableInput",
              disableToggleType: true,
              width: 4,
              placeholder: "必须和暂停回调一起配置",
            },
          },
          defaultValue: {
            title: newVarInputVal("str", "进度"),
            text: newVarInputVal("str", "处理中..."),
            value: newVarInputVal("var"),
            position: "bottom-right",
            onClose: newVarInputVal("var"),
            onPause: newVarInputVal("var"),
            onResume: newVarInputVal("var"),
          },
        },
      ],
    },
    {
      value: "quickcommand.updateProcessBar",
      label: "更新进度条",
      neverHasOutput: true,
      config: [
        {
          component: "OptionEditor",
          options: {
            value: {
              label: "进度值(0-100)",
              component: "VariableInput",
              placeholder: "留空则显示加载动画",
              width: 4,
              disableToggleType: true,
            },
            text: {
              label: "文本",
              component: "VariableInput",
              width: 4,
            },
            complete: {
              label: "完成并关闭",
              component: "CheckButton",
              width: 4,
              defaultValue: false,
            },
          },
          defaultValue: {
            value: newVarInputVal("var", "100"),
            text: newVarInputVal("str"),
            complete: false,
          },
        },
        {
          label: "进度条对象",
          component: "VariableInput",
          width: 12,
          placeholder: "不传则更新最近的进度条",
          defaultValue: newVarInputVal("var"),
          disableToggleType: true,
        },
      ],
    },
    {
      value: "utools.showOpenDialog",
      label: "文件选择框",
      subCommands: [
        {
          value: "utools.showOpenDialog",
          label: "打开文件对话框",
          icon: "folder_open",
          config: [
            {
              label: "选项",
              component: "OptionEditor",
              defaultValue: DIALOG_CONFIG.defaultValue,
              options: {
                ...DIALOG_CONFIG.options,
                properties: OPEN_DIALOG_PROPERTIES,
              },
            },
          ],
          outputs: {
            label: "选择的文件列表",
            suggestName: "selectedFiles",
            structure: [
              { label: "第一个文件路径", suggestName: "firstFilePath" },
              { label: "第二个文件路径", suggestName: "secondFilePath" },
              { label: "第三个文件路径", suggestName: "thirdFilePath" },
            ],
          },
        },
        {
          value: "utools.showSaveDialog",
          label: "保存文件对话框",
          icon: "save",
          config: [
            {
              label: "选项",
              component: "OptionEditor",
              defaultValue: DIALOG_CONFIG.defaultValue,
              options: {
                ...DIALOG_CONFIG.options,
                properties: SAVE_DIALOG_PROPERTIES,
              },
            },
          ],
          outputs: {
            label: "保存文件路径",
            suggestName: "selectedSavePath",
            typeName: "字符串",
          },
        },
      ],
    },
  ],
};
