const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { runCsharpFeature } = require("../../csharp");

const execFileAsync = promisify(execFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);

// Windows 截图实现
async function captureWindowsScreen() {
  const tmpFile = path.join(os.tmpdir(), `screen-${Date.now()}.png`);
  try {
    await runCsharpFeature("utils", ["-type", "screenshot", "-path", tmpFile]);
    const imageBuffer = await readFileAsync(tmpFile);
    return `data:image/png;base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Windows截图失败:", error);
    return null;
  } finally {
    await unlinkAsync(tmpFile).catch(() => {});
  }
}

// macOS 截图实现
async function captureMacScreen() {
  const tmpFile = path.join(os.tmpdir(), `screen-${Date.now()}.png`);

  try {
    await execFileAsync("screencapture", ["-x", "-C", "-T", "0", tmpFile]);
    const imageBuffer = await readFileAsync(tmpFile);
    return `data:image/png;base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.error("macOS截图失败:", error);
    return null;
  } finally {
    await unlinkAsync(tmpFile).catch(() => {});
  }
}

// Linux 截图实现
async function captureLinuxScreen() {
  const tmpFile = path.join(os.tmpdir(), `screen-${Date.now()}.png`);

  try {
    // 检查可用的截图工具
    let tool = null;
    try {
      await execFileAsync("which", ["gnome-screenshot"]);
      tool = "gnome-screenshot";
    } catch {
      try {
        await execFileAsync("which", ["scrot"]);
        tool = "scrot";
      } catch {
        try {
          await execFileAsync("which", ["import"]);
          tool = "import";
        } catch {
          quickcommand.showSystemMessageBox(
            "请先安装截图工具，命令：sudo apt install scrot"
          );
          return null;
        }
      }
    }

    // 根据可用工具执行截图
    switch (tool) {
      case "gnome-screenshot":
        await execFileAsync("gnome-screenshot", ["-f", tmpFile]);
        break;
      case "scrot":
        await execFileAsync("scrot", [tmpFile]);
        break;
      case "import":
        await execFileAsync("import", ["-window", "root", tmpFile]);
        break;
    }

    const imageBuffer = await readFileAsync(tmpFile);
    return `data:image/png;base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    throw error;
  } finally {
    await unlinkAsync(tmpFile).catch(() => {});
  }
}

// 统一的截图接口
async function captureFullScreen() {
  if (process.platform === "darwin") {
    return await captureMacScreen();
  } else if (process.platform === "win32") {
    return await captureWindowsScreen();
  } else if (process.platform === "linux") {
    return await captureLinuxScreen();
  }
}

function captureAreaScreen() {
  return new Promise((resolve) => {
    window.utools.screenCapture((data) => {
      resolve(data);
    });
  });
}

async function captureScreen(range = "fullscreen") {
  return range === "fullscreen"
    ? await captureFullScreen()
    : await captureAreaScreen();
}

async function captureScreenToFile(range = "fullscreen", path = null) {
  if (!path) return;
  const result = await captureScreen(range);
  if (!result) return;
  fs.writeFileSync(
    path,
    result.replace("data:image/png;base64,", ""),
    "base64"
  );
  return;
}

async function captureScreenToClipboard(range = "fullscreen") {
  const result = await captureScreen(range);
  if (!result) return null;
  window.utools.copyImage(result);
  return result;
}

module.exports = {
  captureScreen,
  captureScreenToFile,
  captureScreenToClipboard,
};
