/**
 * 计算数组的平均值
 * @param {number[]} numbers 数字数组
 * @returns {number} 平均值
 */
function mean(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error("输入必须是非空数组");
  }
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * 计算数组的中位数
 * @param {number[]} numbers 数字数组
 * @returns {number} 中位数
 */
function median(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error("输入必须是非空数组");
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * 计算数组的众数
 * @param {number[]} numbers 数字数组
 * @returns {number[]} 众数数组（可能有多个）
 */
function mode(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error("输入必须是非空数组");
  }

  const frequency = new Map();
  let maxFreq = 0;

  // 计算每个数字出现的频率
  for (const num of numbers) {
    const freq = (frequency.get(num) || 0) + 1;
    frequency.set(num, freq);
    maxFreq = Math.max(maxFreq, freq);
  }

  // 找出所有出现频率最高的数字
  return Array.from(frequency.entries())
    .filter(([_, freq]) => freq === maxFreq)
    .map(([num]) => num)
    .sort((a, b) => a - b);
}

/**
 * 计算数组的方差
 * @param {number[]} numbers 数字数组
 * @param {boolean} [population=true] 是否为总体方差
 * @returns {number} 方差
 */
function variance(numbers, population = true) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error("输入必须是非空数组");
  }

  const avg = mean(numbers);
  const squaredDiffs = numbers.map((num) => Math.pow(num - avg, 2));
  const divisor = population ? numbers.length : numbers.length - 1;

  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / divisor;
}

/**
 * 计算数组的标准差
 * @param {number[]} numbers 数字数组
 * @param {boolean} [population=true] 是否为总体标准差
 * @returns {number} 标准差
 */
function standardDeviation(numbers, population = true) {
  return Math.sqrt(variance(numbers, population));
}

/**
 * 计算数组的范围
 * @param {number[]} numbers 数字数组
 * @returns {Object} 包含最小值、最大值和范围的对象
 */
function range(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error("输入必须是非空数组");
  }

  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  return {
    min, // 最小值
    max, // 最大值
    range: max - min, // 范围
  };
}

/**
 * 计算数组的四分位数
 * @param {number[]} numbers 数字数组
 * @returns {Object} 包含四分位数的对象
 */
function quartiles(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error("输入必须是非空数组");
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  const q2 = median(sorted);
  const q1 = median(sorted.slice(0, mid));
  const q3 = median(sorted.slice(sorted.length % 2 ? mid + 1 : mid));

  return {
    q1, // 第一四分位数
    q2, // 第二四分位数（中位数）
    q3, // 第三四分位数
    iqr: q3 - q1, // 四分位距
  };
}

module.exports = {
  mean,
  median,
  mode,
  variance,
  standardDeviation,
  range,
  quartiles,
};
