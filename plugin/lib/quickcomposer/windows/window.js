/**
 * 窗口置顶
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @param {boolean} isTopMost 是否置顶
 */
async function setTopMost(method, value, isTopMost) {
  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    using System.Diagnostics;
    using System.Management;

    public class Program {
      [DllImport("user32.dll")]
      static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      [DllImport("user32.dll")]
      static extern IntPtr GetForegroundWindow();

      static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
      static readonly IntPtr HWND_NOTOPMOST = new IntPtr(-2);
      const uint SWP_NOMOVE = 0x0002;
      const uint SWP_NOSIZE = 0x0001;

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          SetWindowPos(hwnd, ${
            isTopMost ? "HWND_TOPMOST" : "HWND_NOTOPMOST"
          }, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
        }
      }
    }
  `;

  await quickcommand.runCsharp(script);
}

/**
 * 设置窗口透明度
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @param {number} opacity 透明度 0-100
 */
async function setOpacity(method, value, opacity) {
  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    using System.Diagnostics;
    using System.Management;

    public class Program {
      [DllImport("user32.dll")]
      static extern bool SetLayeredWindowAttributes(IntPtr hwnd, uint crKey, byte bAlpha, uint dwFlags);

      [DllImport("user32.dll")]
      static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      const int GWL_EXSTYLE = -20;
      const int WS_EX_LAYERED = 0x80000;
      const uint LWA_ALPHA = 0x2;

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          SetWindowLong(hwnd, GWL_EXSTYLE, WS_EX_LAYERED);
          SetLayeredWindowAttributes(hwnd, 0, (byte)(${opacity} * 2.55), LWA_ALPHA);
        }
      }
    }
  `;

  await quickcommand.runCsharp(script);
}

/**
 * 设置窗口位置和大小
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @param {number} x X坐标
 * @param {number} y Y坐标
 * @param {number} width 宽度
 * @param {number} height 高度
 */
async function setWindowRect(method, value, x, y, width, height) {
  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    using System.Diagnostics;
    using System.Management;

    public class Program {
      [DllImport("user32.dll")]
      static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          MoveWindow(hwnd, ${x}, ${y}, ${width}, ${height}, true);
        }
      }
    }
  `;

  await quickcommand.runCsharp(script);
}

/**
 * 设置窗口状态
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @param {string} state 状态：normal/maximize/minimize
 */
async function setWindowState(method, value, state) {
  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    using System.Diagnostics;
    using System.Management;

    public class Program {
      [DllImport("user32.dll")]
      static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      const int SW_NORMAL = 1;
      const int SW_MAXIMIZE = 3;
      const int SW_MINIMIZE = 6;

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          ShowWindow(hwnd, ${
            state === "maximize"
              ? "SW_MAXIMIZE"
              : state === "minimize"
              ? "SW_MINIMIZE"
              : "SW_NORMAL"
          });
        }
      }
    }
  `;

  await quickcommand.runCsharp(script);
}

/**
 * 关闭窗口
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 */
async function closeWindow(method, value) {
  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    using System.Diagnostics;
    using System.Management;

    public class Program {
      [DllImport("user32.dll")]
      static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      const uint WM_CLOSE = 0x0010;

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          PostMessage(hwnd, WM_CLOSE, IntPtr.Zero, IntPtr.Zero);
        }
      }
    }
  `;

  await quickcommand.runCsharp(script);
}

/**
 * 设置窗口焦点
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 */
async function setFocus(method, value) {
  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    using System.Diagnostics;
    using System.Management;

    public class Program {
      [DllImport("user32.dll")]
      static extern bool SetForegroundWindow(IntPtr hWnd);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          SetForegroundWindow(hwnd);
        }
      }
    }
  `;

  await quickcommand.runCsharp(script);
}

/**
 * 设置窗口边框
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @param {boolean} hasBorder 是否显示边框
 */
