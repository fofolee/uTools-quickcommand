import { parse } from "@babel/parser";

/**
 * 根据值的类型和属性将其转换为字符串
 * 1. 对于带有 __varInputVal__ 属性的对象，根据该属性决定是否添加引号
 * 2. 对于普通字符串，自动添加引号
 * 3. 对于其他类型(数字、布尔等)，直接转换
 * @param {Object|string|number|boolean} argv 要转换的值
 * @returns {string} 转换后的字符串
 */
export const stringifyWithType = (argv) => {
  // 处理带有类型标记的对象
  if (typeof argv === "object" && argv.hasOwnProperty("__varInputVal__")) {
    return argv.isString ? `"${argv.value}"` : argv.value;
  }

  // 处理普通字符串
  if (typeof argv === "string") {
    return `"${argv}"`;
  }

  // 处理其他类型
  return argv;
};

/**
 * 递归移除对象中的空值
 * @param {Object} obj 要处理的对象
 * @returns {Object} 处理后的对象
 */
const removeEmptyValues = (obj) => {
  return window.lodashM.omitBy(obj, (value) => {
    if (
      window.lodashM.isNil(value) ||
      value === "" ||
      (value.isString && value.value === "")
    )
      return true;
    if (typeof value === "object")
      return window.lodashM.isEmpty(removeEmptyValues(value));
    return false;
  });
};

/**
 * 递归处理对象的值并格式化成字符串
 * @param {Object} obj 要处理的对象
 * @param {string} parentPath 父路径(用于缩进)
 * @returns {string} 处理后的字符串
 */
