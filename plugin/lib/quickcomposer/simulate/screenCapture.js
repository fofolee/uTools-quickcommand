const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const os = require("os");

const execFileAsync = promisify(execFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);

// Windows C# 截图代码
const csharpScript = Buffer.from(
  `
using System;
using System.Runtime.InteropServices;
using System.Drawing;
using System.Drawing.Imaging;

public class ScreenCapture {
    [DllImport("user32.dll")]
    static extern IntPtr GetDC(IntPtr hwnd);

    [DllImport("user32.dll")]
    static extern int ReleaseDC(IntPtr hwnd, IntPtr hdc);

    [DllImport("gdi32.dll")]
    static extern IntPtr CreateCompatibleDC(IntPtr hdc);

    [DllImport("gdi32.dll")]
    static extern IntPtr CreateCompatibleBitmap(IntPtr hdc, int width, int height);

    [DllImport("gdi32.dll")]
    static extern IntPtr SelectObject(IntPtr hdc, IntPtr hgdiobj);

    [DllImport("gdi32.dll")]
    static extern bool BitBlt(IntPtr hdcDest, int xDest, int yDest, int width, int height,
        IntPtr hdcSrc, int xSrc, int ySrc, int rop);

    [DllImport("gdi32.dll")]
    static extern bool DeleteDC(IntPtr hdc);

    [DllImport("gdi32.dll")]
    static extern bool DeleteObject(IntPtr hObject);

    [DllImport("user32.dll")]
    static extern bool GetCursorPos(ref Point point);

    [DllImport("user32.dll")]
    static extern bool GetWindowRect(IntPtr hwnd, ref Rectangle rect);

    public static void CaptureScreen(string outputPath) {
        IntPtr desktopDC = GetDC(IntPtr.Zero);
        Rectangle bounds = System.Windows.Forms.Screen.PrimaryScreen.Bounds;

        IntPtr memoryDC = CreateCompatibleDC(desktopDC);
        IntPtr bitmap = CreateCompatibleBitmap(desktopDC, bounds.Width, bounds.Height);
        IntPtr oldBitmap = SelectObject(memoryDC, bitmap);

        try {
            BitBlt(memoryDC, 0, 0, bounds.Width, bounds.Height, desktopDC, 0, 0, 0x00CC0020);

            using (var bmp = Image.FromHbitmap(bitmap)) {
                bmp.Save(outputPath, ImageFormat.Png);
            }
        }
        finally {
            SelectObject(memoryDC, oldBitmap);
            DeleteObject(bitmap);
            DeleteDC(memoryDC);
            ReleaseDC(IntPtr.Zero, desktopDC);
        }
    }
}`
).toString("base64");

// Windows 截图实现
async function captureWindowsScreen() {
  const tmpFile = path.join(os.tmpdir(), `screen-${Date.now()}.png`);

  try {
    // 使用base64编码的C#代码执行
    const command = `
      $code = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${csharpScript}'));
      Add-Type -TypeDefinition $code;
      [ScreenCapture]::CaptureScreen('${tmpFile.replace(/\\/g, "\\\\")}');
    `;

    await execFileAsync("powershell", [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      command,
    ]);

    // 读取截图
    const imageBuffer = await readFileAsync(tmpFile);
    return `data:image/png;base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Windows截图失败:", error);
    return null;
  } finally {
    // 清理临时文件
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
          console.error("未找到可用的Linux截图工具");
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
    console.error("Linux截图失败:", error);
    return null;
  } finally {
    await unlinkAsync(tmpFile).catch(() => {});
  }
}

// 统一的截图接口
async function captureScreen() {
  try {
    if (process.platform === "darwin") {
      return await captureMacScreen();
    } else if (process.platform === "win32") {
      return await captureWindowsScreen();
    } else if (process.platform === "linux") {
      return await captureLinuxScreen();
    }
  } catch (error) {
    console.error("截图失败:", error);
  }
  return null;
}

module.exports = { captureScreen };
