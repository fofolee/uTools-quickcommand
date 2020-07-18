[TOC]

# 一、添加命令

## 基础

####  常用动作

通过点击`+动作`按钮进行添加

- 打开文件/文件夹/软件 （实现在主输入框启动自定义的软件名称及路径 ）
- 在文件管理器中定位文件
- 用默认浏览器打开网址（实现类似网页快开的功能）
- 用 ubrowser 打开网址
- 执行系统命令
- 将内容写入剪贴板
- 发送系统消息
- 弹窗显示消息
- 发送文本到活动窗口
- 转至指定插件(实现自定义插件关键字)
- 添加延时

![](https://i.imgur.com/dnPOyqW.png)

####  模拟按键

通过点击`+按键`按钮进行添加

## 进阶

#### 匹配

决定通过何种方式进入插件，不同的匹配模式也会影响插值变量的使用

##### 关键字

- 在主输入框输入对应关键字进入插件，最通用的一种模式，关键字可以设置多个

##### 正则/划词

- 正则匹配主输入框文本或唤出语音面板时选中的文本，可以获取输入框文本或选中文本作为变量

##### 窗口/进程

- 匹配呼出 uTools 前或唤出语音面板时的活动窗口，可以获取窗口的信息或文件夹路径作为变量

##### 复制/选中文件

- 匹配拖入主输入框的文件或唤出语音面板时选中的文件，可以获取复制及选中的文件信息作为变量

![](https://i.imgur.com/cCM2k6A.png)

#### 环境

##### quickcommand

- 可以快速执行打开网址、软件、文件夹、模拟按键等高频动作的命令
- 可以通过 quickcommand 的 api 来编写具有 UI 交互的脚本，详见[文档](./quickcommand.html)
- 可以使用nodejs、electron、uTools 的 api, 其中 os、fs、path、child_process、util、axios、electron 已经预先  require 了, 无需再次 require ,详见[文档中的上下文一览](./quickcommand.html#上下文一览)

##### python、cmd、shell 、php 等环境

- 本机装了相应环境即可执行相应的脚本
- 可以通过插值变量增强脚本的功能
- 支持 10+ 语言
- 可以通过 custom 手动设置解释器路径、参数、脚本后缀及编码方式

![](https://i.imgur.com/MPF1MdJ.png)

#### 插值变量

本插件内置了一些特殊的插值变量，可以获取一些特殊的值，能够加入到插件里的任意脚本中

##### 全模式可用

- `{{isWin}}` 是否Window系统， 返回1或0
- `{{LocalId}}`本机唯一ID
- `{{BrowserUrl}}` 浏览器的当前链接
- `{{ClipText}}` 获取剪贴板的文本
- `{{SelectText}}` 获取选中的文本 (已弃用)
- `{{subinput}}`获取子输入框的文本，具有此变量时会在进入插件时自动启动子输入框

##### 匹配窗口/进程时可用

- `{{pwd}}` 资源管理器或访达的当前目录
- `{{SelectFile}}` 文件管理器选中的文件，不支持 Linux
- `{{WindowInfo}}`当前窗口信息，返回 JSON 格式字符串
  - 可以使用类似 `{{WindowInfo.id}}`的格式来直接读取相应的值

##### 匹配正则/划词时可用

- `{{input}} ` 获取主输入框的文本

##### 匹配复制/选中文件时可用

- `{{MatchedFiles}}` 匹配的文件，返回 JSON 格式字符串
  - 可以使用类似`{{MatchedFiles[0].path}}`的格式来直接读取相应的值

![](https://i.imgur.com/PYjjYnR.png)

#### 输出

如果脚本有输出，则可以对输出内容做如下处理

- 隐藏并忽略输出
- 显示纯文本输出 (不解析 html 内容)
- 显示html格式的输出 (可以进一步编写简单的 GUI 界面，参考内置动作`特殊符号大全`)
- 复制到剪贴板
- 发送到活动窗口（可实现发送常用短语之类的功能）
- 发送到系统通知
- 在终端中显示

![](https://i.imgur.com/T45uJi5.png)

# 二、导出/分享/导入

#### 导出命令

点击命令旁的蓝色小箭头即可导出命令，支持

- 导出到剪贴板
- 导出到文件

![](https://i.imgur.com/mnVGx8J.png)

#### 分享命令

点击分享命令即可一键分享当前的命令，初次分享命令，需要按照以下步骤设置 token：

1.通过 [https://www.yuque.com/g/fofolee/em2rng/collaborator/join?token=6LZn2vc34dqfIQdC](https://www.yuque.com/g/fofolee/em2rng/collaborator/join?token=6LZn2vc34dqfIQdC) 成为知识库成员，如果没有语雀账号，需要先注册一个

![](https://i.imgur.com/H4Hh781.png)

2.生成一个具有编辑权限的 token

![U2Rw0P.png](https://s1.ax1x.com/2020/07/19/U2Rw0P.png)

3.在插件内填入生成的 token，之后就可以尽情地分享命令啦

![](https://i.imgur.com/tAXTSi9.png)

#### 导入命令

- 可以通过点击底部的`导入命令`来导入命令
- 会优先识别剪贴板,如果剪贴板内有正确格式的命令会自动导入
- 如果剪贴板内没有,则会弹出文件选择框
- 支持自动识别是单个导出的命令还是全部导出的命令

#### 获取分享

点击设置界面底部的`获取分享`即可获取并导入在线分享的命令啦

![](https://i.imgur.com/rWqQogD.png)

![](https://i.imgur.com/r3vJWKv.png)

# 三、关于

#### 作者

<img width="30px" src="https://s1.ax1x.com/2020/07/14/UaDkdg.png">[github @fofolee]( https://github.com/fofolee )

<img width="30px" src=" https://yuanliao.info/assets/avatars/frbg0owd6t3mmejs.png ">[猿料社区 @fofolee](  https://yuanliao.info/u/fofolee/discussions  )

#### 赞赏码

鉴于之前某位可爱的同学捐赠的时候捐错了对象，此处献上我的捐赠码~

<img width="500px" src="https://s1.ax1x.com/2020/07/15/Uacgqx.png">

#### 所有插件

所有由我制作的插件如下表所示，有兴趣的童鞋可以试一试~

<table> <tbody> <tr> <td><img style="max-width:30px;max-height:30px" src="https://res.u-tools.cn/plugins/logo/c6e808470b6cbc778865e9ed1bebf339.png"></td> <td>快捷命令</td> <td><button onclick="utools.redirect(this.parentNode.parentNode.querySelector('td+td').innerText)">戳我</button></td> </tr> <tr> <td><img style="max-width:30px;max-height:30px" src="https://res.u-tools.cn/plugins/logo/11bf712cc79499549754586fff7c8db1.png"></td> <td>程序员手册</td> <td><button onclick="utools.redirect(this.parentNode.parentNode.querySelector('td+td').innerText)">戳我</button></td> </tr> <tr> <td><img style="max-width:30px;max-height:30px" src="https://res.u-tools.cn/plugins/logo/dd0977b7d74db32d7088795ef62a7769.png"></td> <td>bilibili</td> <td><button onclick="utools.redirect(this.parentNode.parentNode.querySelector('td+td').innerText)">戳我</button></td> </tr> <tr> <td><img style="max-width:30px;max-height:30px" src="https://res.u-tools.cn/plugins/logo/f26a31d11af3a54f9bddd7e781da46d5.png"></td> <td>关闭进程</td> <td><button onclick="utools.redirect(this.parentNode.parentNode.querySelector('td+td').innerText)">戳我</button></td> </tr> <tr> <td><img style="max-width:30px;max-height:30px" src="https://res.u-tools.cn/plugins/logo/80eae148109a4d7001232efebdd14aca.png"></td> <td>插件面板</td> <td><button onclick="utools.redirect(this.parentNode.parentNode.querySelector('td+td').innerText)">戳我</button></td> </tr> <tr> <td><img style="max-width:30px;max-height:30px" src="https://res.u-tools.cn/plugins/logo/223f27b647b184ffdb2cd9f05a99d50a.png"></td> <td>随机壁纸</td> <td><button onclick="utools.redirect(this.parentNode.parentNode.querySelector('td+td').innerText)">戳我</button></td> </tr> <tr> <td><img style="max-width:30px;max-height:30px" src="https://res.u-tools.cn/plugins/logo/480ac04e8ea522b7bb0dae6418e177a4.png"></td> <td>Github助手</td> <td><button onclick="utools.redirect(this.parentNode.parentNode.querySelector('td+td').innerText)">戳我</button></td> </tr> <tr> <td><img style="max-width:30px;max-height:30px" src="https://res.u-tools.cn/plugins/logo/0de374539c3c358d122ca652d26b5b6e.png"></td> <td>文件夹助手</td> <td><button onclick="utools.redirect(this.parentNode.parentNode.querySelector('td+td').innerText)">戳我</button></td> </tr> <tr> <td><img style="max-width:30px;max-height:30px" src="https://res.u-tools.cn/plugins/logo/5f9fd2f37445a462c0735b9dcca828cd.png"></td> <td>emoji搜索</td> <td><button onclick="utools.redirect(this.parentNode.parentNode.querySelector('td+td').innerText)">戳我</button></td> </tr> <tr> <td><img style="max-width:30px;max-height:30px" src="https://res.u-tools.cn/plugins/logo/50ef534638a9fc7fbed5274131afe503.png"></td> <td>😩能不能好好说话</td> <td><button onclick="utools.redirect(this.parentNode.parentNode.querySelector('td+td').innerText)">戳我</button></td> </tr> <tr> <td><img style="max-width:30px;max-height:30px" src="https://res.u-tools.cn/plugins/logo/9863ccc91f32b4ab660d6e58dd8b04ae.png"></td> <td>winget</td> <td><button onclick="utools.redirect(this.parentNode.parentNode.querySelector('td+td').innerText)">戳我</button></td> </tr> <tr> <td><img style="max-width:30px;max-height:30px" src="https://res.u-tools.cn/plugins/logo/6abb03b743259bd4c976d2a29da0a395.png"></td> <td>icons8搜索</td> <td><button onclick="utools.redirect(this.parentNode.parentNode.querySelector('td+td').innerText)">戳我</button></td> </tr> <tr> <td><img style="max-width:30px;max-height:30px" src="https://res.u-tools.cn/plugins/logo/527a20566499e7c3fb63e8705d60ccb7.png"></td> <td>kali 工具介绍</td> <td><button onclick="utools.redirect(this.parentNode.parentNode.querySelector('td+td').innerText)">戳我</button></td> </tr> <tr> <td><img style="max-width:30px;max-height:30px" src="https://res.u-tools.cn/plugins/logo/3ef0e794b7950193fc98289ea2b199e9.png"></td> <td>png转icon</td> <td><button onclick="utools.redirect(this.parentNode.parentNode.querySelector('td+td').innerText)">戳我</button></td> </tr> </tbody> </table>