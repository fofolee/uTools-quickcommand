using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Net.NetworkInformation;
using System.Diagnostics;
using System.IO;
using Microsoft.Win32;
using System.Drawing;
using System.Drawing.Imaging;

public class SystemUtils
{
  #region Win32 API
  [DllImport("user32.dll", CharSet = CharSet.Auto)]
  private static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);

  [DllImport("user32.dll")]
  private static extern int SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);

  [DllImport("user32.dll")]
  private static extern IntPtr GetForegroundWindow();

  [DllImport("PowrProf.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
  private static extern bool SetSuspendState(bool hibernate, bool forceCritical, bool disableWakeEvent);

  [DllImport("kernel32.dll")]
  private static extern EXECUTION_STATE SetThreadExecutionState(EXECUTION_STATE esFlags);

  [DllImport("user32.dll")]
  static extern IntPtr GetDesktopWindow();

  [DllImport("user32.dll")]
  static extern IntPtr GetWindowDC(IntPtr hWnd);

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

  [StructLayout(LayoutKind.Sequential)]
  public struct RECT
  {
    public int left;
    public int top;
    public int right;
    public int bottom;
  }

  [DllImport("user32.dll")]
  private static extern int GetWindowRect(IntPtr hWnd, ref RECT rect);

  [DllImport("user32.dll")]
  private static extern IntPtr ReleaseDC(IntPtr hWnd, IntPtr hDC);

  private const int SPI_SETDESKWALLPAPER = 20;
  private const int SPIF_UPDATEINIFILE = 0x01;
  private const int SPIF_SENDCHANGE = 0x02;
  private const int WM_SYSCOMMAND = 0x0112;
  private const int SC_MONITORPOWER = 0xF170;

  [Flags]
  private enum EXECUTION_STATE : uint
  {
    ES_AWAYMODE_REQUIRED = 0x00000040,
    ES_CONTINUOUS = 0x80000000,
    ES_DISPLAY_REQUIRED = 0x00000002,
    ES_SYSTEM_REQUIRED = 0x00000001
  }
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
      switch (type.ToLower())
      {
        case "wallpaper":
          string wallpaperPath = GetArgumentValue(args, "-path");
          if (string.IsNullOrEmpty(wallpaperPath))
          {
            Console.Error.WriteLine("Error: 必须指定壁纸路径 (-path)");
            return;
          }
          SetWallpaper(wallpaperPath);
          break;

        case "monitor":
          string action = GetArgumentValue(args, "-action");
          if (string.IsNullOrEmpty(action))
          {
            Console.Error.WriteLine("Error: 必须指定动作 (-action)");
            return;
          }
          ControlMonitor(action);
          break;

        case "power":
          string mode = GetArgumentValue(args, "-mode");
          if (string.IsNullOrEmpty(mode))
          {
            Console.Error.WriteLine("Error: 必须指定电源模式 (-mode)");
            return;
          }
          PowerControl(mode);
          break;

        case "network":
          string interfaceName = GetArgumentValue(args, "-interface");
          string ip = GetArgumentValue(args, "-ip");
          string mask = GetArgumentValue(args, "-mask");
          string gateway = GetArgumentValue(args, "-gateway");
          string dns = GetArgumentValue(args, "-dns");
          ConfigureNetwork(interfaceName, ip, mask, gateway, dns);
          break;

        case "startup":
          string appPath = GetArgumentValue(args, "-path");
          string appName = GetArgumentValue(args, "-name");
          bool remove = HasArgument(args, "-remove");
          ManageStartup(appPath, appName, remove);
          break;

        case "shortcut":
          string targetPath = GetArgumentValue(args, "-target");
          string shortcutPath = GetArgumentValue(args, "-path");
          string shortcutArgs = GetArgumentValue(args, "-args");
          CreateShortcut(targetPath, shortcutPath, shortcutArgs);
          break;

        case "brightness":
          string brightness = GetArgumentValue(args, "-level");
          if (string.IsNullOrEmpty(brightness))
          {
            Console.Error.WriteLine("Error: 必须指定亮度级别 (-level)");
            return;
          }
          SetBrightness(int.Parse(brightness));
          break;

        case "screenshot":
          string savePath = GetArgumentValue(args, "-path");
          if (string.IsNullOrEmpty(savePath))
          {
            Console.Error.WriteLine("Error: 必须指定保存路径 (-path)");
            return;
          }
          CaptureScreenToFile(savePath);
          Console.WriteLine("成功保存截图");
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

  private static void SetWallpaper(string path)
  {
    if (!File.Exists(path))
    {
      throw new Exception("壁纸文件不存在");
    }

    SystemParametersInfo(SPI_SETDESKWALLPAPER, 0, path, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);
    Console.WriteLine("成功设置壁纸");
  }

  private static void ControlMonitor(string action)
  {
    IntPtr hWnd = GetForegroundWindow();
    switch (action.ToLower())
    {
      case "off":
        SendMessage(hWnd, WM_SYSCOMMAND, SC_MONITORPOWER, 2);
        break;
      case "on":
        SendMessage(hWnd, WM_SYSCOMMAND, SC_MONITORPOWER, -1);
        break;
      default:
        throw new Exception("不支持的显示器操作");
    }
    Console.WriteLine("成功控制显示器");
  }

  private static void PowerControl(string mode)
  {
    switch (mode.ToLower())
    {
      case "sleep":
        SetSuspendState(false, false, false);
        break;
      case "hibernate":
        SetSuspendState(true, false, false);
        break;
      case "awake":
        SetThreadExecutionState(EXECUTION_STATE.ES_CONTINUOUS | EXECUTION_STATE.ES_DISPLAY_REQUIRED | EXECUTION_STATE.ES_SYSTEM_REQUIRED);
        break;
      case "normal":
        SetThreadExecutionState(EXECUTION_STATE.ES_CONTINUOUS);
        break;
      default:
        throw new Exception("不支持的电源模式");
    }
    Console.WriteLine("成功设置电源模式");
  }

  private static void ConfigureNetwork(string interfaceName, string ip, string mask, string gateway, string dns)
  {
    // 使用netsh命令配置网络
    StringBuilder command = new StringBuilder();
    command.AppendFormat("interface ip set address \"{0}\" static {1} {2}", interfaceName, ip, mask);
    if (!string.IsNullOrEmpty(gateway))
    {
      command.AppendFormat(" {0}", gateway);
    }

    ProcessStartInfo startInfo = new ProcessStartInfo
    {
      FileName = "netsh",
      Arguments = command.ToString(),
      UseShellExecute = false,
      RedirectStandardOutput = true,
      CreateNoWindow = true
    };

    using (Process process = Process.Start(startInfo))
    {
      process.WaitForExit();
      if (process.ExitCode != 0)
      {
        throw new Exception("设置IP地址失败");
      }
    }

    if (!string.IsNullOrEmpty(dns))
    {
      command.Clear();
      command.AppendFormat("interface ip set dns \"{0}\" static {1}", interfaceName, dns);
      startInfo.Arguments = command.ToString();

      using (Process process = Process.Start(startInfo))
      {
        process.WaitForExit();
        if (process.ExitCode != 0)
        {
          throw new Exception("设置DNS失败");
        }
      }
    }

    Console.WriteLine("成功配置网络");
  }

  private static void ManageStartup(string appPath, string appName, bool remove)
  {
    string keyPath = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Run";
    using (RegistryKey key = Registry.CurrentUser.OpenSubKey(keyPath, true))
    {
      if (key == null)
      {
        throw new Exception("无法访问启动项注册表");
      }

      if (remove)
      {
        key.DeleteValue(appName, false);
        Console.WriteLine("成功移除开机启动项");
      }
      else
      {
        key.SetValue(appName, appPath);
        Console.WriteLine("成功添加开机启动项");
      }
    }
  }

  private static void CreateShortcut(string targetPath, string shortcutPath, string args)
  {
    // 使用PowerShell创建快捷方式
    StringBuilder command = new StringBuilder();
    command.AppendFormat(@"
            $WshShell = New-Object -comObject WScript.Shell
            $Shortcut = $WshShell.CreateShortcut('{0}')
            $Shortcut.TargetPath = '{1}'",
        shortcutPath.Replace("'", "''"),
        targetPath.Replace("'", "''"));

    if (!string.IsNullOrEmpty(args))
    {
      command.AppendFormat(@"
                $Shortcut.Arguments = '{0}'",
          args.Replace("'", "''"));
    }

    command.Append(@"
            $Shortcut.Save()");

    ProcessStartInfo startInfo = new ProcessStartInfo
    {
      FileName = "powershell",
      Arguments = command.ToString(),
      UseShellExecute = false,
      RedirectStandardOutput = true,
      CreateNoWindow = true
    };

    using (Process process = Process.Start(startInfo))
    {
      process.WaitForExit();
      if (process.ExitCode != 0)
      {
        throw new Exception("创建快捷方式失败");
      }
    }

    Console.WriteLine("成功创建快捷方式");
  }

  private static void SetBrightness(int level)
  {
    if (level < 0 || level > 100)
    {
      throw new Exception("亮度级别必须在0-100之间");
    }

    // 使用PowerShell命令设置亮度
    ProcessStartInfo startInfo = new ProcessStartInfo
    {
      FileName = "powershell",
      Arguments = string.Format("(Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1,{0})", level),
      UseShellExecute = false,
      RedirectStandardOutput = true,
      CreateNoWindow = true
    };

    using (Process process = Process.Start(startInfo))
    {
      process.WaitForExit();
      if (process.ExitCode != 0)
      {
        throw new Exception("设置亮度失败");
      }
    }

    Console.WriteLine("成功设置亮度");
  }

  private static Image CaptureScreen()
  {
    IntPtr handle = GetDesktopWindow();
    IntPtr hdcSrc = GetWindowDC(handle);
    RECT windowRect = new RECT();
    GetWindowRect(handle, ref windowRect);
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

  private static void CaptureScreenToFile(string path)
  {
    Image img = CaptureScreen();
    img.Save(path, ImageFormat.Png);
    img.Dispose();
  }

  private static void ShowHelp()
  {
    string help = @"
Windows 系统工具使用说明
===================

基本语法:
utils.exe -type <操作类型> [参数...]

操作类型:
--------
1. wallpaper - 设置壁纸
   参数:
     -path <文件路径>  壁纸图片路径
   示例: utils.exe -type wallpaper -path ""C:\wallpaper.jpg""

2. monitor - 控制显示器
   参数:
     -action <动作>  on/off
   示例: utils.exe -type monitor -action off

3. power - 电源控制
   参数:
     -mode <模式>  sleep/hibernate/awake/normal
   示例: utils.exe -type power -mode sleep

4. network - 配置网络
   参数:
     -interface <网卡名称>  网络接口名称
     -ip <IP地址>          要设置的IP地址
     -mask <子网掩码>      子网掩码
     -gateway <网关>       默认网关（可选）
     -dns <DNS>           DNS服务器（可选）
   示例: utils.exe -type network -interface ""以太网"" -ip 192.168.1.100 -mask 255.255.255.0

5. startup - 管理开机启动项
   参数:
     -path <应用程序路径>  应用程序路径
     -name <启动项名称>  启动项名称
     -remove         移除开机启动项（可选）
   示例: utils.exe -type startup -path ""C:\Program Files\MyApp\MyApp.exe"" -name MyApp

6. shortcut - 创建快捷方式
   参数:
     -target <目标路径>  目标路径
     -path <快捷方式路径>  快捷方式路径
     -args <参数>  参数（可选）
   示例: utils.exe -type shortcut -target ""C:\Program Files\MyApp\MyApp.exe"" -path ""C:\Users\MyUser\Desktop\MyApp.lnk""

7. brightness - 控制亮度
    参数:
      -level <亮度>  亮度级别（0-100）
    示例: utils.exe -type brightness -level 75

8. screenshot - 屏幕截图
   参数:
     -path <保存路径>  截图保存路径
   示例: utils.exe -type screenshot -path ""C:\screenshot.png""

注意事项:
--------
1. 某些操作可能需要管理员权限
2. 网络配置更改可能会暂时断开网络连接
3. 电源控制可能会影响正在运行的程序
4. 建议在更改系统设置前先备份当前配置
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

  private static bool HasArgument(string[] args, string key)
  {
    return Array.Exists(args, arg => arg.Equals(key, StringComparison.OrdinalIgnoreCase));
  }
}
