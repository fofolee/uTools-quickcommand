const { runCsharpFeature } = require("../../csharp");

/**
 * 列出所有元素
 * @param {string} method 窗口类型："title"|"handle"|"process"|"class"|"active"
 * @param {string} window 窗口标题、句柄、进程名、类名
 * @param {object} options 选项
 * @param {string} options.filter 过滤条件
 * @returns {object[]} 元素列表
 */
const listElements = async function (method, window, options = {}) {
  const { filter, scope } = options;
  const args = ["-type", "list"];

  args.push("-method", method);
  if (method !== "active" && window) args.push("-window", window);
  if (filter) args.push("-filter", filter);
  if (scope) args.push("-scope", scope);
  try {
    const result = await runCsharpFeature("automation", args);
    console.log(result);
    if (result) return JSON.parse(result);
  } catch (err) {
    console.log(err);
  }
  return [];
};

/**
 * 点击元素
 * @param {string} method 窗口类型："title"|"handle"|"process"|"class"|"active"
 * @param {string} window 窗口标题、句柄、进程名、类名
 * @param {string} by 查找方式："name"|"class"|"type"|"automationid"
 * @param {string} value 查找值
 * @param {object} options 选项
 * @param {string} options.pattern 点击模式："invoke"|"toggle"
 * @param {boolean} options.background 是否后台操作
 * @returns {Object} 操作结果
 * @property {boolean} success 是否成功
 * @property {Object} element 操作的元素信息
 * @property {Object} element.window 操作的元素所在的窗口信息
 */
const clickElement = async function (method, window, by, value, options = {}) {
  const { pattern = "invoke", background = false } = options;
  const args = ["-type", "click", "-by", by, "-value", value];

  args.push("-method", method);
  if (method !== "active" && window) args.push("-window", window);
  if (pattern) args.push("-pattern", pattern);
  if (background) args.push("-background");
  let error;
  try {
    const result = await runCsharpFeature("automation", args);
    if (result) {
      return { success: true, element: JSON.parse(result) };
    }
  } catch (err) {
    error = err.toString();
  }
  return { success: true, error };
};

/**
 * 设置元素值
 * @param {string} method 窗口类型："title"|"handle"|"process"|"class"|"active"
 * @param {string} window 窗口标题、句柄、进程名、类名
 * @param {string} by 查找方式："name"|"class"|"type"|"automationid"
 * @param {string} value 查找值
 * @param {string} newValue 要设置的值
 * @param {object} options 选项
 * @param {boolean} options.background 是否后台操作
 * @returns {Object} 操作结果
 * @property {boolean} success 是否成功
 * @property {Object} element 操作的元素信息
 * @property {Object} element.window 操作的元素所在的窗口信息
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
  let error;
  try {
    const result = await runCsharpFeature("automation", args);
    if (result) return { success: true, element: JSON.parse(result) };
  } catch (err) {
    error = err.toString();
  }
  return { success: false, error };
};

/**
 * 获取元素值
 * @param {string} method 窗口类型："title"|"handle"|"process"|"class"|"active"
 * @param {string} window 窗口标题、句柄、进程名、类名
 * @param {string} by 查找方式："name"|"class"|"type"|"automationid"
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

  let error;
  try {
    const result = await runCsharpFeature("automation", args);
    if (result) return JSON.parse(result);
  } catch (err) {
    error = err.toString();
  }
  return { success: false, error };
};

/**
 * 检查元素
 * @param {object} options 选项
 * @param {number} options.timeout 超时时间(秒)
 * @returns {object} 元素信息
 */
const inspectElement = async function () {
  const args = ["-type", "inspect"];

  try {
    const result = await runCsharpFeature("automation", args);
    if (result) return JSON.parse(result);
  } catch (err) {
    console.log(err);
  }
  return [];
};

module.exports = {
  listElements,
  clickElement,
  setElementValue,
  getElementValue,
  inspectElement,
};
