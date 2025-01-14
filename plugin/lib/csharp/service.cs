using System;
using System.ServiceProcess;
using System.Runtime.InteropServices;
using System.Text;

public class ServiceManager
{
    [DllImport("advapi32.dll", SetLastError = true)]
    private static extern IntPtr OpenSCManager(string lpMachineName, string lpDatabaseName, uint dwDesiredAccess);

    [DllImport("advapi32.dll", SetLastError = true)]
    private static extern IntPtr OpenService(IntPtr hSCManager, string lpServiceName, uint dwDesiredAccess);

    [DllImport("advapi32.dll", SetLastError = true)]
    private static extern bool StartService(IntPtr hService, uint dwNumServiceArgs, string[] lpServiceArgVectors);

    [DllImport("advapi32.dll", SetLastError = true)]
    private static extern bool ControlService(IntPtr hService, uint dwControl, ref SERVICE_STATUS lpServiceStatus);

    [DllImport("advapi32.dll", SetLastError = true)]
    private static extern bool CloseServiceHandle(IntPtr hSCObject);

    private const uint SC_MANAGER_ALL_ACCESS = 0xF003F;
    private const uint SERVICE_ALL_ACCESS = 0xF01FF;
    private const uint SERVICE_CONTROL_STOP = 0x00000001;
    private const uint SERVICE_CONTROL_PAUSE = 0x00000002;
    private const uint SERVICE_CONTROL_CONTINUE = 0x00000003;

    [StructLayout(LayoutKind.Sequential)]
    private struct SERVICE_STATUS
    {
        public uint dwServiceType;
        public uint dwCurrentState;
        public uint dwControlsAccepted;
        public uint dwWin32ExitCode;
        public uint dwServiceSpecificExitCode;
        public uint dwCheckPoint;
        public uint dwWaitHint;
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
                case "list":
                    ListServices();
                    break;
                case "start":
                case "stop":
                case "pause":
                case "continue":
                    string name = GetArgumentValue(args, "-name");
                    if (string.IsNullOrEmpty(name))
                    {
                        Console.Error.WriteLine("Error: 必须指定服务名称 (-name)");
                        return;
                    }
                    ControlServiceByName(name, type);
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

    private static void ListServices()
    {
        Console.Write("[");
        bool first = true;
        ServiceController[] services = ServiceController.GetServices();
        foreach (ServiceController service in services)
        {
            if (!first)
            {
                Console.Write(",");
            }
            first = false;
            Console.Write(string.Format("{{\"name\": \"{0}\", \"displayName\": \"{1}\", \"status\": \"{2}\"}}",
                service.ServiceName,
                service.DisplayName.Replace("\"", "\\\""),
                service.Status));
        }
        Console.Write("]");
    }

    private static void ControlServiceByName(string serviceName, string operation)
    {
        IntPtr scm = OpenSCManager(null, null, SC_MANAGER_ALL_ACCESS);
        if (scm == IntPtr.Zero)
        {
            throw new Exception("无法打开服务控制管理器");
        }

        try
        {
            IntPtr service = OpenService(scm, serviceName, SERVICE_ALL_ACCESS);
            if (service == IntPtr.Zero)
            {
                throw new Exception("无法打开服务");
            }

            try
            {
                SERVICE_STATUS status = new SERVICE_STATUS();
                bool success = false;

                switch (operation.ToLower())
                {
                    case "start":
                        success = StartService(service, 0, null);
                        break;
                    case "stop":
                        success = ControlService(service, SERVICE_CONTROL_STOP, ref status);
                        break;
                    case "pause":
                        success = ControlService(service, SERVICE_CONTROL_PAUSE, ref status);
                        break;
                    case "continue":
                        success = ControlService(service, SERVICE_CONTROL_CONTINUE, ref status);
                        break;
                }

                if (success)
                {
                    Console.WriteLine(string.Format("成功{0}服务: {1}", GetOperationName(operation), serviceName));
                }
                else
                {
                    throw new Exception(string.Format("无法{0}服务", GetOperationName(operation)));
                }
            }
            finally
            {
                CloseServiceHandle(service);
            }
        }
        finally
        {
            CloseServiceHandle(scm);
        }
    }

    private static string GetOperationName(string operation)
    {
        switch (operation.ToLower())
        {
            case "start": return "启动";
            case "stop": return "停止";
            case "pause": return "暂停";
            case "continue": return "继续";
            default: return operation;
        }
    }

    private static void ShowHelp()
    {
        string help = @"
Windows 服务管理工具使用说明
======================

基本语法:
service.exe -type <操作类型> [参数...]

操作类型:
--------
1. list - 列出所有服务
   示例: service.exe -type list

2. start - 启动服务
   参数:
     -name <服务名>  服务名称
   示例: service.exe -type start -name Spooler

3. stop - 停止服务
   参数:
     -name <服务名>  服务名称
   示例: service.exe -type stop -name Spooler

4. pause - 暂停服务
   参数:
     -name <服务名>  服务名称
   示例: service.exe -type pause -name Spooler

5. continue - 继续服务
   参数:
     -name <服务名>  服务名称
   示例: service.exe -type continue -name Spooler

返回值:
------
list操作返回JSON格式的服务信息：
{""name"": ""服务名"", ""displayName"": ""显示名称"", ""status"": ""状态""}

注意事项:
--------
1. 需要管理员权限
2. 并非所有服务都支持暂停/继续操作
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
