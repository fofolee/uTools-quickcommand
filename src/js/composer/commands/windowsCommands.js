import { newVarInputVal } from "js/composer/varInputValManager.js";

const sendKeys = [
  // 特殊按键
  { value: "{ENTER}", label: "回车键 (Enter)" },
  { value: "{BACKSPACE}", label: "退格键 (Backspace)" },
  { value: "{BREAK}", label: "Break键" },
  { value: "{CAPSLOCK}", label: "大写锁定 (Caps Lock)" },
  { value: "{DELETE}", label: "删除键 (Delete)" },
  { value: "{END}", label: "End键" },
  { value: "{ESC}", label: "ESC键" },
  { value: "{HELP}", label: "帮助键" },
  { value: "{HOME}", label: "Home键" },
  { value: "{INSERT}", label: "插入键 (Insert)" },
  { value: "{INS}", label: "插入键 (Ins)" },
  { value: "{NUMLOCK}", label: "数字锁定键" },
  { value: "{PGDN}", label: "下一页 (Page Down)" },
  { value: "{PGUP}", label: "上一页 (Page Up)" },
  { value: "{PRTSC}", label: "打印屏幕键" },
  { value: "{SCROLLLOCK}", label: "滚动锁定键" },
  { value: "{TAB}", label: "Tab键" },
  { value: "{DOWN}", label: "向下键" },
  { value: "{LEFT}", label: "向左键" },
  { value: "{RIGHT}", label: "向右键" },
  { value: "{UP}", label: "向上键" },
  // 功能键
  ...new Array(12).fill(0).map((_, index) => ({
    value: `{F${index + 1}}`,
    label: `F${index + 1}`,
  })),
  // 数字键盘
  ...new Array(10).fill(0).map((_, index) => ({
    value: `{NUMPAD${index}}`,
    label: `小键盘 ${index}`,
  })),
  { value: "{ADD}", label: "小键盘加号" },
  { value: "{SUBTRACT}", label: "小键盘减号" },
  { value: "{MULTIPLY}", label: "小键盘乘号" },
  { value: "{DIVIDE}", label: "小键盘除号" },
];

const modifierKeys = [
  // 修饰键组合示例
  { value: "^", label: "Ctrl" },
  { value: "%", label: "Alt" },
  { value: "+", label: "Shift" },
  { value: "^c", label: "Ctrl+C" },
];

const registryPaths = [
  // 系统设置
  {
    value: "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion",
    label: "Windows设置",
  },
  { value: "HKLM\\SYSTEM\\CurrentControlSet\\Control", label: "系统控制" },
  {
    value: "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion",
    label: "Windows NT设置",
  },

  // 启动项
  {
    value: "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run",
    label: "系统启动项",
  },
  {
    value: "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run",
    label: "用户启动项",
  },

  // 软件设置
  {
    value: "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
    label: "已安装软件(64位)",
  },
  {
    value:
      "HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
    label: "已安装软件(32位)",
  },

  // 文件关联
  { value: "HKLM\\SOFTWARE\\Classes", label: "系统文件关联" },
  { value: "HKCU\\SOFTWARE\\Classes", label: "用户文件关联" },

  // 服务
  { value: "HKLM\\SYSTEM\\CurrentControlSet\\Services", label: "系统服务" },

  // 环境变量
  {
    value:
      "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
    label: "系统环境变量",
  },
  { value: "HKCU\\Environment", label: "用户环境变量" },

  // 网络设置
  {
    value: "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters",
    label: "TCP/IP设置",
  },
  {
    value: "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\NetworkList",
    label: "网络配置",
  },
];

const searchWindowConfig = [
  {
    label: "窗口查找方式",
    component: "QSelect",
    icon: "search",
    width: 3,
    options: [
      { label: "标题", value: "title" },
      { label: "类名", value: "class" },
      { label: "句柄", value: "handle" },
      { label: "进程名", value: "process" },
      { label: "活动窗口", value: "active" },
    ],
    defaultValue: "title",
  },
  {
    label: "窗口标题/类名/句柄/进程名/活动窗口",
    component: "VariableInput",
    icon: "title",
    width: 9,
    placeholder: "标题、类名支持模糊匹配，选择活动窗口无需输入",
    options: {
      window: {
        props: [
          { label: "标题", value: "title" },
          { label: "类名", value: "class" },
          { label: "句柄", value: "handle" },
          { label: "进程名", value: "processName" },
        ],
      },
    },
  },
];

const windowHandleConfig = [
  {
    label: "窗口句柄",
    component: "VariableInput",
    icon: "window",
    width: 12,
    placeholder: "可从搜索/选择窗口获取，留空则使用当前活动窗口",
    defaultValue: newVarInputVal("str", ""),
    options: {
      window: {
        props: "handle",
      },
    },
  },
];

