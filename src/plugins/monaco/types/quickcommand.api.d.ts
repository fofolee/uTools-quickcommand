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
   * quickcommand.showInputBox({labels:["输入框标签"],values:["默认值"],hints:["输入框提示"]}).then(values => {
   *     console.log(`输入的内容分别为${values}`)
   * })
   * ```
   *
   *
   *
   * @param options 数组时，为每一个输入框的标签名；对象时，为每一个输入框的属性
   * @param title 窗口标题，默认为空
   */
  showInputBox(
    options: string[] | { labels: string[]; values: string[]; hints: string[] },
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
   *     // 每一个选项为 json 格式
   *     opt.push({title: `选项${i}`, description: `选项${i}的描述`, icon: `http://www.u.tools/favicon.ico`,abcd: `选项${i}的自定义属性`})
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
   * @param options 列表的选项。placeholder: 搜索框占位符；optionType: 选项的格式，默认为plaintext；
   * enableSearch：启用搜索，默认 true；showCancelButton：显示关闭按钮，默认 false；closeOnSelect：
   * 点击后关闭，默认 true
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
   * @param value 默认的文本值
   */
  showTextArea(placeholder?: string, value?: string): Promise<string>;

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
   */
  showConfirmBox(message?: string, title?: string): Promise<boolean>;

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
   */
  loadRemoteScript(url: string): Promise<object>;

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
   * windows 下运行 VBS 脚本并返回运行结果
   *
   * ```js
   * quickcommand.runVbs(`CreateObject("SAPI.SpVoice").Speak"Hello"`)
   * ```
   *
   * @param script VBS 代码
   */
  runVbs(script: string): Promise<string>;

  /**
   * 在终端运行，不支持 Linux
   *
   * @param command 要在终端运行的命令
   * ```js
   * quickcommand.runInTerminal(`whoami`)
   * ```
   */
  runInTerminal(command: string);

  /**
   * 对应 utools.onPluginEnter 的 code type 和 payload
   *
   * code: 唯一标识
   *
   * type: 匹配模式，可以为 text | img | files | regex | over | window
   *
   * payload: 当匹配模式为关键字时，返回进入插件的关键字；为正则时，返回匹配的文本；为窗口时，返回匹配的窗口信息；为文件时，返回匹配的文件信息
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
   * 写剪贴板
   *
   * @param txt 要写入的文本
   */
  writeClipboard(txt: string);
}

declare var quickcommand: quickcommandApi;
