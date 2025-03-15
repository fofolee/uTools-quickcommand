const { ipcRenderer } = require("electron");
const os = require("os");
const { createBrowserWindow } = utools;

const dialogPath = "lib/dialog/view.html";
const preloadPath = "lib/dialog/controller.js";

const commonBrowserWindowOptions = {
  resizable: false,
  minimizable: false,
  maximizable: false,
  fullscreenable: false,
  skipTaskbar: true,
  alwaysOnTop: true,
  frame: false,
  movable: true,
  webPreferences: {
    preload: preloadPath,
    devTools: utools.isDev(),
  },
};

/**
 * 创建对话框窗口
 * @param {object} config - 对话框配置
 * @param {object} [customDialogOptions] - 自定义窗口选项
 * @returns {Promise} 返回对话框结果
 */
const createDialog = (config, customDialogOptions = {}) => {
  return new Promise((resolve) => {
    // linux 和 win32 都使用 win32 的样式
    const platform = os.platform() === "darwin" ? "darwin" : "win32";

    const dialogWidth =
      config.type === "textarea" || config.type === "select"
        ? 500
        : platform === "win32"
        ? 370
        : 420;

    const dialogOptions = {
      title: config.title || "对话框",
      width: dialogWidth,
      height: 80,
      opacity: 0,
      ...commonBrowserWindowOptions,
      ...customDialogOptions, // 合并自定义选项
    };

    // 创建窗口
    const UBrowser = createBrowserWindow(dialogPath, dialogOptions, () => {
      const windowId = UBrowser.webContents.id;

      const windowResponseHandler = (event, result) => {
        resolve(result);
        UBrowser.destroy();
      };

      const windowResizeHandler = (event, height) => {
        // 获取当前窗口位置
        const bounds = UBrowser.getBounds();
        // 调整y坐标，保持窗口中心点不变
        const y = Math.round(bounds.y - (height - bounds.height) / 2);
        // 确保坐标和尺寸都是有效的整数
        const newBounds = {
          x: Math.round(bounds.x),
          y: Math.max(0, y), // 确保不会超出屏幕顶部
          width: dialogWidth,
          height: Math.round(height),
        };
        // 设置新的位置和大小
        UBrowser.setBounds(newBounds);
        UBrowser.setOpacity(1);
      };

      // 监听子窗口返回的计算高度, 等待按钮有自己的计算逻辑
      config.type !== "wait-button" &&
        ipcRenderer.once(`window-resize-${windowId}`, windowResizeHandler);

      // 监听子窗口返回的返回值
      ipcRenderer.once(`window-response-${windowId}`, windowResponseHandler);

      // 发送配置到子窗口
      ipcRenderer.sendTo(windowId, `window-config`, {
        ...config,
        isDark: utools.isDarkColors(),
        platform,
        windowId,
      });
    });
  });
};

/**
 * 显示一个系统级消息框
 * @param {string} content - 消息内容
 * @param {string} [title] - 标题，默认为空
 * @returns {Promise<void>} Promise
 */
const showSystemMessageBox = async (content, title = "") => {
  await createDialog({
    type: "message",
    title,
    content,
  });
};

/**
 * 显示一个系统级输入框组对话框
 * @param {string[]|{label:string,value:string,hint:string}[]} options - 输入框配置，可以是标签数组或者带属性的对象数组
 * @param {string} [title] - 标题，默认为空
 * @returns {Promise<string[]>} 输入的内容数组
 */
const showSystemInputBox = async (options, title = "") => {
  // 确保 options 是数组
  const optionsArray = Array.isArray(options) ? options : [options];

  // 转换每个选项为正确的格式
  const inputOptions = optionsArray.map((opt) => {
    if (typeof opt === "string") {
      return opt;
    }
    if (typeof opt === "object" && opt.label) {
      return {
        label: opt.label,
        value: opt.value || "",
        hint: opt.hint || "",
      };
    }
    throw new Error("输入框配置格式错误");
  });

  return await createDialog({
    type: "input",
    title,
    inputOptions,
  });
};

/**
 * 显示一个系统级确认框，返回是否点击了确认
 * @param {string} content - 确认内容
 * @param {string} [title] - 标题，默认为空
 * @returns {Promise<boolean>} 是否确认
 */
const showSystemConfirmBox = async (content, title = "") => {
  const result = await createDialog({
    type: "confirm",
    title,
    content,
  });
  return !!result;
};

/**
 * 显示一个系统级按钮组对话框，返回点击的按钮的索引和文本
 * @param {string[]} buttons - 按钮文本数组
 * @param {string} [title] - 标题，默认为空
 * @returns {Promise<{id: number, text: string}>} 选择的按钮信息
 */
