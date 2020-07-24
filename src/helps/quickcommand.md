[TOC]

## quickcommand

### ❖ UI 交互

#### `showButtonBox(buttons, title)`

- buttons: Array  每一个元素对应一个按钮
- title: String | undefined 对话框标题
- 返回: Promise
  - id: Integer  按钮的序号，从0开始
  - text: String  按钮的文本

显示一个按钮对话框，用来接收用户的输入

**示例**

```js
// then 写法
quickcommand.showButtonBox(["按钮1", "按钮2", "按钮3"]).then(({ id, text }) => {
    console.log(`选择了第${id+1}个按钮`)
    console.log(`按钮的文本为${text}`)
})

// async 写法
(async () =>{
  let button = await quickcommand.showButtonBox(["按钮1", "按钮2", "按钮3"])
  console.log(`选择了第${button.id+1}个按钮`)
  console.log(`按钮的文本为${button.text}`)
})()

// 捕获错误
quickcommand.showButtonBox().catch(e => {
    console.log(e)
})
```
**实例**

```js
// 截取自内置快捷命令： 通过 find 查找文件
quickcommand.showButtonBox(['打开文件', '在文件管理器中定位', '复制文件路径']).then(x => {
    switch (x.id) {
        case 0:
            utools.shellOpenItem(file);
            break;
        case 1:
            utools.shellShowItemInFolder(file);
            break;
        case 2:
            utools.copyText(file);
            break;
        default:
            break;
    }
})
```

####`showInputBox(placeHolders, title)`

- placeHolders: Array  每一个占位符对应一个输入框
- title: String | undefined 对话框标题
- 返回: Promise
  - values: Array  所以输入框的值

显示一个输入框界面，用来接用户的输入

**示例**

```js
quickcommand.showInputBox(["输入框1", "输入框2", "输入框3"]).then(values => {
    console.log(`输入的内容分别为${values}`)
})
```
**实例**

```js
// 截取自内置快捷命令： 文本替换
quickcommand.showInputBox(["要替换的内容，两边加 / 使用正则", "替换为的内容"]).then(inputs => {
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
})
```
####`showSelectList(selects, options)`

- selects: Array  每一个元素对应一个列表选项
- options: Array | undefined 列表的选项
  - placeholder: String 搜索框占位符
  - optionType:  String 选项的格式，有`plaintext`、`html`、`json`三种，默认为`plaintext`
- 返回: Promise
  - id: Integer  选择的序号，从0开始
  - text: String  选择的文本
  - title/description/[…]: 当`optionType`为`json`时，对应`json`里的每一个属性 

显示一个支持搜索的且可以动态更新的选项列表

当指定`optionType`为`json`时，类似于插件开发的`列表模式`，`title`、`description`和`icon`分别表示标题、描述和图标，其中`title`为必备属性

**示例**

```js
// plaintext
var opt = []
for (var i = 0; i < 15; i++) {
    // 每一个选项为文本格式
    opt.push(`选项` + i)
}
quickcommand.showSelectList(opt).then(choise => {
    console.log(`选择的选项为${choise.text}`)
})

// json
var opt = []
for (var i = 0; i < 15; i++) {
    // 每一个选项为 json 格式
    opt.push({title: `选项${i}`, description: `选项${i}的描述`, abcd: `选项${i}的自定义属性`})
}
quickcommand.showSelectList(opt, {optionType: 'json'}).then(choise => {
    console.log(`选择的选项为${choise.title}`)
})

// html
var opt = []
for (var i = 0; i < 15; i++) {
    // 每一个选项为 html 格式
    opt.push(`<div style="color: red">选项${i}</div>`)
}
quickcommand.showSelectList(opt, {optionType: 'html'}).then(choise => {
    console.log(`选择的选项为${quickcommand.htmlParse(choise.text).body.innerText}`)
})
```
**实例**

