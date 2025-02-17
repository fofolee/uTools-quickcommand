import { newVarInputVal } from "js/composer/varInputValManager";

export const systemCommands = {
  label: "系统操作",
  icon: "settings_suggest",
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
              label: "要写入剪切板的内容",
              component: "VariableInput",
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
              label: "图片路径/base64",
              component: "VariableInput",
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
              label: "文件路径",
              component: "VariableInput",
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
      subCommands: [
        {
          value: "electron.clipboard.readText",
          label: "剪贴板文本",
          icon: "content_copy",
          outputs: {
            label: "剪贴板文本",
            suggestName: "clipboardText",
          },
        },
        {
          value: "quickcommand.readClipboardImage",
          label: "剪贴板图片",
          icon: "image",
          outputs: {
            label: "图片DataURL",
            suggestName: "clipboardImageDataURL",
          },
        },
        {
          value: "utools.getCopyedFiles",
          label: "剪贴板文件",
          icon: "file_copy",
          outputs: {
            label: "剪贴板文件列表",
            suggestName: "clipboardFileList",
            structure: [
              {
                isFile: { label: "是否是文件", suggestName: "isFile" },
                isDirectory: {
                  label: "是否是目录",
                  suggestName: "isDirectory",
                },
                name: { label: "文件名", suggestName: "name" },
                path: { label: "文件路径", suggestName: "path" },
              },
            ],
          },
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
      component: "SystemCommandEditor",
      icon: "terminal",
      asyncMode: "await",
      outputs: {
        label: "执行结果",
        suggestName: "execResult",
      },
    },
    {
      value: "utools.getPath",
      label: "获取系统路径",
      defaultValue: "home",
      config: [
        {
          label: "路径类型",
          component: "ButtonGroup",
          options: [
            {
              label: "用户主目录",
              value: "home",
            },
            {
              label: "应用数据目录",
              value: "appData",
            },
            {
              label: "用户数据目录",
              value: "userData",
            },
            {
              label: "缓存目录",
              value: "cache",
            },
            {
              label: "临时目录",
              value: "temp",
            },
            {
              label: "桌面",
              value: "desktop",
            },
            {
              label: "文档",
              value: "documents",
            },
            {
              label: "下载",
              value: "downloads",
            },
            {
              label: "音乐",
              value: "music",
            },
            {
              label: "图片",
              value: "pictures",
            },
            {
              label: "视频",
              value: "videos",
            },
            {
              label: "uTools日志目录",
              value: "logs",
            },
            {
              label: "uTools程序目录",
              value: "exe",
            },
            {
              label: "uTools模块目录",
              value: "module",
            },
          ],
        },
      ],
      outputs: {
        label: "系统路径",
        suggestName: "systemPath",
      },
    },
    {
      value: "utools.isMacOS",
      label: "判断系统类型",
      subCommands: [
        {
          value: "utools.isMacOS",
          label: "是否Mac",
          icon: "computer",
          outputs: {
            label: "是否是Mac",
            typeName: "布尔值",
            suggestName: "isMacOS",
          },
        },
        {
          value: "utools.isWindows",
          label: "是否Windows",
          icon: "computer",
          outputs: {
            label: "是否是Windows",
            typeName: "布尔值",
            suggestName: "isWindows",
          },
        },
        {
          value: "utools.isLinux",
          label: "是否Linux",
          icon: "computer",
          outputs: {
            label: "是否是Linux",
            typeName: "布尔值",
            suggestName: "isLinux",
          },
        },
      ],
    },
    {
      value: "quickcomposer.system.os.arch",
      label: "系统信息",
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
          outputs: {
            label: "CPU信息",
            suggestName: "cpuInfo",
            structure: [
              {
                model: { label: "型号", suggestName: "model" },
                speed: { label: "速度", suggestName: "speed" },
                times: {
                  label: "时间",
                  user: { label: "user", suggestName: "user" },
                  nice: { label: "nice", suggestName: "nice" },
                  sys: { label: "sys", suggestName: "sys" },
                  idle: { label: "idle", suggestName: "idle" },
                  irq: { label: "irq", suggestName: "irq" },
                },
              },
            ],
          },
        },
        {
          value: "quickcomposer.system.os.memory",
          label: "内存信息",
          icon: "storage",
          config: [
            {
              label: "内存类型",
              component: "ButtonGroup",
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
              component: "ButtonGroup",
              options: [
                { label: "主机名", value: "hostname" },
                { label: "网络接口", value: "networkInterfaces" },
              ],
              defaultValue: "hostname",
              width: 12,
            },
            {
              label: "包含内部接口",
              component: "CheckButton",
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
              component: "ButtonGroup",
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
      icon: "folder",
      config: [],
      subCommands: [
        {
          value: "quickcomposer.system.path.normalize",
          label: "规范化路径",
          icon: "straighten",
          config: [
            {
              label: "路径",
              component: "VariableInput",
              icon: "folder",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.system.path.parse",
          label: "解析路径",
          icon: "account_tree",
          config: [
            {
              label: "路径",
              component: "VariableInput",
              icon: "folder",
              width: "auto",
            },
          ],
          outputs: {
            label: "路径解析结果",
            suggestName: "pathParseResult",
            structure: {
              root: { label: "根路径", suggestName: "parseRoot" },
              dir: { label: "目录", suggestName: "parseDir" },
              base: { label: "基本名称", suggestName: "parseBaseName" },
              ext: { label: "扩展名", suggestName: "parseExtName" },
              name: { label: "文件名", suggestName: "parseFileName" },
            },
          },
        },
        {
          value: "quickcomposer.system.path.dirname",
          label: "获取目录名",
          icon: "folder",
          config: [
            {
              label: "路径",
              component: "VariableInput",
              icon: "folder",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.system.path.basename",
          label: "获取文件名",
          icon: "description",
          config: [
            {
              label: "路径",
              component: "VariableInput",
              icon: "folder",
              width: "auto",
            },
            {
              label: "要移除的扩展名",
              component: "VariableInput",
              icon: "extension",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.system.path.extname",
          label: "获取扩展名",
          icon: "extension",
          config: [
            {
              label: "路径",
              component: "VariableInput",
              icon: "folder",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.system.path.isAbsolute",
          label: "判断绝对路径",
          icon: "check_circle",
          config: [
            {
              label: "路径",
              component: "VariableInput",
              icon: "folder",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.system.path.join",
          label: "连接路径",
          icon: "add_link",
          config: [
            {
              label: "路径片段",
              component: "VariableInput",
              icon: "folder",
              width: "auto",
            },
            {
              label: "路径片段",
              component: "VariableInput",
              icon: "folder",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.system.path.resolve",
          label: "解析绝对路径",
          icon: "assistant_direction",
          config: [
            {
              label: "路径片段",
              component: "VariableInput",
              icon: "folder",
              width: "auto",
            },
            {
              label: "路径片段",
              component: "VariableInput",
              icon: "folder",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.system.path.relative",
          label: "计算相对路径",
          icon: "compare_arrows",
          config: [
            {
              label: "起始路径",
              component: "VariableInput",
              icon: "folder",
              width: 6,
            },
            {
              label: "目标路径",
              component: "VariableInput",
              icon: "folder",
              width: 6,
            },
          ],
        },
        {
          value: "quickcomposer.system.path.format",
          label: "格式化路径",
          icon: "format_shapes",
          config: [
            {
              label: "根路径",
              component: "VariableInput",
              icon: "folder",
              width: 6,
            },
            {
              label: "目录",
              component: "VariableInput",
              icon: "folder",
              width: 6,
            },
            {
              label: "基本名称",
              component: "VariableInput",
              icon: "description",
              width: 6,
            },
            {
              label: "文件名",
              component: "VariableInput",
              icon: "insert_drive_file",
              width: 6,
            },
            {
              label: "扩展名",
              component: "VariableInput",
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
      icon: "dangerous",
      neverHasOutput: true,
      config: [
        {
          label: "进程ID",
          component: "VariableInput",
          disableToggleType: true,
          icon: "developer_board",
          width: 7,
        },
        {
          label: "信号",
          component: "QSelect",
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
