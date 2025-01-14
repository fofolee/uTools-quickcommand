const { runCsharpFeature } = require("../../csharp");

/**
 * 列出进程
 * @returns {Array} 进程列表
 */
const listProcesses = async function () {
  const args = ["-type", "list"];
  const result = await runCsharpFeature("process", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  try {
    return JSON.parse(result);
  } catch (error) {
    console.error("解析进程列表失败:", error);
    return null;
  }
};

/**
 * 终止进程
 * @param {string} target 进程ID或名称
 * @returns {boolean} 是否成功
 */
const killProcess = async function (target) {
  const args = ["-type", "kill", "-target", target];
  const result = await runCsharpFeature("process", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

/**
 * 启动进程
 * @param {string} path 程序路径
 * @param {string} arguments 启动参数
 * @returns {boolean} 是否成功
 */
const startProcess = async function (path, arguments = "") {
  const args = ["-type", "start", "-path", path];
  if (arguments) {
    args.push("-args", arguments);
  }
  const result = await runCsharpFeature("process", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

module.exports = {
  listProcesses,
  killProcess,
  startProcess,
};
