const fs = require("fs");
const path = require("path");
const quickcommand = require("../../quickcommand");

// 读取 monitor.cs 模板
const monitorTemplate = fs.readFileSync(
  path.join(__dirname, "..", "csharp", "monitor.cs"),
  "utf8"
);

// 监控剪贴板变化
const watchClipboard = async function () {
  const args = ["-type", "clipboard"];
  const result = await quickcommand.runCsharp(monitorTemplate, args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

// 监控文件系统变化
const watchFileSystem = async function (options = {}) {
  const { path: watchPath, filter = "*.*", recursive = true } = options;

  if (!watchPath) {
    throw new Error("必须指定监控路径");
  }

  const args = ["-type", "filesystem", "-path", watchPath];

  if (filter !== "*.*") {
    args.push("-filter", filter);
  }

  if (!recursive) {
    args.push("-recursive", "false");
  }

  const result = await quickcommand.runCsharp(monitorTemplate, args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return true;
};

module.exports = {
  watchClipboard,
  watchFileSystem,
};
