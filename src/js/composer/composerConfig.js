export {
  ubrowserOperationConfigs,
  defaultUBrowserConfigs,
} from "./ubrowserConfig";

// 定义命令分类
export const commandCategories = [
  {
    label: "文件操作",
    icon: "folder",
    commands: [
      {
        value: "open",
        label: "打开文件/文件夹/软件",
        desc: "文件、文件夹或软件的绝对路径",
        icon: "folder_open",
      },
      {
        value: "locate",
        label: "在文件管理器中定位文件",
        desc: "要在文件管理器里显示的文件路径",
        icon: "location_on",
      },
    ],
  },
  {
    label: "网络操作",
    icon: "language",
    commands: [
      {
        value: "visit",
        label: "用默认浏览器打开网址",
        desc: "要访问的网址链接",
        icon: "language",
      },
      {
        value: "utools.ubrowser.goto",
        label: "用ubrowser打开网址",
        desc: "要访问的网址链接",
        isAsync: true,
        icon: "public",
      },
      {
        value: "ubrowser",
        label: "ubrowser浏览器操作",
        desc: "配置ubrowser浏览器操作",
        hasUBrowserEditor: true,
        isAsync: true,
        icon: "public",
      },
      {
        value: "axios",
        label: "HTTP请求(Axios)",
        desc: "使用Axios发送HTTP请求",
        hasAxiosEditor: true,
        isAsync: true,
        icon: "http",
      },
    ],
  },
  {
    label: "系统操作",
    icon: "computer",
    commands: [
      {
        value: "system",
        label: "执行系统命令",
        desc: "要执行的命令行",
        icon: "terminal",
      },
      {
        value: "copyTo",
        label: "将内容写入剪贴板",
        desc: "要写入剪切板的内容",
        icon: "content_copy",
      },
      {
        value: "electron.clipboard.readText",
        label: "获取剪贴板内容",
        desc: "获取剪贴板内容",
        icon: "content_copy",
        hasNoArgs: true,
      },
    ],
  },
  {
    label: "消息通知",
    icon: "notifications",
    commands: [
      {
        value: "console.log",
        label: "打印消息",
        desc: "要打印的消息文本",
        icon: "info",
      },
      {
        value: "message",
        label: "发送系统消息",
        desc: "要发送的系统消息文本",
        icon: "message",
      },
      {
        value: "send",
        label: "发送文本到活动窗口",
        desc: "要发送到窗口的文本内容",
        icon: "send",
      },
    ],
  },
  {
    label: "编码解码",
    icon: "code",
    commands: [
      {
        value: "(text=>Buffer.from(text).toString('base64'))",
        label: "Base64编码",
        desc: "将文本编码为Base64",
        icon: "lock",
      },
      {
        value: "(text=>Buffer.from(text,'base64').toString())",
        label: "Base64解码",
        desc: "将Base64解码为文本",
        icon: "lock_open",
      },
      {
        value: "(text=>Buffer.from(text).toString('hex'))",
        label: "十六进制编码",
        desc: "将文本编码为十六进制",
        icon: "lock",
      },
      {
        value: "(text=>Buffer.from(text,'hex').toString())",
        label: "十六进制解码",
        desc: "将十六进制解码为文本",
        icon: "lock_open",
      },
      {
        value: "encodeURIComponent",
        label: "URL编码",
        desc: "将文本进行URL编码",
        icon: "link",
      },
      {
        value: "decodeURIComponent",
        label: "URL解码",
        desc: "将URL编码解码为文本",
        icon: "link_off",
      },
    ],
  },
  {
    label: "其他功能",
    icon: "more_horiz",
    commands: [
      {
        value: "utools.redirect",
        label: "转至指定插件",
        desc: "要跳转至的插件名称",
        icon: "alt_route",
      },
      {
        value: "quickcommand.sleep",
        label: "添加延时",
        desc: "延迟的毫秒数",
        inputType: "number",
        icon: "schedule",
      },
    ],
  },
  {
    label: "按键操作",
    icon: "keyboard",
    commands: [
      {
        value: "keyTap",
        label: "模拟按键",
        desc: "模拟键盘按键",
        hasKeyRecorder: true,
        icon: "keyboard",
      },
    ],
  },
];
