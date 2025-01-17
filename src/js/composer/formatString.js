import { parse } from "@babel/parser";
import {
  stringifyVarInputVal,
  isVarInputVal,
  newVarInputVal,
} from "./varInputValManager";

const processString = (value) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return `"${value}"`;
  }
};

/**
 * 处理单个值，返回格式化后的字符串
 */
const processValue = (value, parentPath = "") => {
  if (!value) return value;

  if (typeof value === "object") {
    return processObject(value, parentPath);
  }
  if (typeof value === "string") {
    return processString(value);
  }

  return value;
};

/**
 * 格式化带缩进的值
 */
const formatWithIndent = (value, indent, isLast = true) => {
  return `${indent}${value}${isLast ? "" : ","}`;
};

/**
 * 递归处理对象的值并格式化成字符串
 */
const processObject = (obj, parentPath = "") => {
  // 移除空值
  obj = removeEmptyValues(obj);

  if (isVarInputVal(obj)) {
    return stringifyVarInputVal(obj);
  }

  const indentLevel = parentPath.split(".").length;
  const indent = "  ".repeat(indentLevel + 1);
  const closingIndent = "  ".repeat(indentLevel);

  // 处理数组
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";

    const items = obj.map((item, index) =>
      formatWithIndent(
        processValue(item, parentPath + "  "),
        indent,
        index === obj.length - 1
      )
    );

    return `[\n${items.join("\n")}\n${closingIndent}]`;
  }

  // 处理对象
  const entries = Object.entries(obj);
  if (entries.length === 0) return "{}";

  const items = entries.map(([key, value], index) =>
    formatWithIndent(
      `"${key}": ${processValue(value, parentPath + "  ")}`,
      indent,
      index === entries.length - 1
    )
  );

  return `{\n${items.join("\n")}\n${closingIndent}}`;
};

/**
 * 递归移除对象中的空值
 */
const removeEmptyValues = (obj) => {
  const isEmptyValue = (value) => {
    const realValue = isVarInputVal(value) ? value.value : value;
    return window.lodashM.isNil(realValue) || realValue === "";
  };

  const processObjectValue = (value) => {
    if (typeof value === "object" && !isVarInputVal(value)) {
      return removeEmptyValues(value);
    }
    return value;
  };

  if (Array.isArray(obj)) {
    return obj.filter((value) => !isEmptyValue(value)).map(processObjectValue);
  }

  return window.lodashM.omitBy(
    obj,
    (value) =>
      isEmptyValue(value) ||
      (typeof value === "object" &&
        !isVarInputVal(value) &&
        window.lodashM.isEmpty(removeEmptyValues(value)))
  );
};

/**
 * 格式化对象为JSON字符串,根据值的类型决定是否添加引号
 * @param {Object} jsonObj 要格式化的对象
 * @returns {string} 格式化后的JSON字符串
 */
const stringifyObject = (jsonObj) => {
  if (isVarInputVal(jsonObj)) {
    return stringifyVarInputVal(jsonObj);
  }
  if (jsonObj instanceof Array) {
    return `[${jsonObj.map((item) => stringifyArgv(item)).join(",")}]`;
  }
  try {
    return processObject(jsonObj);
  } catch (e) {
    console.warn("Failed to stringify object:", e);
    return JSON.stringify(jsonObj, null, 2);
  }
};

/**
 * 格式化参数为字符串
 * @param {Object|string|number|boolean} argv 要格式化的参数
 * @returns {string} 格式化后的字符串
 */
export const stringifyArgv = (argv) => {
  // 普通字符串加上引号
  if (typeof argv === "string") {
    return processString(argv);
  }
  // null类型是Object，需要单独处理，返回原值
  if (argv === null) {
    return null;
  }
  // 对象通过stringifyObject处理
  if (typeof argv === "object") {
    return stringifyObject(argv);
  }
  // 其他类型返回原值
  return argv;
};

/**
 * 解析字符串为variableInput对象
 * @param {string} str 要解析的字符串
 * @returns {Object} 解析后的对象
 */
