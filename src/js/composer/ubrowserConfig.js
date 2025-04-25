import { deviceName, userAgent } from "js/options/httpOptions";

// ubrowser 浏览器操作配置
export const ubrowserOperationConfigs = {
  waitTime: {
    value: "wait",
    label: "等待时间",
    icon: "timer",
    config: [
      {
        label: "等待时间(ms)",
        icon: "timer",
        component: "NumberInput",
        min: 0,
        step: 100,
        width: 12,
      },
    ],
  },
  waitElement: {
    value: "wait",
    label: "等待元素",
    icon: "find_in_page",
    config: [
      {
        label: "等待元素的CSS选择器",
        icon: "find_in_page",
        component: "VariableInput",
        width: 12,
      },
    ],
  },
  waitCondition: {
    value: "wait",
    label: "等待条件",
    icon: "code",
    config: [
      {
        label: "等待条件",
        icon: "code",
        component: "FunctionInput",
        placeholder: "返回true时结束等待",
        width: 12,
      },
      {
        label: "超时时间(ms)",
        icon: "timer_off",
        component: "NumberInput",
        width: 12,
        defaultValue: 60000,
      },
      {
        topLabel: "传递给函数的参数值",
        component: "ArrayEditor",
      },
    ],
  },
  click: {
    value: "click",
    label: "点击",
    icon: "mouse",
    config: [
      {
        label: "点击元素的CSS选择器",
        icon: "mouse",
        component: "VariableInput",
        width: 12,
      },
    ],
  },
  css: {
    value: "css",
    label: "注入CSS",
    icon: "style",
    config: [
      {
        label: "注入的CSS样式",
        icon: "style",
        component: "VariableInput",
        width: 12,
      },
    ],
  },
  press: {
    value: "press",
    label: "按键",
    icon: "keyboard",
    config: [
      {
        label: "按键",
        icon: "keyboard",
        component: "VariableInput",
        width: 4,
      },
      {
        component: "CheckGroup",
        options: [
          { label: "Ctrl", value: "ctrl" },
          { label: "Shift", value: "shift" },
          { label: "Alt", value: "alt" },
          { label: "Meta", value: "meta" },
        ],
        width: 8,
      },
    ],
  },
  paste: {
    value: "paste",
    label: "粘贴",
    icon: "content_paste",
    config: [
      {
        label: "粘贴内容",
        icon: "content_paste",
        component: "VariableInput",
        width: 12,
      },
    ],
  },
  viewport: {
    value: "viewport",
    label: "视窗",
    icon: "crop",
    config: [
      {
        label: "视窗宽度",
        icon: "swap_horiz",
        component: "NumberInput",
        min: 0,
        step: 100,
        width: 6,
      },
      {
        label: "视窗高度",
        icon: "height",
        component: "NumberInput",
        min: 0,
        step: 100,
        width: 6,
      },
    ],
  },
  screenshotElement: {
    value: "screenshot",
    label: "元素截图",
    icon: "picture_as_pdf",
    config: [
      {
        label: "元素选择器",
        icon: "crop",
        component: "VariableInput",
        width: 12,
      },
      {
        label: "保存路径",
        icon: "save",
        component: "VariableInput",
        options: {
          dialog: {
            type: "save",
            options: {
              defaultPath: "screenshot.png",
            },
          },
        },
        width: 12,
      },
    ],
  },
  screenshotPosition: {
    value: "screenshot",
    label: "区域截图",
    icon: "crop",
    config: [
      {
        component: "OptionEditor",
        options: {
          x: {
            label: "X坐标",
            icon: "drag_handle",
            component: "NumberInput",
            min: 0,
            step: 100,
            width: 3,
          },
          y: {
            label: "Y坐标",
            icon: "drag_handle",
            component: "NumberInput",
            min: 0,
            step: 100,
            width: 3,
          },
          width: {
            label: "宽度",
            icon: "swap_horiz",
            component: "NumberInput",
            min: 0,
            step: 100,
            width: 3,
          },
          height: {
            label: "高度",
            icon: "height",
            component: "NumberInput",
            min: 0,
            step: 100,
            width: 3,
          },
        },
      },
      {
        label: "保存路径",
        icon: "save",
        options: {
          dialog: {
            type: "save",
            options: {
              defaultPath: "screenshot.png",
            },
          },
        },
        width: 12,
      },
    ],
  },
  pdf: {
    value: "pdf",
    label: "导出PDF",
    icon: "picture_as_pdf",
    config: [
      {
        component: "OptionEditor",
        options: {
          format: {
            label: "格式",
            component: "QSelect",
            options: [
              "A0",
              "A1",
              "A2",
              "A3",
              "A4",
              "A5",
              "A6",
              "Legal",
              "Letter",
              "Tabloid",
              "Ledger",
            ],
            width: 3,
          },
          landscape: {
            label: "横向打印",
            component: "CheckButton",
            width: 3,
          },
          pageRanges: {
            label: "页码范围",
            component: "VariableInput",
            placeholder: "1-5, 8",
            width: 3,
          },
          scale: {
            label: "缩放",
            component: "NumberInput",
            min: 0,
            step: 0.1,
            width: 3,
          },
        },
        defaultValue: {
          format: "A4",
          landscape: false,
          pageRanges: "",
          scale: 1,
        },
      },
      {
        label: "保存路径",
        icon: "save",
        component: "VariableInput",
        width: 12,
      },
    ],
  },
  device: {
    value: "device",
    label: "模拟设备",
    icon: "phone_iphone",
    config: [
      {
        component: "OptionEditor",
        options: {
          size: {
            component: "DictEditor",
            options: {
              fixedKeys: ["width", "height"],
              disableAdd: true,
            },
          },
          userAgent: {
            label: "User-Agent",
            component: "VariableInput",
            options: {
              items: userAgent,
            },
          },
        },
      },
    ],
  },
  cookies: {
    value: "cookies",
    label: "获取Cookie",
    icon: "cookie",
    config: [
      {
        label: "Cookie名称",
        icon: "cookie",
        component: "VariableInput",
        width: 12,
      },
    ],
  },
  markdown: {
    value: "markdown",
    label: "转markdown",
    icon: "get_app",
    config: [
      {
        label: "CSS 或 XPath 选择器，不传递则转换整个网页内容",
        icon: "find_in_page",
        component: "VariableInput",
        width: 12,
      },
    ],
  },
  setCookies: {
    value: "setCookies",
    label: "设置Cookie",
    icon: "cookie",
    config: [
      {
        label: "Cookie列表",
        component: "ArrayEditor",
        columns: {
          name: {
            label: "名称",
          },
          value: {
            label: "值",
          },
        },
      },
    ],
  },
  removeCookies: {
    value: "removeCookies",
    label: "删除Cookie",
    icon: "cookie",
    config: [
      {
        label: "Cookie名称",
        icon: "cookie",
        component: "VariableInput",
        width: 12,
      },
    ],
  },
  clearCookies: {
    value: "clearCookies",
    label: "清空Cookie",
    icon: "cookie",
    config: [
      {
        label: "URL(可选)",
        icon: "link",
        component: "VariableInput",
        width: 12,
      },
    ],
  },
  evaluate: {
    value: "evaluate",
    label: "执行代码",
    icon: "code",
    config: [
      {
        label: "执行的代码",
        icon: "code",
        component: "FunctionInput",
        width: 12,
      },
      {
        topLabel: "传递给函数的参数值",
        component: "ArrayEditor",
      },
    ],
  },
  whenElement: {
    value: "when",
    label: "判断元素",
    icon: "rule",
    config: [
      {
        label: "判断元素的CSS选择器",
        icon: "find_in_page",
        component: "VariableInput",
        width: 12,
      },
    ],
  },
  whenCondition: {
    value: "when",
    label: "判断条件",
    icon: "rule",
    config: [
      {
        label: "判断条件",
        icon: "code",
        component: "FunctionInput",
        width: 12,
        placeholder: "返回true时结束判断",
      },
      {
        topLabel: "传递给函数的参数值",
        component: "ArrayEditor",
      },
    ],
  },
  end: {
    value: "end",
    label: "结束判断",
    icon: "stop",
    config: [],
  },
  mousedown: {
    value: "mousedown",
    label: "按下鼠标",
    icon: "mouse",
    config: [
      {
        label: "按下元素选择器",
        icon: "mouse",
        component: "VariableInput",
        width: 12,
      },
    ],
  },
  mouseup: {
    value: "mouseup",
    label: "释放鼠标",
    icon: "mouse",
    config: [
      {
        label: "释放元素选择器",
        icon: "mouse",
        component: "VariableInput",
        width: 12,
      },
    ],
  },
  file: {
    value: "file",
    label: "上传文件",
    icon: "upload_file",
    config: [
      {
        label: "文件输入框选择器",
        icon: "upload_file",
        component: "VariableInput",
        placeholder: "必须是可选择文件的输入元素 input[type=file]",
        width: 12,
      },
      {
        label: "文件列表",
        component: "VariableInput",
        icon: "image",
        width: 12,
        options: {
          dialog: {
            type: "open",
            options: {
              title: "选择文件",
              properties: ["openFile", "multiSelections"],
            },
          },
        },
      },
    ],
  },
  setValue: {
    value: "value",
    label: "设置值",
    icon: "check_box",
    config: [
      {
        label: "元素选择器",
        icon: "find_in_page",
        component: "VariableInput",
        width: 6,
      },
      {
        label: "设置的值",
        icon: "edit",
        component: "VariableInput",
        width: 6,
      },
    ],
  },
  check: {
    value: "check",
    label: "设置选中",
    icon: "center_focus_strong",
    config: [
      {
        label: "复选框/选框选择器",
        icon: "check_box",
        component: "VariableInput",
        width: 8,
      },
      {
        label: "选中状态",
        component: "CheckButton",
        defaultValue: false,
        width: 4,
      },
    ],
  },
  focus: {
    value: "focus",
    label: "聚焦元素",
    icon: "swap_vert",
    config: [
      {
        label: "元素选择器",
        icon: "center_focus_strong",
        component: "VariableInput",
        width: 12,
      },
    ],
  },
  scrollToElement: {
    value: "scroll",
    label: "滚动到元素",
    icon: "download",
    config: [
      {
        label: "目标元素选择器",
        icon: "swap_vert",
        component: "VariableInput",
        width: 12,
      },
    ],
  },
  scrollToPosition: {
    value: "scroll",
    label: "滚动到坐标",
    icon: "download",
    config: [
      {
        label: "X坐标",
        icon: "drag_handle",
        component: "NumberInput",
        width: 6,
      },
      {
        label: "Y坐标",
        icon: "drag_handle",
        component: "NumberInput",
        width: 6,
      },
    ],
  },
  download: {
    value: "download",
    label: "下载",
    icon: "download",
    config: [
      {
        label: "下载URL",
        icon: "link",
        component: "VariableInput",
        width: 6,
      },
      {
        label: "保存路径",
        icon: "save",
        component: "VariableInput",
        width: 6,
      },
    ],
  },
  devTools: {
    value: "devTools",
    label: "开发工具",
    icon: "developer_board",
    config: [
      {
        component: "ButtonGroup",
        options: [
          { label: "右侧", value: "right" },
          { label: "底部", value: "bottom" },
          { label: "独立", value: "undocked" },
          { label: "分离", value: "detach" },
        ],
        defaultValue: "right",
        width: 12,
      },
    ],
  },
  hide: {
    value: "hide",
    label: "隐藏",
    icon: "visibility_off",
    config: [],
  },
  show: {
    value: "show",
    label: "显示",
    icon: "visibility",
    config: [],
  },
};
