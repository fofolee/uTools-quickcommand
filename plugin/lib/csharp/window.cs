using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Diagnostics;
using System.Web.Script.Serialization;
using System.Collections.Generic;

public class WindowManager
{
  #region Win32 API
  [DllImport("user32.dll")]
  private static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

  [DllImport("user32.dll")]
  private static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);

  [DllImport("user32.dll")]
  private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

  [DllImport("user32.dll")]
  private static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

  [DllImport("user32.dll")]
  private static extern bool SetForegroundWindow(IntPtr hWnd);

  [DllImport("user32.dll")]
  private static extern bool SetLayeredWindowAttributes(IntPtr hwnd, uint crKey, byte bAlpha, uint dwFlags);

  [DllImport("user32.dll")]
  private static extern int GetWindowLong(IntPtr hWnd, int nIndex);

  [DllImport("user32.dll")]
  private static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

  [DllImport("user32.dll")]
  private static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

  [DllImport("user32.dll")]
  private static extern IntPtr GetForegroundWindow();

  [DllImport("user32.dll")]
  private static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

  [DllImport("user32.dll")]
  private static extern bool GetClientRect(IntPtr hWnd, out RECT lpRect);

  [DllImport("user32.dll")]
  private static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

  [DllImport("user32.dll")]
  private static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

  [DllImport("user32.dll")]
  private static extern bool IsWindowVisible(IntPtr hWnd);

  [DllImport("user32.dll")]
  private static extern bool IsIconic(IntPtr hWnd);

  [DllImport("user32.dll")]
  private static extern bool IsZoomed(IntPtr hWnd);

  [DllImport("user32.dll")]
  private static extern bool IsWindow(IntPtr hWnd);
  [DllImport("user32.dll")]
  private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

  [DllImport("user32.dll")]
  private static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

  [StructLayout(LayoutKind.Sequential)]
  private struct RECT
  {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
  }

  private static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
  private static readonly IntPtr HWND_NOTOPMOST = new IntPtr(-2);
  private const uint SWP_NOMOVE = 0x0002;
  private const uint SWP_NOSIZE = 0x0001;
  private const uint WM_CLOSE = 0x0010;
  private const int GWL_STYLE = -16;
  private const int GWL_EXSTYLE = -20;
  private const int WS_BORDER = 0x00800000;
  private const int WS_CAPTION = 0x00C00000;
  private const int WS_CHILD = 0x40000000;
  private const int WS_POPUP = unchecked((int)0x80000000);
  private const int WS_SYSMENU = 0x00080000;
  private const int WS_MINIMIZEBOX = 0x00020000;
  private const int WS_MAXIMIZEBOX = 0x00010000;
  private const int WS_EX_TOPMOST = 0x00000008;
  private const int WS_EX_TRANSPARENT = 0x00000020;
  private const int WS_EX_TOOLWINDOW = 0x00000080;
  private const int WS_EX_LAYERED = 0x00080000;
  private const uint LWA_ALPHA = 0x2;
  private const int SW_HIDE = 0;
  private const int SW_SHOW = 5;
  private const int SW_NORMAL = 1;
  private const int SW_MAXIMIZE = 3;
  private const int SW_MINIMIZE = 6;
  private const int SW_RESTORE = 9;

  private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  #endregion

  public static void Main(string[] args)
  {
    if (args.Length == 0 || args[0] == "-h" || args[0] == "--help")
    {
      ShowHelp();
      return;
    }

    try
    {
      List<IntPtr> targetWindows = GetTargetWindows(args);
      if (targetWindows.Count == 0)
      {
        throw new Exception("未找到目标窗口");
      }

      string type = GetArgumentValue(args, "-type");
      if (type.ToLower() == "info")
      {
        var allWindowInfo = new List<Dictionary<string, object>>();
        foreach (IntPtr windowHandle in targetWindows)
        {
          var windowInfo = GetBasicWindowInfo(windowHandle);
          if (windowInfo != null)
          {
            allWindowInfo.Add(windowInfo);
          }
        }
        var serializer = new JavaScriptSerializer();
        Console.WriteLine(serializer.Serialize(allWindowInfo));
        return;
      }

      IntPtr targetHandle = targetWindows[0];
      Dictionary<string, object> operatedWindow = null;

      switch (type.ToLower())
      {
        case "topmost":
          bool isTopMost = bool.Parse(GetArgumentValue(args, "-value") ?? "true");
          SetWindowPos(targetHandle, isTopMost ? HWND_TOPMOST : HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
          operatedWindow = GetBasicWindowInfo(targetHandle);
          break;

        case "opacity":
          int opacity = int.Parse(GetArgumentValue(args, "-value") ?? "100");
          SetWindowLong(targetHandle, GWL_EXSTYLE, GetWindowLong(targetHandle, GWL_EXSTYLE) | WS_EX_LAYERED);
          SetLayeredWindowAttributes(targetHandle, 0, (byte)(opacity * 2.55), LWA_ALPHA);
          operatedWindow = GetBasicWindowInfo(targetHandle);
          break;

        case "rect":
          string[] rectValues = (GetArgumentValue(args, "-value") ?? "").Split(',');
          if (rectValues.Length == 4)
          {
            int x = int.Parse(rectValues[0]);
            int y = int.Parse(rectValues[1]);
            int width = int.Parse(rectValues[2]);
            int height = int.Parse(rectValues[3]);
            MoveWindow(targetHandle, x, y, width, height, true);
          }
          operatedWindow = GetBasicWindowInfo(targetHandle);
          break;

        case "state":
          string state = GetArgumentValue(args, "-value") ?? "normal";
          int cmdShow = state == "maximize" ? SW_MAXIMIZE :
                      state == "minimize" ? SW_MINIMIZE : SW_NORMAL;
          ShowWindow(targetHandle, cmdShow);
          operatedWindow = GetBasicWindowInfo(targetHandle);
          break;

        case "visible":
          bool visible = bool.Parse(GetArgumentValue(args, "-value") ?? "true");
          ShowWindow(targetHandle, visible ? SW_SHOW : SW_HIDE);
          operatedWindow = GetBasicWindowInfo(targetHandle);
          break;

        case "close":
          PostMessage(targetHandle, WM_CLOSE, IntPtr.Zero, IntPtr.Zero);
          operatedWindow = GetBasicWindowInfo(targetHandle);
          break;

        case "focus":
          if (IsIconic(targetHandle))
          {
            ShowWindow(targetHandle, SW_RESTORE);
          }
          SetForegroundWindow(targetHandle);
          operatedWindow = GetBasicWindowInfo(targetHandle);
          break;

        case "border":
          bool hasBorder = bool.Parse(GetArgumentValue(args, "-value") ?? "true");
          int style = GetWindowLong(targetHandle, GWL_STYLE);
          style = hasBorder ? style | WS_CAPTION : style & ~WS_CAPTION;
          SetWindowLong(targetHandle, GWL_STYLE, style);
          operatedWindow = GetBasicWindowInfo(targetHandle);
          break;

        case "clickthrough":
          bool isTransparent = bool.Parse(GetArgumentValue(args, "-value") ?? "true");
          int exStyle = GetWindowLong(targetHandle, GWL_EXSTYLE);
          exStyle |= WS_EX_LAYERED;
          exStyle = isTransparent ? exStyle | WS_EX_TRANSPARENT : exStyle & ~WS_EX_TRANSPARENT;
          SetWindowLong(targetHandle, GWL_EXSTYLE, exStyle);
          operatedWindow = GetBasicWindowInfo(targetHandle);
          break;

        case "info":
          operatedWindow = GetBasicWindowInfo(targetHandle);
          break;

        default:
          Console.Error.WriteLine("Error: 不支持的操作类型");
          return;
      }

      if (operatedWindow != null)
      {
        var serializer = new JavaScriptSerializer();
        Console.WriteLine(serializer.Serialize(operatedWindow));
      }
    }
    catch (Exception ex)
    {
      Console.Error.WriteLine(string.Format("Error: {0}", ex.Message));
    }
  }

  private static List<IntPtr> GetTargetWindows(string[] args)
  {
    List<IntPtr> targetWindows = new List<IntPtr>();
    string method = GetArgumentValue(args, "-method") ?? "title";
    string value = GetArgumentValue(args, "-window") ?? "";

    switch (method.ToLower())
    {
      case "handle":
        IntPtr handle = new IntPtr(long.Parse(value));
        if (!IsWindow(handle))
        {
          throw new Exception("指定的句柄不是一个有效的窗口句柄");
        }
        targetWindows.Add(handle);
        break;

      case "active":
        targetWindows.Add(GetForegroundWindow());
        break;

      case "process":
        var processes = Process.GetProcessesByName(value);
        foreach (var process in processes)
        {
          if (process.MainWindowHandle != IntPtr.Zero)
          {
            targetWindows.Add(process.MainWindowHandle);
          }
        }
        break;

      case "class":
        EnumWindows((hwnd, param) =>
        {
          if (!IsWindowVisible(hwnd))
          {
            return true;
          }

          StringBuilder className = new StringBuilder(256);
          GetClassName(hwnd, className, className.Capacity);
          string windowClassName = className.ToString();

          if (windowClassName.IndexOf(value, StringComparison.OrdinalIgnoreCase) >= 0)
          {
            targetWindows.Add(hwnd);
          }
          return true;
        }, IntPtr.Zero);
        break;

      case "title":
      default:
        if (!string.IsNullOrEmpty(value))
        {
          EnumWindows((hwnd, param) =>
          {
            StringBuilder title = new StringBuilder(256);
            GetWindowText(hwnd, title, title.Capacity);
            string windowTitle = title.ToString();

            if (!string.IsNullOrEmpty(windowTitle) &&
                          windowTitle.IndexOf(value, StringComparison.OrdinalIgnoreCase) >= 0)
            {
              targetWindows.Add(hwnd);
            }
            return true;
          }, IntPtr.Zero);
        }
        break;
    }

    if (targetWindows.Count == 0)
    {
      throw new Exception("未找到匹配的窗口");
    }

    return targetWindows;
  }

  private static Dictionary<string, object> GetBasicWindowInfo(IntPtr hwnd)
  {
    StringBuilder title = new StringBuilder(256);
    StringBuilder className = new StringBuilder(256);
    GetWindowText(hwnd, title, title.Capacity);
    GetClassName(hwnd, className, className.Capacity);

    // 获取窗口位置和大小
    RECT rect = new RECT();
    GetWindowRect(hwnd, out rect);

    // 获取进程信息
    uint processId = 0;
    GetWindowThreadProcessId(hwnd, out processId);
    string processName = "";
    string processPath = "";
    try
    {
      var process = Process.GetProcessById((int)processId);
      processName = process.ProcessName;
      processPath = process.MainModule.FileName;
    }
    catch { }

    return new Dictionary<string, object>
        {
            { "handle", hwnd.ToInt64() },
            { "title", title.ToString() },
            { "class", className.ToString() },
            { "x", rect.Left },
            { "y", rect.Top },
            { "width", rect.Right - rect.Left },
            { "height", rect.Bottom - rect.Top },
            { "processName", processName },
            { "processPath", processPath }
        };
  }

  private static string GetArgumentValue(string[] args, string key)
  {
    int index = Array.IndexOf(args, key);
    if (index >= 0 && index < args.Length - 1)
    {
      return args[index + 1];
    }
    return null;
  }

  private static void ShowHelp()
  {
    string help = @"
Windows 窗口管理工具使用说明
==========================

基本语法:
window.exe -type <操作类型> [参数...]

操作类型:
--------
1. topmost    - 设置窗口置顶
2. opacity    - 设置窗口透明度
3. rect       - 设置窗口位置和大小
4. state      - 设置窗口状态
5. visible    - 设置窗口可见性
6. close      - 关闭窗口
7. focus      - 设置窗口焦点
8. border     - 设置窗口边框
9. clickthrough - 设置点击穿透
10. info      - 获取窗口信息

通用参数:
--------
-method    窗口查找方式（可选，默认title）
          可选值：
          - title     窗口标题（支持模糊匹配）
          - handle    窗口句柄
          - active    当前活动窗口
          - process   进程名
          - class     窗口类名（支持模糊匹配）

-window    要查找的窗口值（根据method解释）

操作参数说明:
-----------
1. topmost:
   -value    true/false，是否置顶

2. opacity:
   -value    0-100，透明度

3. rect:
   -value    x,y,width,height，窗口位置和大小

4. state:
   -value    normal/maximize/minimize，窗口状态

5. visible:
   -value    true/false，是否可见

6. border:
   -value    true/false，是否显示边框

7. clickthrough:
   -value    true/false，是否点击穿透

使用示例:
--------
1. 设置窗口置顶：
   window.exe -type topmost -window ""记事本"" -value true

2. 设置窗口透明度：
   window.exe -type opacity -window ""记事本"" -value 80

3. 设置窗口位置和大小：
   window.exe -type rect -window ""记事本"" -value ""100,100,800,600""

4. 最大化窗口：
   window.exe -type state -window ""记事本"" -value maximize

5. 隐藏窗口：
   window.exe -type visible -window ""记事本"" -value false

6. 关闭窗口：
   window.exe -type close -window ""记事本""

7. 获取窗口信息：
   window.exe -type info -window ""记事本""

8. 通过进程名查找窗口：
   window.exe -type info -method process -window ""notepad""

9. 通过窗口类名查找：
   window.exe -type info -method class -window ""Chrome""  # 会匹配 Chrome_WidgetWin_1

返回值:
------
1. 均为JSON格式
2. info操作返回所有匹配窗口信息
3. 其他操作返回操作的窗口信息
4. 失败均抛出异常

注意事项:
--------
1. 窗口标题、类名支持模糊匹配，active方式可不提供window参数
2. 只有info操作会返回所有匹配窗口的信息，其他操作只会操作第一个匹配的窗口
";
    Console.WriteLine(help);
  }
}
