const { runCsharpFeature } = require("../../csharp");

/**
 * 执行消息发送操作
 * @param {string} type - 操作类型, 可选值: "keyboard"|"mouse"|"inspect"
 * @param {Object} params - 参数对象
 * @param {string} params.method - 查找方式："title"|"handle"|"process"|"class"|"active"
 * @param {string} params.window - 窗口标题、句柄、进程名、类名
 * @param {string} params.action - 动作类型，如 "keys"、"text"、"click" 等
 * @param {string} params.value - 操作的值，如按键、文本等
 * @param {Object} params.options - 附加选项
 * @returns {Promise<Object>} - 操作结果
 */
async function runSendMessage(type, params = {}) {
  const args = ["-type", type];
  const { method = "active", window, action, value, options = {} } = params;
  const { control, text, pos, filter, background = false } = options;

  // 通用参数
  args.push("-method", method);
  if (method !== "active" && window) {
    args.push("-window", window);
  }

  // 特定命令的参数处理
  switch (type) {
    case "keyboard":
      args.push("-action", action);
      if (value) {
        args.push("-value", value);
      }
      if (control) {
        args.push("-control", control);
      }
      break;

    case "mouse":
      args.push("-action", action);
      if (control) {
        args.push("-control", control);
      }
      if (text) {
        args.push("-text", text);
      }
      if (pos) {
        args.push("-pos", pos);
      }
      break;

    case "inspect":
      if (filter) {
        args.push("-filter", filter);
      }
      break;
  }

  // 后台操作参数
  args.push("-background", background.toString());

  let error;
  try {
    const result = await runCsharpFeature("sendmessage", args);
    if (result) {
      const jsonResult = JSON.parse(result);
      if (type === "inspect") {
        return jsonResult;
      }
      return { success: true, control: jsonResult };
    }
  } catch (err) {
    error = err
      .toString()
      .replace(/^Error: /, "")
      .trim();
  }

  if (type === "inspect") return [];
  return { success: false, error };
}

module.exports = {
  sendKeys: (method, window, keys, options = {}) =>
    runSendMessage("keyboard", {
      method,
      window,
      action: "keys",
      value: keys,
      options,
    }),

  sendText: (method, window, text, options = {}) =>
    runSendMessage("keyboard", {
      method,
      window,
      action: "text",
      value: text,
      options,
    }),

  click: (method, window, action = "click", options = {}) =>
    runSendMessage("mouse", {
      method,
      window,
      action,
      options,
    }),

  inspectWindow: (method, window, options = {}) =>
    runSendMessage("inspect", {
      method,
      window,
      options,
    }),
};
