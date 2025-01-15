const { runCsharpFeature } = require("../../csharp");

/**
 * 键盘操作
 * @param {string} method 窗口类型："title"|"handle"|"process"|"class"|"active"
 * @param {string} window 窗口标题、句柄、进程名、类名
 * @param {string} keys 键盘按键
 * @param {object} options 选项
 * @param {string} options.control 控件类名
 * @param {boolean} options.background 是否后台操作
 * @returns {Object} 操作结果
 * @property {boolean} success 是否成功
 * @property {Object} control 控件信息
 * @property {string} control.window 控件所在窗口的信息
 */
const sendKeys = async function (method, window, keys, options = {}) {
  const { control, background = false } = options;
  const args = ["-type", "keyboard", "-action", "keys", "-value", keys];
  args.push("-method", method);
  if (method !== "active" && window) args.push("-window", window);
  if (control) args.push("-control", control);
  args.push("-background", background.toString());
  let error;
  try {
    const result = await runCsharpFeature("sendmessage", args);
    if (result) {
      return {
        success: true,
        control: JSON.parse(result),
      };
    }
  } catch (err) {
    error = err.toString();
  }
  return { success: false, error };
};

/**
 * 发送文本
 * @param {string} method 窗口类型："title"|"handle"|"process"|"class"|"active"
 * @param {string} window 窗口标题、句柄、进程名、类名
 * @param {string} text 文本
 * @param {object} options 选项
 * @param {string} options.control 控件类名
 * @param {boolean} options.background 是否后台操作
 * @returns {Object} 操作结果
 * @property {boolean} success 是否成功
 * @property {Object} control 控件信息
 * @property {string} control.window 控件所在窗口的信息
 */
const sendText = async function (method, window, text, options = {}) {
  const { control, background = false } = options;
  const args = ["-type", "keyboard", "-action", "text", "-value", text];

  args.push("-method", method);
  if (method !== "active" && window) args.push("-window", window);
  if (control) args.push("-control", control);
  args.push("-background", background.toString());
  let error;
  try {
    const result = await runCsharpFeature("sendmessage", args);
    if (result) {
      return { success: true, control: JSON.parse(result) };
    }
  } catch (err) {
    error = err.toString();
  }
  return { success: false, error };
};

/**
 * 鼠标点击
 * @param {string} method 窗口类型："title"|"handle"|"process"|"class"|"active"
 * @param {string} window 窗口标题、句柄、进程名、类名
 * @param {string} action 动作："click"|"doubleClick"|"rightClick"
 * @param {object} options 选项
 * @param {string} options.control 控件类名
 * @param {string} options.text 控件文本
 * @param {string} options.pos 点击位置：x,y
 * @param {boolean} options.background 是否后台操作
 * @returns {Object} 操作结果
 * @property {boolean} success 是否成功
 * @property {Object} control 控件信息
 * @property {string} control.window 控件所在窗口的信息
 */
const click = async function (method, window, action = "click", options = {}) {
  const { control, text, pos, background = false } = options;
  const args = ["-type", "mouse", "-action", action];

  args.push("-method", method);
  if (method !== "active" && window) args.push("-window", window);
  if (control) args.push("-control", control);
  if (text) args.push("-text", text);
  if (pos) args.push("-pos", pos);
  args.push("-background", background.toString());

  let error;
  try {
    const result = await runCsharpFeature("sendmessage", args);
    if (result) {
      return { success: true, control: JSON.parse(result) };
    }
  } catch (err) {
    error = err.toString();
  }
  return { success: false, error };
};

/**
 * 获取窗口控件树
 * @param {string} method 窗口类型："title"|"handle"|"process"|"class"|"active"
 * @param {string} window 窗口标题、句柄、进程名、类名
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
  try {
    const result = await runCsharpFeature("sendmessage", args);
    if (result) return JSON.parse(result);
  } catch (error) {
    console.log(error);
  }
  return [];
};

module.exports = {
  sendKeys,
  sendText,
  click,
  inspectWindow,
};
