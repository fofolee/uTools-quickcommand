/**
 * 长度单位转换
 * @param {number} value 数值
 * @param {string} fromUnit 源单位
 * @param {string} toUnit 目标单位
 * @returns {number} 转换结果
 */
function length(value, fromUnit, toUnit) {
  const units = {
    mm: 0.001, // 毫米
    cm: 0.01, // 厘米
    dm: 0.1, // 分米
    m: 1, // 米（基准单位）
    km: 1000, // 千米
    in: 0.0254, // 英寸
    ft: 0.3048, // 英尺
    yd: 0.9144, // 码
    mi: 1609.344, // 英里
  };

  if (!(fromUnit in units)) {
    throw new Error(`不支持的源单位: ${fromUnit}`);
  }
  if (!(toUnit in units)) {
    throw new Error(`不支持的目标单位: ${toUnit}`);
  }

  // 先转换为米，再转换为目标单位
  return (value * units[fromUnit]) / units[toUnit];
}

/**
 * 重量单位转换
 * @param {number} value 数值
 * @param {string} fromUnit 源单位
 * @param {string} toUnit 目标单位
 * @returns {number} 转换结果
 */
function weight(value, fromUnit, toUnit) {
  const units = {
    mg: 0.001, // 毫克
    g: 1, // 克（基准单位）
    kg: 1000, // 千克
    t: 1000000, // 吨
    oz: 28.3495, // 盎司
    lb: 453.592, // 磅
  };

  if (!(fromUnit in units)) {
    throw new Error(`不支持的源单位: ${fromUnit}`);
  }
  if (!(toUnit in units)) {
    throw new Error(`不支持的目标单位: ${toUnit}`);
  }

  // 先转换为克，再转换为目标单位
  return (value * units[fromUnit]) / units[toUnit];
}

/**
 * 面积单位转换
 * @param {number} value 数值
 * @param {string} fromUnit 源单位
 * @param {string} toUnit 目标单位
 * @returns {number} 转换结果
 */
function area(value, fromUnit, toUnit) {
  const units = {
    mm2: 0.000001, // 平方毫米
    cm2: 0.0001, // 平方厘米
    dm2: 0.01, // 平方分米
    m2: 1, // 平方米（基准单位）
    km2: 1000000, // 平方千米
    ha: 10000, // 公顷
    in2: 0.00064516, // 平方英寸
    ft2: 0.092903, // 平方英尺
    yd2: 0.836127, // 平方码
    ac: 4046.86, // 英亩
    mi2: 2589988.11, // 平方英里
  };

  if (!(fromUnit in units)) {
    throw new Error(`不支持的源单位: ${fromUnit}`);
  }
  if (!(toUnit in units)) {
    throw new Error(`不支持的目标单位: ${toUnit}`);
  }

  // 先转换为平方米，再转换为目标单位
  return (value * units[fromUnit]) / units[toUnit];
}

/**
 * 体积单位转换
 * @param {number} value 数值
 * @param {string} fromUnit 源单位
 * @param {string} toUnit 目标单位
 * @returns {number} 转换结果
 */
function volume(value, fromUnit, toUnit) {
  const units = {
    ml: 0.001, // 毫升
    l: 1, // 升（基准单位）
    m3: 1000, // 立方米
    cm3: 0.001, // 立方厘米
    mm3: 0.000001, // 立方毫米
    gal: 3.78541, // 加仑（美制）
    qt: 0.946353, // 夸脱（美制）
    pt: 0.473176, // 品脱（美制）
    cup: 0.236588, // 杯（美制）
    floz: 0.0295735, // 液量盎司（美制）
  };

  if (!(fromUnit in units)) {
    throw new Error(`不支持的源单位: ${fromUnit}`);
  }
  if (!(toUnit in units)) {
    throw new Error(`不支持的目标单位: ${toUnit}`);
  }

  // 先转换为升，再转换为目标单位
  return (value * units[fromUnit]) / units[toUnit];
}

/**
 * 温度单位转换
 * @param {number} value 数值
 * @param {string} fromUnit 源单位
 * @param {string} toUnit 目标单位
 * @returns {number} 转换结果
 */
function temperature(value, fromUnit, toUnit) {
  const conversions = {
    C: {
      F: (v) => (v * 9) / 5 + 32,
      K: (v) => v + 273.15,
      C: (v) => v,
    },
    F: {
      C: (v) => ((v - 32) * 5) / 9,
      K: (v) => ((v - 32) * 5) / 9 + 273.15,
      F: (v) => v,
    },
    K: {
      C: (v) => v - 273.15,
      F: (v) => ((v - 273.15) * 9) / 5 + 32,
      K: (v) => v,
    },
  };

  if (!(fromUnit in conversions)) {
    throw new Error(`不支持的源单位: ${fromUnit}`);
  }
  if (!(toUnit in conversions[fromUnit])) {
    throw new Error(`不支持的目标单位: ${toUnit}`);
  }

  return conversions[fromUnit][toUnit](value);
}

/**
 * 时间单位转换
 * @param {number} value 数值
 * @param {string} fromUnit 源单位
 * @param {string} toUnit 目标单位
 * @returns {number} 转换结果
 */
function time(value, fromUnit, toUnit) {
  const units = {
    ms: 0.001, // 毫秒
    s: 1, // 秒（基准单位）
    min: 60, // 分钟
    h: 3600, // 小时
    d: 86400, // 天
    w: 604800, // 周
    mo: 2592000, // 月（按30天计算）
    y: 31536000, // 年（按365天计算）
  };

  if (!(fromUnit in units)) {
    throw new Error(`不支持的源单位: ${fromUnit}`);
  }
  if (!(toUnit in units)) {
    throw new Error(`不支持的目标单位: ${toUnit}`);
  }

  // 先转换为秒，再转换为目标单位
  return (value * units[fromUnit]) / units[toUnit];
}

module.exports = {
  length,
  weight,
  area,
  volume,
  temperature,
  time,
};
