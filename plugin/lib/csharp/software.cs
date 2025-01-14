using System;
using System.Text;
using System.Runtime.InteropServices;
using Microsoft.Win32;
using System.Collections.Generic;
using System.Diagnostics;
using System.Web.Script.Serialization;
using System.Linq;

public class SoftwareManager
{
    [DllImport("msi.dll", CharSet = CharSet.Unicode)]
    private static extern uint MsiEnumProducts(uint iProductIndex, StringBuilder lpProductBuf);

    [DllImport("msi.dll", CharSet = CharSet.Unicode)]
    private static extern uint MsiGetProductInfo(string szProduct, string szProperty, StringBuilder lpValueBuf, ref uint pcchValueBuf);

    [DllImport("msi.dll", CharSet = CharSet.Unicode)]
    private static extern uint MsiConfigureProduct(string szProduct, int iInstallLevel, int eInstallState);

    private const int INSTALLSTATE_DEFAULT = -1;
    private const int INSTALLSTATE_ABSENT = 2;
    private const int INSTALLLEVEL_DEFAULT = 0;

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
                    ListSoftware();
                    break;
                case "uninstall":
                    string target = GetArgumentValue(args, "-target");
                    if (string.IsNullOrEmpty(target))
                    {
                        Console.Error.WriteLine("Error: 必须指定目标软件 (-target)");
                        return;
                    }
                    UninstallSoftware(target);
                    break;
                case "repair":
                    string product = GetArgumentValue(args, "-target");
                    if (string.IsNullOrEmpty(product))
                    {
                        Console.Error.WriteLine("Error: 必须指定目标软件 (-target)");
                        return;
                    }
                    RepairSoftware(product);
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

    private static void ListSoftware()
    {
        Console.Write("[");
        bool first = true;

        // 列出MSI安装的软件
        uint index = 0;
        StringBuilder productCode = new StringBuilder(39);
        while (MsiEnumProducts(index++, productCode) == 0)
        {
            uint charCount = 128;
            StringBuilder displayName = new StringBuilder((int)charCount);
            StringBuilder publisher = new StringBuilder((int)charCount);
            StringBuilder version = new StringBuilder((int)charCount);

            MsiGetProductInfo(productCode.ToString(), "ProductName", displayName, ref charCount);
            charCount = 128;
            MsiGetProductInfo(productCode.ToString(), "Publisher", publisher, ref charCount);
            charCount = 128;
            MsiGetProductInfo(productCode.ToString(), "VersionString", version, ref charCount);

            if (!first)
            {
                Console.Write(",");
            }
            first = false;
            Console.Write(string.Format("{{\"name\": \"{0}\", \"publisher\": \"{1}\", \"version\": \"{2}\", \"source\": \"{3}\", \"id\": \"{4}\"}}",
                displayName.ToString().Replace("\"", "\\\""),
                publisher.ToString().Replace("\"", "\\\""),
                version.ToString().Replace("\"", "\\\""),
                "MSI",
                productCode.ToString().Replace("\\", "\\\\").Replace("\"", "\\\"")));
        }

        // 列出注册表中的软件
        string[] registryPaths = {
            @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
            @"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
        };

        foreach (string registryPath in registryPaths)
        {
            using (RegistryKey key = Registry.LocalMachine.OpenSubKey(registryPath))
            {
                if (key != null)
                {
                    foreach (string subKeyName in key.GetSubKeyNames())
                    {
                        using (RegistryKey subKey = key.OpenSubKey(subKeyName))
                        {
                            if (subKey != null)
                            {
                                string displayName = subKey.GetValue("DisplayName") as string;
                                if (!string.IsNullOrEmpty(displayName))
                                {
                                    string publisher = subKey.GetValue("Publisher") as string;
                                    if (publisher == null) publisher = "";
                                    string version = subKey.GetValue("DisplayVersion") as string;
                                    if (version == null) version = "";
                                    string uninstallString = subKey.GetValue("UninstallString") as string;
                                    if (uninstallString == null) uninstallString = "";

                                    if (!first)
                                    {
                                        Console.Write(",");
                                    }
                                    first = false;
                                    Console.Write(string.Format("{{\"name\": \"{0}\", \"publisher\": \"{1}\", \"version\": \"{2}\", \"source\": \"{3}\", \"id\": \"{4}\"}}",
                                        displayName.Replace("\"", "\\\""),
                                        publisher.Replace("\"", "\\\""),
                                        version.Replace("\"", "\\\""),
                                        "Registry",
                                        uninstallString.Replace("\\", "\\\\").Replace("\"", "\\\"")));
                                }
                            }
                        }
                    }
                }
            }
        }
        Console.Write("]");
    }

    private static void OutputSoftwareInfo(string name, string publisher, string version, string source, string id)
    {
        Console.WriteLine(string.Format("{{\"name\": \"{0}\", \"publisher\": \"{1}\", \"version\": \"{2}\", \"source\": \"{3}\", \"id\": \"{4}\"}}",
            name.Replace("\"", "\\\""),
            publisher.Replace("\"", "\\\""),
            version.Replace("\"", "\\\""),
            source,
            id.Replace("\"", "\\\"")));
    }