export const parseToHasType = (str) => {
  if (!str) {
    return newVarInputVal("str", "");
  }
  return str.startsWith('"') && str.endsWith('"')
    ? newVarInputVal("str", str.slice(1, -1))
    : newVarInputVal("var", str);
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
      // 处理数组索引通配符 [*]
      .replace(/\[\*\]/g, "###ARRAYINDEX###")
      // 处理普通的 *
      .replace(/\*/g, "[^/.\\[\\]]+")
      // 转义特殊字符
      .replace(/[.[\]]/g, "\\$&")
      // 还原 ** 为正则表达式
      .replace(/###DOUBLEWILDCARD###/g, ".*")
      // 还原数组索引通配符
      .replace(/###ARRAYINDEX###/g, "\\[\\d+\\]");

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
 * 递归获取完整的成员访问路径
 * @param {Object} node 节点
 * @returns {string} 完整的成员访问路径
 */
const getMemberPath = (node) => {
  if (node.type === "Identifier") {
    return node.name;
  } else if (node.type === "MemberExpression") {
    return `${getMemberPath(node.object)}.${node.property.name}`;
  }
  return "";
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
 * 3. 数组索引：
 *    - arg0[0] - 匹配数组的第一个元素
 *    - arg0[*] - 匹配数组的任意元素
 *    - arg0[*].name - 匹配数组任意元素的name属性
 *    - arg0[*].** - 匹配数组任意元素的所有属性（包括嵌套）
 *
 * 4. 通配符：
 *    - * - 匹配单个层级的任意字符（不包含点号和方括号）
 *    - ** - 匹配任意层级（包含点号）
 *    - [*] - 匹配任意数组索引
 *
 * 5. 排除规则：
 *    - !pattern - 排除匹配的路径
 *    - 排除优先级高于包含
 *
 * 6. 示例：
 *    - arg0 - 匹配第一个参数
 *    - arg*.headers.** - 匹配任意参数中headers下的所有属性
 *    - arg*.data.* - 匹配任意参数中data下的直接子属性
 *    - arg0[*] - 匹配第一个参数的所有数组元素
 *    - arg0[*].name - 匹配第一个参数数组中所有元素的name属性
 *    - !arg*.headers.Content-Type - 排除所有参数中的Content-Type头
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

    // 处理函数名，支持成员方法调用
    let name;
    if (callExpression.callee.type === "MemberExpression") {
      name = getMemberPath(callExpression.callee);
    } else {
      name = callExpression.callee.name;
    }

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
            ? newVarInputVal("str", node.value)
            : node.value;
        // 数字、布尔
        case "NumericLiteral":
        case "BooleanLiteral":
          return shouldUseVariableFormat
            ? newVarInputVal("var", JSON.stringify(node.value))
            : node.value;
        // null
        case "NullLiteral":
          return shouldUseVariableFormat ? newVarInputVal("var", "null") : null;
        case "Identifier":
          // 标识符（变量）总是不带引号的
          return shouldUseVariableFormat
            ? newVarInputVal("var", node.name)
            : node.name;
        case "ObjectExpression":
          return node.properties.reduce((obj, prop) => {
            const key = prop.key.name || prop.key.value;
            const newPath = currentPath ? `${currentPath}.${key}` : key;
            obj[key] = processNode(prop.value, newPath);
            return obj;
          }, {});
        case "ArrayExpression":
          return node.elements.map((element, index) => {
            const elementPath = `${currentPath}[${index}]`;
            const processedElement = processNode(element, elementPath);

            if (
              shouldUseVariableFormat &&
              typeof processedElement === "object"
            ) {
              return Object.entries(processedElement).reduce(
                (acc, [key, value]) => {
                  // 如果值已经是 varInputVal 格式，直接使用
                  if (isVarInputVal(value)) {
                    acc[key] = value;
                  } else {
                    // 否则转换为 varInputVal 格式
                    acc[key] = newVarInputVal(
                      typeof value === "string" ? "str" : "var",
                      typeof value === "string" ? value : JSON.stringify(value)
                    );
                  }
                  return acc;
                },
                {}
              );
            }
            return processedElement;
          });
        case "ObjectProperty":
          return processNode(node.value, currentPath);
        case "MemberExpression":
          // 处理成员表达式
          const memberPath = functionStr.slice(node.start, node.end);
          return shouldUseVariableFormat
            ? newVarInputVal("var", memberPath)
            : getMemberPath(node);
        default:
          console.warn("Unhandled node type:", node.type);
          return null;
      }
    };

    const argvs = callExpression.arguments.map((arg, index) =>
      processNode(arg, `arg${index}`)
    );

    return {
      name,
      argvs,
    };
  } catch (e) {
    console.warn("Failed to parse function:", e);
    return null;
  }
};
