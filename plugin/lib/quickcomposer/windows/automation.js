const { runCsharpFeature } = require("../../csharp");

/**
 * 列出所有元素
 * @param {string} method 窗口类型：title/handle/active
 * @param {string} window 窗口标题/句柄
 * @param {object} options 选项
 * @param {string} options.filter 过滤条件
 * @param {boolean} options.background 是否后台操作
 * @returns {object[]} 元素列表
 */
const listElements = async function (method, window, options = {}) {
  const { filter, scope } = options;
  const args = ["-type", "list"];

  args.push("-method", method);
  if (method !== "active" && window) args.push("-window", window);
  if (filter) args.push("-filter", filter);
  if (scope) args.push("-scope", scope);
  const result = await runCsharpFeature("automation", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  try {
    return JSON.parse(result);
  } catch (error) {
    console.error("解析元素列表失败:", error);
    return null;
  }
};

/**
 * 点击元素
 * @param {string} method 窗口类型：title/handle/active
 * @param {string} window 窗口标题/句柄
 * @param {string} by 查找方式：name/class/type/automationid
 * @param {string} value 查找值
 * @param {object} options 选项
 * @param {string} options.pattern 点击模式：invoke/toggle
 * @param {boolean} options.background 是否后台操作
 * @returns {boolean} 是否成功
 */
const clickElement = async function (method, window, by, value, options = {}) {
  const { pattern = "invoke", background = false } = options;
  const args = ["-type", "click", "-by", by, "-value", value];

  args.push("-method", method);
  if (method !== "active" && window) args.push("-window", window);
  if (pattern) args.push("-pattern", pattern);
  if (background) args.push("-background");

  const result = await runCsharpFeature("automation", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

/**
 * 设置元素值
 * @param {string} method 窗口类型：title/handle/active
 * @param {string} window 窗口标题/句柄
 * @param {string} by 查找方式：name/class/type/automationid
 * @param {string} value 查找值
 * @param {string} newValue 要设置的值
 * @param {object} options 选项
 * @param {boolean} options.background 是否后台操作
 * @returns {boolean} 是否成功
 */
const setElementValue = async function (
  method,
  window,
  by,
  value,
  newValue,
  options = {}
) {
  const { background = false } = options;
  const args = [
    "-type",
    "setvalue",
    "-by",
    by,
    "-value",
    value,
    "-newvalue",
    newValue,
  ];

  args.push("-method", method);
  if (method !== "active" && window) args.push("-window", window);
  if (background) args.push("-background");

  const result = await runCsharpFeature("automation", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

/**
 * 获取元素值
 * @param {string} method 窗口类型：title/handle/active
 * @param {string} window 窗口标题/句柄
 * @param {string} by 查找方式：name/class/type/automationid
 * @param {string} value 查找值
 * @param {object} options 选项
 * @param {boolean} options.background 是否后台操作
 * @returns {object} 元素值
 */
const getElementValue = async function (
  method,
  window,
  by,
  value,
  options = {}
) {
  const { background = false } = options;
  const args = ["-type", "getvalue", "-by", by, "-value", value];

  args.push("-method", method);
  if (method !== "active" && window) args.push("-window", window);
  if (background) args.push("-background");

  const result = await runCsharpFeature("automation", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  try {
    return JSON.parse(result);
  } catch (error) {
    console.error("解析元素值失败:", error);
    return null;
  }
};

/**
 * 检查元素
 * @param {object} options 选项
 * @param {number} options.timeout 超时时间(秒)
 * @param {boolean} options.background 是否后台操作
 * @returns {object} 元素信息
 */
const inspectElement = async function () {
  const args = ["-type", "inspect"];

  const result = await runCsharpFeature("automation", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  try {
    return JSON.parse(result);
  } catch (error) {
    console.error("解析元素信息失败:", error);
    return null;
  }
};

module.exports = {
  listElements,
  clickElement,
  setElementValue,
  getElementValue,
  inspectElement,
};
