using System;
using System.Collections.Generic;
using System.Web.Script.Serialization;

public class ExplorerManager
{
  public static void Main(string[] args)
  {
    if (args.Length == 0 || args[0] == "-h" || args[0] == "--help")
    {
      ShowHelp();
      return;
    }

    try
    {
      string type = GetArgumentValue(args, "-type");
      if (string.IsNullOrEmpty(type))
      {
        throw new Exception("必须指定操作类型 (-type)");
      }

      switch (type.ToLower())
      {
        case "list":
          ListExplorerWindows();
          break;

        case "navigate":
          string handle = GetArgumentValue(args, "-handle");
          string path = GetArgumentValue(args, "-path");
          if (string.IsNullOrEmpty(handle) || string.IsNullOrEmpty(path))
          {
            throw new Exception("必须指定窗口句柄和目标路径");
          }
          NavigateToPath(long.Parse(handle), path);
          break;

        default:
          throw new Exception(string.Format("不支持的操作类型: {0}", type));
      }
    }
    catch (Exception ex)
    {
      Console.Error.WriteLine(string.Format("Error: {0}", ex.Message));
    }
  }

  private static void ListExplorerWindows()
  {
    var explorerWindows = new List<Dictionary<string, object>>();

    try
    {
      dynamic shellApp = Activator.CreateInstance(Type.GetTypeFromProgID("Shell.Application"));
      dynamic windows = shellApp.Windows();

      foreach (dynamic window in windows)
      {
        try
        {
          string locationUrl = window.LocationURL;
          if (string.IsNullOrEmpty(locationUrl)) continue;

          string path = new Uri(locationUrl).LocalPath;
          explorerWindows.Add(new Dictionary<string, object>
                    {
                        { "handle", window.HWND },
                        { "title", window.LocationName },
                        { "path", path },
                        { "class", "CabinetWClass" }
                    });
        }
        catch
        {
          // 忽略获取信息失败的窗口
        }
      }
    }
    catch (Exception ex)
    {
      Console.Error.WriteLine(string.Format("Error: {0}", ex.Message));
      return;
    }

    var serializer = new JavaScriptSerializer();
    Console.WriteLine(serializer.Serialize(explorerWindows));
  }

  private static void NavigateToPath(long handle, string path)
  {
    try
    {
      dynamic shellApp = Activator.CreateInstance(Type.GetTypeFromProgID("Shell.Application"));
      dynamic windows = shellApp.Windows();

      foreach (dynamic window in windows)
      {
        try
        {
          if (window.HWND == handle)
          {
            window.Navigate(path);
            Console.WriteLine("true");
            return;
          }
        }
        catch
        {
          // 忽略单个窗口的错误
        }
      }
      throw new Exception("未找到指定的窗口");
    }
    catch (Exception ex)
    {
      throw new Exception(string.Format("导航失败: {0}", ex.Message));
    }
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
    Console.WriteLine(@"
Windows 资源管理器工具使用说明
==========================

基本语法:
explorer.exe -type <操作类型> [参数...]

操作类型:
--------
1. list      - 列出所有打开的资源管理器窗口
2. navigate  - 导航到指定路径
   参数:
   -handle   窗口句柄
   -path     目标路径

返回值:
------
list: JSON格式的窗口信息数组
navigate: true表示成功

使用示例:
--------
1. 列出所有资源管理器窗口：
   explorer.exe -type list
2. 导航到指定路径：
   explorer.exe -type navigate -handle 12345 -path ""C:\Windows""
");
  }
}
