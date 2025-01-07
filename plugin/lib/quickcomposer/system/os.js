const os = require("os");

// 获取系统架构
function arch() {
  return os.arch();
}

// 获取CPU信息
function cpus(format = "full") {
  const cpuInfo = os.cpus();
  if (format === "simple") {
    return cpuInfo.map(({ model, speed }) => ({ model, speed }));
  }
  return cpuInfo;
}

// 获取内存信息
function memory(type = "totalmem") {
  switch (type) {
    case "totalmem":
      return os.totalmem();
    case "freemem":
      return os.freemem();
    default:
      throw new Error("不支持的内存信息类型");
  }
}

// 获取网络信息
function network(type = "hostname", internal = false) {
  switch (type) {
    case "hostname":
      return os.hostname();
    case "networkInterfaces": {
      const interfaces = os.networkInterfaces();
      if (!internal) {
        // 过滤掉内部接口
        Object.keys(interfaces).forEach((key) => {
          interfaces[key] = interfaces[key].filter((iface) => !iface.internal);
          if (interfaces[key].length === 0) {
            delete interfaces[key];
          }
        });
      }
      return interfaces;
    }
    default:
      throw new Error("不支持的网络信息类型");
  }
}

// 获取平台信息
function platform(type = "platform") {
  switch (type) {
    case "platform":
      return os.platform();
    case "type":
      return os.type();
    case "release":
      return os.release();
    case "arch":
      return os.arch();
    case "endianness":
      return os.endianness();
    case "tmpdir":
      return os.tmpdir();
    case "homedir":
      return os.homedir();
    case "uptime":
      return os.uptime();
    case "userInfo":
      return os.userInfo();
    default:
      throw new Error("不支持的平台信息类型");
  }
}

module.exports = {
  arch,
  cpus,
  memory,
  network,
  platform,
};
