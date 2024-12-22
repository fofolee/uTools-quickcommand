// 定义命令图标映射
export const commandIcons = {
  'open': 'folder_open',
  'locate': 'location_on',
  'visit': 'language',
  'utools.ubrowser.goto': 'public',
  'system': 'terminal',
  'copyTo': 'content_copy',
  'message': 'message',
  'alert': 'warning',
  'send': 'send',
  'utools.redirect': 'alt_route',
  'quickcommand.sleep': 'schedule',
  'keyTap': 'keyboard'
}

// 定义命令分类
export const commandCategories = [
  {
    label: '文件操作',
    icon: 'folder',
    commands: [
      {
        value: "open",
        label: "打开文件/文件夹/软件",
        desc: "文件、文件夹或软件的绝对路径",
      },
      {
        value: "locate",
        label: "在文件管理器中定位文件",
        desc: "要在文件管理器里显示的文件路径",
      }
    ]
  },
  {
    label: '网络操作',
    icon: 'language',
    commands: [
      {
        value: "visit",
        label: "用默认浏览器打开网址",
        desc: "要访问的网址链接",
      },
      {
        value: "utools.ubrowser.goto",
        label: "用ubrowser打开网址",
        desc: "要访问的网址链接",
      }
    ]
  },
  {
    label: '系统操作',
    icon: 'computer',
    commands: [
      {
        value: "system",
        label: "执行系统命令",
        desc: "要执行的命令行",
      },
      {
        value: "copyTo",
        label: "将内容写入剪贴板",
        desc: "要写入剪切板的内容",
      }
    ]
  },
  {
    label: '消息通知',
    icon: 'notifications',
    commands: [
      {
        value: "message",
        label: "发送系统消息",
        desc: "要发送的系统消息文本",
      },
      {
        value: "alert",
        label: "弹窗显示消息",
        desc: "要弹窗显示的消息文本",
      },
      {
        value: "send",
        label: "发送文本到活动窗口",
        desc: "要发送到窗口的文本内容",
      }
    ]
  },
  {
    label: '其他功能',
    icon: 'more_horiz',
    commands: [
      {
        value: "utools.redirect",
        label: "转至指定插件",
        desc: "要跳转至的插件名称",
      },
      {
        value: "quickcommand.sleep",
        label: "添加延时",
        desc: "延迟的毫秒数",
      }
    ]
  },
  {
    label: '按键操作',
    icon: 'keyboard',
    commands: [
      {
        value: "keyTap",
        label: "模拟按键",
        desc: "模拟键盘按键",
        hasKeyRecorder: true
      }
    ]
  }
]

// 定义哪些命令可以产生输出
export const commandsWithOutput = {
  'system': true,
  'open': true,
  'locate': true,
  'copyTo': true,
}

// 定义哪些命令可以接收输出
export const commandsAcceptOutput = {
  'message': true,
  'alert': true,
  'send': true,
  'copyTo': true,
}
