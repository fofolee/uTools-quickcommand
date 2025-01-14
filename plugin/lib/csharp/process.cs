using System;
using System.Diagnostics;
using System.Text;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.IO;

public class ProcessManager
{
    [DllImport("kernel32.dll")]
    private static extern IntPtr OpenProcess(uint dwDesiredAccess, bool bInheritHandle, uint dwProcessId);

    [DllImport("kernel32.dll")]
    private static extern bool CloseHandle(IntPtr hObject);

    [DllImport("kernel32.dll")]
    private static extern bool TerminateProcess(IntPtr hProcess, uint uExitCode);

    private const uint PROCESS_TERMINATE = 0x0001;
    private const uint PROCESS_QUERY_INFORMATION = 0x0400;

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
                    ListProcesses();
                    break;
                case "kill":
                    string target = GetArgumentValue(args, "-target");
                    if (string.IsNullOrEmpty(target))
                    {
                        Console.Error.WriteLine("Error: 必须指定目标进程 (-target)");
                        return;
                    }
                    KillProcess(target);
                    break;
                case "start":
                    string path = GetArgumentValue(args, "-path");
                    string arguments = GetArgumentValue(args, "-args");
                    if (arguments == null)
                    {
                        arguments = "";
                    }
                    StartProcess(path, arguments);
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

    private static void ListProcesses()
    {
        Console.Write("[");
        Process[] processes = Process.GetProcesses();
        bool first = true;
        foreach (Process proc in processes)
        {
            try
            {
                string processPath = "";
                DateTime startTime = DateTime.MinValue;
                TimeSpan cpuTime = TimeSpan.Zero;
                long memorySize = 0;
                int threadCount = 0;
                ProcessPriorityClass priority = ProcessPriorityClass.Normal;
                string description = "";
                string company = "";
                string version = "";

                try
                {
                    if (proc.MainModule != null)
                    {
                        processPath = proc.MainModule.FileName;
                    }
                    else
                    {
                        processPath = "";
                    }
                    startTime = proc.StartTime;
                    cpuTime = proc.TotalProcessorTime;
                    memorySize = proc.WorkingSet64;
                    threadCount = proc.Threads.Count;
                    priority = proc.PriorityClass;

                    // 获取文件版本信息
                    if (!string.IsNullOrEmpty(processPath) && File.Exists(processPath))
                    {
                        var versionInfo = FileVersionInfo.GetVersionInfo(processPath);
                        description = versionInfo.FileDescription;
                        if (description == null) description = "";
                        company = versionInfo.CompanyName;
                        if (company == null) company = "";
                        version = versionInfo.FileVersion;
                        if (version == null) version = "";
                    }
                }
                catch { }

                if (!first)
                {
                    Console.Write(",");
                }
                first = false;

                Console.Write(string.Format(
                    "{{" +
                    "\"id\": {0}," +
                    "\"name\": \"{1}\"," +
                    "\"title\": \"{2}\"," +
                    "\"path\": \"{3}\"," +
                    "\"startTime\": \"{4}\"," +
                    "\"cpuTime\": \"{5}\"," +
                    "\"memory\": {6}," +
                    "\"threads\": {7}," +
                    "\"priority\": \"{8}\"," +
                    "\"description\": \"{9}\"," +
                    "\"company\": \"{10}\"," +
                    "\"version\": \"{11}\"" +
                    "}}",
                    proc.Id,
                    proc.ProcessName,
                    proc.MainWindowTitle.Replace("\"", "\\\""),
                    processPath.Replace("\\", "\\\\").Replace("\"", "\\\""),
                    startTime.ToString("yyyy-MM-dd HH:mm:ss"),
                    cpuTime.ToString(),
                    memorySize,
                    threadCount,
                    priority.ToString(),
                    description.Replace("\"", "\\\""),
                    company.Replace("\"", "\\\""),
                    version.Replace("\"", "\\\"")
                    ));
            }
            catch { }
        }
        Console.Write("]");
    }

    private static void KillProcess(string target)
    {
        int pid;
        if (int.TryParse(target, out pid))
        {
            KillProcessById(pid);
        }
        else
        {
            KillProcessByName(target);
        }
    }

    private static void KillProcessById(int pid)
    {
        Process proc = Process.GetProcessById(pid);
        try
        {
            proc.Kill();
            Console.WriteLine(string.Format("成功终止进程: {0} (PID: {1})", proc.ProcessName, pid));
        }
        catch (Exception ex)
        {
            throw new Exception(string.Format("无法终止进程: {0}", ex.Message));
        }
    }

    private static void KillProcessByName(string name)
    {
        Process[] processes = Process.GetProcessesByName(name);
        if (processes.Length == 0)
        {
            throw new Exception("找不到指定的进程");
        }

        foreach (Process proc in processes)
        {
            try
            {
                proc.Kill();
                Console.WriteLine(string.Format("成功终止进程: {0} (PID: {1})", name, proc.Id));
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(string.Format("无法终止进程: {0} (PID: {1}) - {2}",
                    name, proc.Id, ex.Message));
            }
        }
    }

    private static void StartProcess(string path, string args)
    {
        ProcessStartInfo startInfo = new ProcessStartInfo
        {
            FileName = path,
            Arguments = args,
            UseShellExecute = true
        };

        Process proc = Process.Start(startInfo);
        Console.WriteLine(string.Format("已启动进程: {0} (PID: {1})", path, proc.Id));
    }

    private static void ShowHelp()
    {
        string help = @"
进程管理工具使用说明
================

基本语法:
process.exe -type <操作类型> [参数...]

操作类型:
--------
1. list - 列出所有进程
   示例: process.exe -type list

2. kill - 终止进程
   参数:
     -target <PID或进程名>  要终止的进程ID或名称
   示例:
     process.exe -type kill -target notepad
     process.exe -type kill -target 1234

3. start - 启动进程
   参数:
     -path <程序路径>  要启动的程序路径
     -args <参数>      启动参数（可选）
   示例:
     process.exe -type start -path ""c:\windows\notepad.exe""
     process.exe -type start -path ""c:\program.exe"" -args ""-param value""

返回值:
------
list操作返回JSON格式的进程信息：
{""id"": 进程ID, ""name"": ""进程名"", ""title"": ""窗口标题"", ""path"": ""进程路径"",
""startTime"": ""启动时间"", ""cpuTime"": ""CPU时间"", ""memory"": 内存使用量,
""threads"": 线程数, ""priority"": ""优先级"", ""description"": ""描述"",
""company"": ""公司"", ""version"": ""版本""}

注意事项:
--------
1. 终止进程可能需要管理员权限
2. 进程名称不需要包含.exe后缀
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
