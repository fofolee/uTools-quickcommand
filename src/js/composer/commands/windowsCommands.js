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

export const windowsCommands = {
  label: "Win自动化",
  icon: "window",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.windows.window.getWindowInfo",
      label: "窗口控制",
      desc: "Windows窗口操作",
      icon: "window",
      config: [
        {
          key: "method",
          label: "查找方式",
          component: "q-select",
          icon: "search",
          width: 3,
          options: [
            { label: "标题", value: "title" },
            { label: "句柄", value: "handle" },
            { label: "活动窗口", value: "active" },
          ],
          defaultValue: "title",
        },
        {
          key: "value",
          label: "窗口标题/句柄",
          component: "VariableInput",
          icon: "title",
          width: 9,
          placeholder: "标题支持模糊匹配，选择活动窗口无需输入",
        },
      ],
      subCommands: [
        {
          value: "quickcomposer.windows.window.getWindowInfo",
          label: "窗口信息",
          icon: "info",
          outputVariable: "windowInfo",
          saveOutput: true,
        },
        {
          value: "quickcomposer.windows.window.setTopMost",
          label: "窗口置顶",
          icon: "vertical_align_top",
          config: [
            {
              key: "isTopMost",
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
              key: "opacity",
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
              key: "x",
              label: "X坐标",
              component: "NumberInput",
              icon: "arrow_right",
              width: 6,
              defaultValue: 0,
            },
            {
              key: "y",
              label: "Y坐标",
              component: "NumberInput",
              icon: "arrow_drop_down",
              width: 6,
              defaultValue: 0,
            },
            {
              key: "width",
              label: "宽度",
              component: "NumberInput",
              icon: "swap_horiz",
              width: 6,
              min: 0,
              defaultValue: 800,
            },
            {
              key: "height",
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
              key: "state",
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
          value: "quickcomposer.windows.window.setVisible",
          label: "窗口可见性",
          icon: "visibility",
          config: [
            {
              key: "visible",
              component: "ButtonGroup",
              icon: "visibility",
              width: 12,
              options: [
                { label: "显示", value: true },
                { label: "隐藏", value: false },
              ],
              defaultValue: true,
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
              key: "hasBorder",
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
              key: "isTransparent",
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
    {
      value: "quickcomposer.windows.sendmessage.inspectWindow",
      label: "界面自动化(sendmessage)",
      desc: "Windows界面自动化操作",
      icon: "smart_button",
      isAsync: true,
      config: [
        {
          key: "method",
          label: "查找方式",
          component: "q-select",
          icon: "search",
          width: 3,
          options: [
            { label: "标题", value: "title" },
            { label: "句柄", value: "handle" },
            { label: "活动窗口", value: "active" },
          ],
          defaultValue: "title",
        },
        {
          key: "value",
          label: "窗口标题/句柄",
          component: "VariableInput",
          icon: "title",
          width: 9,
          placeholder: "标题支持模糊匹配，选择活动窗口无需输入",
        },
      ],
      subCommands: [
        {
          value: "quickcomposer.windows.sendmessage.inspectWindow",
          label: "获取控件树",
          icon: "account_tree",
          outputVariable: "controlsTree",
          saveOutput: true,
          config: [
            {
              key: "options",
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
                  placeholder: "可选，输入要过滤的控件类名或文本",
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
              key: "action",
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
              key: "options",
              component: "OptionEditor",
              width: 12,
              options: {
                control: {
                  label: "控件类名",
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
                  placeholder: "可选，和控件类名至少输入一个",
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
              key: "text",
              label: "文本内容",
              component: "VariableInput",
              icon: "text_fields",
              width: 12,
              placeholder: "要发送的文本内容",
            },
            {
              key: "options",
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
              key: "keys",
              label: "按键序列",
              component: "VariableInput",
              icon: "keyboard",
              width: 12,
              placeholder: "按键组合，多个逗号隔开，如：ctrl+a,a,b",
            },
            {
              key: "options",
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
    {
      value: "quickcomposer.windows.monitor.watchClipboard",
      label: "剪贴板/文件监控",
      desc: "监控系统变化",
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
              key: "options",
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
  ],
};