const searchElementConfig = [
  ...windowHandleConfig,
  {
    label: "元素查找方式",
    component: "QSelect",
    icon: "search",
    width: 4,
    options: [
      { label: "XPath", value: "xpath" },
      { label: "AutomationId", value: "id" },
      { label: "Name", value: "name" },
      { label: "组合条件", value: "condition" },
    ],
    defaultValue: "xpath",
  },
  {
    label: "查找值",
    component: "VariableInput",
    icon: "account_tree",
    options: {
      window: {
        props: [
          { label: "XPath", value: "element.xpath" },
          { label: "AutomationId", value: "element.automationId" },
          { label: "Name", value: "element.name" },
        ],
      },
    },
    width: 8,
    placeholder: "XPath: /Pane[3]/Edit[2], 组合条件: name=按钮&type=Button",
  },
];

const windowInfoStructure = {
  title: { label: "窗口标题", suggestName: "windowTitle" },
  class: { label: "窗口类名", suggestName: "windowClass" },
  handle: { label: "窗口句柄", suggestName: "windowHandle" },
  x: { label: "窗口X坐标", suggestName: "windowX" },
  y: { label: "窗口Y坐标", suggestName: "windowY" },
  width: { label: "窗口宽度", suggestName: "windowWidth" },
  height: { label: "窗口高度", suggestName: "windowHeight" },
  processName: { label: "窗口进程名", suggestName: "windowProcessName" },
  processPath: { label: "窗口进程路径", suggestName: "windowProcessPath" },
  element: {
    label: "元素信息",
    name: { label: "元素名称", suggestName: "elementName" },
    class: { label: "元素类名", suggestName: "elementClass" },
    type: { label: "元素类型", suggestName: "elementType" },
    automationId: {
      label: "元素AutomationId",
      suggestName: "elementAutomationId",
    },
    xpath: { label: "元素XPath", suggestName: "elementXPath" },
    handle: { label: "元素句柄", suggestName: "elementHandle" },
    x: { label: "元素X坐标", suggestName: "elementX" },
    y: { label: "元素Y坐标", suggestName: "elementY" },
    width: { label: "元素宽度", suggestName: "elementWidth" },
    height: { label: "元素高度", suggestName: "elementHeight" },
  },
  position: {
    label: "鼠标位置",
    x: { label: "鼠标X坐标", suggestName: "mouseX" },
    y: { label: "鼠标Y坐标", suggestName: "mouseY" },
  },
};

const controlResultStructure = {
  success: { label: "是否成功", suggestName: "isSuccess" },
  error: {
    label: "错误信息",
    suggestName: "errorMessage",
    placeholder: "操作失败时的错误信息",
  },
};