const showSystemButtonBox = async (buttons, title = "") => {
  return await createDialog({
    type: "buttons",
    title,
    buttons: Array.isArray(buttons) ? buttons : [buttons],
  });
};

/**
 * 显示一个系统级多行文本输入框
 * @param {string} [placeholder] - 输入框的提示文本
 * @param {string} [defaultText] - 输入框的默认文本，默认为空
 * @returns {Promise<string>} 编辑后的文本
 */
const showSystemTextArea = async (placeholder = "请输入", defaultText = "") => {
  return await createDialog({
    type: "textarea",
    placeholder,
    defaultText,
  });
};

/**
 * 显示一个系统级选择列表对话框
 * @param {Array<string|{title: string, description?: string, icon?: string}>} items - 选项列表
 * @param {object} [options] - 配置选项
 * @param {string} [options.title] - 对话框标题
 * @param {string} [options.placeholder] - 输入框占位符
 * @param {boolean} [options.enableSearch] - 是否启用搜索
 * @returns {Promise<{id: number, text: string, data: any}>} 选择的结果
 */
const showSystemSelectList = async (items, options = {}) => {
  const {
    title = "请选择",
    placeholder = "",
    enableSearch = true,
    optionType = "plaintext",
  } = options;

  return await createDialog({
    type: "select",
    title,
    placeholder,
    enableSearch,
    items,
    optionType,
  });
};

/**
 * 计算窗口位置
 * @param {object} options - 配置选项
 * @param {string} [options.position="bottom-right"] - 窗口位置，可选值：top-left, top-right, bottom-left, bottom-right
 * @param {number} options.width - 窗口宽度
 * @param {number} options.height - 窗口高度
 * @param {number} [options.padding=20] - 边距
 * @returns {{x: number, y: number}} 窗口位置坐标
 */
const calculateWindowPosition = (options) => {
  const { position = "bottom-right", width, height, padding = 20 } = options;

  // 获取主屏幕尺寸
  const primaryDisplay = utools.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } =
    primaryDisplay.workAreaSize;

  let x, y;
  switch (position) {
    case "top-left":
      x = padding;
      y = padding;
      break;
    case "top-right":
      x = screenWidth - width - padding;
      y = padding;
      break;
    case "bottom-left":
      x = padding;
      y = screenHeight - height - padding;
      break;
    case "bottom-right":
    default:
      x = screenWidth - width - padding;
      y = screenHeight - height - padding;
      break;
  }

  return { x, y };
};

/**
 * 显示一个系统级等待按钮
 * @param {object} options - 配置选项
 * @param {string} [options.text="等待操作"] - 按钮文本
 * @param {string} [options.position="bottom-right"] - 按钮位置，可选值：top-left, top-right, bottom-left, bottom-right
 * @param {boolean} [options.showCancel=false] - 是否显示取消按钮
 * @returns {Promise<boolean>} 点击确定返回true，点击取消返回false
 */
const showSystemWaitButton = async (options = {}) => {
  const {
    text = "等待操作",
    position = "bottom-right",
    showCancel = true,
  } = options;

  // 创建临时span计算文本宽度
  const span = document.createElement("span");
  span.style.font =
    '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  span.style.visibility = "hidden";
  span.style.position = "absolute";
  span.textContent = text;
  document.body.appendChild(span);

  // 计算窗口尺寸
  const textWidth = span.offsetWidth;
  document.body.removeChild(span);

  const width = Math.max(textWidth + 32 + (showCancel ? 25 : 0), 80);
  const height = 36;

  // 计算窗口位置
  const { x, y } = calculateWindowPosition({ position, width, height });

  return await createDialog(
    {
      type: "wait-button",
      text,
      showCancel,
    },
    {
      width,
      height,
      x,
      y,
      opacity: 1,
    }
  );
};

let lastProcessBar = null;

/**
 * 显示一个进度条对话框
 * @param {object} options - 配置选项
 * @param {string} [options.title="进度"] - 对话框标题
 * @param {string} [options.text="处理中..."] - 进度条上方的文本
 * @param {number} [options.value] - 初始进度值(0-100)，不传则显示加载动画
 * @param {string} [options.position="bottom-right"] - 进度条位置，可选值：top-left, top-right, bottom-left, bottom-right
 * @param {Function} [options.onClose] - 关闭按钮点击时的回调函数
 * @param {Function} [options.onPause] - 暂停按钮点击时的回调函数
 * @param {Function} [options.onResume] - 恢复按钮点击时的回调函数
 * @returns {Promise<{id: number, close: Function}>} 返回进度条窗口ID和关闭函数
 * @throws {Error} 如果只配置了onPause或onResume中的一个会抛出错误
 */
