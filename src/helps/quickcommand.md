[TOC]

## quickcommand

#### `showButtonBox(callback, buttons)`

- callback:  Function  回调函数
  - index: Integer  按钮的序号，从0开始
  - text: String  按钮的文本
- buttons: Array  每一个元素对应一个按钮

显示一个按钮对话框，用来接收用户的输入

**示例**

```js
quickcommand.showButtonBox(({index, text})=>{
  console.log(`选择了第${index+1}个按钮`)
  console.log(`按钮的文本为${text}`)
},["按钮1", "按钮2", "按钮3"])
```
**实例**

```js
# 截取自内置快捷命令： 文本处理
quickcommand.showButtonBox(option => {
    var i = option.index
    console.log(textManipulation[i](text))
    message('结果已复制到剪贴板')
}, ["字数统计", "词频统计", "文本逆转", "\\和/互转", "全部大写", "全部小写",
    "去除空格", "十六进制转字符", "字符转十六进制"
])
textManipulation = [ ... ]
```

####`showInputBox(callback, placeHolders)`

- callback:  Function  回调函数
  - values: Array  所以输入框的值
- placeHolders: Array  每一个占位符对应一个输入框

显示一个输入框界面，用来接用户的输入

**示例**

```js
quickcommand.showInputBox(values => {
  console.log(`输入的内容分别为${values}`)
},["输入框1", "输入框2", "输入框3"])
```
**实例**

```js
# 截取自内置快捷命令： 文本替换
quickcommand.showInputBox(inputs => {
    var search = inputs[0]
    var repl = inputs[1]
	...
    utools.hideMainWindow()
    quickcommand.sleep(300)
    quickcommand.simulateCopy()
    quickcommand.sleep(100)
    var source = electron.clipboard.readText()
    source = source.replace(search, repl)
	...
}, ["要替换的内容，两边加 / 使用正则", "替换为的内容"])
```
####`showSelectList(callback, selects, options)`

- callback:  Function  回调函数
  - index: Integer  选择的序号，从0开始
  - text: String  选择的文本
- selects: Array  每一个元素对应一个列表选项
- options: Array | undefined 列表的选项
  - placeholder: String 搜索框占位符
  - enableHTML:  Boolean 选项是否支持html，默认为false
  - closeOnSelect：Boolean 选择后是否关闭列表，默认为true

显示一个支持搜索的选项列表，类似于列表模式，但原理不同

**示例**

```js
var opt = []
for (var i = 0; i < 15; i++) {
    opt.push(`选项` + i)
}
quickcommand.showSelectList(choise => {
    console.log(`选择的选项为${choise.text}`)
}, opt)
```
**实例**

```js
# 截取自内置快捷命令： 离线插件
const api = 'https://api.u-tools.cn/Plugins/Developer/allPlugins'
 axios(api).then(res => {
     var document = quickcommand.htmlParse(res.data)
     var doms = document.querySelectorAll('div[style]')
     var divs = []
     doms.forEach(d => {
         d.querySelector('a').style.display = 'none'
         d.querySelector('h3+div').style.color = '#9e9e9e'
         d.querySelector('h3').style = "margin: 0; font-weight: normal"
         divs.push(d.innerHTML)
     })
     quickcommand.showSelectList(x => {
         var dom = quickcommand.htmlParse(x.text)
         var href = dom.querySelector('a').href
         var file = dom.querySelector('h3').innerText + '.upx'
         var filepath = path.join(utools.getPath('downloads'), file)
         quickcommand.downloadFile(href, filepath).then(() => {
             utools.shellShowItemInFolder(filepath)
         })
     }, divs, { enableHTML: true, closeOnSelect: false })
 })
```

####`showTextAera(callback, placeholder)`

- callback:  Function  回调函数
  - text: String  文本框的文本
- placeholder: String | undefined  文本框占位符

显示一个文本框界面，用来接用户的输入

**示例**

```js
quickcommand.showTextAera(text=>{
  console.log(`输入的文本为${text}`)
}, "请输入文本")
```

 **实例** 

```js
# 截取自内置快捷命令： vscode代码片段生成器
var snippet = {}
quickcommand.showTextAera(code => {
    snippet.body = code.split("\n")
    quickcommand.showInputBox(inputs => {
        snippet.prefix = inputs[1]
        snippet.description = inputs[0]
        var result = `"${inputs[0]}": ` + JSON.stringify(snippet, null, '\t')
        console.log(result)
        utools.copyText(result)
        quickcommand.showMessageBox('已复制')
    }, ["代码片段的描述", "触发代码片段的关键词"])
}, ("请输入代码片段"))
```
####`showMessageBox(message, icon, time)`

- message:  String  显示的消息内容
- icon: String | undefined  图标，可为`success`、`error`、`warning`、`info`、`question`，默认为`success`
- time: Integer | undefined  多少毫秒后消失，默认为`3000`

