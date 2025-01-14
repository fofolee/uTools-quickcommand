using System;
using System.Text;
using Microsoft.Win32;
using System.Collections.Generic;
using System.Web.Script.Serialization;

public class RegistryManager
{
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
            string path = GetArgumentValue(args, "-path");
            string name = GetArgumentValue(args, "-name");
            string value = GetArgumentValue(args, "-value");
            string valueType = GetArgumentValue(args, "-valuetype");
            if (valueType == null)
            {
                valueType = "string";
            }
            else
            {
                valueType = valueType.ToLower();
            }

            switch (type.ToLower())
            {
                case "get":
                    if (string.IsNullOrEmpty(path))
                    {
                        Console.Error.WriteLine("Error: 必须指定注册表路径 (-path)");
                        return;
                    }
                    GetValue(path, name);
                    break;

                case "set":
                    if (string.IsNullOrEmpty(path) || string.IsNullOrEmpty(name))
                    {
                        Console.Error.WriteLine("Error: 必须指定注册表路径 (-path) 和键名 (-name)");
                        return;
                    }
                    SetValue(path, name, value, valueType);
                    break;

                case "delete":
                    if (string.IsNullOrEmpty(path))
                    {
                        Console.Error.WriteLine("Error: 必须指定注册表路径 (-path)");
                        return;
                    }
                    DeleteValue(path, name);
                    break;

                case "list":
                    if (string.IsNullOrEmpty(path))
                    {
                        Console.Error.WriteLine("Error: 必须指定注册表路径 (-path)");
                        return;
                    }
                    ListKeys(path);
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

    private static void GetValue(string path, string name)
    {
        using (RegistryKey key = OpenRegistryKey(path))
        {
            if (key != null)
            {
                object value = key.GetValue(name);
                if (value != null)
                {
                    var info = new Dictionary<string, string>();
                    info["path"] = path.Replace("\\", "\\\\");
                    info["name"] = name;
                    info["value"] = value.ToString();
                    info["type"] = key.GetValueKind(name).ToString();

                    var serializer = new JavaScriptSerializer();
                    Console.Write(serializer.Serialize(info));
                    return;
                }
            }
        }
        Console.Error.WriteLine("Error: 找不到指定的注册表值");
    }

    private static void SetValue(string path, string name, string value, string valueType)
    {
        using (RegistryKey key = OpenRegistryKey(path, true))
        {
            if (key == null)
            {
                throw new Exception("找不到指定的注册表项");
            }

            object typedValue = ConvertValue(value, valueType);
            RegistryValueKind kind = GetValueKind(valueType);
            key.SetValue(name, typedValue, kind);
            Console.WriteLine("成功设置注册表值");
        }
    }

    private static void DeleteValue(string path, string name)
    {
        using (RegistryKey key = OpenRegistryKey(path, true))
        {
            if (key == null)
            {
                throw new Exception("找不到指定的注册表项");
            }

            if (string.IsNullOrEmpty(name))
            {
                // 删除整个键
                Registry.LocalMachine.DeleteSubKeyTree(GetRelativePath(path), false);
                Console.WriteLine("成功删除注册表项");
            }
            else
            {
                // 删除指定值
                key.DeleteValue(name, false);
                Console.WriteLine("成功删除注册表值");
            }
        }
    }

    private static void ListKeys(string path)
    {
        var result = new List<Dictionary<string, string>>();
        using (RegistryKey key = OpenRegistryKey(path))
        {
            if (key != null)
            {
                foreach (string subKeyName in key.GetSubKeyNames())
                {
                    var info = new Dictionary<string, string>();
                    info["path"] = (path + "\\" + subKeyName).Replace("\\", "\\\\");
                    info["name"] = subKeyName;
                    result.Add(info);
                }
            }
        }

        var serializer = new JavaScriptSerializer();
        Console.Write(serializer.Serialize(result));
    }

    private static RegistryKey OpenRegistryKey(string path, bool writable = false)
    {
        string[] parts = path.Split('\\');
        if (parts.Length < 2)
        {
            throw new Exception("无效的注册表路径");
        }

        RegistryKey root = GetRootKey(parts[0]);
        string subPath = string.Join("\\", parts, 1, parts.Length - 1);
        return root.OpenSubKey(subPath, writable);
    }

    private static RegistryKey GetRootKey(string name)
    {
        switch (name.ToUpper())
        {
            case "HKLM":
            case "HKEY_LOCAL_MACHINE":
                return Registry.LocalMachine;
            case "HKCU":
            case "HKEY_CURRENT_USER":
                return Registry.CurrentUser;
            case "HKCR":
            case "HKEY_CLASSES_ROOT":
                return Registry.ClassesRoot;
            case "HKU":
            case "HKEY_USERS":
                return Registry.Users;
            case "HKCC":
            case "HKEY_CURRENT_CONFIG":
                return Registry.CurrentConfig;
            default:
                throw new Exception("无效的注册表根键");
        }
    }

    private static string GetRelativePath(string path)
    {
        string[] parts = path.Split('\\');
        if (parts.Length < 2)
        {
            throw new Exception("无效的注册表路径");
        }
        return string.Join("\\", parts, 1, parts.Length - 1);
    }

    private static void OutputValue(string name, object value, RegistryValueKind kind)
    {
        string valueStr = FormatValue(value, kind);
        Console.WriteLine(string.Format("{{\"type\": \"value\", \"name\": \"{0}\", \"value\": {1}, \"valueType\": \"{2}\"}}",
            name.Replace("\"", "\\\""),
            valueStr,
            kind.ToString()));
    }

    private static string FormatValue(object value, RegistryValueKind kind)
    {
        switch (kind)
        {
            case RegistryValueKind.String:
            case RegistryValueKind.ExpandString:
                return string.Format("\"{0}\"", value.ToString().Replace("\"", "\\\""));
            case RegistryValueKind.MultiString:
                return string.Format("[{0}]", string.Join(",", Array.ConvertAll(
                    (string[])value,
                    s => string.Format("\"{0}\"", s.Replace("\"", "\\\"")))));
            case RegistryValueKind.Binary:
                return string.Format("[{0}]", string.Join(",", (byte[])value));
            default:
                return value.ToString();
        }
    }

    private static object ConvertValue(string value, string valueType)
    {
        switch (valueType)
        {
            case "string":
                return value;
            case "dword":
                return int.Parse(value);
            case "qword":
                return long.Parse(value);
            case "binary":
                return Array.ConvertAll(value.Split(','), byte.Parse);
            case "multistring":
                return value.Split(',');
            case "expandstring":
                return value;
            default:
                throw new Exception("不支持的值类型");
        }
    }

    private static RegistryValueKind GetValueKind(string valueType)
    {
        switch (valueType)
        {
            case "string":
                return RegistryValueKind.String;
            case "dword":
                return RegistryValueKind.DWord;
            case "qword":
                return RegistryValueKind.QWord;
            case "binary":
                return RegistryValueKind.Binary;
            case "multistring":
                return RegistryValueKind.MultiString;
            case "expandstring":
                return RegistryValueKind.ExpandString;
            default:
                throw new Exception("不支持的值类型");
        }
    }

    private static void ShowHelp()
    {
        string help = @"
Windows 注册表管理工具使用说明
======================

基本语法:
registry.exe -type <操作类型> [参数...]

操作类型:
--------
1. get - 获取注册表值
   参数:
     -path <注册表路径>  完整的注册表路径
     -name <值名称>      要获取的值名称（可选，不指定则列出所有值）
   示例:
     registry.exe -type get -path ""HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion"" -name ""ProgramFilesDir""

2. set - 设置注册表值
   参数:
     -path <注册表路径>  完整的注册表路径
     -name <值名称>      要设置的值名称
     -value <值>         要设置的值
     -valuetype <类型>   值类型（可选，默认为string）
                        支持的类型：string, dword, qword, binary, multistring, expandstring
   示例:
     registry.exe -type set -path ""HKCU\Software\MyApp"" -name ""Setting"" -value ""123"" -valuetype dword

3. delete - 删除注册表项或值
   参数:
     -path <注册表路径>  完整的注册表路径
     -name <值名称>      要删除的值名称（可选，不指定则删除整个键）
   示例:
     registry.exe -type delete -path ""HKCU\Software\MyApp"" -name ""Setting""

4. list - 列出注册表项下的所有子项和值
   参数:
     -path <注册表路径>  完整的注册表路径
   示例:
     registry.exe -type list -path ""HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion""

返回值:
------
JSON格式的注册表信息：
键：{""type"": ""key"", ""name"": ""键名""}
值：{""type"": ""value"", ""name"": ""值名"", ""value"": 值, ""valueType"": ""值类型""}

注意事项:
--------
1. 需要管理员权限才能修改系统关键注册表项
2. 注册表路径必须以根键开头（HKLM、HKCU、HKCR、HKU、HKCC）
3. 修改注册表可能会影响系统稳定性，请谨慎操作
4. 建议在修改前备份重要的注册表项
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
}