const processObject = (obj, parentPath = "") => {
  // 移除空值
  obj = removeEmptyValues(obj);
  // 如果是 VariableInput 的输出，直接用 stringifyWithType 处理
  if (obj && typeof obj === "object" && obj.hasOwnProperty("__varInputVal__")) {
    return stringifyWithType(obj);
  }

  let result = "{\n";
  const entries = Object.entries(obj);

  entries.forEach(([key, value], index) => {
    let valueStr = "";

    // 处理对象类型
    if (value && typeof value === "object") {
      // 如果是 VariableInput 的输出，直接用 stringifyWithType 处理
      if (value.hasOwnProperty("__varInputVal__")) {
        valueStr = stringifyWithType(value);
      } else {
        valueStr = processObject(value, parentPath + "  ");
      }
    }
    // 处理其他类型
    else {
      valueStr = stringifyWithType(value);
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
 * 格式化对象为JSON字符串,根据值的类型决定是否添加引号
 * @param {Object} jsonObj 要格式化的对象
 * @returns {string} 格式化后的JSON字符串
 */
export const stringifyObject = (jsonObj) => {
  try {
    return processObject(jsonObj);
  } catch (e) {
    console.warn("Failed to stringify object:", e);
    return JSON.stringify(jsonObj, null, 2);
  }
};

/**
 * 解析字符串为variableInput对象
 * @param {string} str 要解析的字符串
 * @returns {Object} 解析后的对象
 */
export const parseToHasType = (str) => {
  if (!str) {
    return {
      value: "",
      isString: true,
      __varInputVal__: true,
    };
  }
  return str.startsWith('"') && str.endsWith('"')
    ? {
        value: str.slice(1, -1),
        isString: true,
        __varInputVal__: true,
      }
    : {
        value: str,
        isString: false,
        __varInputVal__: true,
      };
};

/**
 * 检查路径是否匹配模式
 * @param {string} path 当前路径
 * @param {string[]} patterns 路径模式数组
 * @returns {boolean} 是否匹配
 */
const isPathMatched = (path, patterns) => {
  // 先检查包含模式
  const includedPatterns = patterns.filter((p) => !p.startsWith("!"));
  const excludedPatterns = patterns
    .filter((p) => p.startsWith("!"))
    .map((p) => p.slice(1));

  const matchPattern = (path, pattern) => {
    // 将模式转换为正则表达式
    const regexPattern = pattern
      // 先处理 **，将其转换为特殊标记
      .replace(/\*\*/g, "###DOUBLEWILDCARD###")
      // 处理普通的 *
      .replace(/\*/g, "[^/.]+")
      // 转义特殊字符
      .replace(/[.]/g, "\\$&")
      // 还原 ** 为正则表达式
      .replace(/###DOUBLEWILDCARD###/g, ".*");

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  };

  // 如果有包含模式，必须匹配其中之一
  const includeMatch =
    !includedPatterns.length ||
    includedPatterns.some((p) => matchPattern(path, p));

  // 检查是否被排除
  const excludeMatch = excludedPatterns.some((p) => matchPattern(path, p));

  return includeMatch && !excludeMatch;
};

/**
 * 解析函数调用字符串，返回函数名和参数
 * @param {string} functionStr 要解析的函数字符串
 * @param {Object} options 解析选项
 * @param {string[]} options.variableFormatPaths 需要使用variable格式的路径模式数组
 *
 * 路径匹配规则说明：
 * 1. 参数位置：
 *    - arg0, arg1, arg2... - 匹配具体位置的参数
 *    - arg* - 匹配任意位置的参数
 *
 * 2. 对象属性：
 *    - arg0.headers - 精确匹配headers属性
 *    - arg1.data.* - 匹配data下的所有直接子属性
 *    - arg2.params.** - 匹配params下的所有属性（包括嵌套）
 *
 * 3. 通配符：
 *    - * - 匹配单个层级的任意字符（不包含点号）
 *    - ** - 匹配任意层级（包含点号）
 *
 * 4. 排除规则：
 *    - !pattern - 排除匹配的路径
 *    - 排除优先级高于包含
 *
 * 5. 示例：
 *    - arg0 - 匹配第一个参数
 *    - arg*.headers.** - 匹配任意参数中headers下的所有属性
 *    - arg*.data.* - 匹配任意参数中data下的直接子属性
 *    - !arg*.headers.Content-Type - 排除所有参数中的Content-Type头
 *    - arg*.headers.Accept* - 匹配所有以Accept开头的头部
 *
 * 6. 使用建议：
 *    - 优先使用精确匹配（arg0, arg1.data）
 *    - 使用通配符时注意层级（* vs **）
 *    - 合理使用排除规则避免过度匹配
 *
 * @returns {Object} 解析结果，包含函数名和参数数组
 */
export const parseFunction = (functionStr, options = {}) => {
  try {
    const ast = parse(functionStr, {
      sourceType: "module",
      plugins: ["jsx"],
    });

    const callExpression = ast.program.body[0].expression;
    if (callExpression.type !== "CallExpression") {
      throw new Error("Not a valid function call");
    }

    const functionName = callExpression.callee.name;

    // 递归处理AST节点
    const processNode = (node, currentPath = "") => {
      if (!node) return null;

      const shouldUseVariableFormat =
        currentPath &&
        options.variableFormatPaths?.length > 0 &&
        isPathMatched(currentPath, options.variableFormatPaths);

      switch (node.type) {
        case "StringLiteral":
          // 字符串字面量总是带引号的
          return shouldUseVariableFormat
            ? { value: node.value, isString: true, __varInputVal__: true }
            : node.value;
        case "NumericLiteral":
          return node.value;
        case "BooleanLiteral":
          return node.value;
        case "NullLiteral":
          return null;
        case "Identifier":
          // 标识符（变量）总是不带引号的
          return shouldUseVariableFormat
            ? { value: node.name, isString: false, __varInputVal__: true }
            : node.name;
        case "ObjectExpression":
          return node.properties.reduce((obj, prop) => {
            const key = prop.key.name || prop.key.value;
            const newPath = currentPath ? `${currentPath}.${key}` : key;
            obj[key] = processNode(prop.value, newPath);
            return obj;
          }, {});
        case "ArrayExpression":
          return node.elements.map((element, index) =>
            processNode(element, `${currentPath}[${index}]`)
          );
        case "ObjectProperty":
          return processNode(node.value, currentPath);
        default:
          console.warn("Unhandled node type:", node.type);
          return null;
      }
    };

    const args = callExpression.arguments.map((arg, index) =>
      processNode(arg, `arg${index}`)
    );

    return {
      functionName,
      args,
    };
  } catch (e) {
    console.warn("Failed to parse function:", e);
    return null;
  }
};
