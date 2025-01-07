const path = require("path");

/**
 * 规范化路径
 * @param {string} p 要规范化的路径
 * @returns {string} 规范化后的路径
 */
function normalize(p) {
  try {
    return path.normalize(p);
  } catch (error) {
    throw new Error(`路径规范化失败: ${error.message}`);
  }
}

/**
 * 连接路径片段
 * @param {...string} paths 路径片段
 * @returns {string} 连接后的路径
 */
function join(...paths) {
  try {
    return path.join(...paths);
  } catch (error) {
    throw new Error(`路径连接失败: ${error.message}`);
  }
}

/**
 * 解析路径
 * @param {string} p 要解析的路径
 * @returns {Object} 解析结果，包含 root, dir, base, ext, name
 */
function parse(p) {
  try {
    return path.parse(p);
  } catch (error) {
    throw new Error(`路径解析失败: ${error.message}`);
  }
}

/**
 * 获取路径的目录名
 * @param {string} p 路径
 * @returns {string} 目录名
 */
function dirname(p) {
  try {
    return path.dirname(p);
  } catch (error) {
    throw new Error(`获取目录名失败: ${error.message}`);
  }
}

/**
 * 获取路径的文件名
 * @param {string} p 路径
 * @param {string} [ext] 可选的扩展名，如果提供则从结果中移除
 * @returns {string} 文件名
 */
function basename(p, ext = undefined) {
  try {
    return path.basename(p, ext);
  } catch (error) {
    throw new Error(`获取文件名失败: ${error.message}`);
  }
}

/**
 * 获取路径的扩展名
 * @param {string} p 路径
 * @returns {string} 扩展名
 */
function extname(p) {
  try {
    return path.extname(p);
  } catch (error) {
    throw new Error(`获取扩展名失败: ${error.message}`);
  }
}

/**
 * 判断路径是否为绝对路径
 * @param {string} p 路径
 * @returns {boolean} 是否为绝对路径
 */
function isAbsolute(p) {
  try {
    return path.isAbsolute(p);
  } catch (error) {
    throw new Error(`判断绝对路径失败: ${error.message}`);
  }
}

/**
 * 计算相对路径
 * @param {string} from 起始路径
 * @param {string} to 目标路径
 * @returns {string} 相对路径
 */
function relative(from, to) {
  try {
    return path.relative(from, to);
  } catch (error) {
    throw new Error(`计算相对路径失败: ${error.message}`);
  }
}

/**
 * 将路径解析为绝对路径
 * @param {...string} paths 路径片段
 * @returns {string} 解析后的绝对路径
 */
function resolve(...paths) {
  try {
    return path.resolve(...paths);
  } catch (error) {
    throw new Error(`解析绝对路径失败: ${error.message}`);
  }
}

/**
 * 格式化路径对象为路径字符串
 * @param {string} root 根路径
 * @param {string} dir 目录
 * @param {string} base 基本名称
 * @param {string} name 文件名
 * @param {string} ext 扩展名
 * @returns {string} 格式化后的路径
 */
function format(root, dir, base, name, ext) {
  try {
    const pathObject = { root, dir, base, name, ext };
    return path.format(pathObject);
  } catch (error) {
    throw new Error(`格式化路径失败: ${error.message}`);
  }
}

module.exports = {
  normalize,
  join,
  parse,
  dirname,
  basename,
  extname,
  isAbsolute,
  relative,
  resolve,
  format,
  sep: path.sep,
  delimiter: path.delimiter,
  win32: path.win32,
  posix: path.posix,
};
