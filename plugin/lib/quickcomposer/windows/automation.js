const { runCsharpFeature } = require("../../csharp");

/**
 * 执行自动化操作
 * @param {string} type - 操作类型, 可选值: "inspect"|"click"|"setvalue"|"getvalue"|"select"|"expand"|"scroll"|"wait"|"focus"|"highlight"
 * @param {Object} params - 参数对象
 * @param {string} params.by - 查找方式："xpath"|"id"|"name"|"condition"
 * @param {string} params.searchValue - 搜索值
 * @param {string} params.window - 窗口标题、句柄、进程名、类名
 * @param {Object} params.options - 附加选项
 * @returns {Promise<Object>} - 操作结果
 */
async function runAutomation(
  type,
  window = "",
  by = "xpath",
  searchValue = "",
  params = {}
) {
  const args = [];

  if (window) {
    args.push("-method", "handle", "-window", window);
  } else {
    args.push("-method", "active");
  }

  args.push("-type", type);

  // 通用参数处理
  if (type !== "inspect") {
    switch (by) {
      case "xpath":
        args.push("-xpath", searchValue);
        break;
      case "id":
        args.push("-id", searchValue);
        break;
      case "name":
        args.push("-name", searchValue);
        break;
      case "condition":
        args.push("-condition", searchValue);
        break;
    }
  }

  // 特定命令的参数处理
  switch (type) {
    case "inspect":
      if (params.usePosition) {
        args.push("-position");
        if (params.x && params.y) {
          args.push(`${params.x},${params.y}`);
        }
      }
      break;

    case "setvalue":
      if (params.newValue !== undefined) {
        args.push("-value", params.newValue);
      }
      if (params.sendenter) {
        args.push("-sendenter");
      }
      break;

    case "select":
      if (params.item !== undefined) {
        args.push("-item", params.item);
      }
      break;

    case "expand":
      if (params.expand !== undefined) {
        args.push("-expand", params.expand);
      }
      break;

    case "scroll":
      if (params.direction !== undefined) {
        args.push("-direction", params.direction);
      }
      if (params.amount !== undefined) {
        args.push("-amount", params.amount);
      }
      break;

    case "wait":
      if (params.timeout !== undefined) {
        args.push("-timeout", params.timeout);
      }
      break;

    case "highlight":
      if (params.duration !== undefined) {
        args.push("-duration", params.duration);
      }
      break;

    case "sendkeys":
      if (params.keys !== undefined) {
        args.push("-keys", params.keys);
      }
      break;

    case "enable":
      if (params.enable !== undefined) {
        args.push("-enable", params.enable);
      }
      break;
  }

  let error;
  try {
    const result = await runCsharpFeature("automation", args);
    if (result) {
      const resultStr = result.toString().trim();
      if (type === "inspect") return JSON.parse(resultStr);
      if (resultStr === "true") return { success: true };
      try {
        return { success: true, data: JSON.parse(resultStr) };
      } catch (err) {
        return { success: true, data: resultStr };
      }
    }
  } catch (err) {
    error = err
      .toString()
      .replace(/^Error: /, "")
      .trim();
  }

  if (type === "inspect") return { error };
  return { success: false, error };
}

module.exports = {
  inspect: () => runAutomation("inspect"),
  inspectPosition: (position) =>
    runAutomation("inspect", null, null, null, {
      ...position,
      usePosition: true,
    }),
  click: (...args) => runAutomation("click", ...args),
  setvalue: (...args) => runAutomation("setvalue", ...args),
  getvalue: (...args) => runAutomation("getvalue", ...args),
  select: (...args) => runAutomation("select", ...args),
  expand: (...args) => runAutomation("expand", ...args),
  scroll: (...args) => runAutomation("scroll", ...args),
  wait: (...args) => runAutomation("wait", ...args),
  focus: (...args) => runAutomation("focus", ...args),
  highlight: (...args) => runAutomation("highlight", ...args),
  sendkeys: (...args) => runAutomation("sendkeys", ...args),
  enable: (...args) => runAutomation("enable", ...args),
};
