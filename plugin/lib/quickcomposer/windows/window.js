const { runCsharpFeature } = require("../../csharp");

/**
 * 执行窗口操作
 * @param {string} type - 操作类型, 可选值: "topmost"|"opacity"|"rect"|"state"|"close"|"focus"|"border"|"clickthrough"|"info"
 * @param {Object} params - 参数对象
 * @param {string} params.method - 查找方式："title"|"handle"|"process"|"class"|"active"
 * @param {string} params.window - 窗口标题、句柄、进程名、类名
 * @param {*} params.value - 操作的值，不同操作类型对应不同的值类型
 * @returns {Promise<Object>} - 操作结果
 */
async function runWindow(type, params = {}) {
  const args = ["-type", type];
  const { method = "active", window, value } = params;

  // 通用参数
  args.push("-method", method);
  if (window) {
    args.push("-window", window);
  }

  // 特定命令的参数处理
  switch (type) {
    case "topmost":
    case "border":
    case "clickthrough":
      if (value !== undefined) {
        args.push("-value", value.toString());
      }
      break;

    case "opacity":
      if (value !== undefined) {
        args.push("-value", value.toString());
      }
      break;

    case "rect":
      if (value && typeof value === "object") {
        const { x = 0, y = 0, width = 0, height = 0 } = value;
        args.push("-value", `${x},${y},${width},${height}`);
      }
      break;

    case "state":
      if (value) {
        args.push("-value", value);
      }
      break;
  }

  let error;
  try {
    const result = await runCsharpFeature("window", args);
    if (result) {
      const jsonResult = JSON.parse(result);
      if (type === "info") {
        return jsonResult;
      }
      return { success: true, window: jsonResult };
    }
  } catch (err) {
    error = err
      .toString()
      .replace(/^Error: /, "")
      .trim();
    console.log(error);
  }

  if (type === "info") return [];
  return { success: false, error };
}

module.exports = {
  setTopMost: (method, window, isTopMost) =>
    runWindow("topmost", { method, window, value: isTopMost }),

  setOpacity: (method, window, opacity) =>
    runWindow("opacity", { method, window, value: opacity }),

  setWindowRect: (method, window, x, y, width, height) =>
    runWindow("rect", { method, window, value: { x, y, width, height } }),

  setWindowState: (method, window, state) =>
    runWindow("state", { method, window, value: state }),

  closeWindow: (method, window) => runWindow("close", { method, window }),

  setFocus: (method, window) => runWindow("focus", { method, window }),

  setBorder: (method, window, hasBorder) =>
    runWindow("border", { method, window, value: hasBorder }),

  setClickThrough: (method, window, isTransparent) =>
    runWindow("clickthrough", { method, window, value: isTransparent }),

  getWindowInfo: (method, window) => runWindow("info", { method, window }),
};
