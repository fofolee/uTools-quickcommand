/**
 * 角度转弧度
 * @param {number} degrees 角度
 * @returns {number} 弧度
 */
function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * 弧度转角度
 * @param {number} radians 弧度
 * @returns {number} 角度
 */
function radiansToDegrees(radians) {
  return (radians * 180) / Math.PI;
}

/**
 * 正弦函数
 * @param {number} angle 角度
 * @param {boolean} [useRadians=false] 是否使用弧度
 * @returns {number} 正弦值
 */
function sin(angle, useRadians = false) {
  const rad = useRadians ? angle : degreesToRadians(angle);
  return Math.sin(rad);
}

/**
 * 余弦函数
 * @param {number} angle 角度
 * @param {boolean} [useRadians=false] 是否使用弧度
 * @returns {number} 余弦值
 */
function cos(angle, useRadians = false) {
  const rad = useRadians ? angle : degreesToRadians(angle);
  return Math.cos(rad);
}

/**
 * 正切函数
 * @param {number} angle 角度
 * @param {boolean} [useRadians=false] 是否使用弧度
 * @returns {number} 正切值
 */
function tan(angle, useRadians = false) {
  const rad = useRadians ? angle : degreesToRadians(angle);
  return Math.tan(rad);
}

/**
 * 反正弦函数
 * @param {number} value 正弦值
 * @param {boolean} [returnRadians=false] 是否返回弧度
 * @returns {number} 角度或弧度
 */
function asin(value, returnRadians = false) {
  if (value < -1 || value > 1) {
    throw new Error("反正弦函数的输入值必须在 [-1, 1] 范围内");
  }
  const rad = Math.asin(value);
  return returnRadians ? rad : radiansToDegrees(rad);
}

/**
 * 反余弦函数
 * @param {number} value 余弦值
 * @param {boolean} [returnRadians=false] 是否返回弧度
 * @returns {number} 角度或弧度
 */
function acos(value, returnRadians = false) {
  if (value < -1 || value > 1) {
    throw new Error("反余弦函数的输入值必须在 [-1, 1] 范围内");
  }
  const rad = Math.acos(value);
  return returnRadians ? rad : radiansToDegrees(rad);
}

/**
 * 反正切函数
 * @param {number} value 正切值
 * @param {boolean} [returnRadians=false] 是否返回弧度
 * @returns {number} 角度或弧度
 */
function atan(value, returnRadians = false) {
  const rad = Math.atan(value);
  return returnRadians ? rad : radiansToDegrees(rad);
}

/**
 * 双参数反正切函数
 * @param {number} y y坐标
 * @param {number} x x坐标
 * @param {boolean} [returnRadians=false] 是否返回弧度
 * @returns {number} 角度或弧度
 */
function atan2(y, x, returnRadians = false) {
  const rad = Math.atan2(y, x);
  return returnRadians ? rad : radiansToDegrees(rad);
}

/**
 * 双曲正弦函数
 * @param {number} x 输入值
 * @returns {number} 双曲正弦值
 */
function sinh(x) {
  return Math.sinh(x);
}

/**
 * 双曲余弦函数
 * @param {number} x 输入值
 * @returns {number} 双曲余弦值
 */
function cosh(x) {
  return Math.cosh(x);
}

/**
 * 双曲正切函数
 * @param {number} x 输入值
 * @returns {number} 双曲正切值
 */
function tanh(x) {
  return Math.tanh(x);
}

module.exports = {
  degreesToRadians,
  radiansToDegrees,
  sin,
  cos,
  tan,
  asin,
  acos,
  atan,
  atan2,
  sinh,
  cosh,
  tanh,
};
