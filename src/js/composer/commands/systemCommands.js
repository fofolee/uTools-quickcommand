import { newVarInputVal } from "js/composer/varInputValManager";

export const systemCommands = {
  label: "系统操作",
  icon: "computer",
  defaultOpened: false,
  commands: [
    {
      value: "utools.copyText",
      label: "写入剪贴板",
      subCommands: [
        {
          value: "utools.copyText",
          label: "写入文本",
          icon: "content_copy",
          config: [
            {
              key: "content",
              label: "要写入剪切板的内容",
              type: "varInput",
              icon: "content_copy",
            },
          ],
        },
        {
          value: "utools.copyImage",
          label: "写入图片",
          icon: "image",
          config: [
            {
              key: "image",
              label: "图片路径/base64",
              type: "varInput",
              icon: "image",
              options: {
                dialog: {
                  type: "open",
                  options: {
                    title: "选择图片",
                    properties: ["openFile", "showHiddenFiles"],
                  },
                },
              },
            },
          ],
        },
        {
          value: "utools.copyFile",
          label: "写入文件",
          icon: "file_copy",
          config: [
            {
              key: "file",
              label: "文件路径",
              type: "varInput",
              icon: "file_copy",
              options: {
                dialog: {
                  type: "open",
                  options: {
                    title: "选择文件",
                    properties: [
                      "openFile",
                      "showHiddenFiles",
                      "multiSelections",
                    ],
                  },
                },
              },
            },
          ],
        },
      ],
    },
    {
      value: "electron.clipboard.readText",
      label: "读取剪贴板",
      outputVariable: "clipboardContent",
      saveOutput: true,
      subCommands: [
        {
          value: "electron.clipboard.readText",
          label: "剪贴板文本",
          icon: "content_copy",
        },
        {
          value: "quickcommand.readClipboardImage",
          label: "剪贴板图片",
          icon: "image",
        },
        {
          value: "utools.getCopyedFiles",
          label: "剪贴板文件",
          icon: "file_copy",
        },
        {
          value: "electron.clipboard.readRTF",
          label: "剪贴板RTF",
          icon: "text_snippet",
        },
        {
          value: "electron.clipboard.readHTML",
          label: "剪贴板HTML",
          icon: "web",
        },
      ],
    },
    {
      value: "quickcomposer.system.exec",
      label: "执行系统命令",
      desc: "执行系统命令并返回输出结果",
      component: "SystemCommandEditor",
      icon: "terminal",
      isAsync: true,
    },
    {
      value: "quickcomposer.system.os.arch",
      label: "系统信息",
      desc: "获取操作系统相关信息",
      icon: "computer",
      config: [],
      subCommands: [
        {
          value: "quickcomposer.system.os.arch",
          label: "系统架构",
          icon: "memory",
        },
        {
          value: "quickcomposer.system.os.cpus",
          label: "CPU信息",
          icon: "developer_board",
          config: [
            {
              label: "信息格式",
              type: "buttonGroup",
              options: [
                { label: "完整信息", value: "full" },
                { label: "仅型号和速度", value: "simple" },
              ],
              defaultValue: "full",
              width: 12,
            },
          ],
        },
        {
          value: "quickcomposer.system.os.memory",
          label: "内存信息",
          icon: "storage",
          config: [
            {
              label: "内存类型",
              type: "buttonGroup",
              options: [
                { label: "总内存", value: "totalmem" },
                { label: "空闲内存", value: "freemem" },
              ],
              defaultValue: "totalmem",
              width: 12,
            },
          ],
        },
        {
          value: "quickcomposer.system.os.network",
          label: "网络信息",
          icon: "wifi",
          config: [
            {
              label: "网络信息类型",
              type: "buttonGroup",
              options: [
                { label: "主机名", value: "hostname" },
                { label: "网络接口", value: "networkInterfaces" },
              ],
              defaultValue: "hostname",
              width: 12,
            },
            {
              label: "包含内部接口",
              type: "checkbox",
              defaultValue: false,
              width: 12,
              condition: "values[0] === 'networkInterfaces'",
            },
          ],
        },
        {
          value: "quickcomposer.system.os.platform",
          label: "平台信息",
          icon: "computer",
          config: [
            {
              label: "平台信息类型",
              type: "buttonGroup",
              options: [
                { label: "操作系统名称", value: "platform" },
                { label: "操作系统类型", value: "type" },
                { label: "操作系统版本", value: "release" },
                { label: "操作系统架构", value: "arch" },
                { label: "CPU字节序", value: "endianness" },
                { label: "系统临时目录", value: "tmpdir" },
                { label: "主目录", value: "homedir" },
                { label: "系统正常运行时间", value: "uptime" },
                { label: "用户信息", value: "userInfo" },
              ],
              defaultValue: "platform",
              width: 12,
            },
          ],
        },
      ],
    },
    {
      value: "quickcomposer.system.path.normalize",
      label: "路径操作",
      desc: "路径解析和处理",
      icon: "folder",
      config: [
        {
          label: "路径",
          type: "varInput",
          icon: "folder",
          width: "auto",
        },
      ],
      subCommands: [
        {
          value: "quickcomposer.system.path.normalize",
          label: "规范化路径",
          icon: "straighten",
        },
        {
          value: "quickcomposer.system.path.parse",
          label: "解析路径",
          icon: "account_tree",
        },
        {
          value: "quickcomposer.system.path.dirname",
          label: "获取目录名",
          icon: "folder",
        },
        {
          value: "quickcomposer.system.path.basename",
          label: "获取文件名",
          icon: "description",
          config: [
            {
              label: "要移除的扩展名",
              type: "varInput",
              icon: "extension",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.system.path.extname",
          label: "获取扩展名",
          icon: "extension",
        },
        {
          value: "quickcomposer.system.path.isAbsolute",
          label: "判断绝对路径",
          icon: "check_circle",
        },
        {
          value: "quickcomposer.system.path.join",
          label: "连接路径",
          icon: "add_link",
          excludeConfig: [0],
          config: [
            {
              label: "路径片段",
              type: "varInput",
              icon: "folder",
              width: "auto",
            },
            {
              label: "路径片段",
              type: "varInput",
              icon: "folder",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.system.path.resolve",
          label: "解析绝对路径",
          icon: "assistant_direction",
          excludeConfig: [0],
          config: [
            {
              label: "路径片段",
              type: "varInput",
              icon: "folder",
              width: "auto",
            },
            {
              label: "路径片段",
              type: "varInput",
              icon: "folder",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.system.path.relative",
          label: "计算相对路径",
          icon: "compare_arrows",
          excludeConfig: [0],
          config: [
            {
              label: "起始路径",
              type: "varInput",
              icon: "folder",
              width: 6,
            },
            {
              label: "目标路径",
              type: "varInput",
              icon: "folder",
              width: 6,
            },
          ],
        },
        {
          value: "quickcomposer.system.path.format",
          label: "格式化路径",
          icon: "format_shapes",
          excludeConfig: [0],
          config: [
            {
              label: "根路径",
              type: "varInput",
              icon: "folder",
              width: 6,
            },
            {
              label: "目录",
              type: "varInput",
              icon: "folder",
              width: 6,
            },
            {
              label: "基本名称",
              type: "varInput",
              icon: "description",
              width: 6,
            },
            {
              label: "文件名",
              type: "varInput",
              icon: "insert_drive_file",
              width: 6,
            },
            {
              label: "扩展名",
              type: "varInput",
              icon: "extension",
              width: 6,
            },
          ],
        },
      ],
    },
    {
      value: "quickcommand.kill",
      label: "关闭进程",
      desc: "关闭指定进程",
      icon: "dangerous",
      config: [
        {
          label: "进程ID",
          type: "numInput",
          min: 0,
          step: 100,
          icon: "developer_board",
          width: 7,
        },
        {
          label: "信号",
          type: "select",
          icon: "signal_cellular_alt",
          options: [
            { label: "正常终止 (15)", value: "SIGTERM" },
            { label: "强制终止 (9)", value: "SIGKILL" },
            { label: "中断进程 (2)", value: "SIGINT" },
            { label: "退出信号 (3)", value: "SIGQUIT" },
            { label: "挂起信号 (1)", value: "SIGHUP" },
          ],
          defaultValue: "SIGKILL",
          width: 5,
        },
      ],
    },
  ],
};
