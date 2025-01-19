const { ipcRenderer } = require("electron");
const { createBrowserWindow } = utools;
/**
 * 创建对话框窗口
 * @param {object} config - 对话框配置
 * @returns {Promise} 返回对话框结果
 */
const createDialog = (config) => {
  return new Promise((resolve) => {
    const dialogPath = "lib/dialog/view.html";
    const preloadPath = "lib/dialog/controller.js";

    const dialogOptions = {
      title: config.title || "对话框",
      width: 470,
      height: 80,
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      frame: false,
      webPreferences: {
        preload: preloadPath,
      },
    };

    // 创建窗口
    const UBrowser = createBrowserWindow(dialogPath, dialogOptions, () => {
      const dialogResultHandler = (event, result) => {
        resolve(result);
        // 移除监听器
        ipcRenderer.removeListener("dialog-result", dialogResultHandler);
        UBrowser.destroy();
      };

      const dialogReadyHandler = (event, height) => {
        // 获取当前窗口位置
        const bounds = UBrowser.getBounds();
        // 调整y坐标，保持窗口中心点不变
        const y = Math.round(bounds.y - (height - bounds.height) / 2);
        // 确保坐标和尺寸都是有效的整数
        const newBounds = {
          x: Math.round(bounds.x),
          y: Math.max(0, y), // 确保不会超出屏幕顶部
          width: 470,
          height: Math.round(height),
        };
        // 设置新的位置和大小
        UBrowser.setBounds(newBounds);
        ipcRenderer.removeListener("dialog-ready", dialogReadyHandler);
      };
      ipcRenderer.on("dialog-ready", dialogReadyHandler);

      // 添加监听器
      ipcRenderer.on("dialog-result", dialogResultHandler);

      // 发送配置到子窗口
      ipcRenderer.sendTo(UBrowser.webContents.id, "dialog-config", {
        ...config,
        isDark: utools.isDarkColors(),
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
 * @returns {Promise<{id: number, text: string, data: any}>} 选择的结果
 */
const showSystemSelectList = async (items, options = {}) => {
  const defaultOptions = {
    title: "",
  };
  const finalOptions = { ...defaultOptions, ...options };

  return await createDialog({
    type: "select",
    title: finalOptions.title,
    items: items,
  });
};

module.exports = {
  showSystemMessageBox,
  showSystemInputBox,
  showSystemConfirmBox,
  showSystemButtonBox,
  showSystemTextArea,
  showSystemSelectList,
};
