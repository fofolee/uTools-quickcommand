/**
 * 圆形计算
 * @param {number} radius 半径
 * @returns {Object} 计算结果
 */
function circle(radius) {
  if (radius < 0) {
    throw new Error("半径不能为负数");
  }

  return {
    area: Math.PI * radius * radius, // 面积
    perimeter: 2 * Math.PI * radius, // 周长
    diameter: 2 * radius, // 直径
  };
}

/**
 * 矩形计算
 * @param {number} width 宽度
 * @param {number} height 高度
 * @returns {Object} 计算结果
 */
function rectangle(width, height) {
  if (width < 0 || height < 0) {
    throw new Error("长度不能为负数");
  }

  return {
    area: width * height, // 面积
    perimeter: 2 * (width + height), // 周长
    diagonal: Math.sqrt(width * width + height * height), // 对角线长度
  };
}

/**
 * 三角形计算
 * @param {number} a 边长a
 * @param {number} b 边长b
 * @param {number} c 边长c
 * @returns {Object} 计算结果
 */
function triangle(a, b, c) {
  if (a < 0 || b < 0 || c < 0) {
    throw new Error("边长不能为负数");
  }

  // 检查三角形是否合法（任意两边之和大于第三边）
  if (a + b <= c || b + c <= a || a + c <= b) {
    throw new Error("不能构成三角形");
  }

  // 半周长
  const s = (a + b + c) / 2;

  // 使用海伦公式计算面积
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

  // 计算三个角的角度（弧度）
  const angleA = Math.acos((b * b + c * c - a * a) / (2 * b * c));
  const angleB = Math.acos((a * a + c * c - b * b) / (2 * a * c));
  const angleC = Math.acos((a * a + b * b - c * c) / (2 * a * b));

  // 判断三角形类型
  const angles = [angleA, angleB, angleC].map(
    (angle) => (angle * 180) / Math.PI
  );
  let type;
  if (angles.some((angle) => Math.abs(angle - 90) < 0.000001)) {
    type = "直角三角形";
  } else if (angles.some((angle) => angle > 90)) {
    type = "钝角三角形";
  } else {
    type = "锐角三角形";
  }

  return {
    area, // 面积
    perimeter: a + b + c, // 周长
    angles: {
      // 三个角的度数
      A: angles[0],
      B: angles[1],
      C: angles[2],
    },
    type, // 三角形类型
    inradius: area / s, // 内切圆半径
    circumradius: (a * b * c) / (4 * area), // 外接圆半径
  };
}

module.exports = {
  circle,
  rectangle,
  triangle,
};
