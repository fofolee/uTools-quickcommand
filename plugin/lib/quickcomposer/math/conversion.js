/**
 * 进制转换
 * @param {string|number} value 要转换的值
 * @param {string} fromBase 源进制
 * @param {string} toBase 目标进制
 * @returns {string} 转换结果
 */
function base(value, fromBase, toBase) {
  const bases = {
    binary: 2,
    octal: 8,
    decimal: 10,
    hex: 16,
  };

  if (!(fromBase in bases)) {
    throw new Error(`不支持的源进制: ${fromBase}`);
  }
  if (!(toBase in bases)) {
    throw new Error(`不支持的目标进制: ${toBase}`);
  }

  // 先转为十进制
  let decimal;
  if (fromBase === "decimal") {
    decimal = Number(value);
  } else {
    decimal = parseInt(String(value), bases[fromBase]);
  }

  // 再转为目标进制
  if (toBase === "decimal") {
    return String(decimal);
  }
  return decimal.toString(bases[toBase]);
}

module.exports = {
  base,
};