```js
// 截取自内置快捷命令： 文本处理
let textManipulation = [ ... ]
let text = quickcommand.payload
let options = textManipulation.map(t => {
    return {
        title: t.name,
        description: t.func(text)
    }
})

quickcommand.showSelectList(options, { optionType: 'json' })
    .then(choise => {
        console.log(choise.description)
        utools.copyText(choise.description)
    })

axios.post('http://fy.iciba.com/ajax.php?a=fy', `f=auto&t=auto&w=${text}`)
    .then(res => {
        let content = res.data.content
        let trans = content.out ? content.out : content.word_mean
        let opt = textManipulation[0]
        opt.description = trans
        quickcommand.updateSelectList(opt, 0)
    })   
```

#### `updateSelectList(opt, id)`

- opt:  String  要更新的选项
- id: Integer  | undefined: 要更新的选项的序号，不赋值时则追加到最后一个选项后面

动态更新当前的选项列表的选项。

**示例**

```js
// 初始状态只有 1、2、3 三个选项
quickcommand.showSelectList(['1','2','3']).then(x=>{
  console.log(x)
})

// 1s 后追加一个选项
quickcommand.setTimeout(()=>{
  quickcommand.updateSelectList('4')
}, 1000)

// 2s 后更新第二个选项的值
quickcommand.setTimeout(()=>{
  quickcommand.updateSelectList('updated', 1)
}, 2000)
```

####`showTextAera(placeholder)`

- placeholder: String | undefined  文本框占位符
- 返回: Promise
  - text: String  文本框的文本

显示一个文本框界面，用来接用户的输入

**示例**

```js
quickcommand.showTextAera("请输入文本").then(text=>{
  console.log(`输入的文本为${text}`)
})
```

 **实例** 

```js
// 截取自内置快捷命令： vscode代码片段生成器
var snippet = {}
quickcommand.showTextAera("请输入代码片段").then(code => {
    snippet.body = code.split("\n")
    quickcommand.showInputBox(["代码片段的描述", "触发代码片段的关键词"])
        .then(inputs => {
            snippet.prefix = inputs[1]
            snippet.description = inputs[0]
            var result = `"${inputs[0]}": ` + JSON.stringify(snippet, null, '\t')
            console.log(result)
            utools.copyText(result)
            quickcommand.showMessageBox('已复制')
        })
})
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

#### `showConfirmBox(title)`

- title: String | undefined 提示的标题
- 返回: Promise
  - confirmed: Boolean | undefined 是否点击了确定按钮

显示一个确认框

```js
quickcommand.showConfirmBox().then(confirmed => {
    confirmed && console.log('点击了确定')
})
```

### ❖ 延时函数

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
### ❖ 前端封装

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

#### `downloadFile(url, file | options)`

- url:  String 地址
- file | options : 
  - file: String 当赋值为文件路径时，则表示下载文件的绝对路径
  - options: Object | undefined 不赋值时，则会弹出对话框要求选择下载到的路径, 赋值为 `Object `时，表示弹出对话框的 `options `，格式和 `utools.showSaveDialog` 中的 `options `一致
- 返回: Promise 
  - content: Buffer 文件的内容

下载文件，可选直接下载到指定路径，或者弹出对话框选择下载路径

```js
// 下载文件到D:/
quickcommand.downloadFile('https://res.u-tools.cn/currentversion/uTools-1.1.3.exe', 'D:/')

// 下载文件，并弹出对话框询问保存路径
quickcommand.downloadFile('https://res.u-tools.cn/currentversion/uTools-1.1.3.exe')
```

#### `uploadFile(url, file | options, name, formData)`

- url:  String 地址
- file | options : 
  - file: String 当赋值为文件路径时，则表示要上传的文件的绝对路径
  - options: Object | undefined 不赋值时，则会弹出对话框要求选择要上传的文件的路径, 赋值为 `Object `时，表示弹出对话框的 `options `，格式和 `utools.showOpenDialog` 中的 `options `一致
- name: String | undefined 文件名，默认为`file`
- formData: Object | undefined 其他需要添加的表单数据
- 返回: Promise 
  - response: Object 响应内容

上传文件，可以直接上传指定文件，或者弹出对话框选择要上传的文件，可以自定义表单数据

```js
// 上传图片到图床
quickcommand.uploadFile("https://imgkr.com/api/v2/files/upload", "C:\\test.jpg").then(res=>{
  console.log('上传成功，图片地址为:' + res.data.data)
})

