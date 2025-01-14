const { runCsharpFeature } = require("../../csharp");

/**
 * 键盘操作
 * @param {string} method 窗口类型：title/handle/active
 * @param {string} window 窗口标题/句柄
 * @param {string} keys 键盘按键
 * @param {object} options 选项
 * @param {string} options.control 控件类名
 * @param {boolean} options.background 是否后台操作
 * @returns {boolean} 是否成功
 */
const sendKeys = async function (method, window, keys, options = {}) {
  const { control, background = false } = options;
  const args = ["-type", "keyboard", "-action", "keys", "-value", keys];
  args.push("-method", method);
  if (method !== "active" && window) args.push("-window", window);
  if (control) args.push("-control", control);
  args.push("-background", background.toString());

  const result = await runCsharpFeature("sendmessage", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

/**
 * 发送文本
 * @param {string} method 窗口类型：title/handle/active
 * @param {string} window 窗口标题/句柄
 * @param {string} text 文本
 * @param {object} options 选项
 * @param {string} options.control 控件类名
 * @param {boolean} options.background 是否后台操作
 * @returns {boolean} 是否成功
 */
const sendText = async function (method, window, text, options = {}) {
  const { control, background = false } = options;
  const args = ["-type", "keyboard", "-action", "text", "-value", text];

  args.push("-method", method);
  if (method !== "active" && window) args.push("-window", window);
  if (control) args.push("-control", control);
  args.push("-background", background.toString());

  const result = await runCsharpFeature("sendmessage", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

/**
 * 鼠标点击
 * @param {string} method 窗口类型：title/handle/active
 * @param {string} window 窗口标题/句柄
 * @param {string} action 动作：click/doubleClick/rightClick
 * @param {object} options 选项
 * @param {string} options.control 控件类名
 * @param {string} options.text 控件文本
 * @param {string} options.pos 点击位置：x,y
 * @param {boolean} options.background 是否后台操作
 * @returns {boolean} 是否成功
 */
const click = async function (
  method,
  window,
  action = "click",
  options = {}
) {
  const { control, text, pos, background = false } = options;
  const args = ["-type", "mouse", "-action", action];

  args.push("-method", method);
  if (method !== "active" && window) args.push("-window", window);
  if (control) args.push("-control", control);
  if (text) args.push("-text", text);
  if (pos) args.push("-pos", pos);
  args.push("-background", background.toString());

  const result = await runCsharpFeature("sendmessage", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

/**
 * 获取窗口控件树
 * @param {string} method 窗口类型：title/handle/active
 * @param {string} window 窗口标题/句柄
 * @param {object} options 选项
 * @param {string} options.filter 过滤条件
 * @param {boolean} options.background 是否后台操作
 * @returns {object} 控件树
 */
const inspectWindow = async function (method, window, options = {}) {
  const { filter, background = false } = options;
  const args = ["-type", "inspect"];

  args.push("-method", method);
  if (method !== "active" && window) args.push("-window", window);
  if (filter) args.push("-filter", filter);
  args.push("-background", background.toString());

  const result = await runCsharpFeature("sendmessage", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  try {
    return JSON.parse(result);
  } catch (error) {
    console.error("解析控件树失败:", error);
    return null;
  }
};

module.exports = {
  sendKeys,
  sendText,
  click,
  inspectWindow,
};