const showProcessBar = async (options = {}) => {
  const {
    text = "处理中...",
    value,
    position = "bottom-right",
    onClose,
    onPause,
    onResume,
  } = options;

  // 校验暂停/恢复回调必须同时配置
  if ((onPause && !onResume) || (!onPause && onResume)) {
    throw new Error("onPause 和 onResume 必须同时配置");
  }

  const windowWidth = 350;
  const windowHeight = 60;

  const { x, y } = calculateWindowPosition({
    position,
    width: windowWidth,
    height: windowHeight,
  });

  return new Promise((resolve) => {
    const UBrowser = createBrowserWindow(
      dialogPath,
      {
        width: windowWidth,
        height: windowHeight,
        x,
        y,
        opacity: 0,
        focusable: false,
        ...commonBrowserWindowOptions,
      },
      () => {
        const windowId = UBrowser.webContents.id;
        let windowResizeHandler;
        let processPauseHandler;

        // 创建事件处理器
        windowResizeHandler = (event, height) => {
          const bounds = UBrowser.getBounds();
          const y = Math.round(bounds.y - (height - bounds.height));
          const newBounds = {
            x: Math.round(bounds.x),
            y: Math.max(0, y),
            width: windowWidth,
            height: Math.round(height),
          };
          UBrowser.setBounds(newBounds);
          UBrowser.setOpacity(1);
        };

        // 监听暂停/恢复事件
        if (onPause && onResume) {
          processPauseHandler = (event, isPaused) => {
            if (isPaused) {
              onPause();
            } else {
              onResume();
            }
          };
          ipcRenderer.on(`process-pause-${windowId}`, processPauseHandler);
        }

        // 监听子窗口返回的计算高度
        ipcRenderer.on(`window-resize-${windowId}`, windowResizeHandler);

        const closeProcessBar = () => {
          if (typeof onClose === "function") {
            onClose();
          }
          // 清理所有事件监听器
          ipcRenderer.removeListener(
            `window-resize-${windowId}`,
            windowResizeHandler
          );
          if (processPauseHandler) {
            ipcRenderer.removeListener(
              `process-pause-${windowId}`,
              processPauseHandler
            );
          }
          lastProcessBar = null;
          UBrowser.destroy();
        };

        // 监听对话框结果
        ipcRenderer.once(`process-close-${windowId}`, () => {
          closeProcessBar();
        });

        // 发送配置到子窗口
        ipcRenderer.sendTo(windowId, "window-config", {
          type: "process",
          text,
          value: value === undefined ? 0 : value,
          isDark: utools.isDarkColors(),
          platform: process.platform,
          showPause: Boolean(onPause && onResume),
          isLoading: value === undefined,
          windowId,
        });

        const processBar = {
          id: windowId,
          close: closeProcessBar,
        };

        lastProcessBar = processBar;
        resolve(processBar);
      }
    );
  });
};

/**
 * 更新进度条的进度
 * @param {object} options - 配置选项
 * @param {number} [options.value] - 新的进度值(0-100)，不传则显示加载动画
 * @param {string} [options.text] - 新的进度文本
 * @param {boolean} [options.complete] - 是否完成并关闭进度条
 * @param {{id: number, close: Function}|undefined} processBar - 进度条对象, 如果不传入则使用上一次创建的进度条
 * @throws {Error} 如果传入的processBar对象不是有效的进度条对象
 */
const updateProcessBar = (options = {}, processBar = null) => {
  if (!processBar) {
    if (!lastProcessBar) {
      throw new Error("没有找到已创建的进度条");
    }
    processBar = lastProcessBar;
  }
  // 校验processBar对象
  if (
    typeof processBar !== "object" ||
    typeof processBar.id !== "number" ||
    typeof processBar.close !== "function"
  ) {
    throw new Error("processBar对象格式错误");
  }

  const { value, text, complete } = options;
  ipcRenderer.sendTo(processBar.id, "update-process", {
    value,
    text,
    isLoading: value === undefined,
  });

  if (complete) {
    setTimeout(() => {
      processBar.close();
    }, 600);
  }
};

module.exports = {
  showSystemMessageBox,
  showSystemInputBox,
  showSystemConfirmBox,
  showSystemButtonBox,
  showSystemTextArea,
  showSystemSelectList,
  showSystemWaitButton,
  showProcessBar,
  updateProcessBar,
};
