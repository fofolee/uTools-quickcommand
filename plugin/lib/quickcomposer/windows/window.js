const { runCsharpFeature } = require("../../csharp");

/**
 * 窗口置顶，只操作第一个找到的窗口
 * @param {string} method 查找方式："title"|"handle"|"process"|"class"|"active"
 * @param {string} value 窗口标题、句柄、进程名、类名
 * @param {Object} result 结果
 * @param {boolean} result.success 是否成功
 * @param {Object} result.window 被置顶的窗口信息
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
  let error;
  try {
    const windowInfo = await runCsharpFeature("window", args);
    if (windowInfo) {
      return {
        success: true,
        window: JSON.parse(windowInfo),
      };
    }
  } catch (err) {
    error = err.toString();
  }
  return { success: false, error };
}

/**
 * 设置窗口透明度，只操作第一个找到的窗口
 * @param {string} method 查找方式："title"|"handle"|"process"|"class"|"active"
 * @param {string} value 窗口标题、句柄、进程名、类名
 * @param {number} opacity 透明度 0-100
 * @param {Object} result 结果
 * @param {boolean} result.success 是否成功
 * @param {Object} result.window 被设置透明度的窗口信息
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
  let error;
  try {
    const windowInfo = await runCsharpFeature("window", args);
    if (windowInfo) {
      return { success: true, window: JSON.parse(windowInfo) };
    }
  } catch (err) {
    error = err.toString();
  }
  return { success: false, error };
}

/**
 * 设置窗口位置和大小，只操作第一个找到的窗口
 * @param {string} method 查找方式："title"|"handle"|"process"|"class"|"active"
 * @param {string} value 窗口标题、句柄、进程名、类名
 * @param {number} x X坐标
 * @param {number} y Y坐标
 * @param {number} width 宽度
 * @param {number} height 高度
 * @param {Object} result 结果
 * @param {boolean} result.success 是否成功
 * @param {Object} result.window 被设置位置和大小的窗口信息
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
  let error;
  try {
    const windowInfo = await runCsharpFeature("window", args);
    if (windowInfo) {
      return { success: true, window: JSON.parse(windowInfo) };
    }
  } catch (err) {
    error = err.toString();
  }
  return { success: false, error };
}

/**
 * 设置窗口状态，只操作第一个找到的窗口
 * @param {string} method 查找方式："title"|"handle"|"process"|"class"|"active"
 * @param {string} value 窗口标题、句柄、进程名、类名
 * @param {string} state 状态："normal"|"maximize"|"minimize"
 * @param {Object} result 结果
 * @param {boolean} result.success 是否成功
 * @param {Object} result.window 被设置状态的窗口信息
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
  let error;
  try {
    const windowInfo = await runCsharpFeature("window", args);
    if (windowInfo) {
      return { success: true, window: JSON.parse(windowInfo) };
    }
  } catch (err) {
    error = err.toString();
  }
  return { success: false, error };
}

/**
 * 关闭窗口，只操作第一个找到的窗口
 * @param {string} method 查找方式："title"|"handle"|"process"|"class"|"active"
 * @param {string} value 窗口标题、句柄、进程名、类名
 * @param {Object} result 结果
 * @param {boolean} result.success 是否成功
 * @param {Object} result.window 被关闭的窗口信息
 */
async function closeWindow(method, value) {
  const args = ["-type", "close", "-method", method, "-window", value];
  let error;
  try {
    const windowInfo = await runCsharpFeature("window", args);
    if (windowInfo) {
      return { success: true, window: JSON.parse(windowInfo) };
    }
  } catch (err) {
    error = err.toString();
  }
  return { success: false, error };
}

/**
 * 设置窗口焦点，只操作第一个找到的窗口
 * @param {string} method 查找方式："title"|"handle"|"process"|"class"|"active"
 * @param {string} value 窗口标题、句柄、进程名、类名
 * @param {Object} result 结果
 * @param {boolean} result.success 是否成功
 * @param {Object} result.window 被设置焦点的窗口信息
 */
async function setFocus(method, value) {
  const args = ["-type", "focus", "-method", method, "-window", value];
  let error;
  try {
    const windowInfo = await runCsharpFeature("window", args);
    if (windowInfo) {
      return { success: true, window: JSON.parse(windowInfo) };
    }
  } catch (err) {
    error = err.toString();
  }
  return { success: false, error };
}

/**
 * 设置窗口边框，只操作第一个找到的窗口
 * @param {string} method 查找方式："title"|"handle"|"process"|"class"|"active"
 * @param {string} value 窗口标题、句柄、进程名、类名
 * @param {boolean} hasBorder 是否显示边框
 * @param {Object} result 结果
 * @param {boolean} result.success 是否成功
 * @param {Object} result.window 被设置边框的窗口信息
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
  let error;
  try {
    const windowInfo = await runCsharpFeature("window", args);
    if (windowInfo) {
      return { success: true, window: JSON.parse(windowInfo) };
    }
  } catch (err) {
    error = err.toString();
  }
  return { success: false, error };
}

/**
 * 设置窗口点击穿透，只操作第一个找到的窗口
 * @param {string} method 查找方式："title"|"handle"|"process"|"class"|"active"
 * @param {string} value 窗口标题、句柄、进程名、类名
 * @param {boolean} isTransparent 是否点击穿透
 * @param {Object} result 结果
 * @param {boolean} result.success 是否成功
 * @param {Object} result.window 被设置点击穿透的窗口信息
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
  let error;
  try {
    const windowInfo = await runCsharpFeature("window", args);
    if (windowInfo) {
      return { success: true, window: JSON.parse(windowInfo) };
    }
  } catch (err) {
    error = err.toString();
  }
  return { success: false, error };
}

/**
 * 获取窗口信息，返回所有匹配的窗口信息
 * @param {string} method 查找方式："title"|"handle"|"process"|"class"|"active"
 * @param {string} value 窗口标题、句柄、进程名、类名
 * @returns {Object} 所有匹配的窗口信息
 */
async function getWindowInfo(method, value) {
  const args = ["-type", "info", "-method", method, "-window", value];
  try {
    const windowInfo = await runCsharpFeature("window", args);
    if (windowInfo) return JSON.parse(windowInfo);
  } catch (err) {
    console.log(err);
  }
  return [];
}

module.exports = {
  setTopMost,
  setOpacity,
  setWindowRect,
  setWindowState,
  closeWindow,
  setFocus,
  setBorder,
  setClickThrough,
  getWindowInfo,
};
