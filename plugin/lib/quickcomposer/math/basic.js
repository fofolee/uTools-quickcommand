/**
 * 基本算术运算
 * @param {string} expression 算术表达式
 * @returns {number} 计算结果
 */
function evaluate(expression) {
  // 移除所有空白字符
  expression = expression.toString().replace(/\s+/g, "");

  // 检查表达式是否为空
  if (!expression) {
    throw new Error("表达式不能为空");
  }

  // 检查表达式是否包含非法字符
  if (!/^[0-9+\-*/().]+$/.test(expression)) {
    throw new Error("表达式包含非法字符");
  }

  // 检查括号是否匹配
  let bracketCount = 0;
  for (const char of expression) {
    if (char === "(") bracketCount++;
    if (char === ")") bracketCount--;
    if (bracketCount < 0) {
      throw new Error("括号不匹配");
    }
  }
  if (bracketCount !== 0) {
    throw new Error("括号不匹配");
  }

  try {
    // 将表达式中的数字转换为整数计算，使用固定精度
    const scale = Math.pow(10, 15); // 使用固定的15位精度
    const processedExpression = expression.replace(/\d*\.?\d+/g, (match) => {
      const num = parseFloat(match);
      return Math.round(num * scale);
    });

    // 使用 Function 构造函数创建一个安全的计算环境
    const result = new Function(`return ${processedExpression}`)();

    // 检查结果是否为有限数
    if (!Number.isFinite(result)) {
      throw new Error("计算结果无效");
    }

    // 还原小数位数
    return result / scale;
  } catch (error) {
    throw new Error("表达式计算错误: " + error.message);
  }
}

/**
 * 处理两个数的加法，避免浮点数精度问题
 * @param {number} a 第一个数
 * @param {number} b 第二个数
 * @returns {number} 计算结果
 */
function add(a, b) {
  const precision = Math.max(
    (a.toString().split(".")[1] || "").length,
    (b.toString().split(".")[1] || "").length
  );
  const scale = Math.pow(10, precision);
  return (Math.round(a * scale) + Math.round(b * scale)) / scale;
}

/**
 * 处理两个数的减法，避免浮点数精度问题
 * @param {number} a 第一个数
 * @param {number} b 第二个数
 * @returns {number} 计算结果
 */
function subtract(a, b) {
  const precision = Math.max(
    (a.toString().split(".")[1] || "").length,
    (b.toString().split(".")[1] || "").length
  );
  const scale = Math.pow(10, precision);
  return (Math.round(a * scale) - Math.round(b * scale)) / scale;
}

/**
 * 处理两个数的乘法，避免浮点数精度问题
 * @param {number} a 第一个数
 * @param {number} b 第二个数
 * @returns {number} 计算结果
 */
function multiply(a, b) {
  const precision =
    (a.toString().split(".")[1] || "").length +
    (b.toString().split(".")[1] || "").length;
  const scale = Math.pow(10, precision);
  return (Math.round(a * scale) * Math.round(b * scale)) / (scale * scale);
}

/**
 * 处理两个数的除法，避免浮点数精度问题
 * @param {number} a 第一个数
 * @param {number} b 第二个数
 * @param {number} [precision=10] 精度
 * @returns {number} 计算结果
 */
function divide(a, b, precision = 10) {
  if (b === 0) {
    throw new Error("除数不能为零");
  }
  const scale = Math.pow(10, precision);
  return Math.round(a * scale) / Math.round(b * scale);
}

/**
 * 计算阶乘
 * @param {number} n 非负整数
 * @returns {number} 阶乘结果
 */
function factorial(n) {
  if (!Number.isInteger(n)) {
    throw new Error("阶乘只能计算整数");
  }
  if (n < 0) {
    throw new Error("阶乘不能计算负数");
  }
  if (n > 170) {
    throw new Error("数字过大，可能导致溢出");
  }

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * 计算绝对值
 * @param {number} x 数字
 * @returns {number} 绝对值
 */
function abs(x) {
  // 将数字转换为整数计算，使用固定精度
  const scale = Math.pow(10, 15); // 使用固定的15位精度
  const num = parseFloat(x.toString());
  const result = Math.abs(Math.round(num * scale));
  return result / scale;
}

/**
 * 向上取整
 * @param {number} x 数字
 * @returns {number} 向上取整结果
 */
function ceil(x) {
  return Math.ceil(x);
}

/**
 * 向下取整
 * @param {number} x 数字
 * @returns {number} 向下取整结果
 */
function floor(x) {
  return Math.floor(x);
}

/**
 * 四舍五入
 * @param {number} x 数字
 * @param {number} [decimals=0] 保留小数位数
 * @returns {number} 四舍五入结果
 */
function round(x, decimals = 0) {
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new Error("小数位数必须是非负整数");
  }
  const factor = Math.pow(10, decimals);
  return Math.round(x * factor) / factor;
}

/**
 * 计算平方根
 * @param {number} x 非负数
 * @returns {number} 平方根
 */
function sqrt(x) {
  if (x < 0) {
    throw new Error("不能计算负数的平方根");
  }
  return Math.sqrt(x);
}

/**
 * 计算幂
 * @param {number} base 底数
 * @param {number} exponent 指数
 * @returns {number} 幂运算结果
 */
function pow(base, exponent) {
  const result = Math.pow(base, exponent);
  if (!Number.isFinite(result)) {
    throw new Error("计算结果超出范围");
  }
  return result;
}

/**
 * 计算对数
 * @param {number} x 正数
 * @param {number} [base=Math.E] 底数
 * @returns {number} 对数值
 */
function log(x, base = Math.E) {
  if (x <= 0) {
    throw new Error("对数只能计算正数");
  }
  if (base <= 0 || base === 1) {
    throw new Error("对数的底数必须是大于0且不等于1的数");
  }

  return base === Math.E ? Math.log(x) : Math.log(x) / Math.log(base);
}

module.exports = {
  evaluate,
  factorial,
  abs,
  ceil,
  floor,
  round,
  sqrt,
  pow,
  log,
};
