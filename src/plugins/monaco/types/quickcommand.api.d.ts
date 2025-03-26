interface quickcommandApi {
  /**
   * 显示一个按钮组对话框，并返回用户点击的按钮的索引及名称
   *
   * ```js
   * quickcommand.showButtonBox(["按钮1", "按钮2", "按钮3"]).then(({ id, text }) => {
   *     console.log(`选择了第${id+1}个按钮`)
   *     console.log(`按钮的文本为${text}`)
   * })
   * ```
   *
   * @param buttons 每一个按钮的名称
   * @param title 窗口标题，默认为空
   */
  showButtonBox(
    buttons: string[],
    title?: string
  ): Promise<{ id: number; text: string }>;

  /**
   * 显示一个输入框组对话框，并返回用户输入的所有值
   *
   * ```js
   * quickcommand.showInputBox(["输入框1", "输入框2", "输入框3"]).then(values => {
   *     console.log(`输入的内容分别为${values}`)
   * })
   *
   * quickcommand.showInputBox([{label:"输入框标签",value:"默认值",hint:"输入框提示"},{label:"输入框标签2",value:"默认值2",hint:"输入框提示2"}]).then(values => {
   *     console.log(`输入的内容分别为${values}`)
   * })
   * ```
   *
   * @param options 数组，如果元素为字符串，则作为输入框的标签名；如果元素为对象，则作为输入框的属性，包含label、value、hint三个属性
   * @param title 窗口标题，默认为空
   */
  showInputBox(
    options: string[] | { labels: string; values: string; hints: string }[],
    title?: string
  ): Promise<string[]>;

  /**
   * 显示一个支持搜索的且可以动态更新的选项列表，选项类型为文本或html时，返回选择的索引和文本，为对象时，返回选择的对象
   *
   * ```js
   * // plaintext
   * var opt = []
   * for (var i = 0; i < 15; i++) {
   *     // 每一个选项为文本格式
   *     opt.push(`选项` + i)
   * }
   * quickcommand.showSelectList(opt).then(choise => {
   *     console.log(`选择的选项为${choise.text}`)
   * })
   * ​
   * // json
   * var opt = []
   * for (var i = 0; i < 15; i++) {
   *     // 每一个选项为 json 格式, 使用clickFn注册选项单击事件时id属性是必需的
   *     opt.push({
   *        id: i,
   *        title: `选项${i}`,
   *        description: `选项${i}的描述`,
   *        icon: `https://yuanliao.info/favicon.ico`,
   *        abcd: `选项${i}的自定义属性`,
   *        clickFn:function(e){console.log(e)}
   *     })
   * }
   * quickcommand.showSelectList(opt, {optionType: 'json'}).then(choise => {
   *     console.log(`选择的选项为${choise.title}`)
   * })
   * ​
   * // html
   * var opt = []
   * for (var i = 0; i < 15; i++) {
   *     // 每一个选项为 html 格式
   *     opt.push(`<div style="color: red">选项${i}</div>`)
   * }
   * quickcommand.showSelectList(opt, {optionType: 'html'}).then(choise => {
   *     console.log(`选择的选项为${quickcommand.htmlParse(choise.text).body.innerText}`)
   * })
   * ```
   *
   * @param selects 每一个列表选项
   * @param options 配置选项
   * @param options.placeholder 搜索框占位符，默认为空
   * @param options.optionType 选项的格式，plaintext|html|json，默认为plaintext
   * @param options.enableSearch 启用搜索，默认 true
   * @param options.showCancelButton 显示关闭按钮，默认 false
   * @param options.closeOnSelect 点击后关闭，默认 true
   */
  showSelectList(
    selects: string[] | object[],
    options?: {
      placeholder: string;
      optionType: "plaintext" | "html" | "json";
      enableSearch: boolean;
      showCancelButton: boolean;
      closeOnSelect: boolean;
    }
  ): Promise<{ id: number; text: string | object }>;

  /**
   * 动态更新当前的选项列表的选项
   *
   * ```js
   * // 初始状态只有 1、2、3 三个选项
   * quickcommand.showSelectList(['1','2','3']).then(x=>{
   *   console.log(x)
   * })
   * ​
   * // 1s 后追加一个选项
   * quickcommand.setTimeout(()=>{
   *   quickcommand.updateSelectList('4')
   * }, 1000)
   * ​
   * // 2s 后更新第二个选项的值
   * quickcommand.setTimeout(()=>{
   *   quickcommand.updateSelectList('updated', 1)
   * }, 2000)
   * ```
   *
   * @param opt 要更新的选项
   * @param id 要更新的选项的序号，不赋值时则追加到最后一个选项后面
   */
  updateSelectList(opt: string, id?: number): void;

  /**
   * 显示一个文本框，并返回用户输入的值
   *
   * ```js
   * quickcommand.showTextAera("请输入文本").then(text=>{
   *   console.log(`输入的文本为${text}`)
   * })
   * ```
   *
   * @param placeholder 文本框占位符
   * @param defaultText 默认的文本值
   */
  showTextArea(placeholder?: string, defaultText?: string): Promise<string>;

  /**
   * 显示一个自动消失的提示框
   *
   * ```js
   * quickcommand.showMessageBox("这是一段3s后自动消失的成功提示", "success", 3000)
   * ```
   * @param message 显示的消息内容
   * @param icon 图标，默认为 success
   * @param time 多少毫秒后消失，如不指定则根据文本长度自动调整，当设为 0 时则需要手动点击关闭
   */
  showMessageBox(
    message: string,
    icon?: "success" | "error" | "warning" | "info",
    time?: number
  ): void;

  /**
   * 显示一个确认框，返回是否点击了确认
   *
   * ```js
   * quickcommand.showConfirmBox().then(confirmed => {
   *     confirmed && console.log('点击了确定')
   * })
   * ```
   * @param message 提示的内容
   * @param title 提示的标题
   * @param html 内容是支持html，默认 false
   * @param width 确认框宽度，默认 450
   */
  showConfirmBox(
    message?: string,
    title?: string,
    isHtml?: boolean,
    width?: number
  ): Promise<boolean>;

  /**
   * 显示等待用户操作的按钮，用户点击后执行相关操作
   *
   * ```js
   * quickcommand.showWaitButton(() => {
   *     stopRunning()
   * }, "停止运行")
   * ```
   * @param callback 点击后的回调
   * @param label 按钮的标题
   */
  showWaitButton(callback: () => void, label?: string): void;

  /**
   * 关掉现有等待操作按钮
   *
   * 正常会在退出运行结果界面后自动关闭，也可手动关闭
   */
  closeWaitButton(): void;

  /**
   * 监听用户按键，并执行回调函数
   *
   * ```js
   * quickcommand.listenKeydown(e=>{
   *  if(e.key === 'c' && e.ctrlKey){
   *    console.log("取消")
   *  }
   * })
   * ```
   *
   * @param callback 按键回调函数
   */
  listenKeydown(callback: (event) => void): void;

  /**
   * 移除所有按键监听
   *
   * 正常会在退出运行结果界面后自动移除，也可手动移除
   */
  removeListener(): void;

  /**
   * 同步等待，会阻塞进程
   * @param ms 等待的毫秒数
   */
  sleep(ms: number): void;

  /**
   * 异步等待
   *
   * ```js
   * quickcommand.setTimeout(()=>{
   *   console.log('2000毫秒后执行')
   * }, 2000)
   * ```
   *
   * @param ms 等待的毫秒数
   */
  setTimeout(callback: () => void, ms);

  /**
   * 清除异步等待
   *
   * @param timeoutId 等待的timeoutId
   * ```js
   * const timeoutId = quickcommand.setTimeout(()=>{
   *   console.log('这条内容不会被打印')
   * }, 2000)
   * quickcommand.clearTimeout(timeoutId)
   * ```
   */
  clearTimeout(timeoutId: number): void;

  /**
   * async 等待
   *
   * @param ms 等待的毫秒数
   * ```js
   * quickcommand.asyncSleep(2000).then(() => {
   *   console.log('2000毫秒后执行')
   * })
   * ```
   */
  asyncSleep(ms: number): Promise<number>;

  /**
   * 将给定的html字符串解析为 DOM 对象，用于快速编写爬虫脚本
   *
   * ```js
   * var html = `<a href="https://u.tools/">uTools</a>`
   * var href = quickcommand.htmlParse(html).querySelector('a').href
   * console.log(`解析出来的a标签地址为${href}`)
   * ```
   *
   * @param html 需要解析的 html 文本
   */
  htmlParse(html: string): object;

  /**
   * 将给定的markdown字符串解析为html字符串
   *
   * @param markdown 需要解析的markdown文本
   * ```js
   * quickcommand.markdownParse("# 这是一个标题").then(html => {
   *   console.log(html)
   * })
   * ```
   */
  markdownParse(markdown: string): string;

  /**
   * 下载文件，并返回文件的 Buffer，可选直接下载到指定路径，或者弹出对话框选择下载路径
   *
   * ```js
   * // 下载文件到D:/
   * quickcommand.downloadFile('https://res.u-tools.cn/currentversion/uTools-1.1.3.exe', 'D:/')
   * ​
   * // 下载文件，并弹出对话框询问保存路径
   * quickcommand.downloadFile('https://res.u-tools.cn/currentversion/uTools-1.1.3.exe')
   * ```
   *
   * @param url 地址
   * @param file 当赋值为文件路径时，则表示下载文件的绝对路径；
   * 不赋值时，则会弹出对话框要求选择下载到的路径；
   * 赋值为 Object时，表示弹出对话框的 options，格式和 utools.showSaveDialog 中的 options一致
   */
  downloadFile(url: string, file?: string | object): Promise<Buffer>;

  /**
   * 上传文件，可以直接上传指定文件，或者弹出对话框选择要上传的文件，可以自定义表单数据
   *
   * ```js
   * // 上传图片到图床
   * quickcommand.uploadFile("https://imgkr.com/api/v2/files/upload", "C:\\test.jpg").then(res=>{
   *   console.log('上传成功，图片地址为:' + res.data.data)
   * })
   * ​
   * // 包含额外表单数据
   * quickcommand.uploadFile("https://catbox.moe/user/api.php", "C:\\test.jpg", 'fileToUpload', {
   *   "reqtype": "fileupload"
   * }).then(res=>{
   *   console.log('上传成功，图片地址为:' + res.data)
   * })
   * ```
   *
   * @param url 地址
   * @param file 当赋值为文件路径时，则表示要上传的文件的绝对路径；
   * 不赋值时，则会弹出对话框要求选择要上传的文件的路径；
   * 赋值为 Object时，表示弹出对话框的 options，格式和 utools.showOpenDialog 中的 options一致
   *
   * @param name 文件名，默认为 file
   * @param formData 其他需要提交的表单数据
   */
  uploadFile(
    url: string,
    file?: string | object,
    name?: string,
    formData?: object
  ): Promise<object>;

  /**
   * 加载一个远程脚本文件，并返回脚本 export 的对象
   *
   * ```js
   * let remote = 'https://cdn.jsdelivr.net/npm/sweetalert2@9'
   * quickcommand.loadRemoteScript(remote).then(swal => {
   *     swal.fire('已加载 sweetalert2 并成功弹窗')
   * })
   * ```
   *
   * @param url 脚本地址
   * @param options 选项
   * @param options.useCache 使用缓存，默认为假。为真时会将远程脚本缓存到本地的utools.getPath("userData")/quickcommand目录，否则每次都会下载脚本
   */
  loadRemoteScript(url: string, options?: { useCache?: boolean }): Promise<object>;

  /**
   * 将 signal 发送给 pid 标识的进程 , 默认为关闭进程
   *
   * 不同于process.kill，会将该进程启用的所有子进程也杀死
   *
   * @param pid 进程 ID
   * @param signal 进程信号，默认为SIGTERM
   * @param callback 失败时的回调
   */
  kill(
    pid: number,
    signal?: string | number,
    callback?: (error?: Error) => void
  ): void;

  /**
   * windows 下运行 VBS 脚本并返回运行结果 (Promise)
   *
   * ```js
   * quickcommand.runVbs(`CreateObject("SAPI.SpVoice").Speak"Hello, World!"`)
   * ```
   *
   * @param script VBS 脚本代码
   */
  runVbs(script: string): Promise<string>;

  /**
   * windows 下运行 Powershell 脚本并返回运行结果 (Promise)
   *
   * ```js
   * quickcommand.runPowerShell(`$voice = New-Object -ComObject SAPI.SPVOICE
   * $voice.Speak('Hello, World!')`)
   * ```
   *
   * @param script Powershell 脚本代码
   */
  runPowerShell(script: string): Promise<string>;

  /**
   * MacOS 下运行 AppleScript 脚本并返回运行结果 (Promise)
   *
   * ```js
   * quickcommand.runAppleScript(`say "Hello, World!"`)
   * ```
   *
   * @param script AppleScript 代码
   */
  runAppleScript(script: string): Promise<string>;

  /**
   * 在终端运行，不支持 Linux
   *
   * @param command 要在终端运行的命令
   * @param options 终端运行参数
   * @param options.dir 运行目录
   * @param options.windows 终端类型，默认wt
   * @param options.macos 终端类型，默认warp
   *
   * ```js
   * quickcommand.runInTerminal(`whoami`)
   * ```
   */
  runInTerminal(
    command: string,
    options?: {
      dir?: string;
      windows?: "wt" | "cmd";
      macos?: "warp" | "iterm" | "terminal";
    }
  );

  /**
   * 对应 utools.onPluginEnter 的 `code` `type` 和 `payload`
   *
   * `code`: 唯一标识
   *
   * `type`: 匹配模式，可以为 text | img | files | regex | over | window
   *
   * `payload`: 当匹配模式为关键字时，返回进入插件的关键字；为正则时，返回匹配的文本；为窗口时，返回匹配的窗口信息；为文件时，返回匹配的文件信息
   *
   * ```js
   * if (quickcommand.enterData.type == 'regex'){
   *   var text = quickcommand.enterData.payload
   *     console.log(`主输入框匹配的文本为${text}`)
   * }
   * ```
   *
   */
  enterData: { code: string; type: string; payload: any };

  /**
   * 模拟复制操作
   */
  simulateCopy();

  /**
   * 模拟粘贴操作
   */
  simulatePaste();

  /**
   * 唤醒 uTools
   *
   * 当插件自身已经退出时，utools.showMainWindow() 将不再起作用
   *
   * 此时可以用此接口呼出 uTools 窗口
   */
  wakeUtools();

  /**
   * 读剪贴板
   */
  readClipboard(): text<string>;

  /**
   * 读剪贴板图片
   */
  readClipboardImage(): text<string>;

  /**
   * 写剪贴板
   *
   * @param txt 要写入的文本
   */
  writeClipboard(txt: string);

  userData: {
    /**
     * 创建/更新用户数据，返回是否成功
     *
     * 菜单-环境配置-用户特殊变量中的对应数据也会同步变更
     *
     * @param value: 要写入的数据
     *
     * @param id: 数据标识
     *
     * @param isNative: 是否仅本机有效，默认为 true
     *
     *```js
     * // 仅本机有效时，不同设备可以分别设置 filePath 的值而不冲突
     * quickcommand.userData.put('D:/xx.json' ,'filePath')
     *
     * // 非仅本机有效，则类似设置了一个缺省值，所有未设置仅本机有效的 filePath 值都为 D:/xx.json
     * quickcommand.userData.put('D:/xx.json' ,'filePath', false)
     * ```
     */
    put(value: string, id: string, isNative?: boolean): boolean;
    /**
     * 获取用户数据
     *
     * @param id: 数据标识
     *
     * ```js
     * // 等效于特殊变量 {{usr:filePath}}
     * quickcommand.userData.get('filePath')
     * ```
     */
    get(id: string): string;
    /**
     * 删除用户数据，返回是否成功
     *
     * @param id: 数据标识
     *
     */
    del(id: string): boolean;
    /**
     * 获取所有用户数据

     *
     */
    all(): Array<{ id: string; value: string; isNative: boolean }>;
  };

  /**
   * 显示一个系统级消息框
   *
   * ```js
   * quickcommand.showSystemMessageBox("这是一条消息", "标题")
   * ```
   *
   * @param content 消息内容
   * @param title 标题，默认为空
   */
  showSystemMessageBox(content: string, title?: string): Promise<void>;

  /**
   * 显示一个系统级输入框组对话框，返回所有输入框的值
   *
   * ```js
   * // 简单数组形式
   * quickcommand.showSystemInputBox(["姓名", "年龄", "地址"], "个人信息").then(values => {
   *   console.log(values) // ["张三", "25", "北京"]
   * })
   *
   * // 对象数组形式
   * quickcommand.showSystemInputBox([
   *   { label: "姓名", value: "张三", hint: "请输入姓名" },
   *   { label: "年龄", value: "25", hint: "请输入年龄" }
   * ], "个人信息").then(values => {
   *   console.log(values) // ["张三", "25"]
   * })
   * ```
   *
   * @param options 输入框配置，可以是标签数组或者带属性的对象数组
   * @param title 标题，默认为空
   */
  showSystemInputBox(
    options: string[] | { label: string; value?: string; hint?: string }[],
    title?: string
  ): Promise<string[] | null>;

  /**
   * 显示一个系统级确认框，返回是否点击了确认
   *
   * ```js
   * quickcommand.showSystemConfirmBox("确定要删除吗？", "确认删除").then(confirmed => {
   *   if (confirmed) {
   *     console.log("用户点击了确定")
   *   }
   * })
   * ```
   *
   * @param content 确认内容
   * @param title 标题，默认为空
   */
  showSystemConfirmBox(content: string, title?: string): Promise<boolean>;

  /**
   * 显示一个系统级按钮组对话框，返回点击的按钮的索引和文本
   *
   * ```js
   * quickcommand.showSystemButtonBox(["保存", "不保存", "取消"], "保存确认").then(result => {
   *   if (result) {
   *     console.log(`点击了第${result.id + 1}个按钮：${result.text}`)
   *   }
   * })
   * ```
   *
   * @param buttons 按钮文本数组
   * @param title 标题，默认为空
   */
  showSystemButtonBox(
    buttons: string[],
    title?: string
  ): Promise<{ id: number; text: string } | null>;

  /**
   * 显示一个系统级多行文本输入框
   *
   * ```js
   * quickcommand.showSystemTextArea("请输入内容", "").then(text => {
   *   if (text) {
   *     console.log("输入的文本：", text)
   *   }
   * })
   * ```
   *
   * @param placeholder 输入框的提示文本，默认为空
   * @param defaultText 输入框的默认文本，默认为空
   */
  showSystemTextArea(
    placeholder?: string,
    defaultText?: string
  ): Promise<string | null>;

  /**
   * 显示一个支持搜索的系统级选项列表，选项类型为文本时，返回选择的索引和文本，为对象时，返回选择的对象
   *
   * ```js
   * // plaintext
   * var opt = []
   * for (var i = 0; i < 15; i++) {
   *     // 每一个选项为文本格式
   *     opt.push(`选项` + i)
   * }
   * quickcommand.showSystemSelectList(opt).then(choise => {
   *     console.log(`选择的选项为${choise.text}`)
   * })
   * ​
   * // json
   * var opt = []
   * for (var i = 0; i < 15; i++) {
   *     opt.push({
   *        id: i,
   *        title: `选项${i}`,
   *        description: `选项${i}的描述`,
   *        icon: `https://yuanliao.info/favicon.ico`,
   *        abcd: `选项${i}的自定义属性`,
   *     })
   * }
   * quickcommand.showSystemSelectList(opt, {optionType: 'json'}).then(choise => {
   *     console.log(`选择的选项为${choise.title}`)
   * })
   * ​
   * ```
   *
   * @param selects 每一个列表选项，可以为文本或对象
   * @param selects.title 选项的标题
   * @param selects.description 选项的描述
   * @param selects.icon 选项的图标
   * @param options 配置选项
   * @param options.placeholder 搜索框占位符，默认为空
   * @param options.enableSearch 是否启用搜索，默认为 true
   * @param options.title 对话框标题，默认为请选择
   * @param options.optionType 选项的格式，plaintext|json，默认为plainText
   */
  showSystemSelectList(
    selects: string[] | object[],
    options?: {
      placeholder: string;
      enableSearch: boolean;
      title: string;
      optionType: "plaintext" | "json";
    }
  ): Promise<{ id: number; text: string | object }>;

  /**
   * 显示一个系统级等待按钮
   * @param options 配置选项
   * @param options.text 按钮文本
   * @param options.position 按钮位置，可选值：top-left, top-right, bottom-left, bottom-right
   * @param options.showCancel 是否显示取消按钮，默认 true
   *
   * ```js
   * const result = await quickcommand.showSystemWaitButton({
   *   text: "等待操作",
   *   position: "bottom-right",
   * })
   * console.log(result) // true 或 false
   * ```
   */
  showSystemWaitButton(options?: {
    text?: string;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    showCancel?: boolean;
  }): Promise<boolean>;

  /**
   * 运行代码
   * @param code 代码
   * @param options 选项
   * @param options.language 编程语言，不传时则根据操作系统选择cmd或是shell
   * @param options.args 脚本参数
   * @param options.scriptCode 脚本文件编码
   * @param options.outputCode 命令行输出编码
   * @param options.runInTerminal 终端运行参数，不传则不在终端运行
   * @param options.runInTerminal.dir 运行目录
   * @param options.runInTerminal.windows windows使用的终端，默认wt
   * @param options.runInTerminal.macos macos使用的终端，默认warp
   *
   * 支持的编程语言：
   * shell, applescript, cmd, python, powershell, javascript, ruby, php, lua, perl, csharp, c
   *
   * ```js
   * const script = `
   * import sys
   * print(sys.argv[1])
   * `
   * const options = {
   *   language: "python",
   *   args: ["hello world"]
   * }

   * quickcommand.runCode(script, options).then(result => {
   *   console.log(result)
   * }).catch(e => {
   *   console.log(e)
   * })
   * ```
   */
  runCode(
    code: string,
    options: {
      language:
        | "shell"
        | "applescript"
        | "cmd"
        | "python"
        | "powershell"
        | "javascript"
        | "ruby"
        | "php"
        | "lua"
        | "perl"
        | "csharp"
        | "c";
      args?: string[];
      scriptCode?: string;
      outputCode?: string;
      runInTerminal?: {
        dir?: string;
        windows?: "wt" | "cmd";
        macos?: "warp" | "iterm" | "terminal";
      };
    }
  ): Promise<string>;

  /**
   * 显示一个带有暂停、恢复、关闭回调功能的进度条，支持动态更新进度
   * @param {object} options - 配置选项
   * @param {string} [options.text="处理中..."] - 进度条上方的文本
   * @param {number} [options.value] - 初始进度值(0-100)，不传则显示加载动画
   * @param {string} [options.position="bottom-right"] - 进度条位置，可选值：top-left, top-right, bottom-left, bottom-right
   * @param {Function} [options.onClose] - 关闭按钮点击时的回调函数
   * @param {Function} [options.onPause] - 暂停按钮点击时的回调函数，必须和onResume一起配置
   * @param {Function} [options.onResume] - 恢复按钮点击时的回调函数，必须和onPause一起配置
   * @returns {Promise<{id: number, close: Function}>} 返回进度条对象
   *
   * ```js
   * // 显示进度条
   * const processBar = await quickcommand.showProcessBar({
   *   text: "正在下载文件...",
   *   value: 0,
   *   position: "bottom-right"
   * });
   *
   * // 显示加载动画
   * const processBar = await quickcommand.showProcessBar({
   *   text: "正在加载...",
   *   position: "bottom-right"
   * });
   *
   * // 带暂停/恢复，关闭回调功能
   * let isPaused = false;
   * const processBar = await quickcommand.showProcessBar({
   *   text: "正在下载文件...",
   *   value: 0,
   *   onPause: () => {
   *     isPaused = true;
   *     console.log("暂停下载");
   *   },
   *   onResume: () => {
   *     isPaused = false;
   *     console.log("继续下载");
   *   },
   *   onClose: () => {
   *     console.log("用户关闭了进度条");
   *   }
   * });
   *
   * // 动态更新进度
   * const items = Array(100).fill(0);
   * for (let i = 0; i < items.length; i++) {
   *   // 检查是否暂停
   *   while (isPaused) {
   *     await quickcommand.asyncSleep(100);
   *   }
   *
   *   // 更新进度
   *   quickcommand.updateProcessBar({
   *     value: Math.round((i + 1) / items.length * 100),
   *     text: `正在处理第 ${i + 1}/${items.length} 项`
   *   });
   *
   *   await someAsyncOperation();
   * }
   *
   * // 完成时更新并关闭
   * quickcommand.updateProcessBar({
   *   value: 100,
   *   text: "处理完成！",
   *   complete: true
   * });
   * ```
   */
  showProcessBar(options?: {
    title?: string;
    text?: string;
    value?: number;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    onClose?: () => void;
    onPause?: () => void;
    onResume?: () => void;
  }): Promise<{
    id: number;
    close: () => void;
  }>;

  /**
   * 更新进度条的进度
   * @param {object} options - 配置选项
   * @param {number} [options.value] - 新的进度值(0-100)，不传则显示加载动画
   * @param {string} [options.text] - 新的进度文本
   * @param {boolean} [options.complete] - 是否完成并关闭进度条
   * @param {{id: number, close: Function}|undefined} processBar - 进度条对象，如果不传入则使用上一次创建的进度条
   *
   * ```js
   * // 更新进度
   * quickcommand.updateProcessBar({
   *   value: 50,
   *   text: "已完成50%"
   * });
   *
   * // 切换为加载动画
   * quickcommand.updateProcessBar({
   *   text: "正在加载..."
   * });
   *
   * // 使用指定的进度条
   * quickcommand.updateProcessBar({
   *   value: 50,
   *   text: "已完成50%"
   * }, processBar);
   *
   * // 完成并关闭
   * quickcommand.updateProcessBar({
   *   value: 100,
   *   text: "完成！",
   *   complete: true
   * });
   * ```
   */
  updateProcessBar(
    options: {
      value?: number;
      text?: string;
      complete?: boolean;
    },
    processBar?: {
      id: number;
      close: () => void;
    }
  ): void;

  /**
   * 与 AI 进行问答
   * @param content 对话内容
   * @param content.prompt 提示词
   * @param content.role 预设角色: translate|shell|summarize|polish|expand
   * @param apiConfig API配置，不传或传入null则使用用户配置的第一个API配置
   * @param apiConfig.apiType 模型类型：openai/ollama
   * @param apiConfig.apiUrl API地址
   * @param apiConfig.apiToken API令牌（仅 OpenAI 需要）
   * @param apiConfig.model 模型名称
   * @param options 其他选项
   * @param options.showProcessBar 是否显示进度条
   * @param options.onStream 流式请求回调
   * @param options.onFetch 发起请求回调
   *
   *
   * ```js
   * // 不传apiConfig时，需在配置页面-右下角菜单-AI配置中进行配置
   * const response = await quickcommand.askAI(
   *   {
   *     prompt: "你好",
   *   }
   * );
   *
   * // OpenAI 示例
   * const response = await quickcommand.askAI(
   *   {
   *     prompt: "你好",
   *   },
   *   {
   *     apiType: "openai",
   *     apiUrl: "https://api.openai.com",
   *     apiToken: "your-api-token",
   *     model: "gpt-3.5-turbo"
   *   }
   * );
   * console.log(response);
   *
   * // Ollama 示例 (流式回调)
   * await quickcommand.askAI(
   *   {
   *     prompt: "查找进程名为chrome的进程并关闭",
   *     role: "shell"
   *   },
   *   {
   *     apiType: "ollama",
   *     apiUrl: "http://localhost:11434",
   *     model: "qwen2.5:32b"
   *   },
   *   {
   *     onStream: (chunk, isDone) => {
   *       // 获取流式响应
   *       console.log(chunk);
   *       if (isDone) {
   *         console.log("流式请求完成");
   *       }
   *     },
   *     onFetch: (controller) => {
   *       console.log("请求开始");
   *       // 某个特定条件，中断请求
   *       if (某个特定条件) {
   *         controller.abort();
   *       }
   *     }
   *   }
   * );
   * ```
   */
  askAI(
    content: {
      /** 提示词 */
      prompt: string;
      /** 预设角色: 翻译、shell命令生成、总结、润色、扩写 */
      role?: "translate" | "shell" | "summarize" | "polish" | "expand";
    },
    /** API配置，不传或传入null则使用用户配置的第一个API配置 */
    apiConfig?: {
      /** 模型类型：openai/ollama */
      apiType: "openai" | "ollama";
      /** API地址 */
      apiUrl: string;
      /** API令牌（仅 OpenAI 需要） */
      apiToken?: string;
      /** 模型名称 */
      model: string;
    },
    options?: {
      /** 是否显示进度条, 默认 true */
      showProcessBar?: boolean;
      /** 请求开始回调 */
      onFetch?: (controller: AbortController) => void;
      /** 流式请求回调 */
      onStream?: (chunk: string, isDone: boolean) => void;
    }
  ): Promise<{
    /** 是否成功 */
    success: boolean;
    /** AI 响应内容 */
    result?: string;
    /** 错误信息 */
    error?: string;
  }>;
}

declare var quickcommand: quickcommandApi;
