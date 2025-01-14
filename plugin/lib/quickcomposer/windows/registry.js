const { runCsharpFeature } = require("../../csharp");

/**
 * 获取注册表值
 * @param {string} path 注册表路径
 * @param {string} name 值名称
 * @returns {object} 注册表值
 */
const getValue = async function (path, name = "") {
  const args = ["-type", "get", "-path", path];
  if (name) {
    args.push("-name", name);
  }
  const result = await runCsharpFeature("registry", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  try {
    return JSON.parse(result);
  } catch (error) {
    console.error("解析注册表值失败:", error);
    return null;
  }
};

/**
 * 设置注册表值
 * @param {string} path 注册表路径
 * @param {string} name 值名称
 * @param {string} value 值
 * @param {string} valueType 值类型
 * @returns {boolean} 是否成功
 */
const setValue = async function (path, name, value, valueType = "string") {
  const args = [
    "-type",
    "set",
    "-path",
    path,
    "-name",
    name,
    "-value",
    value,
    "-valuetype",
    valueType,
  ];
  const result = await runCsharpFeature("registry", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

/**
 * 删除注册表值
 * @param {string} path 注册表路径
 * @param {string} name 值名称
 * @returns {boolean} 是否成功
 */
const deleteValue = async function (path, name = "") {
  const args = ["-type", "delete", "-path", path];
  if (name) {
    args.push("-name", name);
  }
  const result = await runCsharpFeature("registry", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

/**
 * 列出注册表项
 * @param {string} path 注册表路径
 * @returns {Array} 注册表项列表
 */
const listKeys = async function (path) {
  const args = ["-type", "list", "-path", path];
  const result = await runCsharpFeature("registry", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  try {
    return JSON.parse(result);
  } catch (error) {
    console.error("解析注册表项列表失败:", error);
    return null;
  }
};

module.exports = {
  getValue,
  setValue,
  deleteValue,
  listKeys,
};
