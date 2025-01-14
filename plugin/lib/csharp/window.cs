using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Diagnostics;
using System.Web.Script.Serialization;

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

        string type = GetArgumentValue(args, "-type");
        if (string.IsNullOrEmpty(type))
        {
            Console.Error.WriteLine("Error: 必须指定操作类型 (-type)");
            return;
        }

        try
        {
            IntPtr hwnd = GetWindowHandle(args);
            if (hwnd == IntPtr.Zero)
            {
                Console.Error.WriteLine("Error: 未找到目标窗口");
                return;
            }

            switch (type.ToLower())
            {
                case "topmost":
                    bool isTopMost = bool.Parse(GetArgumentValue(args, "-value") ?? "true");
                    SetWindowPos(hwnd, isTopMost ? HWND_TOPMOST : HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
                    break;

                case "opacity":
                    int opacity = int.Parse(GetArgumentValue(args, "-value") ?? "100");
                    SetWindowLong(hwnd, GWL_EXSTYLE, GetWindowLong(hwnd, GWL_EXSTYLE) | WS_EX_LAYERED);
                    SetLayeredWindowAttributes(hwnd, 0, (byte)(opacity * 2.55), LWA_ALPHA);
                    break;

                case "rect":
                    string[] rectValues = (GetArgumentValue(args, "-value") ?? "").Split(',');
                    if (rectValues.Length == 4)
                    {
                        int x = int.Parse(rectValues[0]);
                        int y = int.Parse(rectValues[1]);
                        int width = int.Parse(rectValues[2]);
                        int height = int.Parse(rectValues[3]);
                        MoveWindow(hwnd, x, y, width, height, true);
                    }
                    break;

                case "state":
                    string state = GetArgumentValue(args, "-value") ?? "normal";
                    int cmdShow = state == "maximize" ? SW_MAXIMIZE :
                                state == "minimize" ? SW_MINIMIZE : SW_NORMAL;
                    ShowWindow(hwnd, cmdShow);
                    break;

                case "visible":
                    bool visible = bool.Parse(GetArgumentValue(args, "-value") ?? "true");
                    ShowWindow(hwnd, visible ? SW_SHOW : SW_HIDE);
                    break;

                case "close":
                    PostMessage(hwnd, WM_CLOSE, IntPtr.Zero, IntPtr.Zero);
                    break;

                case "focus":
                    if (IsIconic(hwnd))
                    {
                        ShowWindow(hwnd, SW_RESTORE);
                    }
                    SetForegroundWindow(hwnd);
                    break;

                case "border":
                    bool hasBorder = bool.Parse(GetArgumentValue(args, "-value") ?? "true");
                    int style = GetWindowLong(hwnd, GWL_STYLE);
                    style = hasBorder ? style | WS_CAPTION : style & ~WS_CAPTION;
                    SetWindowLong(hwnd, GWL_STYLE, style);
                    break;

                case "clickthrough":
                    bool isTransparent = bool.Parse(GetArgumentValue(args, "-value") ?? "true");
                    int exStyle = GetWindowLong(hwnd, GWL_EXSTYLE);
                    exStyle |= WS_EX_LAYERED;
                    exStyle = isTransparent ? exStyle | WS_EX_TRANSPARENT : exStyle & ~WS_EX_TRANSPARENT;
                    SetWindowLong(hwnd, GWL_EXSTYLE, exStyle);
                    break;

                case "info":
                    GetWindowInfo(hwnd);
                    break;

                default:
                    Console.Error.WriteLine("Error: 不支持的操作类型");
                    break;
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(string.Format("Error: {0}", ex.Message));
        }
    }

    private static IntPtr GetWindowHandle(string[] args)
    {
        string method = GetArgumentValue(args, "-method") ?? "title";
        string value = GetArgumentValue(args, "-window") ?? "";

        switch (method.ToLower())
        {
            case "handle":
                return new IntPtr(long.Parse(value));
            case "active":
                return GetForegroundWindow();
            default: // title
                if (string.IsNullOrEmpty(value))
                {
                    return IntPtr.Zero;
                }

                IntPtr foundWindow = IntPtr.Zero;
                EnumWindows((hwnd, param) =>
                {
                    StringBuilder title = new StringBuilder(256);
                    GetWindowText(hwnd, title, title.Capacity);
                    string windowTitle = title.ToString();

                    if (!string.IsNullOrEmpty(windowTitle) &&
                        windowTitle.IndexOf(value, StringComparison.OrdinalIgnoreCase) >= 0)
                    {
                        foundWindow = hwnd;
                        return false; // 找到后停止枚举
                    }
                    return true;
                }, IntPtr.Zero);

                return foundWindow;
        }
    }

    private static void GetWindowInfo(IntPtr hwnd)
    {
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
        try
        {
            Process process = Process.GetProcessById((int)processId);
            processName = process.ProcessName;

            var startInfo = new ProcessStartInfo
            {
                FileName = "wmic",
                Arguments = string.Format("process where ProcessId={0} get ExecutablePath /value", processId),
                UseShellExecute = false,
                RedirectStandardOutput = true,
                CreateNoWindow = true
            };
            using (var proc = Process.Start(startInfo))
            {
                string output = proc.StandardOutput.ReadToEnd();
                if (!string.IsNullOrEmpty(output))
                {
                    string[] lines = output.Split(new[] { Environment.NewLine }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (string line in lines)
                    {
                        if (line.StartsWith("ExecutablePath="))
                        {
                            processPath = line.Substring("ExecutablePath=".Length);
                            break;
                        }
                    }
                }
            }
        }
        catch { }

        int style = GetWindowLong(hwnd, GWL_STYLE);
        int exStyle = GetWindowLong(hwnd, GWL_EXSTYLE);

        var data = new
        {
            handle = hwnd.ToInt64(),
            processId = processId,
            process = new
            {
                name = processName,
                path = processPath
            },
            title = titleText.ToString(),
            className = className.ToString(),
            window = new
            {
                x = windowRect.Left,
                y = windowRect.Top,
                width = windowRect.Right - windowRect.Left,
                height = windowRect.Bottom - windowRect.Top
            },
            client = new
            {
                width = clientRect.Right - clientRect.Left,
                height = clientRect.Bottom - clientRect.Top
            },
            state = new
            {
                visible = IsWindowVisible(hwnd),
                minimized = IsIconic(hwnd),
                maximized = IsZoomed(hwnd),
                focused = GetForegroundWindow() == hwnd
            },
            style = new
            {
                border = (style & WS_BORDER) != 0,
                caption = (style & WS_CAPTION) != 0,
                child = (style & WS_CHILD) != 0,
                popup = (style & WS_POPUP) != 0,
                sysmenu = (style & WS_SYSMENU) != 0,
                minimizeBox = (style & WS_MINIMIZEBOX) != 0,
                maximizeBox = (style & WS_MAXIMIZEBOX) != 0
            },
            exStyle = new
            {
                topmost = (exStyle & WS_EX_TOPMOST) != 0,
                transparent = (exStyle & WS_EX_TRANSPARENT) != 0,
                toolWindow = (exStyle & WS_EX_TOOLWINDOW) != 0,
                layered = (exStyle & WS_EX_LAYERED) != 0
            }
        };

        var serializer = new JavaScriptSerializer();
        Console.WriteLine(serializer.Serialize(data));
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
          可选值：title, handle, active

-window    窗口标题或句柄
          示例：-window ""记事本""

-value     操作值，根据不同操作类型有不同含义

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

返回值:
------
1. info操作返回JSON格式的窗口信息
2. 其他操作无返回值，执行失败时输出错误信息

注意事项:
--------
1. 窗口标题支持模糊匹配
2. handle方式查找窗口时需要提供正确的窗口句柄
3. active方式不需要提供window参数，直接操作当前活动窗口
4. 某些操作可能需要管理员权限
";
        Console.WriteLine(help);
    }
}
