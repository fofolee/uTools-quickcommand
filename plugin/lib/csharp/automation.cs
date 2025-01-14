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

public class AutomationManager
{
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
    private static extern short GetAsyncKeyState(int vKey);

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
                case "list":
                    // 列出所有元素
                    string filter = GetArgumentValue(args, "-filter"); // 可选的过滤条件
                    ListElements(args, filter);
                    break;

                case "find":
                    // 查找元素
                    string by = GetArgumentValue(args, "-by") ?? "name";
                    string value = GetArgumentValue(args, "-value");
                    string scope = GetArgumentValue(args, "-scope") ?? "children";
                    FindElement(args, by, value, scope);
                    break;

                case "getinfo":
                    // 获取元素信息
                    GetElementInfo(args);
                    break;

                case "click":
                    // 点击元素
                    ClickElement(args);
                    break;

                case "setvalue":
                    // 设置值
                    string newValue = GetArgumentValue(args, "-value");
                    SetElementValue(args, newValue);
                    break;

                case "getvalue":
                    // 获取值
                    GetElementValue(args);
                    break;

                case "select":
                    // 选择项目
                    string item = GetArgumentValue(args, "-item");
                    SelectItem(args, item);
                    break;

                case "expand":
                    // 展开/折叠
                    string expandStr = GetArgumentValue(args, "-expand");
                    bool expand = expandStr != null && expandStr.ToLower() == "true";
                    ExpandElement(args, expand);
                    break;

                case "scroll":
                    // 滚动
                    string direction = GetArgumentValue(args, "-direction") ?? "vertical";
                    double amount = double.Parse(GetArgumentValue(args, "-amount") ?? "0");
                    ScrollElement(args, direction, amount);
                    break;

                case "wait":
                    // 等待元素
                    by = GetArgumentValue(args, "-by") ?? "name";
                    value = GetArgumentValue(args, "-value");
                    int timeout = int.Parse(GetArgumentValue(args, "-timeout") ?? "30");
                    WaitForElement(args, by, value, timeout);
                    break;

                case "focus":
                    // 设置焦点
                    SetFocus(args);
                    break;

                case "sendkeys":
                    // 发送按键
                    string keys = GetArgumentValue(args, "-keys");
                    SendKeys(args, keys);
                    break;

                case "getchild":
                    // 获取子元素
                    string childType = GetArgumentValue(args, "-type") ?? "all";
                    GetChildElements(args, childType);
                    break;

                case "getparent":
                    // 获取父元素
                    GetParentElement(args);
                    break;

                case "highlight":
                    // 高亮显示元素
                    int duration = int.Parse(GetArgumentValue(args, "-duration") ?? "2");
                    HighlightElement(args, duration);
                    break;

                case "inspect":
                    // 生成元素识别器
                    int inspectTimeout = int.Parse(GetArgumentValue(args, "-timeout") ?? "30");
                    InspectElement(args, inspectTimeout);
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