async function setBorder(method, value, hasBorder) {
  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    using System.Diagnostics;
    using System.Management;

    public class Program {
      [DllImport("user32.dll")]
      static extern int GetWindowLong(IntPtr hWnd, int nIndex);

      [DllImport("user32.dll")]
      static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      const int GWL_STYLE = -16;
      const int WS_BORDER = 0x00800000;
      const int WS_DLGFRAME = 0x00400000;
      const int WS_CAPTION = WS_BORDER | WS_DLGFRAME;

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          int style = GetWindowLong(hwnd, GWL_STYLE);
          if (${hasBorder}) {
            style |= WS_CAPTION;
          } else {
            style &= ~WS_CAPTION;
          }
          SetWindowLong(hwnd, GWL_STYLE, style);
        }
      }
    }
  `;

  await quickcommand.runCsharp(script);
}

/**
 * 设置窗口点击穿透
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @param {boolean} isTransparent 是否点击穿透
 */
async function setClickThrough(method, value, isTransparent) {
  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    using System.Diagnostics;
    using System.Management;

    public class Program {
      [DllImport("user32.dll")]
      static extern int GetWindowLong(IntPtr hWnd, int nIndex);

      [DllImport("user32.dll")]
      static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      const int GWL_EXSTYLE = -20;
      const int WS_EX_TRANSPARENT = 0x00000020;
      const int WS_EX_LAYERED = 0x80000;

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          int exStyle = GetWindowLong(hwnd, GWL_EXSTYLE);
          exStyle |= WS_EX_LAYERED;
          if (${isTransparent}) {
            exStyle |= WS_EX_TRANSPARENT;
          } else {
            exStyle &= ~WS_EX_TRANSPARENT;
          }
          SetWindowLong(hwnd, GWL_EXSTYLE, exStyle);
        }
      }
    }
  `;

  await quickcommand.runCsharp(script);
}

/**
 * 获取窗口信息
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @returns {Object} 窗口信息
 */
