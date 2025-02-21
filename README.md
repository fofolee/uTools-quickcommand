# 快捷命令 5.0

[![GitHub stars](https://img.shields.io/github/stars/fofolee/uTools-quickcommand?style=flat-square)](https://github.com/fofolee/uTools-quickcommand/stargazers) [![GitHub forks](https://img.shields.io/github/forks/fofolee/uTools-quickcommand?style=flat-square)](https://github.com/fofolee/uTools-quickcommand/network/members) [![version](https://img.shields.io/badge/dynamic/json?color=f58142&label=version&query=%24.version&url=https%3A%2F%2Fraw.githubusercontent.com%2Ffofolee%2FuTools-quickcommand%2Fmaster%2Fplugin%2Fplugin.json&style=flat-square)](https://www.yuque.com/fofolee/qcdocs3/ucnd2o) [![猿料](https://img.shields.io/badge/%E7%8C%BF%E6%96%99-%2Fd%2F424-red?style=flat-square)](https://yuanliao.info/d/424) [![评论](https://img.shields.io/badge/dynamic/json?color=e05d44&label=%E8%AF%84%E8%AE%BA&query=%24.data.attributes.commentCount&url=https%3A%2F%2Fyuanliao.info%2Fapi%2Fdiscussions%2F424&style=flat-square)](https://yuanliao.info/d/424) ![rating](https://img.shields.io/badge/dynamic/json?color=05d44&label=评分&query=%24.rating&url=http%3A%2F%2Fopen.u-tools.cn%2Fplugins%2F9a1d1d03%3Ftag_id%3D0%26mid%3Dd1fef324-b4fd-5f81-b05e-4d4d822277b3%26nid%3Df1960e006c87cf1107f2017711668d6c&style=flat-square) ![downloads](https://img.shields.io/badge/dynamic/json?color=05d44&label=下载&query=%24.downloads&url=http%3A%2F%2Fopen.u-tools.cn%2Fplugins%2F9a1d1d03%3Ftag_id%3D0%26mid%3Dd1fef324-b4fd-5f81-b05e-4d4d822277b3%26nid%3Df1960e006c87cf1107f2017711668d6c&style=flat-square)

## 编译安装

```sh
npm i -g @quasar/cli
cd uTools-quickcommand
npm i && cd plugin && npm i && cd ..
# 调试
quasar dev
# 编译
quasar build
```

# 一、核心功能

## ① 编写脚本

- AI加持：支持AI编写脚本并自动更新代码
- 快速执行命令：如打开文件夹、软件、网址等
- 快速运行脚本：如批处理、`shell`、`python` 等
- 直接编写网页：可以直接编写简单的 `html` 页面

- 无需编写插件：实现需要使用 `utools` 的 api 或者带 UI 界面的功能

## ② 可视化编排

- 自动化：文件操作、网络操作、系统操作、音频操作、图片操作、视频操作、uTools功能、Mac自动化、Window自动化、浏览器控制、数据处理、编码加密、流程控制、编程相关、用户交互、AI对话、模拟操作、获取状态、数学计算、用户数据、显示器、输出消息等20种以上不同类型命令。
- 工具集：所有功能既可以组合使用，也可以单独运行，具备视频压缩、格式转换，图片裁剪、旋转，文本朗读，音频播放，编解码，模拟按键，鼠标连点等超过 100 种实用功能。

# 二、其他特色

- 可以对命令进行分享和下载
- 快速收藏文件、网址、插件别名，通过面板视图，实现类似软件启动器、网页搜藏夹、插件面板等功能
- 定时运行命令
- 提供后台服务，将插件内部和外部环境打通

# 三、配置参数

## 「 匹配 」

支持以下模式激活插件

- 关键字

  在主输入框输入对应关键字进入插件，最通用的一种模式，关键字可以设置多个

- 正则/划词

  正则匹配主输入框文本或唤出超级面板时选中的文本，可以获取输入框文本或选中文本作为变量

- 窗口/进程

匹配呼出 uTools 前或唤出超级面板时的活动窗口，可以获取窗口的信息或文件夹路径作为变量

- 复制/选中文件

匹配拖入主输入框的文件或唤出超级面板时选中的文件，可以获取复制及选中的文件信息作为变量

- 图片

匹配剪贴板的图片

## 「 环境 」

支持以下环境

- quickcomposer (可视化编排)
- qucikcommand (electron + nodejs + utools)
- html
- cmd
- shell
- applescript
- python
- php
- javascript
- 等

## 「 输出 」

- 隐藏并忽略输出
- 显示纯文本输出 (不解析 html 内容)
- 显示 html 格式的输出 (可以进一步编写简单的 GUI 界面，参考内置动作特殊符号大全)
- 复制到剪贴板
- 发送到活动窗口（可实现发送常用短语之类的功能）
- 发送到系统通知
- 在终端中显示

# 四、可视化编排功能概览

## 音频操作

文本朗读（支持中文、英文、日语、韩语等）、系统音效播放（提示音、错误音、警告音等）、音频播放/停止、音频录制、音频信息分析（时长、声道、采样率）...

## 浏览器操作

启动浏览器实例、标签页管理、Cookie操作、文本输入、页面滚动、尺寸控制、网络请求拦截、设备模拟、JavaScript注入、DOM元素操作、截图、表单提交...

## 编码加密

Base64编解码、十六进制编解码、URL编解码、MD5哈希、SHA1哈希、SHA256哈希、SHA512哈希、SM3哈希、AES加密、SM4加密、RSA加密、SM2加密...

## 流程控制

if-else条件判断、循环执行、数组遍历、对象遍历、switch-case分支、try-catch异常处理...

## 数据处理

字符串处理（反转、替换、分割、合并、去重、统计）、数组操作（过滤、排序、分组、聚合、扁平化、并集、交集、差集）、时间处理（格式化、计算、比较）、JSON处理、正则匹配...

## 文件操作

文件/文件夹创建、复制、移动、删除、重命名、属性获取、文件监控、文件图标获取、文件归档、快捷方式创建、默认程序打开...

## 图片处理

格式转换、图片压缩、尺寸调整、旋转翻转、水印添加、PNG转图标、图片信息获取、亮度对比度调整、图片合并、图片裁剪...

## macOS特定功能

应用管理（启动、退出、前台切换）、系统设置（音量、亮度、Dock）、Finder操作（窗口控制、文件操作）、系统事件、快捷键绑定...

## Windows特定功能
窗口控制（置顶、透明度、位置、大小、最大/最小化）、窗口查找（通过标题、类名、进程名）、窗口消息发送（按键、文本、命令）、进程管理（启动、结束、查找、权限提升）、注册表操作（读取、写入、删除、监控）、服务管理（启动、停止、重启、查询、创建、删除）、软件管理（安装、卸载、版本查询）、系统工具（磁盘管理、电源管理、网络配置）、快捷方式管理（创建、修改、删除）、系统设置修改（显示器、音频、电源等）、文件系统监控（文件变化、目录变化）、系统热键注册、UAC权限控制、界面自动化（UI元素查找、点击、输入）、系统事件监听（剪贴板变化、文件变化）...

## 数学计算
基础运算、随机数生成、统计计算（平均值、中位数、众数）、几何计算、三角函数、对数运算、进制转换、单位换算...

## 通知消息

控制台输出、系统通知、自定义通知样式...

## 编程相关

JS代码注入、脚本执行（支持多种语言）、函数返回、变量管理...

## 模拟操作

键盘按键模拟、按键序列、文本复制粘贴、鼠标点击和移动、屏幕截图（全屏、区域、窗口）、拖拽操作...

## 系统操作

剪贴板读写（文本、图片、文件）、系统路径获取、系统信息获取、进程管理、环境变量操作、系统命令执行...

## 用户数据

数据存取、数据删除、数据同步、数据导入导出...

## 用户界面

消息提示框、确认框、输入框、按钮组、选择列表、进度条、文件选择框、颜色选择器、日期选择器...

## uTools功能

匹配数据获取、插件跳转、窗口控制、版本信息获取、主题切换、快捷键管理...
Windows特定功能
窗口控制（置顶、透明度、位置）、消息发送、文件系统监控、进程管理、注册表操作、服务管理、快捷方式管理、系统设置修改...

## AI问答

AI问答（自由问答、翻译、总结、润色、扩写、生成shell代码）...

## 视频处理

格式转换、视频压缩、视频剪辑、视频合并、速度调整、视频截图、GIF转换、音频提取、水印添加、分辨率调整、帧率设置、码率控制...

## 状态获取

当前文件管理器路径、当前浏览器URL、选中文本、选中图片、选中文件、剪贴板内容、系统状态...

## 脚本命令

Shell脚本执行、Python脚本执行、Node.js脚本执行、PowerShell脚本执行、AppleScript执行...

## 其他功能

延时操作、定时任务...


# 五、截图
>详细介绍见 https://www.yuque.com/fofolee/mwsoos/bg31vl


>划词
[![OhN9xJ.gif](https://s1.ax1x.com/2022/05/16/OhN9xJ.gif)](https://imgtu.com/i/OhN9xJ)

>配置界面
![xb2g30.png](https://files.catbox.moe/xb2g30.png)

>AI代码生成
![4kcqh9.png](https://files.catbox.moe/4kcqh9.png)

>可视化编排界面
![5mbyoa.png](https://files.catbox.moe/5mbyoa.png)

>浏览器自动化
![nq4q0c.png](https://files.catbox.moe/nq4q0c.png)

>后台服务
![iiv1jv.png](https://files.catbox.moe/iiv1jv.png)
