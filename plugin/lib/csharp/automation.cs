using System;
using System.Text;
using System.Runtime.InteropServices;
using System.Windows.Automation;
using System.Windows.Automation.Text;
using System.Windows;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Linq;
using System.Threading;
using System.Windows.Forms;
using System.Drawing;
using System.Diagnostics;

public class AutomationManager
{
  // UIA Control Type IDs
  private static class UIA_ControlTypeIds
  {
    public const int Window = 50032;
  }

  // 用于缓存找到的元素
  private static Dictionary<string, AutomationElement> elementCache = new Dictionary<string, AutomationElement>();

  [DllImport("user32.dll")]
  private static extern IntPtr GetForegroundWindow();

  [StructLayout(LayoutKind.Sequential)]
  private struct Point
  {
    public int X;
    public int Y;

    public override bool Equals(object obj)
    {
      if (!(obj is Point)) return false;
      Point other = (Point)obj;
      return X == other.X && Y == other.Y;
    }

    public static bool operator ==(Point a, Point b)
    {
      return a.Equals(b);
    }

    public static bool operator !=(Point a, Point b)
    {
      return !a.Equals(b);
    }

    public override int GetHashCode()
    {
      return X.GetHashCode() ^ Y.GetHashCode();
    }

    public System.Windows.Point ToWindowsPoint()
    {
      return new System.Windows.Point(X, Y);
    }
  }

  [DllImport("user32.dll")]
  [return: MarshalAs(UnmanagedType.Bool)]
  private static extern bool GetCursorPos(out Point lpPoint);

  [DllImport("user32.dll")]
  private static extern IntPtr WindowFromPoint(Point point);

  [DllImport("user32.dll")]
  static extern int GetWindowLong(IntPtr hwnd, int index);

  [DllImport("user32.dll")]
  static extern int SetWindowLong(IntPtr hwnd, int index, int newStyle);

  [DllImport("user32.dll")]
  static extern bool IsWindow(IntPtr hWnd);

  [DllImport("user32.dll")]
  private static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

  [DllImport("user32.dll")]
  private static extern bool IsWindowVisible(IntPtr hWnd);

  private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

  private const int GWL_EXSTYLE = -20;
  private const int WS_EX_TRANSPARENT = 0x20;
  private const int WS_EX_LAYERED = 0x80000;
  private const int WS_EX_TOOLWINDOW = 0x80;
  private const int WS_EX_NOACTIVATE = 0x08000000;
  private const int HWND_TOPMOST = -1;

  [DllImport("user32.dll")]
  static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

  [DllImport("user32.dll")]
  private static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

  [DllImport("user32.dll", CharSet = CharSet.Auto)]
  private static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

  [DllImport("user32.dll", CharSet = CharSet.Auto)]
  private static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

  [DllImport("user32.dll")]
  private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

  [DllImport("user32.dll")]
  private static extern bool EnableWindow(IntPtr hWnd, bool bEnable);

  [StructLayout(LayoutKind.Sequential)]
  private struct RECT
  {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
  }

  [DllImport("user32.dll")]
  [return: MarshalAs(UnmanagedType.Bool)]
  private static extern bool GetWindowRect(IntPtr hWnd, ref RECT lpRect);

  [DllImport("user32.dll")]
  private static extern bool SetCursorPos(int x, int y);

  [DllImport("user32.dll")]
  private static extern void mouse_event(uint dwFlags, int dx, int dy, uint dwData, int dwExtraInfo);

  private const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
  private const uint MOUSEEVENTF_LEFTUP = 0x0004;

  // 添加静态字段
  private static System.Windows.Forms.Timer mouseTimer;
  private static Form overlayForm;
  private static Form previewForm;
  private static AutomationElement lastElement;
  private static Point lastCursorPos;
  private static bool completed;

  private static CacheRequest CreateCacheRequest()
  {
    var cacheRequest = new CacheRequest();
    cacheRequest.Add(AutomationElement.NameProperty);
    cacheRequest.Add(AutomationElement.ClassNameProperty);
    cacheRequest.Add(AutomationElement.ControlTypeProperty);
    cacheRequest.Add(AutomationElement.BoundingRectangleProperty);
    cacheRequest.Add(AutomationElement.IsOffscreenProperty);
    cacheRequest.Add(AutomationElement.IsEnabledProperty);
    cacheRequest.TreeScope = TreeScope.Element | TreeScope.Children | TreeScope.Descendants;
    return cacheRequest;
  }

  private static AutomationElement GetTaskbarElement()
  {
    IntPtr taskbarHandle = FindWindow("Shell_TrayWnd", null);
    if (taskbarHandle != IntPtr.Zero)
    {
      return AutomationElement.FromHandle(taskbarHandle);
    }
    return null;
  }

  private static List<AutomationElement> GetTaskbarChildren(AutomationElement taskbarElement)
  {
    var children = new List<AutomationElement>();
    if (taskbarElement == null) return children;

    try
    {
      var cacheRequest = CreateCacheRequest();
      cacheRequest.Push();
      try
      {
        var conditions = new AndCondition(
            new PropertyCondition(AutomationElement.IsOffscreenProperty, false),
            new PropertyCondition(AutomationElement.IsEnabledProperty, true),
            new PropertyCondition(AutomationElement.IsContentElementProperty, true)
        );

        var taskbarChildren = taskbarElement.FindAll(TreeScope.Children | TreeScope.Descendants, conditions);
        foreach (AutomationElement child in taskbarChildren)
        {
          children.Add(child);
        }
      }
      finally
      {
        cacheRequest.Pop();
      }
    }
    catch (Exception ex)
    {
      Console.Error.WriteLine(string.Format("Error: {0}", ex.Message));
    }

    return children;
  }

