/**
 * 生成随机数
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @param {number} count 生成数量
 * @param {number} decimals 小数位数
 * @returns {number|number[]} 随机数或随机数数组
 */
function number(min = 0, max = 100, count = 1, decimals = 0) {
  if (min >= max) {
    throw new Error("最小值必须小于最大值");
  }
  if (count < 1) {
    throw new Error("生成数量必须大于0");
  }
  if (decimals < 0) {
    throw new Error("小数位数不能为负数");
  }

  const factor = Math.pow(10, decimals);
  const generate = () => {
    const random = Math.random() * (max - min) + min;
    return Math.round(random * factor) / factor;
  };

  if (count === 1) {
    return generate();
  }

  return Array.from({ length: count }, generate);
}

/**
 * 生成随机整数
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @param {number} count 生成数量
 * @returns {number|number[]} 随机整数或随机整数数组
 */
function integer(min = 0, max = 100, count = 1) {
  min = Math.ceil(min);
  max = Math.floor(max);

  if (min >= max) {
    throw new Error("最小值必须小于最大值");
  }
  if (count < 1) {
    throw new Error("生成数量必须大于0");
  }

  const generate = () => Math.floor(Math.random() * (max - min + 1)) + min;

  if (count === 1) {
    return generate();
  }

  return Array.from({ length: count }, generate);
}

module.exports = {
  number,
  integer,
};
