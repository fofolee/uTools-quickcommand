const { runCsharpFeature } = require("../../csharp");

// 监控剪贴板变化
const watchClipboard = async function () {
  const args = ["-type", "clipboard", "-once"];
  const result = await runCsharpFeature("monitor", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return JSON.parse(result);
};

// 监控文件系统变化
const watchFileSystem = async function (watchPath, options = {}) {
  const { filter = "*.*", recursive = true } = options;

  if (!watchPath) {
    throw new Error("必须指定监控路径");
  }

  const args = ["-type", "filesystem", "-path", watchPath, "-once"];

  if (filter !== "*.*") {
    args.push("-filter", filter);
  }

  if (!recursive) {
    args.push("-recursive", "false");
  }

  const result = await runCsharpFeature("monitor", args);
  if (result && result.startsWith("Error:")) {
    throw new Error(result.substring(7));
  }
  return JSON.parse(result);
};

module.exports = {
  watchClipboard,
  watchFileSystem,
};