  private static void InspectElementByPosition(string position)
  {
    Point cursorPos;
    if (string.IsNullOrEmpty(position))
    {
      // 获取当前鼠标位置
      GetCursorPos(out cursorPos);
    }
    else
    {
      // 解析传入的坐标
      string[] coords = position.Split(',');
      cursorPos = new Point
      {
        X = int.Parse(coords[0]),
        Y = int.Parse(coords[1])
      };
    }

    var element = AutomationElement.FromPoint(cursorPos.ToWindowsPoint());
    if (element != null)
    {
      InspectElementInfo(element, cursorPos);
      return;
    }
    throw new Exception("在指定坐标未找到元素");
  }

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
      switch (type.ToLower())
      {
        case "inspect":
          string position = GetArgumentValue(args, "-position");
          if (position != null)  // 参数存在（一定会有值，可能是空字符串）
          {
            InspectElementByPosition(position);
          }
          else  // 参数不存在
          {
            InspectElement(args);
          }
          break;

        case "click":
          ClickElement(GetTargetElement(args));
          break;

        case "setvalue":
          string value = GetArgumentValue(args, "-value");
          SetElementValue(GetTargetElement(args), value);
          string sendenter = GetArgumentValue(args, "-sendenter");
          if (sendenter != null)
          {
            System.Windows.Forms.SendKeys.SendWait("{ENTER}");
          }
          break;

        case "getvalue":
          GetElementValue(GetTargetElement(args));
          break;

        case "select":
          string item = GetArgumentValue(args, "-item");
          SelectItem(GetTargetElement(args), item);
          break;

        case "expand":
          string expandStr = GetArgumentValue(args, "-expand");
          bool expand = false;
          if (!string.IsNullOrEmpty(expandStr))
          {
            expand = expandStr.ToLower() == "true";
          }
          ExpandElement(GetTargetElement(args), expand);
          break;

        case "scroll":
          string direction = GetArgumentValue(args, "-direction");
          if (string.IsNullOrEmpty(direction))
          {
            direction = "vertical";
          }
          string amountStr = GetArgumentValue(args, "-amount");
          double amount = 0;
          if (!string.IsNullOrEmpty(amountStr))
          {
            amount = double.Parse(amountStr);
          }
          ScrollElement(GetTargetElement(args), direction, amount);
          break;

        case "wait":
          string timeoutStr = GetArgumentValue(args, "-timeout");
          int timeout = 30;
          if (!string.IsNullOrEmpty(timeoutStr))
          {
            timeout = int.Parse(timeoutStr);
          }
          WaitForElement(args, timeout);
          break;

        case "focus":
          SetFocus(GetTargetElement(args));
          break;

        case "highlight":
          string durationStr = GetArgumentValue(args, "-duration");
          int duration = 2;
          if (!string.IsNullOrEmpty(durationStr))
          {
            duration = int.Parse(durationStr);
          }
          HighlightElement(GetTargetElement(args), duration);
          break;

        case "sendkeys":
          string keys = GetArgumentValue(args, "-keys");
          SendKeys(GetTargetElement(args), keys);
          break;

        case "enable":
          bool enable = GetArgumentValue(args, "-enable") == "true";
          EnableElement(GetTargetElement(args), enable);
          break;

        default:
          throw new Exception(string.Format("不支持的操作类型: {0}", type));
      }
    }
    catch (Exception ex)
    {
      Console.Error.WriteLine(string.Format("Error: {0}", ex.Message));
      Environment.Exit(1);
    }
  }

  private static AutomationElement GetTargetElement(string[] args)
  {
    // 获取起始窗口
    AutomationElement root;
    try
    {
      List<IntPtr> targetWindows = GetTargetWindows(args);
      if (targetWindows.Count == 0)
      {
        throw new Exception("未找到目标窗口");
      }

      // 总是使用第一个窗口
      IntPtr handle = targetWindows[0];

      root = AutomationElement.FromHandle(handle);
    }
    catch
    {
      throw new Exception("无法获取指定的窗口");
    }

    if (root == null)
    {
      throw new Exception("无法获取指定的窗口");
    }

    // 通过 XPath 查找（优先）
    string xpath = GetArgumentValue(args, "-xpath");
    if (!string.IsNullOrEmpty(xpath))
    {
      var element = FindElementByXPath(xpath, root);
      if (element != null) return element;
      throw new Exception(string.Format("找不到指定的XPath: {0}", xpath));
    }

    // 通过 AutomationId 查找
    string id = GetArgumentValue(args, "-id");
    if (!string.IsNullOrEmpty(id))
    {
      var element = root.FindFirst(TreeScope.Subtree,
          new PropertyCondition(AutomationElement.AutomationIdProperty, id));
      if (element != null) return element;
      throw new Exception(string.Format("找不到指定的AutomationId: {0}", id));
    }

    // 通过 Name 查找
    string name = GetArgumentValue(args, "-name");
    if (!string.IsNullOrEmpty(name))
    {
      var element = root.FindFirst(TreeScope.Subtree,
          new PropertyCondition(AutomationElement.NameProperty, name));
      if (element != null) return element;
      throw new Exception(string.Format("找不到指定的Name: {0}", name));
    }

    // 通过组合条件查找
    string condition = GetArgumentValue(args, "-condition");
    if (!string.IsNullOrEmpty(condition))
    {
      var conditions = new List<Condition>();
      string[] parts = condition.Split(';');
      foreach (string part in parts)
      {
        string[] keyValue = part.Split('=');
        if (keyValue.Length == 2)
        {
          switch (keyValue[0].ToLower())
          {
            case "name":
              conditions.Add(new PropertyCondition(AutomationElement.NameProperty, keyValue[1]));
              break;
            case "class":
              conditions.Add(new PropertyCondition(AutomationElement.ClassNameProperty, keyValue[1]));
              break;
            case "automation":
              conditions.Add(new PropertyCondition(AutomationElement.AutomationIdProperty, keyValue[1]));
              break;
            case "type":
              string controlTypeName = keyValue[1];
              if (controlTypeName.StartsWith("ControlType."))
              {
                controlTypeName = controlTypeName.Substring("ControlType.".Length);
              }
              var field = typeof(ControlType).GetField(controlTypeName);
              if (field != null)
              {
                ControlType controlType = (ControlType)field.GetValue(null);
                conditions.Add(new PropertyCondition(AutomationElement.ControlTypeProperty, controlType));
              }
              break;
          }
        }
      }

      if (conditions.Count > 0)
      {
        Condition searchCondition;
        if (conditions.Count > 1)
        {
          searchCondition = new AndCondition(conditions.ToArray());
        }
        else
        {
          searchCondition = conditions[0];
        }
        var element = root.FindFirst(TreeScope.Subtree, searchCondition);
        if (element != null) return element;
        throw new Exception(string.Format("找不到符合条件的元素: {0}", condition));
      }
    }

    throw new Exception("必须指定元素的识别方式: -xpath, -id, -name 或 -condition");
  }

  private static List<IntPtr> GetTargetWindows(string[] args)
  {
    List<IntPtr> targetWindows = new List<IntPtr>();
    string method = GetArgumentValue(args, "-method") ?? "handle";
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



  private static void ShowHelp()
  {
    Console.WriteLine(@"UI自动化工具 v1.0

用法: automation.exe <操作类型> [参数]

操作类型:

1. inspect - 检查元素
   无需其他参数，点击要检查的元素即可

2. click - 点击指定元素
   参数: -xpath <XPath路径> [-window <窗口句柄>]
   适用控件: 所有可点击的控件，包括：
   - Button (按钮)
   - MenuItem (菜单项)
   - TreeItem (树项)
   - ListItem (列表项)
   - TabItem (标签页)
   - RadioButton (单选按钮)
   - CheckBox (复选框)
   示例:
   - 点击按钮: -xpath ""//Button[@Name='确定']""
   - 点击菜单项: -xpath ""//MenuBar/MenuItem[@Name='文件']/MenuItem[@Name='打开']""
   - 点击树节点: -xpath ""//Tree/TreeItem[@Name='节点1']""

3. setvalue - 设置值
   参数: -xpath <XPath路径> -value <新值> [-window <窗口句柄>]

4. getvalue - 获取值
   参数: -xpath <XPath路径> [-window <窗口句柄>]

5. select - 选择指定项目
   参数: -xpath <XPath路径> -item <项目名称> [-window <窗口句柄>]
   适用控件及其特性:
   - ComboBox (组合框)
     * 自动展开下拉列表
     * 支持选择 ListItem
   - TreeView (树视图)
     * 支持选择所有层级的 TreeItem
     * 使用完整路径查找
   - ListBox (列表框)
     * 支持选择直接子项 ListItem
   - DataGrid (数据网格)
     * 支持选择 DataItem 和 ListItem
   - Table (表格)
     * 支持选择 DataItem 和 ListItem
   - Tab (标签页)
     * 支持选择直接子项 TabItem
   - MenuBar/Menu (菜单)
     * 支持选择所有层级的 MenuItem
   - RadioButton (单选按钮)
     * 直接选择匹配名称的按钮
   - CheckBox (复选框)
     * 直接选择匹配名称的复选框
   示例:
   - 选择下拉框选项: -xpath ""//ComboBox"" -item ""选项1""
   - 选择树节点: -xpath ""//Tree"" -item ""父节点/子节点""
   - 选择列表项: -xpath ""//List"" -item ""列表项1""
   - 选择标签页: -xpath ""//Tab"" -item ""标签页2""
   - 选择菜单项: -xpath ""//MenuBar"" -item ""文件""
   - 选择单选按钮: -xpath ""//RadioButton[@Name='选项1']"" -item ""选项1""

6. expand - 展开/折叠
   参数: -xpath <XPath路径> -expand <true/false> [-window <窗口句柄>]
   适用控件及其特性:
   - TreeItem (树节点) 展开/折叠子节点
   - ComboBox (组合框) 展开/折叠下拉列表
   - Menu (菜单) 支持展开/折叠子菜单
   - GroupBox (分组框) 展开/折叠内容区域
   - Expander (展开器) 展开/折叠详细内容
   示例:
   - 展开树节点: -xpath ""//Tree/TreeItem[@Name='父节点']"" -expand true
   - 折叠树节点: -xpath ""//Tree/TreeItem[@Name='父节点']"" -expand false
   - 展开下拉框: -xpath ""//ComboBox"" -expand true
   - 折叠下拉框: -xpath ""//ComboBox"" -expand false
   - 展开菜单: -xpath ""//Menu/MenuItem[@Name='文件']"" -expand true
   - 展开分组: -xpath ""//GroupBox[@Name='详细信息']"" -expand true
   - 展开内容: -xpath ""//Expander"" -expand true

7. scroll - 滚动
   参数: -xpath <XPath路径> -direction <vertical/horizontal> -amount <0-100> [-window <窗口句柄>]
   适用控件及其特性:
   - ScrollBar (滚动条)
   - ListBox (列表框)
   - ComboBox (组合框)
   - DataGrid (数据网格)
   - TreeView (树视图)
   - TextBox (文本框)
   - Document (文档)
   示例:
   - 垂直滚动列表到底部: -xpath ""//List"" -direction vertical -amount 100
   - 水平滚动表格到中间: -xpath ""//DataGrid"" -direction horizontal -amount 50
   - 垂直滚动文本框到顶部: -xpath ""//Edit"" -direction vertical -amount 0
   - 水平滚动文档到最右: -xpath ""//Document"" -direction horizontal -amount 100

8. wait - 等待元素
   参数: -xpath <XPath路径> -timeout <秒数> [-window <窗口句柄>]

9. focus - 设置焦点
   参数: -xpath <XPath路径> [-window <窗口句柄>]

10. highlight - 高亮显示
    参数: -xpath <XPath路径> -duration <秒数> [-window <窗口句柄>]

11. sendkeys - 发送按键
    参数: -xpath <XPath路径> -keys <按键> [-window <窗口句柄>]
    按键格式说明:
    - 普通字符直接输入，如 ""abc""
    - 特殊按键用 {} 包围，如 ""{ENTER}""、""{TAB}""
    - 组合键，如 ""^c"" 表示 Ctrl+C
    支持的特殊按键:
    - {BACKSPACE}, {BS}, {BKSP} - 退格键
    - {BREAK} - Break键
    - {CAPSLOCK} - Caps Lock键
    - {DELETE}, {DEL} - Delete键
    - {DOWN} - 向下键
    - {END} - End键
    - {ENTER}, {RETURN} - Enter键
    - {ESC} - Esc键
    - {HELP} - Help键
    - {HOME} - Home键
    - {INSERT}, {INS} - Insert键
    - {LEFT} - 向左键
    - {NUMLOCK} - Num Lock键
    - {PGDN} - Page Down键
    - {PGUP} - Page Up键
    - {PRTSC} - Print Screen键
    - {RIGHT} - 向右键
    - {SCROLLLOCK} - Scroll Lock键
    - {TAB} - Tab键
    - {UP} - 向上键
    - {F1} - {F12} - 功能键
    - {ADD} - 数字键盘加号键
    - {SUBTRACT} - 数字键盘减号键
    - {MULTIPLY} - 数字键盘乘号键
    - {DIVIDE} - 数字键盘除号键
    - {NUMPAD0} - {NUMPAD9} - 数字键盘数字键

12. enable - 启用/禁用元素
    参数: -xpath <XPath路径> -enable <true/false> [-window <窗口句柄>]
    示例:
    - 启用按钮: -xpath ""//Button[@Name='确定']"" -enable true

通用参数:
-window <窗口句柄> 指定要操作的窗口，如果不指定则使用当前活动窗口

元素定位方式:
1. XPath定位（推荐）
   -xpath <XPath路径>
   示例: -xpath ""//Button[@Name='确定']""

2. AutomationId定位
   -id <AutomationId>
   示例: -id ""btnOK""

3. Name定位
   -name <名称>
   示例: -name ""确定""

4. 组合条件定位
   -condition ""name=xx;type=Button;class=xx;automation=xx""
   示例: -condition ""name=确定;type=Button""");
  }

  private static string GetArgumentValue(string[] args, string key, bool checkNextArg = true)
  {
    int index = Array.IndexOf(args, key);
    if (index >= 0)
    {
      if (index < args.Length - 1)
      {
        // 如果需要检查下一个参数是否是参数名
        if (checkNextArg && args[index + 1].StartsWith("-"))
        {
          return "";  // 参数存在但没有值，返回空字符串
        }
        return args[index + 1];
      }
      return "";  // 参数存在但没有值，返回空字符串
    }
    return null;  // 参数不存在
  }

  private static void SetElementValue(AutomationElement element, string value)
  {
    if (string.IsNullOrEmpty(value))
    {
      throw new Exception("必须指定要设置的值");
    }

    try
    {
      var valuePattern = element.GetCurrentPattern(ValuePattern.Pattern) as ValuePattern;
      if (valuePattern != null)
      {
        valuePattern.SetValue(value);
        Console.WriteLine("true");
        return;
      }

      throw new Exception("元素不支持设置值操作");
    }
    catch (Exception ex)
    {
      throw new Exception("设置值失败: " + ex.Message);
    }
  }

  private static void GetElementValue(AutomationElement element)
  {
    try
    {
      var valuePattern = element.GetCurrentPattern(ValuePattern.Pattern) as ValuePattern;
      if (valuePattern != null)
      {
        Console.WriteLine(valuePattern.Current.Value);
        return;
      }

      throw new Exception("元素不支持获取值操作");
    }
    catch (Exception ex)
    {
      throw new Exception("获取值失败: " + ex.Message);
    }
  }

  private static void SelectItem(AutomationElement element, string item)
  {
    if (string.IsNullOrEmpty(item))
    {
      throw new Exception("必须指定要选择的项目");
    }

    // 根据控件类型使用不同的查找策略
    TreeScope searchScope;
    Condition searchCondition;

    int controlTypeId = element.Current.ControlType.Id;

    if (controlTypeId == ControlType.ComboBox.Id)
    {
      // ComboBox需要先展开
      var expandPattern = element.GetCurrentPattern(ExpandCollapsePattern.Pattern) as ExpandCollapsePattern;
      if (expandPattern != null)
      {
        expandPattern.Expand();
        System.Threading.Thread.Sleep(100);
      }
      searchScope = TreeScope.Descendants;
      searchCondition = new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.ListItem);
    }
    else if (controlTypeId == ControlType.Tree.Id)
    {
      // TreeView查找所有TreeItem
      searchScope = TreeScope.Descendants;
      searchCondition = new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.TreeItem);
    }
    else if (controlTypeId == ControlType.List.Id || controlTypeId == ControlType.DataGrid.Id || controlTypeId == ControlType.Table.Id)
    {
      // ListBox, DataGrid, Table 查找直接子项
      searchScope = TreeScope.Children;
      searchCondition = new OrCondition(
        new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.ListItem),
        new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.DataItem)
      );
    }
    else if (controlTypeId == ControlType.Tab.Id)
    {
      // Tab查找直接子项
      searchScope = TreeScope.Children;
      searchCondition = new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.TabItem);
    }
    else if (controlTypeId == ControlType.MenuBar.Id || controlTypeId == ControlType.Menu.Id)
    {
      // 菜单项查找
      searchScope = TreeScope.Descendants;
      searchCondition = new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.MenuItem);
    }
    else if (controlTypeId == ControlType.RadioButton.Id || controlTypeId == ControlType.CheckBox.Id)
    {
      // 单选框和复选框直接选择自身
      if (element.Current.Name == item)
      {
        var selectionItemPattern = element.GetCurrentPattern(SelectionItemPattern.Pattern) as SelectionItemPattern;
        if (selectionItemPattern != null)
        {
          selectionItemPattern.Select();
          Console.WriteLine("true");
          return;
        }
      }
      throw new Exception(string.Format("找不到指定的选项: {0}", item));
    }
    else
    {
      // 对于其他类型的控件，尝试直接使用SelectionPattern
      var selectionPattern = element.GetCurrentPattern(SelectionPattern.Pattern) as SelectionPattern;
      if (selectionPattern != null)
      {
        searchScope = TreeScope.Children;
        searchCondition = Condition.TrueCondition;
      }
      else
      {
        throw new Exception("不支持的控件类型");
      }
    }

    // 查找所有子项
    var children = element.FindAll(searchScope, searchCondition);
    if (children.Count == 0)
    {
      throw new Exception("未找到可选择的项目");
    }

    // 遍历查找匹配项并选择
    foreach (AutomationElement child in children)
    {
      if (child.Current.Name == item)
      {
        // 尝试使用SelectionItemPattern选择
        var selectionItemPattern = child.GetCurrentPattern(SelectionItemPattern.Pattern) as SelectionItemPattern;
        if (selectionItemPattern != null)
        {
          selectionItemPattern.Select();
          Console.WriteLine("true");
          return;
        }
      }
    }

    throw new Exception(string.Format("找不到指定的项目: {0}", item));
  }

  private static void ExpandElement(AutomationElement element, bool expand)
  {
    try
    {
      var expandCollapsePattern = element.GetCurrentPattern(ExpandCollapsePattern.Pattern) as ExpandCollapsePattern;
      if (expandCollapsePattern != null)
      {
        if (expand)
          expandCollapsePattern.Expand();
        else
          expandCollapsePattern.Collapse();
        Console.WriteLine("true");
        return;
      }

      throw new Exception("元素不支持展开/折叠操作");
    }
    catch (Exception ex)
    {
      throw new Exception("展开/折叠操作失败: " + ex.Message);
    }
  }

  private static void ScrollElement(AutomationElement element, string direction, double amount)
  {
    if (element == null)
    {
      throw new Exception("未找到目标元素");
    }

    try
    {
      // 首先尝试使用 ScrollPattern
      object scrollPattern;
      if (element.TryGetCurrentPattern(ScrollPattern.Pattern, out scrollPattern))
      {
        var scroll = scrollPattern as ScrollPattern;
        if (direction.ToLower() == "horizontal")
        {
          if (!scroll.Current.HorizontallyScrollable)
          {
            throw new Exception("元素不支持水平滚动");
          }
          scroll.SetScrollPercent(amount, ScrollPattern.NoScroll);
        }
        else
        {
          if (!scroll.Current.VerticallyScrollable)
          {
            throw new Exception("元素不支持垂直滚动");
          }
          scroll.SetScrollPercent(ScrollPattern.NoScroll, amount);
        }
        Console.WriteLine("true");
        return;
      }

      // 尝试使用 ScrollItemPattern
      object scrollItemPattern;
      if (element.TryGetCurrentPattern(ScrollItemPattern.Pattern, out scrollItemPattern))
      {
        var scrollItem = scrollItemPattern as ScrollItemPattern;
        scrollItem.ScrollIntoView();
        Console.WriteLine("true");
        return;
      }

      // 检查是否有滚动条子元素
      var scrollBars = element.FindAll(TreeScope.Children, new PropertyCondition(
          AutomationElement.ControlTypeProperty, ControlType.ScrollBar));

      if (scrollBars.Count > 0)
      {
        foreach (AutomationElement scrollBar in scrollBars)
        {
          // 获取滚动条的方向
          bool isHorizontal = scrollBar.Current.BoundingRectangle.Width > scrollBar.Current.BoundingRectangle.Height;

          if ((direction.ToLower() == "horizontal" && isHorizontal) ||
              (direction.ToLower() == "vertical" && !isHorizontal))
          {
            // 使用 RangeValuePattern 设置滚动条的值
            var rangeValuePattern = scrollBar.GetCurrentPattern(RangeValuePattern.Pattern) as RangeValuePattern;
            if (rangeValuePattern != null)
            {
              double maxValue = rangeValuePattern.Current.Maximum;
              double minValue = rangeValuePattern.Current.Minimum;
              double targetValue = minValue + ((maxValue - minValue) * amount / 100);
              rangeValuePattern.SetValue(targetValue);
              Console.WriteLine("true");
              return;
            }
          }
        }
      }

      throw new Exception("元素不支持滚动操作");
    }
    catch (Exception ex)
    {
      throw new Exception(string.Format("滚动操作失败: {0}", ex.Message));
    }
  }

  private static void WaitForElement(string[] args, int timeout)
  {
    DateTime endTime = DateTime.Now.AddSeconds(timeout);
    while (DateTime.Now < endTime)
    {
      try
      {
        GetTargetElement(args);
        Console.WriteLine("true");
        return;
      }
      catch
      {
        Thread.Sleep(500);
      }
    }
    throw new Exception("等待超时");
  }

  private static AutomationElement FindElementByXPath(string xpath, AutomationElement root)
  {
    string[] segments = xpath.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
    AutomationElement current = root;

    foreach (string segment in segments)
    {
      if (string.IsNullOrEmpty(segment)) continue;

      // 解析控件类型和索引
      string controlType = segment;
      int index = 1;
      string condition = "";

      // 提取索引 [n]
      int indexStart = segment.IndexOf('[');
      if (indexStart > 0)
      {
        int indexEnd = segment.IndexOf(']', indexStart);
        if (indexEnd > indexStart)
        {
          controlType = segment.Substring(0, indexStart);
          string indexStr = segment.Substring(indexStart + 1, indexEnd - indexStart - 1);

          // 检查是否是属性条件
          if (indexStr.StartsWith("@"))
          {
            condition = indexStr;
          }
          else
          {
            int parsedIndex;
            if (int.TryParse(indexStr, out parsedIndex))
            {
              index = parsedIndex;
            }
          }
        }
      }

      // 创建控件类型条件
      List<Condition> conditions = new List<Condition>();
      if (controlType.StartsWith("ControlType."))
      {
        controlType = controlType.Substring("ControlType.".Length);
      }
      var field = typeof(ControlType).GetField(controlType);
      if (field != null)
      {
        ControlType type = (ControlType)field.GetValue(null);
        conditions.Add(new PropertyCondition(AutomationElement.ControlTypeProperty, type));
      }

      // 添加属性条件
      if (!string.IsNullOrEmpty(condition))
      {
        if (condition.StartsWith("@Name='"))
        {
          string name = condition.Substring("@Name='".Length).TrimEnd('\'');
          conditions.Add(new PropertyCondition(AutomationElement.NameProperty, name));
        }
        else if (condition.StartsWith("@AutomationId='"))
        {
          string automationId = condition.Substring("@AutomationId='".Length).TrimEnd('\'');
          conditions.Add(new PropertyCondition(AutomationElement.AutomationIdProperty, automationId));
        }
        else if (condition.StartsWith("@ClassName='"))
        {
          string className = condition.Substring("@ClassName='".Length).TrimEnd('\'');
          conditions.Add(new PropertyCondition(AutomationElement.ClassNameProperty, className));
        }
      }

      // 查找元素
      Condition finalCondition = conditions.Count > 1
          ? new AndCondition(conditions.ToArray())
          : conditions[0];

      var elements = current.FindAll(TreeScope.Children, finalCondition);
      if (elements.Count == 0) return null;

      // 使用索引选择元素
      if (index > elements.Count) return null;
      current = elements[index - 1];  // 转换为0基索引
    }

    return current;
  }

  private static void SetFocus(AutomationElement element)
  {
    try
    {
      element.SetFocus();
      Console.WriteLine("true");
    }
    catch (Exception ex)
    {
      throw new Exception("设置焦点失败: " + ex.Message);
    }
  }

  private static void HighlightElement(AutomationElement element, int duration)
  {
    var rect = element.Current.BoundingRectangle;
    var highlightForm = new Form
    {
      StartPosition = FormStartPosition.Manual,
      Location = new System.Drawing.Point((int)rect.Left, (int)rect.Top),
      Size = new System.Drawing.Size((int)rect.Width, (int)rect.Height),
      BackColor = Color.Yellow,
      Opacity = 0.3,
      ShowInTaskbar = false,
      FormBorderStyle = FormBorderStyle.None,
      TopMost = true
    };

    try
    {
      highlightForm.Show();
      Console.WriteLine("正在高亮显示元素");
      Thread.Sleep(duration * 1000);
    }
    finally
    {
      highlightForm.Close();
      highlightForm.Dispose();
    }
  }

  private struct ElementHierarchyInfo
  {
    public string XPath;
    public IntPtr WindowHandle;
  }

  // 获取元素的层次结构信息
  private static ElementHierarchyInfo GetElementHierarchyInfo(AutomationElement element)
  {
    var path = new List<string>();
    var current = element;
    var walker = TreeWalker.ControlViewWalker;
    IntPtr windowHandle = IntPtr.Zero;

    // 循环直到找到根元素
    while (current != null && current != AutomationElement.RootElement)
    {
      // 获取父元素,如果获取失败，则停止遍历
      AutomationElement parent;
      try
      {
        parent = walker.GetParent(current);
        // 是否是最后一个元素
        bool isLastElement = (parent == AutomationElement.RootElement || parent == null);
        // 是否是句柄不为0的窗口
        bool isValidWindow = (current.Current.ControlType.Id == UIA_ControlTypeIds.Window && current.Current.NativeWindowHandle != 0);
        // 是否是任务栏
        bool isTaskbar = (current.Current.ClassName == "Shell_TrayWnd" ||
                           current.Current.ClassName == "Shell_SecondaryTrayWnd");

        // 如果是窗口/任务栏，或者是最后一个元素，获取其句柄
        if (isValidWindow || isTaskbar || isLastElement)
        {
          windowHandle = new IntPtr(current.Current.NativeWindowHandle);
          break;  // 获取到句柄后就停止遍历
        }
        else
        {
          // 获取同级元素中的索引
          int index = 1;
          var siblings = parent.FindAll(TreeScope.Children, new PropertyCondition(
              AutomationElement.ControlTypeProperty, current.Current.ControlType));

          foreach (AutomationElement sibling in siblings)
          {
            if (sibling == current) break;
            index++;
          }

          // 构建路径段
          string type = current.Current.ControlType.ProgrammaticName.Replace("ControlType.", "");
          string pathSegment = type;

          // 如果有多个同类型元素，添加索引
          if (siblings.Count > 1)
          {
            pathSegment = string.Format("{0}[{1}]", type, index);
          }

          path.Insert(0, pathSegment);
        }
      }
      catch
      {
        break;
      }
      current = parent;

    }
    if (windowHandle == IntPtr.Zero)
    {
      Point currentMousePosition;
      GetCursorPos(out currentMousePosition);
      windowHandle = WindowFromPoint(currentMousePosition);
    }

    return new ElementHierarchyInfo
    {
      XPath = "/" + string.Join("/", path),
      WindowHandle = windowHandle
    };
  }

  private static void EnableElement(AutomationElement element, bool enable)
  {
    if (element == null)
    {
      throw new Exception("元素不能为空");
    }
    try
    {
      EnableWindow((IntPtr)element.Current.NativeWindowHandle, enable);
      Console.WriteLine("true");
    }
    catch (Exception ex)
    {
      throw new Exception("无法更改元素的启用/禁用状态: " + ex.Message);
    }
  }

  private static void ClickElement(AutomationElement element)
  {
    if (element == null)
    {
      throw new Exception("未找到目标元素");
    }

    try
    {
      // 首先尝试使用 Invoke 模式（适用于按钮等）
      object invokePattern;
      if (element.TryGetCurrentPattern(InvokePattern.Pattern, out invokePattern))
      {
        ((InvokePattern)invokePattern).Invoke();
        Console.WriteLine("true");
        return;
      }

      // 尝试使用 SelectionItem 模式（适用于列表项、单选框等）
      object selectionItemPattern;
      if (element.TryGetCurrentPattern(SelectionItemPattern.Pattern, out selectionItemPattern))
      {
        ((SelectionItemPattern)selectionItemPattern).Select();
        Console.WriteLine("true");
        return;
      }

      // 尝试使用 Toggle 模式（适用于复选框等）
      object togglePattern;
      if (element.TryGetCurrentPattern(TogglePattern.Pattern, out togglePattern))
      {
        ((TogglePattern)togglePattern).Toggle();
        Console.WriteLine("true");
        return;
      }

      // 如果都不支持，尝试使用鼠标点击
      try
      {
        // 激活元素
        element.SetFocus();

        // 获取元素的中心点坐标
        System.Windows.Point clickablePoint = element.GetClickablePoint();

        // 转换为屏幕坐标
        var rect = element.Current.BoundingRectangle;
        if (rect.IsEmpty)
        {
          throw new Exception("无法获取元素位置");
        }

        // 保存当前鼠标位置
        Point currentMousePosition;
        GetCursorPos(out currentMousePosition);

        // 使用 mouse_event 执行点击
        int x = (int)clickablePoint.X;
        int y = (int)clickablePoint.Y;

        // 移动鼠标到目标位置
        SetCursorPos(x, y);
        Thread.Sleep(50);  // 短暂延迟确保鼠标移动到位

        // 模拟鼠标点击
        mouse_event(MOUSEEVENTF_LEFTDOWN, x, y, 0, 0);
        Thread.Sleep(50);  // 短暂延迟模拟真实点击
        mouse_event(MOUSEEVENTF_LEFTUP, x, y, 0, 0);

        // 恢复鼠标位置
        SetCursorPos(currentMousePosition.X, currentMousePosition.Y);
        Console.WriteLine("true");
      }
      catch (Exception ex)
      {
        throw new Exception(string.Format("鼠标点击失败: {0}", ex.Message));
      }
    }
    catch (Exception ex)
    {
      throw new Exception(string.Format("点击操作失败: {0}", ex.Message));
    }
  }

  private static void SendKeys(AutomationElement element, string keys)
  {
    if (string.IsNullOrEmpty(keys))
    {
      throw new Exception("必须指定要发送的按键");
    }

    try
    {
      // 确保元素可以接收输入
      if (!element.Current.IsKeyboardFocusable)
      {
        throw new Exception("元素不支持键盘输入");
      }

      element.SetFocus();
      System.Windows.Forms.SendKeys.SendWait(keys);
      Console.WriteLine("true");
    }
    catch (Exception ex)
    {
      throw new Exception("发送按键失败: " + ex.Message);
    }
  }

  // 元素检查器
  private static void InspectElement(string[] args)
  {
    // 创建一个半透明遮罩窗口
    overlayForm = new Form();
    overlayForm.FormBorderStyle = FormBorderStyle.None;
    overlayForm.StartPosition = FormStartPosition.Manual;
    overlayForm.TopMost = true;
    overlayForm.BackColor = Color.Blue;
    overlayForm.Opacity = 0.15;
    overlayForm.ShowInTaskbar = false;
    overlayForm.KeyPreview = true;

    // 设置窗口样式，确保能显示在任务栏上方
    overlayForm.Load += (sender, e) =>
    {
      var hwnd = overlayForm.Handle;
      var extendedStyle = GetWindowLong(hwnd, GWL_EXSTYLE);
      SetWindowLong(hwnd, GWL_EXSTYLE, extendedStyle | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE | WS_EX_LAYERED);
    };

    // 创建预览窗口
    previewForm = new Form
    {
      FormBorderStyle = FormBorderStyle.None,
      StartPosition = FormStartPosition.Manual,
      BackColor = Color.FromArgb(40, 40, 40),
      ShowInTaskbar = false,
      TopMost = true,
      Opacity = 0.9,
      AutoSize = true,  // 添加自动尺寸
      AutoSizeMode = AutoSizeMode.GrowAndShrink,  // 根据内容调整大小
      KeyPreview = true
    };

    Label previewLabel = new Label
    {
      AutoSize = true,
      Dock = DockStyle.None,
      TextAlign = ContentAlignment.MiddleLeft,
      Font = new Font("楷体", 9),
      ForeColor = Color.White,
      Padding = new Padding(5),
      AutoEllipsis = true,
      UseMnemonic = false,
      MaximumSize = new System.Drawing.Size(600, 0)
    };
    previewForm.Controls.Add(previewLabel);

    // 设置预览窗口样式
    previewForm.Load += (sender, e) =>
    {
      var hwnd = previewForm.Handle;
      var extendedStyle = GetWindowLong(hwnd, GWL_EXSTYLE);
      SetWindowLong(hwnd, GWL_EXSTYLE, extendedStyle | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE | WS_EX_LAYERED);

      // 确保窗口显示在最顶层
      SetWindowPos(
          hwnd,
          new IntPtr(HWND_TOPMOST),
          previewForm.Left,
          previewForm.Top,
          previewForm.Width,
          previewForm.Height,
          0x0040 // SWP_SHOWWINDOW
      );
    };

    // 获取根元素
    var rootElement = AutomationElement.RootElement;

    completed = false;  // 使用静态字段
    Rectangle lastRect = Rectangle.Empty;
    lastElement = null;
    lastCursorPos = new Point();
    AutomationElement taskbarElement = null;
    List<AutomationElement> taskbarChildren = null;

    // 设置/取消窗口鼠标穿透的辅助方法
    Action<bool> setMousePenetrate = (penetrate) =>
    {
      var hwnd = overlayForm.Handle;
      var extendedStyle = GetWindowLong(hwnd, GWL_EXSTYLE);
      if (penetrate)
      {
        SetWindowLong(hwnd, GWL_EXSTYLE, extendedStyle | WS_EX_TRANSPARENT);
      }
      else
      {
        SetWindowLong(hwnd, GWL_EXSTYLE, extendedStyle & ~WS_EX_TRANSPARENT);
      }
    };

    // 更新遮罩层位置的辅助方法
    Action<Rectangle> updateOverlayPosition = (rect) =>
    {
      overlayForm.Location = new System.Drawing.Point(rect.Left, rect.Top);
      overlayForm.Size = new System.Drawing.Size(rect.Width, rect.Height);
      // 确保遮罩层始终在最顶层
      SetWindowPos(
          overlayForm.Handle,
          new IntPtr(HWND_TOPMOST),
          rect.Left,
          rect.Top,
          rect.Width,
          rect.Height,
          0x0040 // SWP_SHOWWINDOW
      );
      overlayForm.Refresh();
    };

    // 添加一个新的辅助方法来更新预览窗口位置
    Action<int, int> updatePreviewPosition = (x, y) =>
    {
      // 确保预览窗口始终在最顶层
      SetWindowPos(
          previewForm.Handle,
          new IntPtr(HWND_TOPMOST),
          x,
          y,
          previewForm.Width,
          previewForm.Height,
          0x0040 // SWP_SHOWWINDOW
      );
      previewForm.Refresh();
    };

    // 创建一个定时器来处理鼠标位置检测
    mouseTimer = new System.Windows.Forms.Timer();
    mouseTimer.Interval = 100;
    mouseTimer.Tick += (sender, e) =>
    {
      try
      {
        Point cursorPos;
        GetCursorPos(out cursorPos);

        if (cursorPos == lastCursorPos)
        {
          return;
        }
        lastCursorPos = cursorPos;

        setMousePenetrate(true);

        // 获取鼠标位置的元素
        var element = AutomationElement.FromPoint(cursorPos.ToWindowsPoint());

        setMousePenetrate(false);

        if (element != null && element != rootElement)
        {
          // AutomationElement.FromPoint只能获得到任务栏
          // 无法获得到任务栏的子元素，所以需要遍历
          element = HandleTaskbarElement(
              element,
              cursorPos,
              ref taskbarElement,
              ref taskbarChildren
          );

          var elementBounds = element.Current.BoundingRectangle;
          Rectangle elementRect = new Rectangle(
              (int)elementBounds.Left,
              (int)elementBounds.Top,
              (int)elementBounds.Width,
              (int)elementBounds.Height
          );

          bool elementChanged = lastElement == null ||
          !element.Equals(lastElement) ||
                              elementRect != lastRect;

          if (elementChanged)
          {
            lastElement = element;
            lastRect = elementRect;

            // 获取元素后，显示遮罩层
            if (!overlayForm.Visible)
            {
              overlayForm.Show();
            }
            updateOverlayPosition(elementRect);

            // 计算预览窗口位置
            int previewX = elementRect.Right + 10;
            int previewY = elementRect.Top;

            // 确保预览窗口不会超出屏幕
            Screen screen = Screen.FromPoint(new System.Drawing.Point(previewX, previewY));
            if (previewX + previewForm.Width > screen.Bounds.Right)
            {
              previewX = elementRect.Left - previewForm.Width - 10;
            }

            if (previewY + previewForm.Height > screen.Bounds.Bottom)
            {
              previewY = screen.Bounds.Bottom - previewForm.Height;
            }

            updatePreviewPosition(previewX, previewY);
          }
          // 处理名称长度
          string elementName = element.Current.Name;
          if (elementName.Length > 50)
          {
            elementName = elementName.Substring(0, 47) + "...";
          }
          // 更新预览窗口内容
          previewLabel.Text = string.Format(
              "坐标: {0}, {1}\r\n" +
              "名称: {2}\r\n" +
              "大小: {3}x{4}\r\n" +
              "类型: {5}\r\n" +
              "C：复制名称，X：复制名称并退出\r\n" +
              "ESC：退出",
              cursorPos.X,
              cursorPos.Y,
              elementName,
              elementRect.Width,
              elementRect.Height,
              element.Current.ControlType.ProgrammaticName.Replace("ControlType.", ""));
          previewForm.Show();
        }
      }
      catch (Exception ex)
      {
        Console.Error.WriteLine(string.Format("Error: {0}", ex.Message));
      }
    };

    overlayForm.MouseClick += (sender, e) =>
    {
      if (e.Button == MouseButtons.Left && lastElement != null)
      {
        try
        {
          InspectElementInfo(lastElement, lastCursorPos);
        }
        catch (Exception ex)
        {
          Console.Error.WriteLine(string.Format("Error: {0}", ex.Message));
        }
        finally
        {
          stopInspect();
        }
      }
    };

    // 添加按键事件处理
    overlayForm.KeyPress += (sender, e) =>
    {
      HandleKeyPress(sender, e);
    };
    previewForm.KeyPress += (sender, e) =>
    {
      HandleKeyPress(sender, e);
    };

    // 在新线程中显示窗口
    Thread thread = new Thread(() =>
    {
      mouseTimer.Start();
      while (!completed)
      {
        Application.DoEvents();
        Thread.Sleep(100);
      }
      mouseTimer.Stop();
    });
    thread.SetApartmentState(ApartmentState.STA);
    thread.Start();
    thread.Join();
  }

  private static Dictionary<string, object> GetWindowInfoFromHandle(IntPtr hwnd)
  {
    var windowInfo = new Dictionary<string, object>();
    if (hwnd != IntPtr.Zero)
    {
      StringBuilder title = new StringBuilder(256);
      StringBuilder className = new StringBuilder(256);
      GetWindowText(hwnd, title, title.Capacity);
      GetClassName(hwnd, className, className.Capacity);

      // 获取窗口位置和大小
      RECT rect = new RECT();
      GetWindowRect(hwnd, ref rect);

      windowInfo.Add("title", title.ToString());
      windowInfo.Add("class", className.ToString());
      windowInfo.Add("handle", hwnd.ToInt32());
      windowInfo.Add("x", rect.Left);
      windowInfo.Add("y", rect.Top);
      windowInfo.Add("width", rect.Right - rect.Left);
      windowInfo.Add("height", rect.Bottom - rect.Top);

      // 获取进程信息
      uint processId;
      GetWindowThreadProcessId(hwnd, out processId);
      try
      {
        var process = System.Diagnostics.Process.GetProcessById((int)processId);
        windowInfo.Add("processName", process.ProcessName);
        windowInfo.Add("processPath", process.MainModule.FileName);
      }
      catch { }
    }
    return windowInfo;
  }

  // 打印元素的完整信息
  private static void InspectElementInfo(AutomationElement element, Point position)
  {
    var hierarchyInfo = GetElementHierarchyInfo(element);

    Dictionary<string, object> result = new Dictionary<string, object>();
    // 元素信息
    Dictionary<string, object> elementInfo = new Dictionary<string, object>();
    elementInfo.Add("name", element.Current.Name);
    elementInfo.Add("class", element.Current.ClassName);
    elementInfo.Add("type", element.Current.ControlType.ProgrammaticName.Replace("ControlType.", ""));
    elementInfo.Add("automationId", element.Current.AutomationId);
    elementInfo.Add("xpath", hierarchyInfo.XPath);
    elementInfo.Add("handle", element.Current.NativeWindowHandle);

    // 添加元素位置和大小信息
    var bounds = element.Current.BoundingRectangle;
    elementInfo.Add("x", (int)bounds.Left);
    elementInfo.Add("y", (int)bounds.Top);
    elementInfo.Add("width", (int)bounds.Width);
    elementInfo.Add("height", (int)bounds.Height);

    // 添加控件文本值
    try
    {
      var valuePattern = element.GetCurrentPattern(ValuePattern.Pattern) as ValuePattern;
      if (valuePattern != null)
      {
        elementInfo.Add("value", valuePattern.Current.Value);
      }
    }
    catch { }

    // 根据传入的坐标获取窗口信息
    if (hierarchyInfo.WindowHandle != IntPtr.Zero)
    {
      var windowInfo = GetWindowInfoFromHandle(hierarchyInfo.WindowHandle);
      foreach (var kvp in windowInfo)
      {
        result.Add(kvp.Key, kvp.Value);
      }
    }

    // 将元素信息添加到结果中
    result.Add("element", elementInfo);

    // 添加坐标信息
    result.Add("position", new Dictionary<string, int> {
            { "x", position.X },
            { "y", position.Y }
        });

    var serializer = new JavaScriptSerializer();
    Console.Write(serializer.Serialize(result));
  }

  private static AutomationElement HandleTaskbarElement(AutomationElement element, Point cursorPos, ref AutomationElement taskbarElement, ref List<AutomationElement> taskbarChildren)
  {
    // 检查是否是任务栏元素
    bool isTaskbarElement = element.Current.ClassName == "Shell_TrayWnd" ||
                           element.Current.ClassName == "Shell_SecondaryTrayWnd";

    // 如果是新的任务栏元素，获取其所有子元素
    if (isTaskbarElement && element != taskbarElement)
    {
      taskbarElement = GetTaskbarElement();
      if (taskbarElement != null)
      {
        taskbarChildren = GetTaskbarChildren(taskbarElement);
      }
    }

    // 如果是任务栏区域，在缓存的子元素中查找
    if (isTaskbarElement && taskbarChildren != null && taskbarChildren.Count > 0)
    {
      var point = cursorPos.ToWindowsPoint();
      AutomationElement bestMatch = null;
      double minArea = double.MaxValue;

      foreach (var child in taskbarChildren)
      {
        try
        {
          var childRect = child.Cached.BoundingRectangle;
          if (childRect.Contains(point))
          {
            double area = childRect.Width * childRect.Height;
            if (area < minArea && area > 0)
            {
              minArea = area;
              bestMatch = child;
            }
          }
        }
        catch { }
      }

      if (bestMatch != null)
      {
        return bestMatch;
      }
    }

    return element;
  }

  private static void stopInspect()
  {
    mouseTimer.Stop();
    overlayForm.Close();
    previewForm.Close();
    Environment.Exit(0);
  }

  private static void HandleKeyPress(object sender, KeyPressEventArgs e)
  {
    if (e.KeyChar == (char)27)  // ESC键
    {
      stopInspect();
    }
    else if (e.KeyChar == 'c' || e.KeyChar == 'C' || e.KeyChar == 'x' || e.KeyChar == 'X')  // 添加复制功能
    {
      if (lastElement != null)
      {
        try
        {
          Clipboard.SetText(lastElement.Current.Name);
          if (e.KeyChar == 'x' || e.KeyChar == 'X')
          {
            InspectElementInfo(lastElement, lastCursorPos);
            stopInspect();
          }
        }
        catch (Exception ex)
        {
          Console.Error.WriteLine(string.Format("Error copying name: {0}", ex.Message));
        }
      }
    }
  }
}