// 包含额外表单数据
quickcommand.uploadFile("https://catbox.moe/user/api.php", "C:\\test.jpg", 'fileToUpload', {
  "reqtype": "fileupload"
}).then(res=>{
  console.log('上传成功，图片地址为:' + res.data)
})
```

### ❖ nodejs 封装

#### `loadRemoteScript(url)`

- url:  String 脚本地址

- 返回: Promise 
  - Object: Object 返回从远程脚本加载的对象

加载一个远程脚本文件

```js
let remote = 'https://cdn.jsdelivr.net/npm/sweetalert2@9'
quickcommand.loadRemoteScript(remote).then(swal => {
    swal.fire('已加载 sweetalert2 并成功弹窗')
})

// async/await
(async () => {
    let remote = 'https://cdn.jsdelivr.net/npm/sweetalert2@9'
    const swal = await quickcommand.loadRemoteScript(remote)
    swal.fire('已加载 sweetalert2 并成功弹窗')
})()
```

#### `kill(pid, signal)`

- pid:  Integer  进程 ID 
- signal: String | Integer | undefined  将发送的信号，默认为 `'SIGTERM'` 

 将 `signal` 发送给 `pid` 标识的进程 , 默认为关闭进程，同`process.kill`

 **示例** 

```js
quickcommand.kill(16084)
```

### ❖ utools 封装

#### `payload`

- String 对应`utools.onPluginEnter`的 `payload` 

当匹配模式为`关键字`时，返回进入插件的关键字；为`正则`时，返回匹配的文本；为`窗口`时，返回匹配的窗口信息；为`文件`时，返回匹配的文件信息

 **示例** 

```js
// 匹配模式为正则/划词时
var text = quickcommand.payload
console.log(`主输入框匹配的文本为${text}`)
```

#### `simulateCopy()`

模拟复制操作

#### `simulatePaste()`

模拟粘贴操作

## 其他

### nodejs

#### ❖ <a href ="javascript:utools.ubrowser.goto('http://nodejs.cn/api/').run({width: 1280, height: 920})">文档</a>

####  ❖ 上下文

  - **require**: *ƒ require(path)* 
  - **os**: {arch: *ƒ*, cpus: *ƒ*, endianness: *ƒ*, freemem: *ƒ*, getPriority: *ƒ*, …} 
  - **fs**: {appendFile: *ƒ*, appendFileSync: *ƒ*, access: *ƒ*, accessSync: *ƒ*, chown: *ƒ*, …} 
  - **path**: {resolve: *ƒ*, normalize: *ƒ*, isAbsolute: *ƒ*, join: *ƒ*, relative: *ƒ*, …} 
  - **child_process**: {_forkChild: *ƒ*, ChildProcess: *ƒ*, exec: *ƒ*, execFile: *ƒ*, execFileSync: *ƒ*, …} 
  - **util**: {_errnoException: *ƒ*, _exceptionWithHostPort: *ƒ*, _extend: *ƒ*, callbackify: *ƒ*, debuglog: *ƒ*, …} 
  - **Buffer**: *ƒ Buffer(arg, encodingOrOffset, length)* 
  - **process**: process {version: "v12.14.1", versions: {…}, arch: "x64", …} 
  - **TextDecoder**: *ƒ TextDecoder()*
  - **TextEncoder**: *ƒ TextEncoder()*
  - **URL**: *ƒ URL()*
  - **URLSearchParams**: *ƒ URLSearchParams()*
  - **axios**: *ƒ* *wrap()*  
    - [文档](./axios.html)

### electron

#### ❖ <a href ="javascript:utools.ubrowser.goto('http://www.electronjs.org/docs').run({width: 1280, height: 920})">文档</a>

#### ❖ 上下文

- **clipboard**: Object
- **contextBridge**: Object
- **crashReporter**: Object
- **desktopCapturer**: Object
- **ipcRenderer**: EventEmitter
- **nativeImage**: Object
- **shell**: Object
- **webFrame**: WebFrame

###  utools

#### ❖ <a href ="javascript:utools.ubrowser.goto('https://u.tools/docs/developer/api.html').run({width: 1280, height: 920})">文档</a>

#### ❖ 上下文

- all except below
- ~~db~~
- ~~removeFeature~~
- ~~setFeature~~


