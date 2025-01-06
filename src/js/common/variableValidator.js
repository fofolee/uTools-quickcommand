// JavaScript 关键字和保留字列表
const reservedWords = [
  // ES6+ JavaScript 语言关键字
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "new",
  "return",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
  "let",
  "static",
  "await",
  "enum",

  // 严格模式下的额外保留字
  "implements",
  "interface",
  "package",
  "private",
  "protected",
  "public",

  // 历史遗留的保留字（可能在未来版本中使用）
  "abstract",
  "boolean",
  "byte",
  "char",
  "double",
  "final",
  "float",
  "goto",
  "int",
  "long",
  "native",
  "short",
  "synchronized",
  "throws",
  "transient",
  "volatile",

  // JavaScript 内置的特殊值
  "null",
  "true",
  "false",
  "undefined",
  "NaN",
  "Infinity",

  // 常用的全局对象和构造函数
  "Array",
  "Boolean",
  "Date",
  "Error",
  "Function",
  "JSON",
  "Math",
  "Number",
  "Object",
  "RegExp",
  "String",
  "Promise",
  "Proxy",
  "Map",
  "Set",
  "Symbol",
  "BigInt",

  // 浏览器和 Node.js 环境的全局对象
  "window",
  "document",
  "console",
  "global",
  "process",
  "globalThis",

  // 特殊的内置标识符
  "arguments",
  "eval",
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "toLocaleString",
  "toString",
  "valueOf",
];

/**
 * 检查变量名是否合法
 * @param {string} name - 要检查的变量名
 * @returns {object} - 包含验证结果和错误信息的对象
 */
export function validateVariableName(name) {
  // 去除空格
  name = name.trim();

  // 检查是否为空
  if (!name) {
    return {
      isValid: false,
      error: "变量名不能为空",
    };
  }

  // 检查是否是保留字
  if (reservedWords.includes(name)) {
    return {
      isValid: false,
      error: `"${name}" 是 JavaScript 保留字，不能用作变量名`,
    };
  }

  // 检查变量名格式是否合法
  const validNameRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
  if (!validNameRegex.test(name)) {
    return {
      isValid: false,
      error:
        "变量名必须以字母、下划线或 $ 开头，只能包含字母、数字、下划线和 $",
    };
  }

  return {
    isValid: true,
    error: null,
  };
}
