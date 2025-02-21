const { runCsharpFeature } = require("../../csharp");
const child_process = require("child_process");

const stopMonitor = () => {
  child_process.exec("taskkill /f /im monitor.exe");
};

// 监控剪贴板变化
const watchClipboard = async function () {
  const args = ["-type", "clipboard", "-once"];
  const loadingBar = await quickcommand.showProcessBar({
    text: "等待剪贴板变化...",
    onClose: () => {
      stopMonitor();
    },
  });
  try {
    const result = await runCsharpFeature("monitor", args);
    loadingBar.close();
    if (result && result.startsWith("Error:")) {
      throw new Error(result.substring(7));
    }
    return JSON.parse(result);
  } catch (error) {
    return {};
  }
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

  const loadingBar = await quickcommand.showProcessBar({
    text: "等待文件变化...",
    onClose: () => {
      stopMonitor();
    },
  });

  try {
    const result = await runCsharpFeature("monitor", args);
    loadingBar.close();
    if (result && result.startsWith("Error:")) {
      throw new Error(result.substring(7));
    }
    return JSON.parse(result);
  } catch (error) {
    return {};
  }
};

module.exports = {
  watchClipboard,
  watchFileSystem,
};
