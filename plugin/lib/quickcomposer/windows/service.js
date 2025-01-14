const { runCsharpFeature } = require("../../csharp");

/**
 * 列出服务
 * @returns {Array} 服务列表
 */
const listServices = async function () {
  const args = ["-type", "list"];
  const result = await runCsharpFeature("service", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  try {
    return JSON.parse(result);
  } catch (error) {
    console.error("解析服务列表失败:", error);
    return null;
  }
};

/**
 * 控制服务
 * @param {string} name 服务名称
 * @param {string} operation 操作类型：start/stop/pause/continue
 * @returns {boolean} 是否成功
 */
const controlService = async function (name, operation) {
  const args = ["-type", operation, "-name", name];
  const result = await runCsharpFeature("service", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

module.exports = {
  listServices,
  controlService,
};
