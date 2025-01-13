using System;
using System.Windows.Forms;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Drawing;
using System.Collections.Generic;
using System.Linq;

public class AutomationTool
{
    #region Win32 API
    [DllImport("user32.dll")]
    private static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

    [DllImport("user32.dll")]
    private static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);

    [DllImport("user32.dll")]
    private static extern bool PostMessage(IntPtr hWnd, uint Msg, int wParam, int lParam);

    [DllImport("user32.dll")]
    private static extern bool SendMessage(IntPtr hWnd, uint Msg, int wParam, int lParam);

    [DllImport("user32.dll")]
    private static extern bool SendMessage(IntPtr hWnd, uint Msg, int wParam, StringBuilder lParam);

    [DllImport("user32.dll")]
    private static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern IntPtr GetFocus();

    [DllImport("user32.dll")]
    private static extern int EnumChildWindows(IntPtr hWnd, EnumWindowProc lpEnumFunc, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    private static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll")]
    private static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern int GetWindowTextLength(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll")]
    private static extern bool ScreenToClient(IntPtr hWnd, ref POINT lpPoint);

    [DllImport("user32.dll")]
    private static extern bool GetClientRect(IntPtr hWnd, out RECT lpRect);

    private const uint WM_KEYDOWN = 0x0100;
    private const uint WM_KEYUP = 0x0101;
    private const uint WM_CHAR = 0x0102;
    private const uint WM_SETTEXT = 0x000C;
    private const uint WM_LBUTTONDOWN = 0x0201;
    private const uint WM_LBUTTONUP = 0x0202;
    private const uint WM_RBUTTONDOWN = 0x0204;
    private const uint WM_RBUTTONUP = 0x0205;
    private const uint WM_LBUTTONDBLCLK = 0x0203;

    private delegate bool EnumWindowProc(IntPtr hwnd, IntPtr lParam);
    private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [StructLayout(LayoutKind.Sequential)]
    private struct RECT
    {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct POINT
    {
        public int X;
        public int Y;
    }

    [DllImport("user32.dll")]
    private static extern IntPtr GetParent(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern IntPtr GetAncestor(IntPtr hwnd, int flags);

    private const int GA_ROOT = 2;

    // 添加工具栏相关的常量和结构体
    private const uint TB_BUTTONCOUNT = 0x0418;
    private const uint TB_GETBUTTON = 0x0417;
    private const uint TB_GETBUTTONTEXT = 0x042D;
    private const uint TB_GETITEMRECT = 0x041D;

    [StructLayout(LayoutKind.Sequential)]
    private struct TBBUTTON
    {
        public int iBitmap;
        public int idCommand;
        public byte fsState;
        public byte fsStyle;
        public byte bReserved1;
        public byte bReserved2;
        public IntPtr dwData;
        public IntPtr iString;
    }

    // 添加 SendMessage 重载
    [DllImport("user32.dll")]
    private static extern bool SendMessage(IntPtr hWnd, uint Msg, int wParam, ref TBBUTTON lParam);

    [DllImport("user32.dll")]
    private static extern bool SendMessage(IntPtr hWnd, uint Msg, int wParam, ref RECT lParam);
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

        string action = GetArgumentValue(args, "-action");
        string value = GetArgumentValue(args, "-value");
        string window = GetArgumentValue(args, "-window");
        string control = GetArgumentValue(args, "-control");
        string filter = GetArgumentValue(args, "-filter");
        string pos = GetArgumentValue(args, "-pos");
        bool background = HasArgument(args, "-background");

        try
        {
            switch (type.ToLower())
            {
                case "keyboard":
                    HandleKeyboardOperation(args);
                    break;
                case "mouse":
                    HandleMouseOperation(args);
                    break;
                case "inspect":
                    HandleInspectOperation(args);
                    break;
                default:
                    Console.WriteLine("Error: 不支持的操作类型");
                    break;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(string.Format("Error: {0}", ex.Message));
        }
    }

    private static List<IntPtr> FindTargetWindows(string window)
    {
        List<IntPtr> targetWindows = new List<IntPtr>();
        if (string.IsNullOrEmpty(window))
        {
            targetWindows.Add(GetForegroundWindow());
        }
        else
        {
            // 查找所有匹配的窗口
            EnumWindows((hwnd, param) =>
            {
                StringBuilder title = new StringBuilder(256);
                GetWindowText(hwnd, title, title.Capacity);
                string windowTitle = title.ToString();

                if (!string.IsNullOrEmpty(windowTitle) &&
                    windowTitle.IndexOf(window, StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    targetWindows.Add(hwnd);
                }
                return true;
            }, IntPtr.Zero);

            if (targetWindows.Count == 0)
            {
                Console.WriteLine("Error: 未找到匹配的窗口");
                return targetWindows;
            }

            // 如果找到多个窗口，输出所有窗口信息
            if (targetWindows.Count > 1)
            {
                Console.WriteLine("找到 {0} 个匹配窗口:", targetWindows.Count);
                foreach (IntPtr hwnd in targetWindows)
                {
                    StringBuilder title = new StringBuilder(256);
                    GetWindowText(hwnd, title, title.Capacity);
                    Console.WriteLine("0x{0:X} - {1}", hwnd.ToInt64(), title);
                }
            }
        }

        return targetWindows;
    }

    private static void HandleKeyboardOperation(string[] args)
    {
        string window = GetArgumentValue(args, "-window");
        string control = GetArgumentValue(args, "-control");
        string action = GetArgumentValue(args, "-action");
        string value = GetArgumentValue(args, "-value");
        bool background = bool.Parse(GetArgumentValue(args, "-background") ?? "false");

        if (string.IsNullOrEmpty(action))
        {
            Console.WriteLine("Error: keyboard操作需要指定 -action 参数");
            return;
        }

        var targetWindows = FindTargetWindows(window);
        if (targetWindows.Count == 0)
        {
            return;
        }

        foreach (IntPtr hWnd in targetWindows)
        {
            IntPtr targetHandle = hWnd;

            // 如果指定了控件，递归查找控件句柄
            if (!string.IsNullOrEmpty(control))
            {
                IntPtr hControl = FindControl(hWnd, control);
                if (hControl != IntPtr.Zero)
                {
                    targetHandle = hControl;
                }
                else
                {
                    Console.WriteLine(string.Format("Warning: 在窗口 0x{0:X} 中未找到指定控件", hWnd.ToInt64()));
                    continue;
                }
            }

            // 只在非后台操作时激活窗口
            if (!background)
            {
                SetForegroundWindow(hWnd);
                Thread.Sleep(50); // 等待窗口激活
            }

            switch (action.ToLower())
            {
                case "keys":
                    if (string.IsNullOrEmpty(value))
                    {
                        Console.WriteLine("Error: 发送按键需要指定 -value 参数");
                        return;
                    }
                    SendKeys(targetHandle, value);
                    break;

                case "text":
                    if (string.IsNullOrEmpty(value))
                    {
                        Console.WriteLine("Error: 发送文本需要指定 -value 参数");
                        return;
                    }
                    SendText(targetHandle, value);
                    break;

                default:
                    Console.WriteLine("Error: 不支持的keyboard操作类型");
                    break;
            }
        }
    }

    private static void HandleMouseOperation(string[] args)
    {
        string window = GetArgumentValue(args, "-window");
        string control = GetArgumentValue(args, "-control");
        string controlText = GetArgumentValue(args, "-text");
        string action = GetArgumentValue(args, "-action");
        string position = GetArgumentValue(args, "-pos");
        bool background = bool.Parse(GetArgumentValue(args, "-background") ?? "false");

        if (string.IsNullOrEmpty(action))
        {
            Console.WriteLine("Error: mouse操作需要指定 -action 参数");
            return;
        }

        var targetWindows = FindTargetWindows(window);
        if (targetWindows.Count == 0)
        {
            return;
        }

        foreach (IntPtr hWnd in targetWindows)
        {
            IntPtr targetHandle = hWnd;

            // 如果指定了控件类名和文本，查找匹配的控件
            if (!string.IsNullOrEmpty(control) || !string.IsNullOrEmpty(controlText))
            {
                targetHandle = FindControlByTextAndClass(hWnd, controlText, control);
                if (targetHandle == IntPtr.Zero)
                {
                    Console.WriteLine(string.Format("Warning: 在窗口 0x{0:X} 中未找到指定控件", hWnd.ToInt64()));
                    continue;
                }
            }

            // 只在非后台操作时激活窗口
            if (!background)
            {
                SetForegroundWindow(hWnd);
                Thread.Sleep(50);
            }

            // 获取点击坐标
            int x = 0, y = 0;
            if (!string.IsNullOrEmpty(position))
            {
                // 使用指定坐标
                string[] pos = position.Split(',');
                if (pos.Length == 2)
                {
                    x = int.Parse(pos[0]);
                    y = int.Parse(pos[1]);
                }
            }
            else
            {
                // 如果没有指定坐标，点击控件中心
                RECT rect;
                if (GetWindowRect(targetHandle, out rect))
                {
                    x = (rect.Right - rect.Left) / 2;
                    y = (rect.Bottom - rect.Top) / 2;
                }
            }

            int lParam = (y << 16) | (x & 0xFFFF);

            switch (action.ToLower())
            {
                case "click":
                    SendMessage(targetHandle, WM_LBUTTONDOWN, 0, lParam);
                    SendMessage(targetHandle, WM_LBUTTONUP, 0, lParam);
                    break;

                case "rightclick":
                    SendMessage(targetHandle, WM_RBUTTONDOWN, 0, lParam);
                    SendMessage(targetHandle, WM_RBUTTONUP, 0, lParam);
                    break;

                case "doubleclick":
                    SendMessage(targetHandle, WM_LBUTTONDOWN, 0, lParam);
                    SendMessage(targetHandle, WM_LBUTTONUP, 0, lParam);
                    SendMessage(targetHandle, WM_LBUTTONDBLCLK, 0, lParam);
                    SendMessage(targetHandle, WM_LBUTTONUP, 0, lParam);
                    break;

                default:
                    Console.WriteLine("Error: 不支持的mouse操作类型");
                    break;
            }
        }
    }

    private static void SendKeys(IntPtr hWnd, string keys)
    {
        // 解析按键组合
        string[] keyArray = keys.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

        foreach (string keyCombo in keyArray)
        {
            string[] modifiers = keyCombo.Trim().Split('+');
            List<byte> modifierKeys = new List<byte>();
            byte mainKey = 0;

            // 处理每个按键
            for (int i = 0; i < modifiers.Length; i++)
            {
                byte vKey = GetVirtualKeyCode(modifiers[i].Trim());
                if (i < modifiers.Length - 1)
                {
                    modifierKeys.Add(vKey);
                }
                else
                {
                    mainKey = vKey;
                }
            }

            // 按下修饰键
            foreach (byte modifier in modifierKeys)
            {
                PostMessage(hWnd, WM_KEYDOWN, modifier, 0);
            }

            // 按下主键
            if (mainKey > 0)
            {
                PostMessage(hWnd, WM_KEYDOWN, mainKey, 0);
                Thread.Sleep(10);
                PostMessage(hWnd, WM_KEYUP, mainKey, 0);
            }

            // 释放修饰键
            for (int i = modifierKeys.Count - 1; i >= 0; i--)
            {
                PostMessage(hWnd, WM_KEYUP, modifierKeys[i], 0);
            }

            // 如果有多个按键组合，等待一下
            if (keyArray.Length > 1)
            {
                Thread.Sleep(50);
            }
        }
    }

    private static void SendText(IntPtr hWnd, string text)
    {
        StringBuilder sb = new StringBuilder(text);
        SendMessage(hWnd, WM_SETTEXT, 0, sb);
    }

    private static string GetArgumentValue(string[] args, string key)
    {
        for (int i = 0; i < args.Length - 1; i++)
        {
            if (args[i].Equals(key, StringComparison.OrdinalIgnoreCase))
            {
                return args[i + 1];
            }
        }
        return null;
    }

    private static bool HasArgument(string[] args, string key)
    {
        return Array.Exists(args, arg => arg.Equals(key, StringComparison.OrdinalIgnoreCase));
    }

    private static byte GetVirtualKeyCode(string key)
    {
        switch (key.ToLower())
        {
            case "ctrl": return 0x11;
            case "alt": return 0x12;
            case "shift": return 0x10;
            case "win": return 0x5B;
            case "enter": return 0x0D;
            case "tab": return 0x09;
            case "esc": return 0x1B;
            case "space": return 0x20;
            case "backspace": return 0x08;
            case "delete": return 0x2E;
            default:
                if (key.Length == 1)
                {
                    return (byte)key.ToUpper()[0];
                }
                throw new ArgumentException(string.Format("不支持的按键: {0}", key));
        }
    }

    private static IntPtr FindControlRecursive(IntPtr parentHandle, string targetClassName)
    {
        if (string.IsNullOrEmpty(targetClassName))
            return IntPtr.Zero;

        IntPtr foundHandle = IntPtr.Zero;
        List<IntPtr> childHandles = new List<IntPtr>();

        // 枚举所有子窗口
        EnumWindowProc childProc = new EnumWindowProc((handle, param) =>
        {
            // 获取类名
            StringBuilder classNameBuffer = new StringBuilder(256);
            GetClassName(handle, classNameBuffer, classNameBuffer.Capacity);

            // 检查是否匹配
            if (classNameBuffer.ToString().Equals(targetClassName, StringComparison.OrdinalIgnoreCase))
            {
                foundHandle = handle;
                return false; // 找到后停止枚举
            }

            childHandles.Add(handle);
            return true;
        });

        EnumChildWindows(parentHandle, childProc, IntPtr.Zero);

        // 如果在当前层级没找到，递归查找子窗口
        if (foundHandle == IntPtr.Zero)
        {
            foreach (IntPtr childHandle in childHandles)
            {
                foundHandle = FindControlRecursive(childHandle, targetClassName);
                if (foundHandle != IntPtr.Zero)
                    break;
            }
        }

        return foundHandle;
    }

    // 修改 HandleKeyboardOperation 和 HandleMouseOperation 中查找控件的部分
    private static IntPtr FindControl(IntPtr parentHandle, string controlClass)
    {
        // 先尝试直接查找
        IntPtr hControl = FindWindowEx(parentHandle, IntPtr.Zero, controlClass, null);
        if (hControl != IntPtr.Zero)
            return hControl;

        // 如果直接查找失败，进行递归查找
        return FindControlRecursive(parentHandle, controlClass);
    }

    private static IntPtr FindControlByTextAndClass(IntPtr parentHandle, string controlText, string className)
    {
        if (string.IsNullOrEmpty(controlText) && string.IsNullOrEmpty(className))
            return IntPtr.Zero;

        List<IntPtr> matchedControls = new List<IntPtr>();
        Queue<IntPtr> searchQueue = new Queue<IntPtr>();
        searchQueue.Enqueue(parentHandle);

        while (searchQueue.Count > 0)
        {
            IntPtr currentHandle = searchQueue.Dequeue();
            List<IntPtr> children = new List<IntPtr>();

            // 枚举当前层级的子窗口
            EnumWindowProc childProc = new EnumWindowProc((handle, param) =>
            {
                bool match = true;

                // 检查类名（如果指定）
                if (!string.IsNullOrEmpty(className))
                {
                    StringBuilder classNameBuffer = new StringBuilder(256);
                    GetClassName(handle, classNameBuffer, classNameBuffer.Capacity);
                    if (!className.Equals(classNameBuffer.ToString(), StringComparison.OrdinalIgnoreCase))
                    {
                        match = false;
                    }
                }

                // 检查控件文本（如果指定）
                if (match && !string.IsNullOrEmpty(controlText))
                {
                    StringBuilder textBuffer = new StringBuilder(256);
                    GetWindowText(handle, textBuffer, textBuffer.Capacity);
                    string windowText = textBuffer.ToString();
                    if (!windowText.Contains(controlText))
                    {
                        match = false;
                    }
                }

                // 检查控件是否可见
                if (match && !IsWindowVisible(handle))
                {
                    match = false;
                }

                if (match)
                {
                    matchedControls.Add(handle);
                }

                // 将子窗口加入搜索队列
                children.Add(handle);
                return true;
            });

            EnumChildWindows(currentHandle, childProc, IntPtr.Zero);

            // 将所有子窗口加入搜索队列
            foreach (IntPtr child in children)
            {
                searchQueue.Enqueue(child);
            }
        }

        if (matchedControls.Count == 0)
        {
            return IntPtr.Zero;
        }
        else if (matchedControls.Count > 1)
        {
            Console.WriteLine("Warning: 找到多个匹配控件:");
            foreach (IntPtr handle in matchedControls)
            {
                StringBuilder text = new StringBuilder(256);
                GetWindowText(handle, text, text.Capacity);
                StringBuilder classBuffer = new StringBuilder(256);
                GetClassName(handle, classBuffer, classBuffer.Capacity);
                Console.WriteLine(string.Format("0x{0:X} - Class: {1}, Text: {2}",
                    handle.ToInt64(), classBuffer, text));
            }
        }

        return matchedControls[0];
    }

    private static void HandleInspectOperation(string[] args)
    {
        string window = GetArgumentValue(args, "-window");
        string filter = GetArgumentValue(args, "-filter");
        bool background = bool.Parse(GetArgumentValue(args, "-background") ?? "false");

        var targetWindows = FindTargetWindows(window);
        if (targetWindows.Count == 0)
        {
            return;
        }

        // 输出所有匹配窗口的信息
        StringBuilder json = new StringBuilder();
        json.Append("[");
        bool firstWindow = true;

        foreach (IntPtr hWnd in targetWindows)
        {
            // 只在非后台操作时激活窗口
            if (!background)
            {
                SetForegroundWindow(hWnd);
                Thread.Sleep(50);
            }

            if (!firstWindow)
            {
                json.Append(",");
            }
            firstWindow = false;

            json.Append(GetControlsTree(hWnd, filter));
        }

        json.Append("]");
        Console.WriteLine(json.ToString());
    }

    private static string GetControlsTree(IntPtr parentHandle, string filter, int depth = 0)
    {
        if (parentHandle == IntPtr.Zero)
            return "{}";

        StringBuilder json = new StringBuilder();
        json.Append("{");

        // 获取窗口信息
        StringBuilder title = new StringBuilder(256);
        StringBuilder className = new StringBuilder(256);
        GetWindowText(parentHandle, title, title.Capacity);
        GetClassName(parentHandle, className, className.Capacity);

        // 获取窗口位置和大小
        RECT windowRect;
        GetWindowRect(parentHandle, out windowRect);

        bool isVisible = IsWindowVisible(parentHandle);

        // 检查当前节点是否匹配过滤条件
        bool matchFilter = true;
        if (!string.IsNullOrEmpty(filter))
        {
            matchFilter =
                title.ToString().IndexOf(filter, StringComparison.OrdinalIgnoreCase) >= 0 ||
                className.ToString().IndexOf(filter, StringComparison.OrdinalIgnoreCase) >= 0;
        }

        // 添加节点信息
        json.AppendFormat(
            "\"handle\":\"0x{0:X}\",\"class\":\"{1}\",\"text\":\"{2}\",\"visible\":{3},\"location\":{{\"x\":{4},\"y\":{5},\"width\":{6},\"height\":{7}}},\"matched\":{8},\"children\":[",
            parentHandle.ToInt64(),
            className.ToString().Replace("\"", "\\\""),
            title.ToString().Replace("\"", "\\\""),
            isVisible.ToString().ToLower(),
            windowRect.Left,
            windowRect.Top,
            windowRect.Right - windowRect.Left,
            windowRect.Bottom - windowRect.Top,
            matchFilter.ToString().ToLower()
        );

        // 递归获取子控件树
        List<string> childJsons = new List<string>();

        EnumChildWindows(parentHandle, (hwnd, param) =>
        {
            string childJson = GetControlsTree(hwnd, filter, depth + 1);
            if (!string.IsNullOrEmpty(childJson) && childJson != "{}")
            {
                childJsons.Add(childJson);
            }
            return true;
        }, IntPtr.Zero);

        // 添加子节点JSON
        if (childJsons.Count > 0)
        {
            json.Append(string.Join(",", childJsons));
        }

        json.Append("]}");

        return json.ToString();
    }

    private static void ShowHelp()
    {
        string help = @"
Windows 界面自动化工具使用说明
==========================

基本语法:
automation.exe -type <操作类型> [参数...]

操作类型:
--------
1. keyboard - 键盘操作
2. mouse   - 鼠标操作
3. inspect - 获取控件树

通用参数:
--------
-window    窗口标题或句柄（支持模糊匹配）
-control   控件类名
-background 后台操作，不激活窗口，默认激活

键盘操作参数:
-----------
-action    操作类型：keys（按键）或text（文本）
-value     要发送的按键或文本内容

鼠标操作参数:
-----------
-action    操作类型：click（单击）、doubleclick（双击）、rightclick（右键）
-text      控件文本
-pos       点击坐标（x,y）

控件树参数:
---------
-filter    过滤条件（控件类名或文本）

使用示例:
--------
1. 发送按键到指定窗口：
   automation.exe -type keyboard -action keys -window ""记事本"" -value ""ctrl+a""

2. 发送文本到指定控件：
   automation.exe -type keyboard -action text -window ""记事本"" -control ""Edit"" -value ""Hello World""

3. 点击指定控件：
   automation.exe -type mouse -action click -window ""记事本"" -control ""Button"" -text ""确定""

4. 后台发送文本：
   automation.exe -type keyboard -action text -window ""记事本"" -value ""Hello"" -background

5. 获取窗口控件树：
   automation.exe -type inspect -window ""记事本"" -filter ""button""

注意事项:
--------
1. 窗口标题支持模糊匹配
2. 控件类名需要完全匹配
3. 后台操作可能会影响某些程序的响应
4. 建议先用inspect获取正确的控件信息再进行操作
";
        Console.WriteLine(help);
    }
}
