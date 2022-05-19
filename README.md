# 快捷命令

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

- 快速执行命令：如打开文件夹、软件、网址等
- 快速运行脚本：如批处理、`shell`、`python` 等
- 直接编写网页：可以直接编写简单的  `html` 页面

- 无需编写插件：实现需要使用 `utools` 的 api 或者带 UI 界面的功能



# 二、其他特色

- 内置了执行`shell`命令、文本处理、文本替换、网址二维码等实用命令
- 支持在插件内下载别人分享的命令
- 快速编辑及运行代码
- 快速收藏文件、网址、插件别名，通过面板视图，实现类似软件启动器、网页搜藏夹、插件面板等功能
- 定时运行命令
- 提供后台服务，将插件内部和外部环境打通



# 三、功能一览

## ① 内置命令

当前内置的命令有：`Windows Terminal 中打开`、`执行 shell 命令`、`文本处理`、`文本替换`、`vscode代码片段生成器`、`通过 find 查找文件`、`网址二维码`



## ② 导入、导出、分享命令

- 支持通过文件导入导出命令
- 支持通过剪贴板导入导出命令
- 支持一键分享命令
- 支持在线获取及导入别人分享的命令



## ③ 自定义命令

### 「 快捷动作 」

- 打开文件/文件夹/软件 （实现在主输入框启动自定义的软件名称及路径 ）
- 在文件管理器中定位文件
- 用默认浏览器打开网址（实现类似网页快开的功能）
- 用 `ubrowser` 打开网址
- 执行系统命令
- 将内容写入剪贴板
- 发送系统消息
- 弹窗显示消息
- 发送文本到活动窗口
- 转至指定插件(实现自定义插件关键字)
- 添加延时



### 「 匹配 」

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

- 专业模式

匹配 JSON 格式的配置，等效于插件开发中的`features.cmds`



### 「 环境 」

支持以下环境

- qucikcommand (electron + nodejs + utools)
- html
- cmd
- shell
- applescript
- python
- php
- javascript
- 等



### 「 输出 」

- 隐藏并忽略输出
- 显示纯文本输出 (不解析 html 内容)
- 显示html格式的输出 (可以进一步编写简单的 GUI 界面，参考内置动作特殊符号大全)
- 复制到剪贴板
- 发送到活动窗口（可实现发送常用短语之类的功能）
- 发送到系统通知
- 在终端中显示



### ④ 面板视图

- 将某一个标签下的命令以面板形式展现
- 可实现网址导航面板、软件启动面板之类的功能



### ⑤ 运行代码

- 内置了一个简单的脚本编辑器，可以快速运行代码
- 会自动记录上次运行的代码



详细介绍见 https://www.yuque.com/fofolee/mwsoos/bg31vl

[![OhN9xJ.gif](https://s1.ax1x.com/2022/05/16/OhN9xJ.gif)](https://imgtu.com/i/OhN9xJ)
[![OhNYi8.png](https://s1.ax1x.com/2022/05/16/OhNYi8.png)](https://imgtu.com/i/OhNYi8)
[![OhNGIf.png](https://s1.ax1x.com/2022/05/16/OhNGIf.png)](https://imgtu.com/i/OhNGIf)
[![OhNAVx.png](https://s1.ax1x.com/2022/05/16/OhNAVx.png)](https://imgtu.com/i/OhNAVx)
[![OhNirR.png](https://s1.ax1x.com/2022/05/16/OhNirR.png)](https://imgtu.com/i/OhNirR)
[![OhNPM9.png](https://s1.ax1x.com/2022/05/16/OhNPM9.png)](https://imgtu.com/i/OhNPM9)
[![OhNFq1.png](https://s1.ax1x.com/2022/05/16/OhNFq1.png)](https://imgtu.com/i/OhNFq1)
[![OhNEa6.png](https://s1.ax1x.com/2022/05/16/OhNEa6.png)](https://imgtu.com/i/OhNEa6)
[![OhNVIK.png](https://s1.ax1x.com/2022/05/16/OhNVIK.png)](https://imgtu.com/i/OhNVIK)
[![OhNePO.png](https://s1.ax1x.com/2022/05/16/OhNePO.png)](https://imgtu.com/i/OhNePO)
[![OhNmGD.png](https://s1.ax1x.com/2022/05/16/OhNmGD.png)](https://imgtu.com/i/OhNmGD)
