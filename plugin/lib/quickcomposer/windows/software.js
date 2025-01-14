const { runCsharpFeature } = require("../../csharp");

/**
 * 列出已安装软件
 * @returns {Array} 软件列表
 */
const listSoftware = async function () {
  const args = ["-type", "list"];
  const result = await runCsharpFeature("software", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  try {
    return JSON.parse(result);
  } catch (error) {
    console.error("解析软件列表失败:", error);
    return null;
  }
};

/**
 * 卸载软件
 * @param {string} target 软件ID
 * @returns {boolean} 是否成功
 */
const uninstallSoftware = async function (target) {
  const args = ["-type", "uninstall", "-target", target];
  const result = await runCsharpFeature("software", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

module.exports = {
  listSoftware,
  uninstallSoftware,
};
