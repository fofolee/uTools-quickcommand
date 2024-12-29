/**
 * 处理来自VariableInput的值
 * @param {string} value JSON.stringify后的值
 * @returns {string} 处理后的值（包含外层引号）
 */
const processVariableValue = (value) => {
  // 处理字符串模式：\"xxx\" -> "xxx"
  if (value.startsWith('"\\"') && value.endsWith('\\""')) {
    return `"${value.slice(3, -3)}"`;
  }
  // 处理非字符串模式：直接去掉外层引号
  return value.slice(1, -1);
};

/**
 * 检查路径是否匹配或是目标路径的父路径
 * @param {string} currentPath 当前路径
 * @param {string[]} targetPaths 目标路径列表
 * @returns {boolean} 是否匹配
 */
const isPathMatched = (currentPath, targetPaths) => {
  if (!targetPaths) return false;
  return targetPaths.some(
    (path) =>
      path === currentPath || // 精确匹配
      path.startsWith(currentPath + ".") // 是父路径
  );
};

/**
 * 递归移除对象中的空值
 * @param {Object} obj 要处理的对象
 * @returns {Object} 处理后的对象
 */
const removeEmptyValues = (obj) => {
  return _.omitBy(obj, (value) => {
    if (_.isNil(value) || value === "") return true;
    if (typeof value === "object")
      return _.isEmpty(removeEmptyValues(value));
    return false;
  });
};

/**
 * 递归处理对象的值
 * @param {Object} obj 要处理的对象
 * @param {string} parentPath 父路径
 * @param {string[]|null} variableFields 需要处理的字段列表，null表示处理所有字段
 * @param {string[]|null} excludeFields 需要排除的字段列表，即使匹配了处理条件也不处理
 * @returns {string} 处理后的字符串
 */
const processObject = (obj, parentPath = "", variableFields, excludeFields) => {
  // 移除空值
  obj = removeEmptyValues(obj);
  let result = "{\n";
  const entries = Object.entries(obj);

  entries.forEach(([key, value], index) => {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    let valueStr = "";

    // 检查是否需要处理当前字段
    const isIncluded =
      !variableFields || isPathMatched(currentPath, variableFields);
    const isExcluded =
      excludeFields && isPathMatched(currentPath, excludeFields);
    const shouldProcess = isIncluded && !isExcluded;

    // 处理对象类型
    if (typeof value === "object" && value !== null) {
      valueStr = processObject(
        value,
        currentPath,
        variableFields,
        excludeFields
      );
    }
    // 处理字符串类型
    else if (typeof value === "string") {
      if (shouldProcess) {
        valueStr = processVariableValue(JSON.stringify(value));
      } else {
        valueStr = JSON.stringify(value);
      }
    }
    // 其他类型直接 stringify
    else {
      valueStr = JSON.stringify(value);
    }

    // 添加缩进
    const indent = "  ".repeat(parentPath.split(".").length + 1);
    result += `${indent}"${key}": ${valueStr}`;
    if (index < entries.length - 1) result += ",";
    result += "\n";
  });

  // 闭合括号的缩进
  const closingIndent = "  ".repeat(parentPath.split(".").length);
  result += `${closingIndent}}`;
  return result;
};

/**
 * 处理JSON字符串中的值
 * 只处理来自VariableInput的字段，支持完整字段处理和指定路径处理
 * 1. 完整字段处理：如 headers - 处理整个对象及其所有子字段
 * 2. 指定路径处理：如 data.headers.Referer - 只处理特定路径
 * 3. 不传递 variableFields 则处理所有字段
 * 4. 可以通过 excludeFields 排除特定字段，即使匹配了处理条件也不处理
 * @param {string} jsonStr JSON字符串
 * @param {string[]|null} [variableFields] 需要处理的字段列表，包括完整字段和指定路径。不传则处理所有字段
 * @param {string[]|null} [excludeFields] 需要排除的字段列表，即使匹配了处理条件也不处理
 * @returns {string} 处理后的字符串
 */
export const formatJsonVariables = (
  jsonObj,
  variableFields = null,
  excludeFields = null
) => {
  try {
    return processObject(jsonObj, "", variableFields, excludeFields);
  } catch (e) {
    console.warn("Failed to process JSON variables:", e);
    return JSON.stringify(jsonObj, null, 2);
  }
};
