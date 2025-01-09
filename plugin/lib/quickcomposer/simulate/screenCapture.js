const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const os = require("os");

const execFileAsync = promisify(execFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);

// Windows C# 截图代码
const csharpScript = `
using System;
using System.Runtime.InteropServices;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using Microsoft.VisualBasic;

public class ScreenCapture
{
    [DllImport("user32.dll")]
    static extern IntPtr GetDC(IntPtr hwnd);

    [DllImport("user32.dll")]
    static extern IntPtr GetDesktopWindow();

    [DllImport("user32.dll")]
    static extern IntPtr GetWindowDC(IntPtr hWnd);

    [DllImport("user32.dll")]
    static extern IntPtr ReleaseDC(IntPtr hWnd, IntPtr hDC);

    [DllImport("gdi32.dll")]
    static extern bool BitBlt(IntPtr hdcDest, int nXDest, int nYDest,
        int nWidth, int nHeight, IntPtr hdcSrc,
        int nXSrc, int nYSrc, int dwRop);

    [DllImport("gdi32.dll")]
    static extern IntPtr CreateCompatibleBitmap(IntPtr hDC, int nWidth, int nHeight);

    [DllImport("gdi32.dll")]
    static extern IntPtr CreateCompatibleDC(IntPtr hDC);

    [DllImport("gdi32.dll")]
    static extern bool DeleteDC(IntPtr hDC);

    [DllImport("gdi32.dll")]
    static extern bool DeleteObject(IntPtr hObject);

    [DllImport("gdi32.dll")]
    static extern IntPtr SelectObject(IntPtr hDC, IntPtr hObject);

    public Image CaptureScreen()
    {
        return CaptureWindow(GetDesktopWindow());
    }

    private Image CaptureWindow(IntPtr handle)
    {
        IntPtr hdcSrc = GetWindowDC(handle);
        User32.RECT windowRect = new User32.RECT();
        User32.GetWindowRect(handle, ref windowRect);
        int width = windowRect.right - windowRect.left;
        int height = windowRect.bottom - windowRect.top;

        IntPtr hdcDest = CreateCompatibleDC(hdcSrc);
        IntPtr hBitmap = CreateCompatibleBitmap(hdcSrc, width, height);
        IntPtr hOld = SelectObject(hdcDest, hBitmap);

        BitBlt(hdcDest, 0, 0, width, height, hdcSrc, 0, 0, 0x00CC0020);
        SelectObject(hdcDest, hOld);
        DeleteDC(hdcDest);

        Image img = Image.FromHbitmap(hBitmap);
        DeleteObject(hBitmap);
        ReleaseDC(handle, hdcSrc);

        return img;
    }

    public void CaptureScreenToFile(string filename, ImageFormat format)
    {
        Image img = CaptureScreen();
        img.Save(filename, format);
    }

    public class User32
    {
        public struct RECT
        {
            public int left;
            public int top;
            public int right;
            public int bottom;
        }

        [DllImport("user32.dll")]
        public static extern IntPtr GetWindowRect(IntPtr hWnd, ref RECT rect);
    }

    public static void Main()
    {
        ScreenCapture sc = new ScreenCapture();
        sc.CaptureScreenToFile(">>tempscreenshot<<", ImageFormat.Png);
    }
}
`;

// Windows 截图实现
async function captureWindowsScreen() {
  const tmpFile = path.join(os.tmpdir(), `screen-${Date.now()}.png`);
  try {
    await window.quickcommand.runCsharp(
      csharpScript.replace(">>tempscreenshot<<", tmpFile.replace(/\\/g, "\\\\"))
    );
    const imageBuffer = await readFileAsync(tmpFile);
    return `data:image/png;base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Windows截图失败:", error);
    return null;
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
async function captureFullScreen() {
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
  if (!path) return null;
  const result = await captureScreen(range);
  if (!result) return null;
  fs.writeFileSync(
    path,
    result.replace("data:image/png;base64,", ""),
    "base64"
  );
  return result;
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
