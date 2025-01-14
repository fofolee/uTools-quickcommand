const { runCsharpFeature } = require("../../csharp");

/**
 * 窗口置顶
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @param {boolean} isTopMost 是否置顶
 */
async function setTopMost(method, value, isTopMost) {
  const args = [
    "-type",
    "topmost",
    "-method",
    method,
    "-window",
    value,
    "-value",
    isTopMost.toString(),
  ];
  await runCsharpFeature("window", args);
}

/**
 * 设置窗口透明度
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @param {number} opacity 透明度 0-100
 */
async function setOpacity(method, value, opacity) {
  const args = [
    "-type",
    "opacity",
    "-method",
    method,
    "-window",
    value,
    "-value",
    opacity.toString(),
  ];
  await runCsharpFeature("window", args);
}

/**
 * 设置窗口位置和大小
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @param {number} x X坐标
 * @param {number} y Y坐标
 * @param {number} width 宽度
 * @param {number} height 高度
 */
async function setWindowRect(method, value, x, y, width, height) {
  const args = [
    "-type",
    "rect",
    "-method",
    method,
    "-window",
    value,
    "-value",
    `${x},${y},${width},${height}`,
  ];
  await runCsharpFeature("window", args);
}

/**
 * 设置窗口状态
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @param {string} state 状态：normal/maximize/minimize
 */
async function setWindowState(method, value, state) {
  const args = [
    "-type",
    "state",
    "-method",
    method,
    "-window",
    value,
    "-value",
    state,
  ];
  await runCsharpFeature("window", args);
}

/**
 * 关闭窗口
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 */
async function closeWindow(method, value) {
  const args = ["-type", "close", "-method", method, "-window", value];
  await runCsharpFeature("window", args);
}

/**
 * 设置窗口焦点
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 */
async function setFocus(method, value) {
  const args = ["-type", "focus", "-method", method, "-window", value];
  await runCsharpFeature("window", args);
}

/**
 * 设置窗口边框
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @param {boolean} hasBorder 是否显示边框
 */
async function setBorder(method, value, hasBorder) {
  const args = [
    "-type",
    "border",
    "-method",
    method,
    "-window",
    value,
    "-value",
    hasBorder.toString(),
  ];
  await runCsharpFeature("window", args);
}

/**
 * 设置窗口点击穿透
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @param {boolean} isTransparent 是否点击穿透
 */
async function setClickThrough(method, value, isTransparent) {
  const args = [
    "-type",
    "clickthrough",
    "-method",
    method,
    "-window",
    value,
    "-value",
    isTransparent.toString(),
  ];
  await runCsharpFeature("window", args);
}

/**
 * 获取窗口信息
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @returns {Object} 窗口信息
 */
async function getWindowInfo(method, value) {
  const args = ["-type", "info", "-method", method, "-window", value];
  const result = await runCsharpFeature("window", args);
  try {
    return JSON.parse(result);
  } catch (error) {
    return {};
  }
}

/**
 * 设置窗口可见性
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @param {boolean} visible 是否可见
 */
async function setVisible(method, value, visible) {
  const args = [
    "-type",
    "visible",
    "-method",
    method,
    "-window",
    value,
    "-value",
    visible.toString(),
  ];
  await runCsharpFeature("window", args);
}

module.exports = {
  setTopMost,
  setOpacity,
  setWindowRect,
  setWindowState,
  setVisible,
  closeWindow,
  setFocus,
  setBorder,
  setClickThrough,
  getWindowInfo,
};