显示一个自动消失的提示框

 **示例** 

```js
quickcommand.showMessageBox("这是一段3s后自动消失的成功提示")
quickcommand.showMessageBox("这是一段3s后自动消失的失败提示", "error")
```

####`sleep(ms)`

- ms:  Integer 等待的毫秒

由于`setTimeout`在electron中存在限制，在隐藏到后台时不会被执行，在vm2中也有bug，所以在quickcommand的环境下被禁用了，但对于模拟按键之类的场景，延迟是不可缺少的，所以提供了`sleep`函数来解决这个问题

 **示例** 

```js
utools.simulateKeyboardTap('d', 'alt')
quickcommand.sleep(200)
utools.simulateKeyboardTap('c', 'ctrl')
```

####`setTimeout(callback, ms)`

- callback:  Function  回调函数
- ms: Integer 延时的毫秒

用法和`setTimeout`一样，但实现原理不一样，`sleep`的异步版本

 **示例** 

```js
quickcommand.setTimeout(()=>{
  console.log('2000毫秒后执行')
}, 2000)
```
####`htmlParse(html)`
- html:  String  需要解析的`html`文本
- 返回: Object `DOM`对象

将给定的`html`字符串解析为`DOM`对象，用于快速编写爬虫脚本

 **示例** 

```js
var html = `<a href="https://u.tools/">uTools</a>`
var href = quickcommand.htmlParse(html).querySelector('a').href
console.log(`解析出来的a标签地址为${href}`)
```

#### `downloadFile(url, defaultPath, showDialog)`

- url:  String 地址
- defaultPath: String | undefined  当`showDialog`为`false`时，表示下载文件的绝对路径，当`showDialog`为`true`时，表示对话框默认显示的文件名
- showDialog: Boolean | undefined 是否弹出对话框 ，默认为`false`
- 返回: Promise 
  - content: Buffer 网络响应内容的`Buffer `

下载文件，也可单纯用于`http`请求，无论`defaultPath`是否定义，都将得到响应内容的`Buffer`，当`showDialog`为`false`且定义了`defaultPath`时，会下载文件为``defaultPath`，当`showDialog`为`true`时，会弹出保存文件对话框，`defaultPath`为对话框默认显示的文件名

```js
# 返回http响应内容
quickcommand.downloadFile('https://www.baidu.com').then(r=>{
  console.log(r.toString())
})

# 下载文件到D:/
quickcommand.downloadFile('https://res.u-tools.cn/currentversion/uTools-1.1.3.exe', 'D:/')

# 下载文件，并弹出对话框询问保存路径
quickcommand.downloadFile('https://res.u-tools.cn/currentversion/uTools-1.1.3.exe', 'uTools.exe', true)
```

#### `payload`

- String 对应`utools.onPluginEnter`的 `payload` 

当匹配模式为`关键字`时，返回进入插件的关键字；为`正则`时，返回匹配的文本；为`窗口`时，返回匹配的窗口信息；为`文件`时，返回匹配的文件信息

 **示例** 

```js
# 匹配模式为正则/划词时
var text = quickcommand.payload
console.log(`主输入框匹配的文本为${text}`)
```

#### `kill(pid, signal)`

- pid:  Integer  进程 ID 
- signal: String | Integer | undefined  将发送的信号，默认为 `'SIGTERM'` 

 将 `signal` 发送给 `pid` 标识的进程 , 默认为关闭进程，同`process.kill`

 **示例** 

```js
quickcommand.kill(16084)
```

#### `simulateCopy()`

模拟复制操作

#### `simulatePaste()`

模拟粘贴操作

## 上下文一览

- nodejs [文档]( http://nodejs.cn/api/ )
  - require
  - os
  - fs
  - path
  - child_process
  - util
  - axios [文档]( https://github.com/axios/axios )
- electron [文档]( http://www.electronjs.org/docs )
  - clipboard
  - contextBridge
  - crashReporter
  - desktopCapturer
  - ipcRenderer
  - nativeImage
  - shell
  - webFrame
- utools [文档]( https://u.tools/docs/developer/api.html )
  - all except below
  - ~~db~~
  - ~~removeFeature~~
  - ~~setFeature~~
- quickcommand
  - sleep: *ƒ (ms)*
  - setTimeout: *ƒ (callback, ms)*
  - showButtonBox: *ƒ (callback, buttons)*
  - showInputBox: *ƒ (callback, placeHolders)*
  - showMessageBox: *ƒ (title, icon = "success", time = 3000)*
  - showSelectList: *ƒ (callback, selects, opt = {})*
  - showTextAera: *ƒ (callback, placeholder = "")*
  - simulateCopy: *ƒ ()*
  - simulatePaste: *ƒ ()*
  - downloadFile: *ƒ (url, defaultPath = '', showDialog = false)*
  - htmlParse: *ƒ (html)*
  - kill: *ƒ (pid)*
  - payload


