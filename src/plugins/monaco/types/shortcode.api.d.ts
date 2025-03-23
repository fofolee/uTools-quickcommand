/**
 * 打开文件或文件夹
 *
 * ```js
 * // 等同于
 * utools.shellOpenItem(path)
 * ```
 */
declare function open(path: string): void;

/**
 * 在文件管理器中显示文件或文件夹
 *
 * ```js
 * // 等同于
 * utools.shellShowItemInFolder(path)
 * ```
 */
declare function locate(path: string): void;

/**
 * 访问 URL
 *
 * ```js
 * // 等同于
 * utools.shellOpenExternal(url)
 * ```
 */
declare function visit(url: string): void;

/**
 * 执行系统命令并返回结果，输出编码根据操作系统自出处理
 *
 * ```js
 * // 等同于
 * child_process.execSync(cmd, { windowsHide: true } )
 * ```
 */
declare function system(cmd: string): string;

/**
 * 显示系统通知
 *
 * ```js
 * // 等同于
 * utools.showNotification(msg)
 * ```
 */
declare function message(msg: string): void;

/**
 * 模拟键盘按键
 *
 * ```js
 * // 等同于
 * utools.simulateKeyboardTap(key, ...modifier)
 * ```
 */
declare function keyTap(key: string, ...modifier: string[]): void;

/**
 * 复制文本到剪贴板
 *
 * ```js
 * // 等同于
 * electron.clipboard.writeText(text)
 * ```
 */
declare function copyTo(text: string): void;

/**
 * 隐藏主窗口并输入文本
 *
 * ```js
 * // 等同于
 * utools.hideMainWindowPasteText(text)
 * ```
 */
declare function send(text: string): void;