async function getWindowInfo(method, value) {
  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    using System.Diagnostics;
    using System.Web.Script.Serialization;

    public class Program {
      [DllImport("user32.dll")]
      static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

      [DllImport("user32.dll")]
      static extern bool GetClientRect(IntPtr hWnd, out RECT lpRect);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      [DllImport("user32.dll")]
      static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

      [DllImport("user32.dll")]
      static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

      [DllImport("user32.dll")]
      static extern bool IsWindowVisible(IntPtr hWnd);

      [DllImport("user32.dll")]
      static extern bool IsIconic(IntPtr hWnd);

      [DllImport("user32.dll")]
      static extern bool IsZoomed(IntPtr hWnd);

      [DllImport("user32.dll")]
      static extern IntPtr GetForegroundWindow();

      [DllImport("user32.dll")]
      static extern int GetWindowLong(IntPtr hWnd, int nIndex);

      [DllImport("user32.dll")]
      static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

      [StructLayout(LayoutKind.Sequential)]
      public struct RECT {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
      }

      const int GWL_STYLE = -16;
      const int GWL_EXSTYLE = -20;
      const int WS_BORDER = 0x00800000;
      const int WS_CAPTION = 0x00C00000;
      const int WS_CHILD = 0x40000000;
      const int WS_POPUP = unchecked((int)0x80000000);
      const int WS_SYSMENU = 0x00080000;
      const int WS_MINIMIZEBOX = 0x00020000;
      const int WS_MAXIMIZEBOX = 0x00010000;
      const int WS_EX_TOPMOST = 0x00000008;
      const int WS_EX_TRANSPARENT = 0x00000020;
      const int WS_EX_TOOLWINDOW = 0x00000080;
      const int WS_EX_LAYERED = 0x00080000;

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          var windowRect = new RECT();
          GetWindowRect(hwnd, out windowRect);

          var clientRect = new RECT();
          GetClientRect(hwnd, out clientRect);

          var titleText = new StringBuilder(256);
          GetWindowText(hwnd, titleText, 256);

          var className = new StringBuilder(256);
          GetClassName(hwnd, className, 256);

          uint processId = 0;
          GetWindowThreadProcessId(hwnd, out processId);

          string processName = "";
          string processPath = "";
          try {
            Process process = Process.GetProcessById((int)processId);
            processName = process.ProcessName;

            var startInfo = new ProcessStartInfo {
              FileName = "wmic",
              Arguments = string.Format("process where ProcessId={0} get ExecutablePath /value", processId),
              UseShellExecute = false,
              RedirectStandardOutput = true,
              CreateNoWindow = true
            };
            using (var proc = Process.Start(startInfo)) {
              string output = proc.StandardOutput.ReadToEnd();
              if (!string.IsNullOrEmpty(output)) {
                string[] lines = output.Split(new[] { Environment.NewLine }, StringSplitOptions.RemoveEmptyEntries);
                foreach (string line in lines) {
                  if (line.StartsWith("ExecutablePath=")) {
                    processPath = line.Substring("ExecutablePath=".Length);
                    break;
                  }
                }
              }
            }
          } catch {}

          int style = GetWindowLong(hwnd, GWL_STYLE);
          int exStyle = GetWindowLong(hwnd, GWL_EXSTYLE);

          var data = new {
            handle = hwnd.ToInt64(),
            processId = processId,
            process = new {
              name = processName,
              path = processPath
            },
            title = titleText.ToString(),
            className = className.ToString(),
            window = new {
              x = windowRect.Left,
              y = windowRect.Top,
              width = windowRect.Right - windowRect.Left,
              height = windowRect.Bottom - windowRect.Top
            },
            client = new {
              width = clientRect.Right - clientRect.Left,
              height = clientRect.Bottom - clientRect.Top
            },
            state = new {
              visible = IsWindowVisible(hwnd),
              minimized = IsIconic(hwnd),
              maximized = IsZoomed(hwnd),
              focused = GetForegroundWindow() == hwnd
            },
            style = new {
              border = (style & WS_BORDER) != 0,
              caption = (style & WS_CAPTION) != 0,
              child = (style & WS_CHILD) != 0,
              popup = (style & WS_POPUP) != 0,
              sysmenu = (style & WS_SYSMENU) != 0,
              minimizeBox = (style & WS_MINIMIZEBOX) != 0,
              maximizeBox = (style & WS_MAXIMIZEBOX) != 0
            },
            exStyle = new {
              topmost = (exStyle & WS_EX_TOPMOST) != 0,
              transparent = (exStyle & WS_EX_TRANSPARENT) != 0,
              toolWindow = (exStyle & WS_EX_TOOLWINDOW) != 0,
              layered = (exStyle & WS_EX_LAYERED) != 0
            }
          };

          var serializer = new JavaScriptSerializer();
          Console.WriteLine(serializer.Serialize(data));
        }
      }
    }
  `;

  const result = await quickcommand.runCsharp(script);
  try {
    return JSON.parse(result);
  } catch (error) {
    return {};
  }
}

/**
 * 设置窗口可见性
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @param {boolean} visible 是否可见
 */
async function setVisible(method, value, visible) {
  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    using System.Diagnostics;
    using System.Management;

    public class Program {
      [DllImport("user32.dll")]
      static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      const int SW_HIDE = 0;
      const int SW_SHOW = 5;

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          ShowWindow(hwnd, ${visible ? "SW_SHOW" : "SW_HIDE"});
        }
      }
    }
  `;

  await quickcommand.runCsharp(script);
}

/**
 * 根据不同方式查找窗口
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @returns {string} C#代码片段
 */
function findWindowByMethod(method, value) {
  switch (method) {
    case "handle":
      return `IntPtr hwnd = new IntPtr(${value});`;
    case "active":
      return `IntPtr hwnd = GetForegroundWindow();`;
    default: // title
      return `IntPtr hwnd = FindWindow(null, "${value}");`;
  }
}

module.exports = {
  setTopMost,
  setOpacity,
  setWindowRect,
  setWindowState,
  setVisible,
  closeWindow,
  setFocus,
  setBorder,
  setClickThrough,
  getWindowInfo,
};
