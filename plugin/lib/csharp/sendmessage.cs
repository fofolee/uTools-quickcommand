using System;
using System.Windows.Forms;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Drawing;
using System.Collections.Generic;
using System.Linq;
using System.Web.Script.Serialization;

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
  private static extern bool IsWindow(IntPtr hWnd);

  [DllImport("user32.dll")]
  private static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

  [DllImport("user32.dll")]
  private static extern bool ScreenToClient(IntPtr hWnd, ref POINT lpPoint);

  [DllImport("user32.dll")]
  private static extern bool GetClientRect(IntPtr hWnd, out RECT lpRect);

  private const int WM_KEYDOWN = 0x0100;
  private const int WM_KEYUP = 0x0101;
  private const int WM_CHAR = 0x0102;
  private const int WM_SETTEXT = 0x000C;
  private const int WM_LBUTTONDOWN = 0x0201;
  private const int WM_LBUTTONUP = 0x0202;
  private const int WM_RBUTTONDOWN = 0x0204;
  private const int WM_RBUTTONUP = 0x0205;
  private const int WM_LBUTTONDBLCLK = 0x0203;

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

  [DllImport("user32.dll")]
  private static extern uint MapVirtualKey(uint uCode, uint uMapType);

  [DllImport("user32.dll")]
  private static extern int GetWindowThreadProcessId(IntPtr hWnd, out int lpdwProcessId);

  private const uint MAPVK_VK_TO_VSC = 0x00;
  private const uint MAPVK_VSC_TO_VK = 0x01;
  private const uint MAPVK_VK_TO_CHAR = 0x02;
  private const uint MAPVK_VSC_TO_VK_EX = 0x03;
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
      List<IntPtr> targetWindows = FindTargetWindows(args);
      if (targetWindows.Count == 0)
      {
        throw new Exception("未找到目标窗口");
      }

      string type = GetArgumentValue(args, "-type");
      IntPtr targetHandle = targetWindows[0];  // 总是使用第一个窗口
      Dictionary<string, object> operatedWindow = null;

      switch (type.ToLower())
      {
        case "list":
          // list 操作只获取第一个匹配窗口的控件树
          string filter = GetArgumentValue(args, "-filter");
          bool background = bool.Parse(GetArgumentValue(args, "-background") ?? "false");

          // 只在非后台操作时激活窗口
          if (!background)
          {
            SetForegroundWindow(targetHandle);
            Thread.Sleep(50);
          }

          string treeJson = GetControlsTree(targetHandle, filter);
          if (!string.IsNullOrEmpty(treeJson))
          {
            Console.WriteLine("[" + treeJson + "]");
          }
          return;  // 直接返回，不输出窗口信息

        case "keyboard":
          HandleKeyboardOperation(targetHandle, args);
          Console.WriteLine("true");
          break;

        case "mouse":
          HandleMouseOperation(targetHandle, args);
          Console.WriteLine("true");
          break;

        default:
          throw new Exception("不支持的操作类型");
      }
    }
    catch (Exception ex)
    {
      Console.Error.WriteLine(string.Format("Error: {0}", ex.Message));
    }
  }

  private static List<IntPtr> FindTargetWindows(string[] args)
  {
    List<IntPtr> targetWindows = new List<IntPtr>();
    string method = GetArgumentValue(args, "-method") ?? "title";
    string value = GetArgumentValue(args, "-window") ?? "";

    // 如果是active方法，直接返回当前活动窗口
    if (method.ToLower() == "active")
    {
      targetWindows.Add(GetForegroundWindow());
      return targetWindows;
    }

    // 如果是handle方法，直接返回指定句柄
    if (method.ToLower() == "handle")
    {
      IntPtr handle = new IntPtr(long.Parse(value));
      if (!IsWindow(handle))
      {
        throw new Exception("指定的句柄不是一个有效的窗口句柄");
      }
      targetWindows.Add(handle);
      return targetWindows;
    }

    // 如果没有指定窗口值，返回空列表
    if (string.IsNullOrEmpty(value))
    {
      return targetWindows;
    }

    switch (method.ToLower())
    {
      case "process":
        // 通过进程名查找
        var processes = System.Diagnostics.Process.GetProcessesByName(value);
        foreach (var process in processes)
        {
          if (process.MainWindowHandle != IntPtr.Zero)
          {
            targetWindows.Add(process.MainWindowHandle);
          }
        }
        break;

      case "class":
        // 通过窗口类名查找
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
        // 通过窗口标题查找（支持模糊匹配）
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
        break;
    }

    if (targetWindows.Count == 0)
    {
      Console.WriteLine(string.Format("Error: 未找到匹配的窗口 (method={0}, value={1})", method, value));
    }

    return targetWindows;
  }

  private static void HandleKeyboardOperation(IntPtr targetHandle, string[] args)
  {
    string control = GetArgumentValue(args, "-control");
    string action = GetArgumentValue(args, "-action");
    string value = GetArgumentValue(args, "-value");
    bool background = bool.Parse(GetArgumentValue(args, "-background") ?? "false");

    // 如果指定了控件，递归查找控件句柄
    IntPtr controlHandle = IntPtr.Zero;
    if (!string.IsNullOrEmpty(control))
    {
      StringBuilder windowTitle = new StringBuilder(256);
      GetWindowText(targetHandle, windowTitle, windowTitle.Capacity);

      controlHandle = FindControl(targetHandle, control);
      if (controlHandle == IntPtr.Zero)
      {
        throw new Exception(string.Format("在窗口中未找到指定控件 (窗口句柄={0}, 标题=\"{1}\", 控件类名=\"{2}\")",
            targetHandle.ToInt64(), windowTitle.ToString(), control));
      }
      targetHandle = controlHandle;
    }

    // 只在非后台操作时激活窗口
    if (!background)
    {
      SetForegroundWindow(targetHandle);
      Thread.Sleep(50);
    }

    switch (action.ToLower())
    {
      case "keys":
        if (string.IsNullOrEmpty(value))
        {
          throw new Exception("发送按键需要指定 -value 参数");
        }
        SendKeys(targetHandle, value);
        break;

      case "text":
        if (string.IsNullOrEmpty(value))
        {
          throw new Exception("发送文本需要指定 -value 参数");
        }
        SendText(targetHandle, value);
        break;

      default:
        throw new Exception("不支持的keyboard操作类型");
    }

    // 返回操作结果
    return;
  }

  private static void HandleMouseOperation(IntPtr targetHandle, string[] args)
  {
    string control = GetArgumentValue(args, "-control");
    string controlText = GetArgumentValue(args, "-text");
    string action = GetArgumentValue(args, "-action");
    string position = GetArgumentValue(args, "-pos");
    bool background = bool.Parse(GetArgumentValue(args, "-background") ?? "false");

    if (string.IsNullOrEmpty(action))
    {
      throw new Exception("mouse操作需要指定 -action 参数");
    }

    // 如果指定了控件类名和文本，查找匹配的控件
    IntPtr controlHandle = IntPtr.Zero;
    if (!string.IsNullOrEmpty(control) || !string.IsNullOrEmpty(controlText))
    {
      StringBuilder windowTitle = new StringBuilder(256);
      GetWindowText(targetHandle, windowTitle, windowTitle.Capacity);

      controlHandle = FindControlByTextAndClass(targetHandle, controlText, control);
      if (controlHandle == IntPtr.Zero)
      {
        throw new Exception(string.Format("在窗口中未找到指定控件 (窗口句柄={0}, 标题=\"{1}\", 控件类名=\"{2}\", 控件文本=\"{3}\")",
            targetHandle.ToInt64(), windowTitle.ToString(), control ?? "", controlText ?? ""));
      }
      targetHandle = controlHandle;
    }

    // 只在非后台操作时激活窗口
    if (!background)
    {
      SetForegroundWindow(targetHandle);
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

    // 返回操作结果
    return;
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
        // 获取扫描码
        uint scanCode = MapVirtualKey((uint)modifier, MAPVK_VK_TO_VSC);

        // 构造 lParam
        int lParamDown = 0x00000001 | // repeat count = 1
                       ((int)scanCode << 16) | // scan code
                       (0x1 << 24);  // extended key for modifiers

        PostMessage(hWnd, WM_KEYDOWN, modifier, lParamDown);
        Thread.Sleep(10); // 短暂延迟确保修饰键被正确识别
      }

      // 发送主键
      if (mainKey > 0)
      {
        // 获取主键的扫描码
        uint scanCode = MapVirtualKey((uint)mainKey, MAPVK_VK_TO_VSC);

        // 构造主键的 lParam
        int lParamDown = 0x00000001 | // repeat count = 1
                       ((int)scanCode << 16); // scan code

        int lParamUp = 0x00000001 | // repeat count = 1
                      ((int)scanCode << 16) | // scan code
                      (0xC0 << 24);  // key up + previous key state

        // 发送按键按下
        PostMessage(hWnd, WM_KEYDOWN, mainKey, lParamDown);
        Thread.Sleep(10); // 短暂延迟

        // 发送按键释放
        PostMessage(hWnd, WM_KEYUP, mainKey, lParamUp);
        Thread.Sleep(10); // 短暂延迟
      }

      // 释放修饰键（反序释放）
      for (int i = modifierKeys.Count - 1; i >= 0; i--)
      {
        byte modifier = modifierKeys[i];
        uint scanCode = MapVirtualKey((uint)modifier, MAPVK_VK_TO_VSC);

        // 构造释放修饰键的 lParam
        int lParamUp = 0x00000001 | // repeat count = 1
                      ((int)scanCode << 16) | // scan code
                      (0xC1 << 24);  // extended key + key up + previous key state

        PostMessage(hWnd, WM_KEYUP, modifier, lParamUp);
        Thread.Sleep(10); // 短暂延迟
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

  private static byte GetVirtualKeyCode(string key)
  {
    switch (key.ToUpper())
    {
      // 修饰键
      case "CTRL":
      case "^": return 0x11;    // VK_CONTROL
      case "ALT":
      case "%": return 0x12;    // VK_MENU
      case "SHIFT": return 0x10;    // VK_SHIFT

      // 特殊按键
      case "{BACKSPACE}":
      case "{BS}":
      case "{BKSP}": return 0x08;  // VK_BACK
      case "{BREAK}": return 0x03;  // VK_CANCEL
      case "{CAPSLOCK}": return 0x14;  // VK_CAPITAL
      case "{DELETE}":
      case "{DEL}": return 0x2E;  // VK_DELETE
      case "{DOWN}": return 0x28;  // VK_DOWN
      case "{END}": return 0x23;  // VK_END
      case "{ENTER}":
      case "{RETURN}": return 0x0D;  // VK_RETURN
      case "{ESC}": return 0x1B;  // VK_ESCAPE
      case "{HELP}": return 0x2F;  // VK_HELP
      case "{HOME}": return 0x24;  // VK_HOME
      case "{INSERT}":
      case "{INS}": return 0x2D;  // VK_INSERT
      case "{LEFT}": return 0x25;  // VK_LEFT
      case "{NUMLOCK}": return 0x90;  // VK_NUMLOCK
      case "{PGDN}": return 0x22;  // VK_NEXT
      case "{PGUP}": return 0x21;  // VK_PRIOR
      case "{PRTSC}": return 0x2C;  // VK_SNAPSHOT
      case "{RIGHT}": return 0x27;  // VK_RIGHT
      case "{SCROLLLOCK}": return 0x91;  // VK_SCROLL
      case "{TAB}": return 0x09;  // VK_TAB
      case "{UP}": return 0x26;  // VK_UP

      // 功能键 F1-F16
      case "{F1}": return 0x70;
      case "{F2}": return 0x71;
      case "{F3}": return 0x72;
      case "{F4}": return 0x73;
      case "{F5}": return 0x74;
      case "{F6}": return 0x75;
      case "{F7}": return 0x76;
      case "{F8}": return 0x77;
      case "{F9}": return 0x78;
      case "{F10}": return 0x79;
      case "{F11}": return 0x7A;
      case "{F12}": return 0x7B;

      // 数字键盘
      case "{ADD}": return 0x6B;  // VK_ADD
      case "{SUBTRACT}": return 0x6D;  // VK_SUBTRACT
      case "{MULTIPLY}": return 0x6A;  // VK_MULTIPLY
      case "{DIVIDE}": return 0x6F;  // VK_DIVIDE
      case "{NUMPAD0}": return 0x60;  // VK_NUMPAD0
      case "{NUMPAD1}": return 0x61;
      case "{NUMPAD2}": return 0x62;
      case "{NUMPAD3}": return 0x63;
      case "{NUMPAD4}": return 0x64;
      case "{NUMPAD5}": return 0x65;
      case "{NUMPAD6}": return 0x66;
      case "{NUMPAD7}": return 0x67;
      case "{NUMPAD8}": return 0x68;
      case "{NUMPAD9}": return 0x69;

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

    // 添加节点信息 - 将句柄改为十进制格式
    json.AppendFormat(
        "\"handle\":\"{0}\",\"class\":\"{1}\",\"text\":\"{2}\",\"visible\":{3},\"location\":{{\"x\":{4},\"y\":{5},\"width\":{6},\"height\":{7}}},\"matched\":{8},\"children\":[",
        parentHandle.ToInt64(),  // 直接使用十进制格式
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
sendmessage.exe -type <操作类型> [参数...]

操作类型:
--------
1. keyboard - 键盘操作
2. mouse   - 鼠标操作
3. list - 获取控件树

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
   sendmessage.exe -type keyboard -action keys -window ""记事本"" -value ""ctrl+a""

2. 发送文本到指定控件：
   sendmessage.exe -type keyboard -action text -window ""记事本"" -control ""Edit"" -value ""Hello World""

3. 点击指定控件：
   sendmessage.exe -type mouse -action click -window ""记事本"" -control ""Button"" -text ""确定""

4. 后台发送文本：
   sendmessage.exe -type keyboard -action text -window ""记事本"" -value ""Hello"" -background

5. 获取窗口控件树：
   sendmessage.exe -type list -window ""记事本"" -filter ""button""

6. 使用句柄查找窗口：
   sendmessage.exe -type keyboard -method handle -window ""0x12345"" -value ""Hello""

7. 操作当前活动窗口：
   sendmessage.exe -type keyboard -method active -value ""ctrl+s""

8. 通过进程名查找窗口：
   sendmessage.exe -type keyboard -method process -window ""notepad"" -value ""Hello""

9. 通过窗口类名查找：
   sendmessage.exe -type keyboard -method class -window ""Chrome"" -value ""Hello""  # 会匹配 Chrome_WidgetWin_1
   sendmessage.exe -type keyboard -method class -window ""Chrome_WidgetWin_1"" -value ""Hello""  # 精确匹配

返回值:
------
1. 均为JSON格式
2. list操作返回控件树信息
3. 其他操作返回操作的控件信息及其所在窗口信息
4. 失败均抛出异常

注意事项:
--------
1. 窗口标题、类名支持模糊匹配，active方式可不提供window参数
2. 所有操作都只会处理第一个匹配的窗口
";
    Console.WriteLine(help);
  }
}
