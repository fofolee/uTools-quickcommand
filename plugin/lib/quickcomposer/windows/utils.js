const { runCsharpFeature } = require("../../csharp");

/**
 * 设置壁纸
 * @param {string} path 壁纸路径
 * @returns {boolean} 是否成功
 */
const setWallpaper = async function (path) {
  const args = ["-type", "wallpaper", "-path", path];
  const result = await runCsharpFeature("utils", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

/**
 * 控制显示器
 * @param {string} action 动作：on/off
 * @returns {boolean} 是否成功
 */
const controlMonitor = async function (action) {
  const args = ["-type", "monitor", "-action", action];
  const result = await runCsharpFeature("utils", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

/**
 * 电源控制
 * @param {string} mode 模式：sleep/hibernate/awake/normal
 * @returns {boolean} 是否成功
 */
const powerControl = async function (mode) {
  const args = ["-type", "power", "-mode", mode];
  const result = await runCsharpFeature("utils", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

/**
 * 配置网络
 * @param {string} interfaceName 网卡名称
 * @param {string} ip IP地址
 * @param {string} mask 子网掩码
 * @param {string} gateway 网关
 * @param {string} dns DNS服务器
 * @returns {boolean} 是否成功
 */
const configureNetwork = async function (
  interfaceName,
  ip,
  mask,
  gateway = "",
  dns = ""
) {
  const args = [
    "-type",
    "network",
    "-interface",
    interfaceName,
    "-ip",
    ip,
    "-mask",
    mask,
  ];
  if (gateway) args.push("-gateway", gateway);
  if (dns) args.push("-dns", dns);

  const result = await runCsharpFeature("utils", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

/**
 * 管理开机启动项
 * @param {string} path 程序路径
 * @param {string} name 启动项名称
 * @param {boolean} remove 是否移除
 * @returns {boolean} 是否成功
 */
const manageStartup = async function (path, name, remove = false) {
  const args = ["-type", "startup", "-path", path, "-name", name];
  if (remove) args.push("-remove");

  const result = await runCsharpFeature("utils", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

/**
 * 创建快捷方式
 * @param {string} targetPath 目标路径
 * @param {string} shortcutPath 快捷方式路径
 * @param {string} args 启动参数
 * @returns {boolean} 是否成功
 */
const createShortcut = async function (targetPath, shortcutPath, args = "") {
  const cmdArgs = [
    "-type",
    "shortcut",
    "-target",
    targetPath,
    "-path",
    shortcutPath,
  ];
  if (args) cmdArgs.push("-args", args);

  const result = await runCsharpFeature("utils", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

/**
 * 设置亮度
 * @param {number} level 亮度级别(0-100)
 * @returns {boolean} 是否成功
 */
const setBrightness = async function (level) {
  const args = ["-type", "brightness", "-level", level.toString()];
  const result = await runCsharpFeature("utils", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

module.exports = {
  setWallpaper,
  controlMonitor,
  powerControl,
  configureNetwork,
  manageStartup,
  createShortcut,
  setBrightness,
};
