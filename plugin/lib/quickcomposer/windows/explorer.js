const { runCsharpFeature } = require("../../csharp");

/**
 * 执行资源管理器操作
 * @param {string} type - 操作类型, 可选值: "list"|"navigate"
 * @param {Object} params - 参数对象
 * @returns {Promise<Object[]|boolean>} - 操作结果
 */
async function runExplorer(type, params = {}) {
  const args = ["-type", type];

  // 添加导航相关参数
  if (type === "navigate") {
    if (!params.handle || !params.path) {
      throw new Error("导航操作需要指定窗口句柄和目标路径");
    }
    args.push("-handle", params.handle.toString());
    args.push("-path", params.path);
  }

  try {
    const result = await runCsharpFeature("explorer", args);
    if (result) {
      if (result.trim() === "true") return true;
      return JSON.parse(result);
    }
  } catch (err) {
    console.error(err);
    return type === "list" ? [] : false;
  }

  return type === "list" ? [] : false;
}

module.exports = {
  /**
   * 获取所有打开的资源管理器窗口信息
   * @returns {Promise<Array>} 资源管理器窗口信息数组
   */
  list: () => runExplorer("list"),

  /**
   * 导航到指定路径
   * @param {number} handle - 窗口句柄
   * @param {string} path - 目标路径
   * @returns {Promise<boolean>} 是否成功
   */
  navigate: (handle, path) => runExplorer("navigate", { handle, path }),
};