    private static void UninstallSoftware(string target)
    {
        // 尝试通过MSI卸载
        if (target.Length == 38 && target.StartsWith("{") && target.EndsWith("}"))
        {
            uint result = MsiConfigureProduct(target, INSTALLLEVEL_DEFAULT, INSTALLSTATE_ABSENT);
            if (result == 0)
            {
                Console.WriteLine("成功启动卸载程序");
                return;
            }
        }

        // 尝试通过注册表卸载字符串卸载
        string[] registryPaths = {
            @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
            @"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
        };

        foreach (string registryPath in registryPaths)
        {
            using (RegistryKey key = Registry.LocalMachine.OpenSubKey(registryPath))
            {
                if (key != null)
                {
                    foreach (string subKeyName in key.GetSubKeyNames())
                    {
                        using (RegistryKey subKey = key.OpenSubKey(subKeyName))
                        {
                            if (subKey != null)
                            {
                                string displayName = subKey.GetValue("DisplayName") as string;
                                if (displayName != null && displayName.Contains(target))
                                {
                                    string uninstallString = subKey.GetValue("UninstallString") as string;
                                    if (!string.IsNullOrEmpty(uninstallString))
                                    {
                                        // 启动卸载程序
                                        ProcessStartInfo startInfo = new ProcessStartInfo
                                        {
                                            FileName = "cmd.exe",
                                            Arguments = "/c " + uninstallString,
                                            UseShellExecute = true
                                        };
                                        Process.Start(startInfo);
                                        Console.WriteLine("成功启动卸载程序");
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        throw new Exception("找不到指定的软件或无法卸载");
    }

    private static void RepairSoftware(string productCode)
    {
        if (productCode.Length != 38 || !productCode.StartsWith("{") || !productCode.EndsWith("}"))
        {
            throw new Exception("无效的产品代码");
        }

        uint result = MsiConfigureProduct(productCode, INSTALLLEVEL_DEFAULT, INSTALLSTATE_DEFAULT);
        if (result == 0)
        {
            Console.WriteLine("成功启动修复程序");
        }
        else
        {
            throw new Exception("无法修复软件");
        }
    }

    private static void ShowHelp()
    {
        string help = @"
Windows 软件管理工具使用说明
======================

基本语法:
software.exe -type <操作类型> [参数...]

操作类型:
--------
1. list - 列出已安装的软件
   示例: software.exe -type list

2. uninstall - 卸载软件
   参数:
     -target <软件名称或ID>  要卸载的软件名称或产品代码
   示例:
     software.exe -type uninstall -target ""Microsoft Office""
     software.exe -type uninstall -target ""{12345678-1234-1234-1234-123456789012}""

3. repair - 修复MSI安装的软件
   参数:
     -target <产品代码>  要修复的软件的产品代码
   示例: software.exe -type repair -target ""{12345678-1234-1234-1234-123456789012}""

返回值:
------
list操作返回JSON格式的软件信息：
{""name"": ""软件名称"", ""publisher"": ""发布者"", ""version"": ""版本"", ""source"": ""来源"", ""id"": ""标识符""}

注意事项:
--------
1. 需要管理员权限
2. 卸载和修复操作可能需要用户确认
3. 并非所有软件都支持修复功能
4. 卸载操作会启动软件自带的卸载程序
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

    private static string GetSoftwareInfo()
    {
        var result = new List<Dictionary<string, string>>();
        string uninstallKey = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall";
        string uninstallKey32 = @"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall";

        // 获取64位和32位软件信息
        GetSoftwareFromRegistry(Registry.LocalMachine, uninstallKey, result);
        GetSoftwareFromRegistry(Registry.LocalMachine, uninstallKey32, result);

        var serializer = new JavaScriptSerializer();
        return serializer.Serialize(result.Select(info => new {
            id = info["id"],
            name = info["name"],
            version = info["version"],
            publisher = info["publisher"],
            installLocation = info.ContainsKey("installLocation") && info["installLocation"] != null ?
                info["installLocation"].Replace("\\", "\\\\") : null,
            uninstallString = info.ContainsKey("uninstallString") && info["uninstallString"] != null ?
                info["uninstallString"].Replace("\\", "\\\\") : null
        }));
    }

    private static void GetSoftwareFromRegistry(RegistryKey root, string keyPath, List<Dictionary<string, string>> result)
    {
        using (RegistryKey key = root.OpenSubKey(keyPath))
        {
            if (key != null)
            {
                foreach (string subKeyName in key.GetSubKeyNames())
                {
                    using (RegistryKey subKey = key.OpenSubKey(subKeyName))
                    {
                        if (subKey != null)
                        {
                            string displayName = subKey.GetValue("DisplayName") as string;
                            if (!string.IsNullOrEmpty(displayName))
                            {
                                var info = new Dictionary<string, string>();
                                info["id"] = subKeyName;
                                info["name"] = displayName;
                                info["version"] = subKey.GetValue("DisplayVersion") as string ?? "";
                                info["publisher"] = subKey.GetValue("Publisher") as string ?? "";
                                info["installLocation"] = subKey.GetValue("InstallLocation") as string;
                                info["uninstallString"] = subKey.GetValue("UninstallString") as string;
                                result.Add(info);
                            }
                        }
                    }
                }
            }
        }
    }
}