    private static void ShowHelp()
    {
        string help = @"UI自动化工具 - 使用说明

用法:
  automation.exe -type <操作类型> [参数]

通用参数:
  -window <窗口标识>  指定操作的窗口(可选)
  -method <查找方式>  指定窗口查找方式(可选,默认active)
    支持以下方式:
    - title     窗口标题(支持模糊匹配)
    - class     窗口类名
    - handle    窗口句柄
    - process   进程名
    - active    当前活动窗口(默认)
    不指定时默认在整个桌面范围内查找

元素识别参数:
  -value <标识值>    要查找的元素的值
  -by <识别方式>     识别方式(可选,默认name)
  支持以下方式:
  - name         按名称查找
  - class        按类名查找
  - type         按控件类型查找
  - automationid 按AutomationId查找

操作类型及示例:
1. inspect - 生成元素识别器
  参数:
    -timeout <超时>    等待超时时间(秒,默认30)
  示例:
    automation.exe -type inspect -timeout 60
  说明:
    运行后点击要识别的元素，将返回元素的详细信息和示例命令

2. list - 列出所有元素
   参数:
    -filter <过滤文本>  按名称/类名/AutomationId过滤(可选)
   示例:
     automation.exe -window ""记事本"" -method title -type list
     automation.exe -window ""记事本"" -method title -type list -filter ""按钮""

3. find - 查找元素
   参数:
     -by <查找方式>     name/class/type/automationid
     -value <查找值>    要查找的值
     -scope <查找范围>  children/descendants/subtree等(可选,默认children)
   示例:
     automation.exe -window ""计算器"" -method title -type find -by name -value ""等于""
     automation.exe -window ""记事本"" -method class -type find -by type -value ""button""

4. getinfo - 获取元素信息
   参数:
     -value <标识值>    要查找的值
     -by <识别方式>     识别方式(可选,默认name)
   示例:
     automation.exe -type getinfo -value ""确定"" -by name
     automation.exe -type getinfo -value ""button"" -by type

5. click - 点击元素
   参数:
     -value <标识值>    要查找的值
     -by <识别方式>     识别方式(可选,默认name)
     -pattern <模式>   invoke/toggle/expand等(可选,默认invoke)
   示例:
     automation.exe -type click -value ""确定"" -by name
     automation.exe -type click -value ""button"" -by type -pattern toggle

6. setvalue - 设置值
   参数:
     -value <标识值>    要查找的值
     -by <识别方式>     识别方式(可选,默认name)
     -newvalue <新值>   要设置的值
   示例:
     automation.exe -type setvalue -value ""文本框"" -by name -newvalue ""新内容""

7. getvalue - 获取值
   参数:
     -value <标识值>    要查找的值
     -by <识别方式>     识别方式(可选,默认name)
   示例:
     automation.exe -type getvalue -value ""文本框"" -by name

8. select - 选择项目
   参数:
     -value <标识值>    要查找的值
     -by <识别方式>     识别方式(可选,默认name)
     -item <项目>      要选择的项目
   示例:
     automation.exe -type select -value ""下拉框"" -by name -item ""选项1""

9. expand - 展开/折叠
   参数:
     -value <标识值>    要查找的值
     -by <识别方式>     识别方式(可选,默认name)
     -expand <true/false> 是否展开
   示例:
     automation.exe -type expand -value ""树节点"" -by name -expand true

10. scroll - 滚动
   参数:
     -value <标识值>    要查找的值
     -by <识别方式>     识别方式(可选,默认name)
     -direction <方向>  vertical/horizontal(可选,默认vertical)
     -amount <数值>     滚动量(0-100)
   示例:
     automation.exe -type scroll -value ""列表"" -by name -direction vertical -amount 50

11. wait - 等待元素
   参数:
     -value <标识值>    要查找的值
     -by <识别方式>     识别方式(可选,默认name)
     -timeout <超时>    超时时间(秒,默认30)
   示例:
     automation.exe -type wait -value ""登录"" -by name -timeout 60

12. focus - 设置焦点
    参数:
      -value <标识值>    要查找的值
      -by <识别方式>     识别方式(可选,默认name)
    示例:
      automation.exe -type focus -value ""输入框"" -by name

13. sendkeys - 发送按键
    参数:
      -value <标识值>    要查找的值
      -by <识别方式>     识别方式(可选,默认name)
      -keys <按键序列>   要发送的按键
    示例:
      automation.exe -type sendkeys -value ""输入框"" -by name -keys ""Hello World""

14. getchild - 获取子元素
    参数:
      -value <标识值>    要查找的值
      -by <识别方式>     识别方式(可选,默认name)
      -type <控件类型>   筛选类型(可选,默认all)
    示例:
      automation.exe -type getchild -value ""窗口"" -by name -type button

15. getparent - 获取父元素
    参数:
      -value <标识值>    要查找的值
      -by <识别方式>     识别方式(可选,默认name)
    示例:
      automation.exe -type getparent -value ""按钮"" -by name

16. highlight - 高亮显示元素
    参数:
      -value <标识值>    要查找的值
      -by <识别方式>     识别方式(可选,默认name)
      -duration <时长>   显示时长(秒,默认2)
    示例:
      automation.exe -type highlight -value ""按钮"" -by name -duration 5

支持的控件类型:
- button      (按钮)
- edit        (编辑框)
- combobox    (下拉框)
- checkbox    (复选框)
- radiobutton (单选按钮)
- listitem    (列表项)
- treeitem    (树项)
- menu        (菜单)
- menuitem    (菜单项)
- tab         (选项卡)
- window      (窗口)

注意事项:
1. 元素ID在find或list操作后返回，需要保存以供后续操作使用
2. list操作会返回元素的完整路径，便于定位
3. 所有操作都支持-timeout参数指定超时时间
4. sendkeys支持特殊按键，如{ENTER}, {TAB}, {F1}, ^c(Ctrl+C)等
5. 高亮显示功能会创建一个半透明黄色窗口覆盖在目标元素上
6. 部分操作可能因目标元素不支持相应模式而失败
";
        Console.WriteLine(help);
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

    private static AutomationElement GetElementByIdentifier(string[] args, string identifier, string by = null)
    {
        // 如果提供了id，优先使用缓存
        if (by == null && elementCache.ContainsKey(identifier))
        {
            return elementCache[identifier];
        }

        // 否则根据识别方式查找元素
        AutomationElement root = GetRootElement(args);
        by = by ?? "name";  // 默认使用name

        Condition condition;
        switch (by.ToLower())
        {
            case "name":
                condition = new PropertyCondition(AutomationElement.NameProperty, identifier);
                break;
            case "class":
                condition = new PropertyCondition(AutomationElement.ClassNameProperty, identifier);
                break;
            case "type":
                // 根据控件类型名称获取对应的ControlType
                ControlType controlType = null;
                switch (identifier.ToLower())
                {
                    case "button":
                        controlType = ControlType.Button;
                        break;
                    case "edit":
                        controlType = ControlType.Edit;
                        break;
                    case "combobox":
                        controlType = ControlType.ComboBox;
                        break;
                    case "checkbox":
                        controlType = ControlType.CheckBox;
                        break;
                    case "radiobutton":
                        controlType = ControlType.RadioButton;
                        break;
                    case "listitem":
                        controlType = ControlType.ListItem;
                        break;
                    case "treeitem":
                        controlType = ControlType.TreeItem;
                        break;
                    case "menu":
                        controlType = ControlType.Menu;
                        break;
                    case "menuitem":
                        controlType = ControlType.MenuItem;
                        break;
                    case "tab":
                        controlType = ControlType.Tab;
                        break;
                    case "window":
                        controlType = ControlType.Window;
                        break;
                    default:
                        throw new Exception("不支持的控件类型: " + identifier);
                }
                condition = new PropertyCondition(AutomationElement.ControlTypeProperty, controlType);
                break;
            case "automationid":
                condition = new PropertyCondition(AutomationElement.AutomationIdProperty, identifier);
                break;
            default:
                throw new Exception("不支持的识别方式: " + by);
        }

        var element = root.FindFirst(TreeScope.Subtree, condition);
        if (element == null)
        {
            throw new Exception(string.Format("找不到{0}为'{1}'的元素", by, identifier));
        }

        return element;
    }

    private static void GetElementInfo(string[] args)
    {
        string identifier = GetArgumentValue(args, "-value");
        string by = GetArgumentValue(args, "-by");
        var element = GetElementByIdentifier(args, identifier, by);
        var info = new Dictionary<string, object>();
        info.Add("name", element.Current.Name);
        info.Add("class", element.Current.ClassName);
        info.Add("type", element.Current.ControlType.ProgrammaticName);
        info.Add("automationId", element.Current.AutomationId);
        info.Add("processId", element.Current.ProcessId);
        info.Add("boundingRectangle", new
        {
            x = element.Current.BoundingRectangle.X,
            y = element.Current.BoundingRectangle.Y,
            width = element.Current.BoundingRectangle.Width,
            height = element.Current.BoundingRectangle.Height
        });
        info.Add("patterns", GetSupportedPatterns(element));

        var serializer = new JavaScriptSerializer();
        Console.Write(serializer.Serialize(info));
    }

    private static void ClickElement(string[] args)
    {
        string identifier = GetArgumentValue(args, "-value");
        string by = GetArgumentValue(args, "-by");
        string pattern = GetArgumentValue(args, "-pattern") ?? "invoke";
        var element = GetElementByIdentifier(args, identifier, by);
        switch (pattern.ToLower())
        {
            case "invoke":
                var invokePattern = element.GetCurrentPattern(InvokePattern.Pattern) as InvokePattern;
                if (invokePattern != null)
                {
                    invokePattern.Invoke();
                    Console.WriteLine("成功执行点击操作");
                    return;
                }
                break;

            case "toggle":
                var togglePattern = element.GetCurrentPattern(TogglePattern.Pattern) as TogglePattern;
                if (togglePattern != null)
                {
                    togglePattern.Toggle();
                    Console.WriteLine("成功执行切换操作");
                    return;
                }
                break;
        }
        throw new Exception("元素不支持指定的操作模式");
    }

    private static string[] GetSupportedPatterns(AutomationElement element)
    {
        var patterns = new List<string>();
        var supportedPatterns = element.GetSupportedPatterns();
        foreach (var pattern in supportedPatterns)
        {
            patterns.Add(pattern.ProgrammaticName);
        }
        return patterns.ToArray();
    }

    private static void SetElementValue(string[] args, string newValue)
    {
        string identifier = GetArgumentValue(args, "-value");
        string by = GetArgumentValue(args, "-by");
        var element = GetElementByIdentifier(args, identifier, by);

        // 尝试ValuePattern
        var valuePattern = element.GetCurrentPattern(ValuePattern.Pattern) as ValuePattern;
        if (valuePattern != null)
        {
            valuePattern.SetValue(newValue);
            Console.WriteLine("成功设置值");
            return;
        }

        // 尝试TextPattern
        var textPattern = element.GetCurrentPattern(TextPattern.Pattern) as TextPattern;
        if (textPattern != null)
        {
            // 获取支持的文本选择单位
            SupportedTextSelection supportedTextSelection = textPattern.SupportedTextSelection;
            if (supportedTextSelection != SupportedTextSelection.None)
            {
                var documentRange = textPattern.DocumentRange;
                // 选择所有文本
                documentRange.Select();
                // 替换文本
                System.Windows.Forms.SendKeys.SendWait("^a"); // Ctrl+A 全选
                System.Windows.Forms.SendKeys.SendWait(newValue);
            }
            else
            {
                throw new Exception("元素不支持文本选择");
            }
            Console.WriteLine("成功设置文本");
            return;
        }

        throw new Exception("元素不支持设置值操作");
    }

    private static void GetElementValue(string[] args)
    {
        string identifier = GetArgumentValue(args, "-value");
        string by = GetArgumentValue(args, "-by");
        var element = GetElementByIdentifier(args, identifier, by);
        string value = null;

        // 尝试ValuePattern
        var valuePattern = element.GetCurrentPattern(ValuePattern.Pattern) as ValuePattern;
        if (valuePattern != null)
        {
            value = valuePattern.Current.Value;
        }
        // 尝试TextPattern
        else
        {
            var textPattern = element.GetCurrentPattern(TextPattern.Pattern) as TextPattern;
            if (textPattern != null)
            {
                value = textPattern.DocumentRange.GetText(int.MaxValue);
            }
        }

        if (value != null)
        {
            var result = new Dictionary<string, string>();
            result.Add("value", value);
            var serializer = new JavaScriptSerializer();
            Console.Write(serializer.Serialize(result));
            return;
        }

        throw new Exception("元素不支持获取值操作");
    }

    private static void SelectItem(string[] args, string item)
    {
        string identifier = GetArgumentValue(args, "-value");
        string by = GetArgumentValue(args, "-by");
        var element = GetElementByIdentifier(args, identifier, by);

        // 尝试SelectionItemPattern
        var selectionItemPattern = element.GetCurrentPattern(SelectionItemPattern.Pattern) as SelectionItemPattern;
        if (selectionItemPattern != null)
        {
            selectionItemPattern.Select();
            Console.WriteLine("成功选择项目");
            return;
        }

        // 尝试ExpandCollapsePattern
        var expandCollapsePattern = element.GetCurrentPattern(ExpandCollapsePattern.Pattern) as ExpandCollapsePattern;
        if (expandCollapsePattern != null)
        {
            // 如果是折叠状态，先展开
            if (expandCollapsePattern.Current.ExpandCollapseState == ExpandCollapseState.Collapsed)
            {
                expandCollapsePattern.Expand();
            }

            // 查找并选择子项
            Condition nameCondition = new PropertyCondition(AutomationElement.NameProperty, item);
            AutomationElement child = element.FindFirst(TreeScope.Descendants, nameCondition);
            if (child != null)
            {
                var childSelectionPattern = child.GetCurrentPattern(SelectionItemPattern.Pattern) as SelectionItemPattern;
                if (childSelectionPattern != null)
                {
                    childSelectionPattern.Select();
                    Console.WriteLine("成功选择子项");
                    return;
                }
            }
        }

        throw new Exception("元素不支持选择操作或未找到指定项目");
    }

    private static void ExpandElement(string[] args, bool expand)
    {
        string identifier = GetArgumentValue(args, "-value");
        string by = GetArgumentValue(args, "-by");
        var element = GetElementByIdentifier(args, identifier, by);
        var expandCollapsePattern = element.GetCurrentPattern(ExpandCollapsePattern.Pattern) as ExpandCollapsePattern;

        if (expandCollapsePattern != null)
        {
            if (expand)
            {
                expandCollapsePattern.Expand();
                Console.WriteLine("成功展开元素");
            }
            else
            {
                expandCollapsePattern.Collapse();
                Console.WriteLine("成功折叠元素");
            }
            return;
        }

        throw new Exception("元素不支持展开/折叠操作");
    }

    private static void ScrollElement(string[] args, string direction, double amount)
    {
        string identifier = GetArgumentValue(args, "-value");
        string by = GetArgumentValue(args, "-by");
        var element = GetElementByIdentifier(args, identifier, by);
        var scrollPattern = element.GetCurrentPattern(ScrollPattern.Pattern) as ScrollPattern;

        if (scrollPattern != null)
        {
            if (direction.ToLower() == "horizontal")
            {
                scrollPattern.SetScrollPercent(amount, ScrollPattern.NoScroll);
            }
            else
            {
                scrollPattern.SetScrollPercent(ScrollPattern.NoScroll, amount);
            }
            Console.WriteLine("成功执行滚动操作");
            return;
        }

        throw new Exception("元素不支持滚动操作");
    }

    private static void WaitForElement(string[] args, string by, string value, int timeout)
    {
        DateTime endTime = DateTime.Now.AddSeconds(timeout);
        while (DateTime.Now < endTime)
        {
            try
            {
                FindElement(args, by, value, "subtree");
                Console.WriteLine("成功找到元素");
                return;
            }
            catch
            {
                Thread.Sleep(500);
            }
        }
        throw new Exception("等待超时");
    }

    private static void FindElementByXPath(string xpath)
    {
        // XPath查找的实现
        throw new Exception("XPath查找暂未实现");
    }

    private static void SetFocus(string[] args)
    {
        string identifier = GetArgumentValue(args, "-value");
        string by = GetArgumentValue(args, "-by");
        var element = GetElementByIdentifier(args, identifier, by);
        try
        {
            element.SetFocus();
            Console.WriteLine("成功设置焦点");
        }
        catch (Exception)
        {
            throw new Exception("无法设置焦点");
        }
    }

    private static void SendKeys(string[] args, string keys)
    {
        if (string.IsNullOrEmpty(keys))
        {
            throw new Exception("必须指定要发送的按键");
        }

        string identifier = GetArgumentValue(args, "-value");
        string by = GetArgumentValue(args, "-by");
        var element = GetElementByIdentifier(args, identifier, by);

        // 确保元素可以接收输入
        if (!element.Current.IsKeyboardFocusable)
        {
            throw new Exception("元素不支持键盘输入");
        }

        element.SetFocus();
        System.Windows.Forms.SendKeys.SendWait(keys);
        Console.WriteLine("成功发送按键");
    }

    private static void GetChildElements(string[] args, string childType)
    {
        string identifier = GetArgumentValue(args, "-value");
        string by = GetArgumentValue(args, "-by");
        var element = GetElementByIdentifier(args, identifier, by);
        var result = new List<Dictionary<string, string>>();

        TreeScope scope = TreeScope.Children;
        Condition condition = Condition.TrueCondition;

        // 根据类型筛选子元素
        if (childType != "all")
        {
            // 根据控件类型名称获取对应的ControlType
            ControlType controlType = null;
            switch (childType.ToLower())
            {
                case "button":
                    controlType = ControlType.Button;
                    break;
                case "edit":
                    controlType = ControlType.Edit;
                    break;
                case "combobox":
                    controlType = ControlType.ComboBox;
                    break;
                case "checkbox":
                    controlType = ControlType.CheckBox;
                    break;
                case "radiobutton":
                    controlType = ControlType.RadioButton;
                    break;
                case "listitem":
                    controlType = ControlType.ListItem;
                    break;
                case "treeitem":
                    controlType = ControlType.TreeItem;
                    break;
                case "menu":
                    controlType = ControlType.Menu;
                    break;
                case "menuitem":
                    controlType = ControlType.MenuItem;
                    break;
                case "tab":
                    controlType = ControlType.Tab;
                    break;
                case "window":
                    controlType = ControlType.Window;
                    break;
                default:
                    throw new Exception("不支持的控件类型: " + childType);
            }

            if (controlType != null)
            {
                condition = new PropertyCondition(
                    AutomationElement.ControlTypeProperty,
                    controlType
                );
            }
        }

        var children = element.FindAll(scope, condition);
        foreach (AutomationElement child in children)
        {
            var childInfo = new Dictionary<string, string>();
            childInfo.Add("id", CacheElement(child));
            childInfo.Add("name", child.Current.Name);
            childInfo.Add("class", child.Current.ClassName);
            childInfo.Add("type", child.Current.ControlType.ProgrammaticName);
            childInfo.Add("automationId", child.Current.AutomationId);
            result.Add(childInfo);
        }

        var serializer = new JavaScriptSerializer();
        Console.Write(serializer.Serialize(result));
    }

    private static void GetParentElement(string[] args)
    {
        string identifier = GetArgumentValue(args, "-value");
        string by = GetArgumentValue(args, "-by");
        var element = GetElementByIdentifier(args, identifier, by);
        var parent = TreeWalker.ControlViewWalker.GetParent(element);

        if (parent != null)
        {
            var parentInfo = new Dictionary<string, string>();
            parentInfo.Add("id", CacheElement(parent));
            parentInfo.Add("name", parent.Current.Name);
            parentInfo.Add("class", parent.Current.ClassName);
            parentInfo.Add("type", parent.Current.ControlType.ProgrammaticName);
            parentInfo.Add("automationId", parent.Current.AutomationId);

            var serializer = new JavaScriptSerializer();
            Console.Write(serializer.Serialize(parentInfo));
        }
        else
        {
            throw new Exception("元素没有父元素");
        }
    }

    private static void HighlightElement(string[] args, int duration)
    {
        string identifier = GetArgumentValue(args, "-value");
        string by = GetArgumentValue(args, "-by");
        var element = GetElementByIdentifier(args, identifier, by);
        var rect = element.Current.BoundingRectangle;

        // 创建一个半透明的高亮窗口
        var highlightForm = new System.Windows.Forms.Form
        {
            StartPosition = System.Windows.Forms.FormStartPosition.Manual,
            Location = new System.Drawing.Point((int)rect.Left, (int)rect.Top),
            Size = new System.Drawing.Size((int)rect.Width, (int)rect.Height),
            BackColor = System.Drawing.Color.Yellow,
            Opacity = 0.3,
            ShowInTaskbar = false,
            FormBorderStyle = System.Windows.Forms.FormBorderStyle.None,
            TopMost = true
        };

        highlightForm.Show();
        Console.WriteLine("正在高亮显示元素");

        // 等待指定时间后关闭高亮
        Thread.Sleep(duration * 1000);
        highlightForm.Close();
        highlightForm.Dispose();
    }

    private static void ListElements(string[] args, string filter)
    {
        var root = GetRootElement(args);
        var result = new List<Dictionary<string, string>>();

        // 获取所有元素
        var elements = root.FindAll(
            TreeScope.Subtree,
            Condition.TrueCondition
        );

        foreach (AutomationElement element in elements)
        {
            // 如果指定了过滤条件，检查元素名称是否包含过滤文本
            if (!string.IsNullOrEmpty(filter) &&
                !element.Current.Name.Contains(filter) &&
                !element.Current.ClassName.Contains(filter) &&
                !element.Current.AutomationId.Contains(filter))
            {
                continue;
            }

            var elementInfo = new Dictionary<string, string>();
            elementInfo.Add("id", CacheElement(element));
            elementInfo.Add("name", element.Current.Name);
            elementInfo.Add("class", element.Current.ClassName);
            elementInfo.Add("type", element.Current.ControlType.ProgrammaticName);
            elementInfo.Add("automationId", element.Current.AutomationId);
            elementInfo.Add("path", GetElementPath(element));
            result.Add(elementInfo);
        }

        var serializer = new JavaScriptSerializer();
        Console.Write(serializer.Serialize(result));
    }

    private static string GetElementPath(AutomationElement element)
    {
        var path = new List<string>();
        var current = element;

        while (current != null && current != AutomationElement.RootElement)
        {
            string name = current.Current.Name;
            string type = current.Current.ControlType.ProgrammaticName;
            string automationId = current.Current.AutomationId;
            // 构建简单的路径段
            string pathSegment = type;
            if (!string.IsNullOrEmpty(automationId))
            {
                pathSegment += string.Format("[@AutomationId='{0}']", automationId);
            }
            else if (!string.IsNullOrEmpty(name))
            {
                pathSegment += string.Format("[@Name='{0}']", name.Replace("'", "&apos;"));
            }

            path.Insert(0, pathSegment);
            current = TreeWalker.ControlViewWalker.GetParent(current);
        }

        return "//" + string.Join("/", path);
    }

    private static string CacheElement(AutomationElement element)
    {
        string elementId = Guid.NewGuid().ToString();
        elementCache[elementId] = element;
        return elementId;
    }

    private static AutomationElement GetRootElement(string[] args)
    {
        string window = GetArgumentValue(args, "-window");
        string method = GetArgumentValue(args, "-method") ?? "active";

        if (string.IsNullOrEmpty(window) && method == "active")
        {
            return AutomationElement.RootElement;
        }

        switch (method.ToLower())
        {
            case "handle":
                // 通过窗口句柄查找
                int handle = int.Parse(window);
                return AutomationElement.FromHandle(new IntPtr(handle));

            case "class":
                // 通过窗口类名查找
                return AutomationElement.RootElement.FindFirst(
                    TreeScope.Children,
                    new PropertyCondition(AutomationElement.ClassNameProperty, window)
                );

            case "process":
                // 通过进程名查找
                var processes = System.Diagnostics.Process.GetProcessesByName(window);
                if (processes.Length > 0)
                {
                    return AutomationElement.FromHandle(processes[0].MainWindowHandle);
                }
                break;

            case "active":
                // 获取当前活动窗口
                IntPtr activeHandle = GetForegroundWindow();
                return AutomationElement.FromHandle(activeHandle);

            case "title":
            default:
                // 通过窗口标题查找(支持模糊匹配)
                var windows = AutomationElement.RootElement.FindAll(
                    TreeScope.Children,
                    Condition.TrueCondition
                );
                foreach (AutomationElement win in windows)
                {
                    if (win.Current.Name.Contains(window))
                    {
                        return win;
                    }
                }
                break;
        }

        throw new Exception("找不到指定的窗口");
    }

    private static void FindElement(string[] args, string by, string value, string scope)
    {
        if (string.IsNullOrEmpty(value))
        {
            throw new Exception("必须指定查找值 (-value)");
        }

        AutomationElement root = GetRootElement(args);
        TreeScope treeScope = TreeScope.Children;
        switch (scope.ToLower())
        {
            case "descendants":
                treeScope = TreeScope.Descendants;
                break;
            case "subtree":
                treeScope = TreeScope.Subtree;
                break;
        }

        Condition condition;
        switch (by.ToLower())
        {
            case "name":
                condition = new PropertyCondition(AutomationElement.NameProperty, value);
                break;
            case "class":
                condition = new PropertyCondition(AutomationElement.ClassNameProperty, value);
                break;
            case "automation":
                condition = new PropertyCondition(AutomationElement.AutomationIdProperty, value);
                break;
            case "xpath":
                FindElementByXPath(value);
                return;
            default:
                throw new Exception("不支持的查找方式: " + by);
        }

        var elements = root.FindAll(treeScope, condition);
        var result = new List<Dictionary<string, string>>();

        foreach (AutomationElement element in elements)
        {
            var elementInfo = new Dictionary<string, string>();
            elementInfo.Add("id", CacheElement(element));
            elementInfo.Add("name", element.Current.Name);
            elementInfo.Add("class", element.Current.ClassName);
            elementInfo.Add("type", element.Current.ControlType.ProgrammaticName);
            elementInfo.Add("automationId", element.Current.AutomationId);
            result.Add(elementInfo);
        }

        var serializer = new JavaScriptSerializer();
        Console.Write(serializer.Serialize(result));
    }

    private static void InspectElement(string[] args, int timeout)
    {
        Console.WriteLine("请在" + timeout + "秒内点击要识别的元素...");

        // 记录当前鼠标位置
        DateTime endTime = DateTime.Now.AddSeconds(timeout);
        AutomationElement clickedElement = null;
        bool wasPressed = false;

        while (DateTime.Now < endTime)
        {
            // 检测鼠标左键点击
            bool isPressed = (GetAsyncKeyState(0x01) & 0x8000) != 0;
            if (isPressed && !wasPressed)  // 鼠标按下瞬间
            {
                // 获取当前鼠标位置
                Point currentPosition;
                GetCursorPos(out currentPosition);

                try
                {
                    // 从鼠标位置获取元素
                    clickedElement = AutomationElement.FromPoint(currentPosition.ToWindowsPoint());
                    if (clickedElement != null && clickedElement != AutomationElement.RootElement)
                    {
                        // 构建元素信息
                        var elementInfo = new Dictionary<string, object>();
                        elementInfo.Add("id", CacheElement(clickedElement));
                        elementInfo.Add("name", clickedElement.Current.Name);
                        elementInfo.Add("class", clickedElement.Current.ClassName);
                        elementInfo.Add("type", clickedElement.Current.ControlType.ProgrammaticName);
                        elementInfo.Add("automationId", clickedElement.Current.AutomationId);
                        elementInfo.Add("path", GetElementPath(clickedElement));
                        elementInfo.Add("location", new {
                            x = clickedElement.Current.BoundingRectangle.X,
                            y = clickedElement.Current.BoundingRectangle.Y,
                            width = clickedElement.Current.BoundingRectangle.Width,
                            height = clickedElement.Current.BoundingRectangle.Height
                        });
                        elementInfo.Add("patterns", GetSupportedPatterns(clickedElement));

                        // 生成示例命令
                        var commands = new List<string>();
                        if (!string.IsNullOrEmpty(clickedElement.Current.Name))
                            commands.Add(string.Format("automation.exe -type find -by name -value \"{0}\"", clickedElement.Current.Name));
                        if (!string.IsNullOrEmpty(clickedElement.Current.AutomationId))
                            commands.Add(string.Format("automation.exe -type find -by automationid -value \"{0}\"", clickedElement.Current.AutomationId));
                        elementInfo.Add("commands", commands);

                        var serializer = new JavaScriptSerializer();
                        Console.Write(serializer.Serialize(elementInfo));
                        return;
                    }
                }
                catch
                {
                    // 忽略获取元素时的错误
                }
            }

            wasPressed = isPressed;
            Thread.Sleep(100);
        }

        throw new Exception("操作超时");
    }
}
