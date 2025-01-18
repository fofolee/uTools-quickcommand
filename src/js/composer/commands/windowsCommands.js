import { newVarInputVal } from "js/composer/varInputValManager.js";

const controlClass = [
  // 基础控件
  { value: "Button", label: "按钮 (Button)" },
  { value: "Edit", label: "编辑框 (Edit)" },
  { value: "Static", label: "静态文本 (Static)" },
  { value: "ComboBox", label: "下拉框 (ComboBox)" },
  { value: "ListBox", label: "列表框 (ListBox)" },
  { value: "CheckBox", label: "复选框 (CheckBox)" },
  { value: "RadioButton", label: "单选框 (RadioButton)" },

  // 常见对话框控件
  { value: "SysListView32", label: "列表视图 (SysListView32)" },
  { value: "SysTreeView32", label: "树形视图 (SysTreeView32)" },
  { value: "SysTabControl32", label: "选项卡 (SysTabControl32)" },
  { value: "msctls_progress32", label: "进度条 (msctls_progress32)" },
  { value: "msctls_trackbar32", label: "滑块 (msctls_trackbar32)" },
  { value: "msctls_updown32", label: "数字调节器 (msctls_updown32)" },

  // 文件对话框相关
  { value: "DirectUIHWND", label: "文件浏览器 (DirectUIHWND)" },
  { value: "ToolbarWindow32", label: "工具栏 (ToolbarWindow32)" },
  { value: "ComboBoxEx32", label: "扩展下拉框 (ComboBoxEx32)" },

  // 常见应用程序控件
  { value: "RICHEDIT50W", label: "富文本编辑框 (RICHEDIT50W)" },
  { value: "Scintilla", label: "代码编辑器 (Scintilla)" },
  { value: "WebView2", label: "Edge浏览器 (WebView2)" },
  {
    value: "Chrome_RenderWidgetHostHWND",
    label: "Chrome渲染 (Chrome_RenderWidgetHostHWND)",
  },

  // 系统控件
  { value: "Shell_TrayWnd", label: "任务栏 (Shell_TrayWnd)" },
  { value: "TrayNotifyWnd", label: "通知区域 (TrayNotifyWnd)" },
  { value: "ReBarWindow32", label: "工具条容器 (ReBarWindow32)" },
  { value: "TaskListThumbnailWnd", label: "任务预览 (TaskListThumbnailWnd)" },

  // 通用容器
  { value: "Window", label: "窗口 (Window)" },
  { value: "Dialog", label: "对话框 (Dialog)" },
  { value: "#32770", label: "标准对话框 (#32770)" },
  { value: "MDIClient", label: "MDI客户区 (MDIClient)" },
  { value: "ScrollBar", label: "滚动条 (ScrollBar)" },
  { value: "GroupBox", label: "分组框 (GroupBox)" },
];

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
    component: "q-select",
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
  },
];

const searchElementConfig = [
  windowHandleConfig,
  {
    label: "元素查找方式",
    component: "q-select",
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
    width: 8,
    placeholder: "XPath: /Pane[3]/Edit[2], 组合条件: name=按钮&type=Button",
  },
];

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
      isAsync: true,
      config: [],
      subCommands: [
        {
          config: searchWindowConfig,
          value: "quickcomposer.windows.window.getWindowInfo",
          label: "搜索窗口",
          icon: "search",
          outputVariable: "windowInfo",
          saveOutput: true,
        },
        {
          value: "quickcomposer.windows.automation.inspect",
          label: "手动选择窗口",
          icon: "my_location",
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
                  component: "NumberInput",
                  icon: "arrow_right",
                  placeholder: "留空使用当前鼠标位置",
                  width: 6,
                },
                y: {
                  label: "Y坐标",
                  component: "NumberInput",
                  icon: "arrow_drop_down",
                  placeholder: "留空使用当前鼠标位置",
                  width: 6,
                },
              },
            },
          ],
        },
      ],
    },
    // 窗口
    {
      value: "quickcomposer.windows.window.setTopMost",
      label: "窗口控制",
      icon: "window",
      config: windowHandleConfig,
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
              component: "NumberInput",
              icon: "opacity",
              width: 12,
              min: 0,
              max: 100,
              defaultValue: 80,
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
              component: "NumberInput",
              icon: "arrow_right",
              width: 6,
              defaultValue: 0,
            },
            {
              label: "Y坐标",
              component: "NumberInput",
              icon: "arrow_drop_down",
              width: 6,
              defaultValue: 0,
            },
            {
              label: "宽度",
              component: "NumberInput",
              icon: "swap_horiz",
              width: 6,
              min: 0,
              defaultValue: 800,
            },
            {
              label: "高度",
              component: "NumberInput",
              icon: "height",
              width: 6,
              min: 0,
              defaultValue: 600,
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
      isAsync: true,
    },
    // automation
    {
      value: "quickcomposer.windows.automation.click",
      label: "界面自动化",
      icon: "smart_button",
      isAsync: true,
      config: searchElementConfig,
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
          outputVariable: "elementValue",
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
                  component: "NumberInput",
                  icon: "straighten",
                  width: 6,
                  min: 0,
                  max: 100,
                  step: 10,
                },
              },
              defaultValue: {
                direction: "vertical",
                amount: 0,
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
      isAsync: true,
      config: windowHandleConfig,
      subCommands: [
        {
          value: "quickcomposer.windows.sendmessage.listControls",
          label: "获取控件树",
          icon: "account_tree",
          outputVariable: "controlsTree",
          saveOutput: true,
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
                    items: controlClass,
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
                    items: controlClass,
                  },
                  width: 6,
                  placeholder: "可选，和文本至少输入一个",
                },
                text: {
                  label: "控件文本",
                  component: "VariableInput",
                  icon: "text_fields",
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
                    items: controlClass,
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
                    items: controlClass,
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
      isAsync: true,
      outputVariable: "monitorEvent",
      saveOutput: true,
      showLoading: true,
      subCommands: [
        {
          value: "quickcomposer.windows.monitor.watchClipboard",
          label: "等待剪贴板变化",
          icon: "content_paste",
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
        },
      ],
    },
    // 进程
    {
      value: "quickcomposer.windows.process.listProcesses",
      label: "进程管理",
      icon: "memory",
      isAsync: true,
      subCommands: [
        {
          value: "quickcomposer.windows.process.listProcesses",
          label: "进程列表",
          icon: "list",
          outputVariable: "processList",
          saveOutput: true,
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
      ],
    },
    // 注册表
    {
      value: "quickcomposer.windows.registry.listKeys",
      label: "注册表管理",
      icon: "settings",
      isAsync: true,
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
      ],
      subCommands: [
        {
          value: "quickcomposer.windows.registry.listKeys",
          label: "列出项",
          icon: "list",
          outputVariable: "registryKeys",
          saveOutput: true,
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
          outputVariable: "registryValue",
          saveOutput: true,
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
              component: "q-select",
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
      isAsync: true,
      subCommands: [
        {
          value: "quickcomposer.windows.service.listServices",
          label: "服务列表",
          icon: "list",
          outputVariable: "serviceList",
          saveOutput: true,
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
      isAsync: true,
      subCommands: [
        {
          value: "quickcomposer.windows.software.listSoftware",
          label: "软件列表",
          icon: "list",
          outputVariable: "softwareList",
          saveOutput: true,
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
      isAsync: true,
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
