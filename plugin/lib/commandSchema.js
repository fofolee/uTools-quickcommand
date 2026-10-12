/**
 * 快捷命令的数据结构说明，qc_get_schema 直接返回这段文本给 AI Agent
 */
module.exports = `# 快捷命令数据结构

一条命令就是一个 JSON 对象，字段如下：

{
  "program": "quickcommand",
  "cmd": "脚本内容",
  "features": {
    "code": "key_1a2b3c4d",
    "explain": "命令名称（uTools 搜索框里显示的名字，不能为空）",
    "cmds": ["触发关键词", { "type": "regex", "label": "名称", "match": "/^https?:\\\\/\\\\//i" }],
    "platform": ["win32", "darwin", "linux"],
    "mainPush": false,
    "icon": ""
  },
  "output": "text",
  "tags": ["日常"]
}

## program（执行方式）

- quickcommand：JavaScript，跑在插件沙箱里，可以用 quickcommand.* / utools.* / fs / require 等，输出的对象里带 code 字段时会把 code 当结果输出
- quickcomposer：可视化编排，内容在 flows 数组里（见下文）
- html：HTML 页面
- shell / applescript / cmd / powershell / python / javascript / ruby / php / c / csharp / lua / perl：对应语言的脚本文件
- custom：自定义解释器，额外需要 customOptions: { bin, argv, ext }

除了 quickcommand 和 quickcomposer，其它 program 都要求 cmd 是脚本正文，额外可选：
- scptarg：命令行参数
- charset: { scriptCode: "gbk", outputCode: "gbk" }（Windows 中文环境常见）

## features

- code：命令的唯一标识，由插件生成。创建时不用填（填了也会重新生成），更新时不要改这个字段。
- explain：必填，同时会作为匹配规则的 label
- cmds：必填数组，每个元素是「触发方式」：
  - 字符串：关键词，如 "翻译"
  - { type: "regex", match: "/^\\\\d+$/i" }：正则匹配主输入框或选中的文本
  - { type: "over" }：匹配任意文本（未被其它插件占用时）
  - { type: "files", fileType: "file"|"directory", extensions: ["png","jpg"], match: "/\\\\.png$/i" }
  - { type: "img" }：匹配剪贴板图片
  - { type: "window", match: { app: ["chrome.exe"], title: "/github/", class: ["..." ] } }：匹配当前活动窗口
  - 多种类型混用时会自动变成 "professional"
- platform：命令生效的系统，默认三个平台都生效
- mainPush：为 true 时命令出现在 uTools 主输入框的推送列表里（输出类型会被限制）
- icon：data URL 或相对路径，**建议留空**（超过 32KB 会报错），用户可以在界面里自己设置

## output（输出方式）

- text（默认）：在 uTools 窗口显示
- html：按 HTML 渲染
- nothing：忽略输出且不关闭窗口
- ignore：忽略输出并隐藏窗口
- terminal：在终端显示
- clip：复制到剪贴板
- send：发送到当前活动窗口
- notice：发送系统通知

## tags

字符串数组，如 ["日常", "图片"]，留空则归入「未分类」。

## flows（quickcomposer 专用）

可视化编排的内容，结构复杂且随版本变化，**不要凭空生成**。要创建编排命令，请让用户在插件界面里拖拽生成，再用 qc_get_command 读取、用 qc_update_command 做小范围调整。

## 示例一：JavaScript 脚本命令

{
  "program": "quickcommand",
  "cmd": "quickcommand.showInputBox(['要加密的内容']).then(([text]) => {\\n  console.log(quickcommand.md5(text))\\n})",
  "features": {
    "explain": "计算 MD5",
    "cmds": ["计算md5"]
  },
  "output": "text",
  "tags": ["日常"]
}

## 示例二：Shell 命令

{
  "program": "shell",
  "cmd": "ls -la ~/Downloads | head -20",
  "features": {
    "explain": "列出下载目录",
    "cmds": [{ "type": "over", "label": "列出下载目录" }]
  },
  "output": "text",
  "tags": []
}

## 返回值约定

所有工具都返回对象：成功是 { ok: true, ... }，失败是 { ok: false, error: "原因" }，写操作的参数不合法时额外返回 errors: [{ path: "features.cmds[0].type", got: "regexp", allow: ["key","regex","over","img","files","window","professional"] }]，照着 errors 改参数重试即可。

## 内置命令

插件自带一批 code 以 default_ 开头的默认命令，它们不落库、不参与 Qc 的读写，qc_list_commands 不会列出它们，也不能修改或删除。用户想调整内置命令时，用 qc_create_command 新建一条自己的即可。
`;