export const windowsCommands = {
  label: "Win自动化",
  icon: "window",
  defaultOpened: false,
  commands: [
    // 获取窗口
    {
      value: "quickcomposer.windows.window.getWindowInfo",
      label: "搜索/选择窗口",
      icon: "window",
      asyncMode: "await",
      config: [],
      subCommands: [
        {
          config: searchWindowConfig,
          value: "quickcomposer.windows.window.getWindowInfo",
          label: "搜索窗口",
          icon: "search",
          outputs: {
            label: "窗口信息",
            suggestName: "windowInfo",
            structure: [
              {
                handle: { label: "窗口句柄", suggestName: "windowHandle" },
                title: { label: "窗口标题", suggestName: "windowTitle" },
                class: { label: "窗口类名", suggestName: "windowClass" },
                x: { label: "窗口X坐标", suggestName: "windowX" },
                y: { label: "窗口Y坐标", suggestName: "windowY" },
                width: { label: "窗口宽度", suggestName: "windowWidth" },
                height: { label: "窗口高度", suggestName: "windowHeight" },
                processName: {
                  label: "窗口进程名",
                  suggestName: "windowProcessName",
                },
                processPath: {
                  label: "窗口进程路径",
                  suggestName: "windowProcessPath",
                },
              },
            ],
          },
        },
        {
          value: "quickcomposer.windows.automation.inspect",
          label: "手动选择窗口",
          icon: "my_location",
          outputs: {
            label: "窗口信息",
            suggestName: "windowInfo",
            structure: windowInfoStructure,
          },
        },
        {
          value: "quickcomposer.windows.automation.inspectPosition",
          label: "从坐标选择窗口",
          icon: "location_on",
          config: [
            {
              component: "OptionEditor",
              options: {
                x: {
                  label: "X坐标",
                  component: "VariableInput",
                  disableToggleType: true,
                  icon: "arrow_right",
                  placeholder: "留空使用当前鼠标位置",
                  width: 6,
                  disableToggleType: true,
                },
                y: {
                  label: "Y坐标",
                  component: "VariableInput",
                  disableToggleType: true,
                  icon: "arrow_drop_down",
                  placeholder: "留空使用当前鼠标位置",
                  width: 6,
                  disableToggleType: true,
                },
              },
              defaultValue: {
                x: newVarInputVal("var"),
                y: newVarInputVal("var"),
              },
            },
          ],
          outputs: {
            label: "窗口信息",
            suggestName: "windowInfo",
            structure: windowInfoStructure,
          },
        },
      ],
    },
    // 窗口
    {
      value: "quickcomposer.windows.window.setTopMost",
      label: "窗口控制",
      icon: "window",
      config: windowHandleConfig,
      outputs: {
        label: "操作结果",
        suggestName: "windowControlResult",
        structure: controlResultStructure,
      },
      subCommands: [
        {
          value: "quickcomposer.windows.window.setTopMost",
          label: "窗口置顶",
          icon: "vertical_align_top",
          config: [
            {
              component: "ButtonGroup",
              icon: "push_pin",
              width: 12,
              options: [
                { label: "置顶", value: true },
                { label: "取消置顶", value: false },
              ],
              defaultValue: true,
            },
          ],
        },
        {
          value: "quickcomposer.windows.window.setOpacity",
          label: "窗口透明度",
          icon: "opacity",
          config: [
            {
              label: "透明度",
              component: "VariableInput",
              icon: "opacity",
              width: 12,
              disableToggleType: true,
              defaultValue: newVarInputVal("var", "80"),
            },
          ],
        },
        {
          value: "quickcomposer.windows.window.setWindowRect",
          label: "窗口位置大小",
          icon: "aspect_ratio",
          config: [
            {
              label: "X坐标",
              component: "VariableInput",
              icon: "arrow_right",
              width: 6,
              disableToggleType: true,
              defaultValue: newVarInputVal("var"),
            },
            {
              label: "Y坐标",
              component: "VariableInput",
              icon: "arrow_drop_down",
              width: 6,
              disableToggleType: true,
              defaultValue: newVarInputVal("var"),
            },
            {
              label: "宽度",
              component: "VariableInput",
              icon: "swap_horiz",
              width: 6,
              disableToggleType: true,
              defaultValue: newVarInputVal("var", "800"),
            },
            {
              label: "高度",
              component: "VariableInput",
              icon: "height",
              width: 6,
              disableToggleType: true,
              defaultValue: newVarInputVal("var", "600"),
            },
          ],
        },
        {
          value: "quickcomposer.windows.window.setWindowState",
          label: "窗口状态",
          icon: "open_in_full",
          config: [
            {
              component: "ButtonGroup",
              icon: "aspect_ratio",
              width: 12,
              options: [
                { label: "最大化", value: "maximize" },
                { label: "最小化", value: "minimize" },
                { label: "还原", value: "normal" },
              ],
              defaultValue: "maximize",
            },
          ],
        },
        {
          value: "quickcomposer.windows.window.closeWindow",
          label: "关闭窗口",
          icon: "close",
        },
        {
          value: "quickcomposer.windows.window.setFocus",
          label: "聚焦窗口",
          icon: "front_hand",
        },
        {
          value: "quickcomposer.windows.window.setBorder",
          label: "窗口边框",
          icon: "border_style",
          config: [
            {
              component: "ButtonGroup",
              icon: "border_style",
              width: 12,
              options: [
                { label: "显示边框", value: true },
                { label: "隐藏边框", value: false },
              ],
              defaultValue: true,
            },
          ],
        },
        {
          value: "quickcomposer.windows.window.setClickThrough",
          label: "点击穿透",
          icon: "touch_app",
          config: [
            {
              component: "ButtonGroup",
              icon: "touch_app",
              width: 12,
              options: [
                { label: "开启穿透", value: true },
                { label: "关闭穿透", value: false },
              ],
              defaultValue: false,
            },
          ],
        },
      ],
      asyncMode: "await",
    },
    // 资源管理器
    {
      value: "quickcomposer.windows.explorer.list",
      label: "资源管理器操作",
      icon: "folder",
      asyncMode: "await",
      subCommands: [
        {
          value: "quickcomposer.windows.explorer.list",
          label: "获取所有已打开路径",
          icon: "folder",
          outputs: {
            label: "已打开路径列表",
            suggestName: "explorerList",
            structure: [
              {
                handle: { label: "窗口句柄", suggestName: "windowHandle" },
                title: { label: "窗口标题", suggestName: "windowTitle" },
                path: { label: "当前路径", suggestName: "windowPath" },
                class: { label: "窗口类名", suggestName: "windowClass" },
              },
            ],
          },
        },
        {
          value: "quickcomposer.windows.explorer.navigate",
          label: "导航到指定路径",
          icon: "folder",
          config: [
            {
              component: "VariableInput",
              label: "窗口句柄",
              icon: "window",
              width: 12,
              placeholder: "输入要导航的窗口句柄",
              defaultValue: newVarInputVal("var"),
              disableToggleType: true,
              width: 4,
            },
            {
              component: "VariableInput",
              label: "路径",
              icon: "folder",
              options: {
                dialog: {
                  type: "open",
                  options: {
                    title: "选择路径",
                    properties: ["openDirectory"],
                  },
                },
              },
              width: 8,
              placeholder: "输入要导航的路径",
            },
          ],
          outputs: {
            label: "是否成功",
            suggestName: "isSuccess",
            typeName: "布尔值",
          },
        },
      ],
    },
    // automation
    {
      value: "quickcomposer.windows.automation.click",
      label: "界面自动化",
      icon: "smart_button",
      asyncMode: "await",
      config: searchElementConfig,
      outputs: {
        label: "操作结果",
        suggestName: "automationResult",
        structure: controlResultStructure,
      },
      subCommands: [
        {
          value: "quickcomposer.windows.automation.click",
          label: "点击元素",
          icon: "mouse",
        },
        {
          value: "quickcomposer.windows.automation.sendkeys",
          label: "模拟键盘输入",
          icon: "keyboard",
          config: [
            {
              component: "OptionEditor",
              options: {
                keys: {
                  label: "输入内容",
                  component: "VariableInput",
                  icon: "keyboard",
                  width: 12,
                  placeholder:
                    "模拟键盘输入，支持按键、组合键、中文，如：ab中文^a{BACKSPACE}",
                  options: {
                    items: [...modifierKeys, ...sendKeys],
                    appendItem: true,
                  },
                },
              },
            },
          ],
        },
        {
          value: "quickcomposer.windows.automation.setvalue",
          label: "设置值",
          icon: "edit",
          config: [
            {
              component: "OptionEditor",
              options: {
                newValue: {
                  label: "新值",
                  component: "VariableInput",
                  icon: "edit",
                  width: 9,
                  placeholder: "要设置的新值",
                },
                sendenter: {
                  label: "发送回车",
                  component: "CheckButton",
                  icon: "keyboard",
                  width: 3,
                },
              },
            },
          ],
        },
        {
          value: "quickcomposer.windows.automation.getvalue",
          label: "获取值",
          icon: "content_paste",
          outputs: {
            label: "操作结果",
            suggestName: "getValueResult",
            structure: {
              ...controlResultStructure,
              data: { label: "元素值", suggestName: "elementValue" },
            },
          },
        },
        {
          value: "quickcomposer.windows.automation.select",
          label: "选择项目",
          icon: "list",
          config: [
            {
              component: "OptionEditor",
              options: {
                item: {
                  label: "选择项",
                  component: "VariableInput",
                  icon: "check_box",
                  width: 12,
                  placeholder: "要选择的项目名称",
                },
              },
            },
          ],
        },
        {
          value: "quickcomposer.windows.automation.enable",
          label: "启用/禁用元素",
          icon: "toggle_on",
          config: [
            {
              component: "OptionEditor",
              options: {
                enable: {
                  component: "ButtonGroup",
                  options: [
                    { label: "启用", value: true },
                    { label: "禁用", value: false },
                  ],
                },
              },
              defaultValue: {
                enable: true,
              },
            },
          ],
        },
        {
          value: "quickcomposer.windows.automation.expand",
          label: "展开/折叠",
          icon: "unfold_more",
          config: [
            {
              component: "OptionEditor",
              options: {
                expand: {
                  label: "操作",
                  component: "ButtonGroup",
                  icon: "unfold_more",
                  width: 12,
                  options: [
                    { label: "展开", value: "true" },
                    { label: "折叠", value: "false" },
                  ],
                },
              },
              defaultValue: {
                expand: "true",
              },
            },
          ],
        },
        {
          value: "quickcomposer.windows.automation.scroll",
          label: "滚动",
          icon: "swap_vert",
          config: [
            {
              component: "OptionEditor",
              options: {
                direction: {
                  label: "方向",
                  component: "ButtonGroup",
                  icon: "swap_vert",
                  width: 6,
                  options: [
                    { label: "垂直", value: "vertical" },
                    { label: "水平", value: "horizontal" },
                  ],
                },
                amount: {
                  label: "位置",
                  component: "VariableInput",
                  icon: "straighten",
                  width: 6,
                  disableToggleType: true,
                },
              },
              defaultValue: {
                direction: "vertical",
                amount: newVarInputVal("var"),
              },
            },
          ],
        },
        {
          value: "quickcomposer.windows.automation.wait",
          label: "等待元素",
          icon: "hourglass_empty",
          config: [
            {
              component: "OptionEditor",
              options: {
                timeout: {
                  label: "超时(秒)",
                  component: "NumberInput",
                  icon: "timer",
                  width: 4,
                  min: 1,
                  max: 3600,
                  step: 10,
                },
              },
              defaultValue: {
                timeout: 30,
              },
            },
          ],
        },
        {
          value: "quickcomposer.windows.automation.focus",
          label: "设置焦点",
          icon: "center_focus_strong",
        },
        {
          value: "quickcomposer.windows.automation.highlight",
          label: "高亮显示",
          icon: "highlight",
          config: [
            {
              component: "OptionEditor",
              options: {
                duration: {
                  label: "持续时间(秒)",
                  component: "NumberInput",
                  icon: "timer",
                  width: 12,
                  min: 1,
                  max: 60,
                  step: 5,
                },
              },
              defaultValue: {
                duration: 2,
              },
            },
          ],
        },
      ],
    },
    // sendmessage
    {
      value: "quickcomposer.windows.sendmessage.listControls",
      label: "发送控制消息",
      icon: "smart_button",
      asyncMode: "await",
      config: windowHandleConfig,
      outputs: {
        label: "操作结果",
        suggestName: "sendMessageResult",
        structure: controlResultStructure,
      },
      subCommands: [
        {
          value: "quickcomposer.windows.sendmessage.listControls",
          label: "获取控件树",
          icon: "account_tree",
          config: [
            {
              component: "OptionEditor",
              width: 12,
              options: {
                filter: {
                  label: "控件过滤",
                  component: "VariableInput",
                  icon: "filter_alt",
                  options: {
                    window: {
                      props: "element.type",
                    },
                  },
                  width: 8,
                  placeholder: "可选，输入要过滤的控件类型或文本",
                },
                background: {
                  label: "后台操作",
                  component: "CheckButton",
                  icon: "back_hand",
                  width: 4,
                },
              },
              defaultValue: {
                background: true,
              },
            },
          ],
          outputs: {
            label: "控件树信息",
            suggestName: "controlsTree",
            structure: [
              {
                handle: { label: "句柄", suggestName: "handle" },
                class: { label: "类名", suggestName: "class" },
                text: { label: "文本", suggestName: "text" },
                visible: { label: "是否可见", suggestName: "visible" },
                location: {
                  label: "位置",
                  suggestName: "location",
                  placeholder: "对象，x,y,width,height",
                },
                matched: { label: "是否匹配", suggestName: "matched" },
                children: {
                  label: "子控件",
                  suggestName: "childrenControls",
                  placeholder: "数组，所有子控件信息",
                },
              },
            ],
          },
        },
        {
          value: "quickcomposer.windows.sendmessage.click",
          label: "点击控件",
          icon: "mouse",
          config: [
            {
              component: "ButtonGroup",
              width: 12,
              options: [
                { label: "单击", value: "click" },
                { label: "双击", value: "doubleclick" },
                { label: "右键", value: "rightclick" },
              ],
              defaultValue: "click",
            },
            {
              component: "OptionEditor",
              width: 12,
              options: {
                control: {
                  label: "控件类型",
                  component: "VariableInput",
                  icon: "class",
                  options: {
                    window: {
                      props: "element.type",
                    },
                  },
                  width: 6,
                  placeholder: "可选，和文本至少输入一个",
                },
                text: {
                  label: "控件文本",
                  component: "VariableInput",
                  icon: "text_fields",
                  options: {
                    window: {
                      props: "element.name",
                    },
                  },
                  width: 6,
                  placeholder: "可选，和控件类型至少输入一个",
                },
                pos: {
                  label: "坐标",
                  component: "VariableInput",
                  icon: "place",
                  width: 6,
                  placeholder: "可选，格式：x,y",
                },
                background: {
                  label: "后台操作",
                  component: "CheckButton",
                  icon: "back_hand",
                  width: 6,
                },
              },
              defaultValue: {
                background: true,
              },
            },
          ],
        },
        {
          value: "quickcomposer.windows.sendmessage.sendText",
          label: "发送文本",
          icon: "keyboard",
          config: [
            {
              label: "文本内容",
              component: "VariableInput",
              icon: "text_fields",
              width: 12,
              placeholder: "要发送的文本内容",
            },
            {
              component: "OptionEditor",
              width: 12,
              options: {
                control: {
                  label: "目标控件",
                  component: "VariableInput",
                  options: {
                    window: {
                      props: "element.type",
                    },
                  },
                  icon: "class",
                  width: 8,
                  placeholder: "可选，目标控件的类名",
                },
                background: {
                  label: "后台操作",
                  component: "CheckButton",
                  icon: "back_hand",
                  width: 4,
                },
              },
              defaultValue: {
                background: true,
              },
            },
          ],
        },
        {
          value: "quickcomposer.windows.sendmessage.sendKeys",
          label: "发送按键",
          icon: "keyboard_alt",
          config: [
            {
              label: "按键序列",
              component: "VariableInput",
              icon: "keyboard",
              width: 12,
              placeholder: "多个逗号隔开，如：a,b,{ENTER}，不支持组合键",
              options: {
                items: sendKeys,
                appendItem: true,
              },
            },
            {
              component: "OptionEditor",
              width: 12,
              options: {
                control: {
                  label: "目标控件",
                  component: "VariableInput",
                  options: {
                    window: {
                      props: "element.type",
                    },
                  },
                  icon: "class",
                  width: 8,
                  placeholder: "可选，目标控件的类名",
                },
                background: {
                  label: "后台操作",
                  component: "CheckButton",
                  icon: "back_hand",
                  width: 4,
                },
              },
              defaultValue: {
                background: true,
              },
            },
          ],
        },
      ],
    },
    // 监控
    {
      value: "quickcomposer.windows.monitor.watchClipboard",
      label: "剪贴板/文件监控",
      icon: "monitor_heart",
      asyncMode: "await",
      subCommands: [
        {
          value: "quickcomposer.windows.monitor.watchClipboard",
          label: "等待剪贴板变化",
          icon: "content_paste",
          outputs: {
            label: "剪贴板变化事件",
            suggestName: "clipboardChangeEvent",
            structure: {
              format: {
                label: "变化内容类型",
                suggestName: "clipboardContentFormat",
                placeholder: "如: text, files",
              },
              content: {
                label: "剪切板内容",
                suggestName: "clipboardContent",
              },
            },
          },
        },
        {
          value: "quickcomposer.windows.monitor.watchFileSystem",
          label: "等待文件夹变化",
          icon: "folder",
          config: [
            {
              label: "监控路径",
              component: "VariableInput",
              icon: "folder",
              width: 12,
              options: {
                dialog: {
                  type: "open",
                  options: {
                    title: "选择文件夹",
                    properties: ["openDirectory"],
                  },
                },
              },
              placeholder: "要监控的文件夹路径",
              required: true,
            },
            {
              component: "OptionEditor",
              width: 12,
              options: {
                filter: {
                  label: "文件过滤",
                  component: "VariableInput",
                  icon: "filter_alt",
                  width: 6,
                  placeholder: "如: *.txt, *.docx",
                },
                recursive: {
                  label: "包含子文件夹",
                  component: "CheckButton",
                  icon: "subdirectory_arrow_right",
                  width: 6,
                  defaultValue: true,
                },
              },
              defaultValue: {
                recursive: false,
              },
            },
          ],
          outputs: {
            label: "文件夹变化事件",
            suggestName: "fileChangeEvent",
            structure: {
              event: {
                label: "事件类型",
                suggestName: "fileChangeEventType",
                placeholder: "如: created, modified, deleted",
              },
              path: {
                label: "变化文件路径",
                suggestName: "changedFilePath",
              },
            },
          },
        },
      ],
    },
    // 进程
    {
      value: "quickcomposer.windows.process.listProcesses",
      label: "进程管理",
      icon: "memory",
      asyncMode: "await",
      subCommands: [
        {
          value: "quickcomposer.windows.process.listProcesses",
          label: "进程列表",
          icon: "list",
          outputs: {
            label: "进程列表",
            suggestName: "processList",
            structure: [
              {
                id: { label: "进程ID", suggestName: "processId" },
                name: { label: "进程名称", suggestName: "processName" },
                title: { label: "进程标题", suggestName: "processTitle" },
                path: { label: "进程路径", suggestName: "processPath" },
                startTime: {
                  label: "启动时间",
                  suggestName: "processStartTime",
                },
                cpuTime: { label: "CPU时间", suggestName: "processCpuTime" },
                memory: { label: "内存使用", suggestName: "processMemory" },
                threads: { label: "线程数", suggestName: "processThreads" },
                priority: { label: "优先级", suggestName: "processPriority" },
                description: {
                  label: "描述",
                  suggestName: "processDescription",
                },
                company: { label: "公司", suggestName: "processCompany" },
                version: { label: "版本", suggestName: "processVersion" },
              },
            ],
          },
        },
        {
          value: "quickcomposer.windows.process.killProcess",
          label: "终止进程",
          icon: "stop_circle",
          config: [
            {
              label: "进程ID/名称",
              component: "VariableInput",
              icon: "tag",
              width: 12,
              placeholder: "输入进程ID或名称",
              required: true,
            },
          ],
          outputs: {
            label: "是否成功",
            suggestName: "isProcessTerminateSuccess",
            typeName: "布尔值",
          },
        },
        {
          value: "quickcomposer.windows.process.startProcess",
          label: "启动进程",
          icon: "play_circle",
          config: [
            {
              label: "程序路径",
              component: "VariableInput",
              icon: "folder",
              width: 12,
              options: {
                dialog: {
                  type: "open",
                  options: {
                    title: "选择程序",
                    filters: [
                      { name: "可执行文件", extensions: ["exe"] },
                      { name: "所有文件", extensions: ["*"] },
                    ],
                  },
                },
              },
            },
            {
              label: "启动参数",
              component: "VariableInput",
              icon: "code",
              width: 12,
              placeholder: "可选的启动参数",
            },
          ],
          outputs: {
            label: "是否成功",
            suggestName: "isProcessStartSuccess",
            typeName: "布尔值",
          },
        },
      ],
    },
    // 注册表
    {
      value: "quickcomposer.windows.registry.listKeys",
      label: "注册表管理",
      icon: "settings",
      asyncMode: "await",
      config: [
        {
          label: "注册表路径",
          component: "VariableInput",
          icon: "folder",
          width: 12,
          placeholder: "如: HKLM\\SOFTWARE\\Microsoft\\Windows",
          options: {
            items: registryPaths,
          },
        },
      ],
      subCommands: [
        {
          value: "quickcomposer.windows.registry.listKeys",
          label: "列出项",
          icon: "list",
          outputs: {
            label: "注册表项列表",
            suggestName: "registryKeys",
            structure: [
              {
                path: {
                  label: "注册表路径",
                  suggestName: "registryPath",
                },
                name: {
                  label: "项名称",
                  suggestName: "registryName",
                },
              },
            ],
          },
        },
        {
          value: "quickcomposer.windows.registry.getValue",
          label: "获取值",
          icon: "search",
          config: [
            {
              label: "注册表路径",
              component: "VariableInput",
              icon: "folder",
              width: 12,
              placeholder: "如: HKLM\\SOFTWARE\\Microsoft\\Windows",
              options: {
                items: registryPaths,
              },
              required: true,
            },
            {
              label: "值名称",
              component: "VariableInput",
              icon: "label",
              width: 12,
              placeholder: "要获取的值名称",
            },
          ],
        },
        {
          value: "quickcomposer.windows.registry.setValue",
          label: "设置值",
          icon: "edit",
          config: [
            {
              label: "注册表路径",
              component: "VariableInput",
              icon: "folder",
              width: 12,
              placeholder: "如: HKLM\\SOFTWARE\\Microsoft\\Windows",
              options: {
                items: registryPaths,
              },
              required: true,
            },
            {
              label: "值名称",
              component: "VariableInput",
              icon: "label",
              width: 12,
              placeholder: "要设置的值名称",
              required: true,
            },
            {
              label: "值内容",
              component: "VariableInput",
              icon: "text_fields",
              width: 8,
              required: true,
            },
            {
              label: "值类型",
              component: "QSelect",
              icon: "category",
              width: 4,
              options: [
                { label: "字符串", value: "string" },
                { label: "可扩展字符串", value: "expandstring" },
                { label: "二进制", value: "binary" },
                { label: "DWORD", value: "dword" },
                { label: "QWORD", value: "qword" },
                { label: "多字符串", value: "multistring" },
              ],
              defaultValue: "string",
            },
          ],
        },
        {
          value: "quickcomposer.windows.registry.deleteValue",
          label: "删除值",
          icon: "delete",
          config: [
            {
              label: "注册表路径",
              component: "VariableInput",
              icon: "folder",
              width: 12,
              placeholder: "如: HKLM\\SOFTWARE\\Microsoft\\Windows",
              options: {
                items: registryPaths,
              },
              required: true,
            },
            {
              label: "值名称",
              component: "VariableInput",
              icon: "label",
              width: 12,
              placeholder: "要删除的值名称(留空删除整个项)",
            },
          ],
        },
      ],
    },
    // 服务
    {
      value: "quickcomposer.windows.service.listServices",
      label: "服务管理",
      icon: "miscellaneous_services",
      asyncMode: "await",
      subCommands: [
        {
          value: "quickcomposer.windows.service.listServices",
          label: "服务列表",
          icon: "list",
          outputs: {
            label: "服务列表",
            suggestName: "serviceList",
            structure: [
              {
                name: { label: "服务名称", suggestName: "serviceName" },
                displayName: {
                  label: "显示名称",
                  suggestName: "serviceDisplayName",
                },
                status: { label: "状态", suggestName: "serviceStatus" },
              },
            ],
          },
        },
        {
          value: "quickcomposer.windows.service.controlService",
          label: "控制服务",
          icon: "settings",
          config: [
            {
              label: "服务名称",
              component: "VariableInput",
              icon: "label",
              width: 12,
              placeholder: "输入服务名称",
              required: true,
            },
            {
              label: "操作",
              component: "ButtonGroup",
              icon: "play_circle",
              width: 12,
              options: [
                { label: "启动", value: "start" },
                { label: "停止", value: "stop" },
                { label: "暂停", value: "pause" },
                { label: "继续", value: "continue" },
              ],
              defaultValue: "start",
            },
          ],
        },
      ],
    },
    // 软件
    {
      value: "quickcomposer.windows.software.listSoftware",
      label: "软件管理",
      icon: "apps",
      asyncMode: "await",
      subCommands: [
        {
          value: "quickcomposer.windows.software.listSoftware",
          label: "软件列表",
          icon: "list",
          outputs: {
            label: "软件列表",
            suggestName: "softwareList",
            structure: [
              {
                name: { label: "软件名称", suggestName: "softwareName" },
                publisher: {
                  label: "发布者",
                  suggestName: "softwarePublisher",
                },
                version: { label: "版本", suggestName: "softwareVersion" },
                source: { label: "来源", suggestName: "softwareSource" },
                id: { label: "ID", suggestName: "softwareId" },
              },
            ],
          },
        },
        {
          value: "quickcomposer.windows.software.uninstallSoftware",
          label: "卸载软件",
          icon: "delete",
          config: [
            {
              label: "软件ID",
              component: "VariableInput",
              icon: "tag",
              width: 12,
              placeholder: "输入软件ID(从软件列表获取)",
              required: true,
            },
          ],
        },
      ],
    },
    // 系统工具
    {
      value: "quickcomposer.windows.utils.setWallpaper",
      label: "系统工具",
      icon: "build",
      asyncMode: "await",
      subCommands: [
        {
          value: "quickcomposer.windows.utils.setWallpaper",
          label: "设置壁纸",
          icon: "wallpaper",
          config: [
            {
              label: "壁纸路径",
              component: "VariableInput",
              icon: "image",
              width: 12,
              options: {
                dialog: {
                  type: "open",
                  options: {
                    title: "选择壁纸",
                    filters: [
                      {
                        name: "图片文件",
                        extensions: ["jpg", "jpeg", "png", "bmp"],
                      },
                    ],
                  },
                },
              },
              required: true,
            },
          ],
        },
        {
          value: "quickcomposer.windows.utils.controlMonitor",
          label: "控制显示器",
          icon: "desktop_windows",
          config: [
            {
              component: "ButtonGroup",
              icon: "power_settings_new",
              width: 12,
              options: [
                { label: "开启", value: "on" },
                { label: "关闭", value: "off" },
              ],
              defaultValue: "off",
            },
          ],
        },
        {
          value: "quickcomposer.windows.utils.powerControl",
          label: "电源控制",
          icon: "power",
          config: [
            {
              component: "ButtonGroup",
              icon: "power_settings_new",
              width: 12,
              options: [
                { label: "睡眠", value: "sleep" },
                { label: "休眠", value: "hibernate" },
                { label: "保持唤醒", value: "awake" },
                { label: "正常", value: "normal" },
              ],
              defaultValue: "sleep",
            },
          ],
        },
        {
          value: "quickcomposer.windows.utils.configureNetwork",
          label: "配置网络",
          icon: "network_check",
          config: [
            {
              label: "网卡名称",
              component: "VariableInput",
              icon: "settings_ethernet",
              width: 12,
              placeholder: "输入网卡名称",
              required: true,
            },
            {
              label: "IP地址",
              component: "VariableInput",
              icon: "router",
              width: 6,
              placeholder: "如: 192.168.1.100",
              required: true,
            },
            {
              label: "子网掩码",
              component: "VariableInput",
              icon: "filter_alt",
              width: 6,
              placeholder: "如: 255.255.255.0",
              required: true,
            },
            {
              label: "默认网关",
              component: "VariableInput",
              icon: "dns",
              width: 6,
              placeholder: "可选",
            },
            {
              label: "DNS服务器",
              component: "VariableInput",
              icon: "dns",
              width: 6,
              placeholder: "可选",
            },
          ],
        },
        {
          value: "quickcomposer.windows.utils.manageStartup",
          label: "开机启动项",
          icon: "power",
          config: [
            {
              label: "程序路径",
              component: "VariableInput",
              icon: "folder",
              width: 12,
              options: {
                dialog: {
                  type: "open",
                  options: {
                    title: "选择程序",
                    filters: [
                      { name: "可执行文件", extensions: ["exe"] },
                      { name: "所有文件", extensions: ["*"] },
                    ],
                  },
                },
              },
              required: true,
            },
            {
              label: "启动项名称",
              component: "VariableInput",
              icon: "label",
              width: 8,
              required: true,
            },
            {
              label: "移除",
              component: "CheckButton",
              icon: "delete",
              width: 4,
            },
          ],
        },
        {
          value: "quickcomposer.windows.utils.createShortcut",
          label: "创建快捷方式",
          icon: "link",
          config: [
            {
              label: "目标路径",
              component: "VariableInput",
              icon: "folder",
              width: 12,
              options: {
                dialog: {
                  type: "open",
                  options: {
                    title: "选择目标",
                    filters: [{ name: "所有文件", extensions: ["*"] }],
                  },
                },
              },
              required: true,
            },
            {
              label: "快捷方式路径",
              component: "VariableInput",
              icon: "save",
              width: 12,
              options: {
                dialog: {
                  type: "save",
                  options: {
                    title: "保存快捷方式",
                    filters: [{ name: "快捷方式", extensions: ["lnk"] }],
                  },
                },
              },
              required: true,
            },
            {
              label: "启动参数",
              component: "VariableInput",
              icon: "code",
              width: 12,
              placeholder: "可选的启动参数",
            },
          ],
        },
        {
          value: "quickcomposer.windows.utils.setBrightness",
          label: "设置亮度",
          icon: "brightness_medium",
          config: [
            {
              label: "亮度级别",
              component: "NumberInput",
              icon: "brightness_medium",
              width: 12,
              min: 0,
              max: 100,
              defaultValue: 50,
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
