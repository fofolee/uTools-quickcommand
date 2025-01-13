using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Linq;
using System.Drawing;

class Monitor {
    // Win32 API
    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetClipboardViewer(IntPtr hWndNewViewer);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool ChangeClipboardChain(IntPtr hWndRemove, IntPtr hWndNewNext);

    private static FileSystemWatcher fsWatcher;
    private static IntPtr nextClipboardViewer;
    private static ClipboardForm clipboardForm;
    private static bool running = true;
    private static bool listenOnce = false;
    private static bool isFirstClipboardEvent = true;

    private class ClipboardForm : Form {
        public ClipboardForm() {
            this.ShowInTaskbar = false;
            this.Visible = false;
            this.WindowState = FormWindowState.Minimized;
            this.FormBorderStyle = FormBorderStyle.None;
            this.Size = new System.Drawing.Size(1, 1);
            this.Load += (sender, e) => {
                nextClipboardViewer = SetClipboardViewer(this.Handle);
            };
            this.FormClosing += (sender, e) => {
                ChangeClipboardChain(this.Handle, nextClipboardViewer);
            };
        }

        protected override CreateParams CreateParams {
            get {
                CreateParams cp = base.CreateParams;
                cp.ExStyle |= 0x80; // WS_EX_TOOLWINDOW
                return cp;
            }
        }

        protected override void WndProc(ref Message m) {
            if (m.Msg == 0x308) { // WM_DRAWCLIPBOARD
                if (isFirstClipboardEvent) {
                    isFirstClipboardEvent = false;
                } else {
                    HandleClipboardChanged();
                    if (listenOnce) {
                        running = false;
                        this.BeginInvoke(new Action(this.Close));
                    }
                }
                SendMessage(nextClipboardViewer, m.Msg, m.WParam, m.LParam);
            }
            else if (m.Msg == 0x30D) { // WM_CHANGECBCHAIN
                if (m.WParam == nextClipboardViewer)
                    nextClipboardViewer = m.LParam;
                else if (nextClipboardViewer != IntPtr.Zero)
                    SendMessage(nextClipboardViewer, m.Msg, m.WParam, m.LParam);
            }
            base.WndProc(ref m);
        }
    }

    public static void ShowHelp() {
        Console.WriteLine(@"Windows 监控工具使用说明
用法: monitor.exe -type <监控类型> [参数...]

监控类型:
  clipboard - 剪贴板监控
    参数:
      -once             只监听一次变化就停止（可选）
    示例:
      monitor.exe -type clipboard -once

  filesystem - 文件系统监控
    参数:
      -path <路径>         要监控的文件夹路径
      -filter <过滤器>     文件过滤器，如 *.txt（可选，默认监控所有文件）
      -recursive <bool>    是否监控子文件夹（可选，默认为 true）
      -once               只监听一次变化就停止（可选）
    示例:
      monitor.exe -type filesystem -path C:\MyFolder -filter *.txt -recursive true -once

返回值:
  监控到的变化会实时输出 JSON 格式的事件信息：
  剪贴板事件:
    {""type"": ""clipboard"", ""format"": ""文本/图片/文件"", ""content"": ""变化内容""}
  文件系统事件:
    {""type"": ""filesystem"", ""event"": ""created/changed/deleted/renamed"", ""path"": ""文件路径"", ""oldPath"": ""重命名前的路径""}

注意事项:
  1. 按 Ctrl+C 停止监控
  2. 剪贴板监控支持文本、图片和文件格式
  3. 文件系统监控支持文件和文件夹的创建、修改、删除和重命名事件
  4. 使用 -once 参数可以在监听到第一次变化后自动停止");
    }

    private static string GetArgumentValue(string[] args, string key) {
        for (int i = 0; i < args.Length - 1; i++) {
            if (args[i].Equals(key, StringComparison.OrdinalIgnoreCase)) {
                return args[i + 1];
            }
        }
        return null;
    }

    private static string EscapeJsonString(string str) {
        if (str == null) return "null";
        StringBuilder sb = new StringBuilder();
        foreach (char c in str) {
            switch (c) {
                case '\"': sb.Append("\\\""); break;
                case '\\': sb.Append("\\\\"); break;
                case '\b': sb.Append("\\b"); break;
                case '\f': sb.Append("\\f"); break;
                case '\n': sb.Append("\\n"); break;
                case '\r': sb.Append("\\r"); break;
                case '\t': sb.Append("\\t"); break;
                default:
                    if (c < ' ') {
                        sb.Append(string.Format("\\u{0:X4}", (int)c));
                    }
                    else {
                        sb.Append(c);
                    }
                    break;
            }
        }
        return string.Format("\"{0}\"", sb.ToString());
    }

    private static void OutputEvent(string type, string format, string content) {
        string json = string.Format("{{\"type\": {0}, \"format\": {1}, \"content\": {2}}}",
            EscapeJsonString(type),
            EscapeJsonString(format),
            EscapeJsonString(content));
        Console.WriteLine(json);
    }

    private static void OutputFileSystemEvent(string type, string eventType, string path, string oldPath = null) {
        StringBuilder json = new StringBuilder();
        json.Append("{\"type\": ").Append(EscapeJsonString(type));
        json.Append(", \"event\": ").Append(EscapeJsonString(eventType));
        json.Append(", \"path\": ").Append(EscapeJsonString(path));
        if (oldPath != null) {
            json.Append(", \"oldPath\": ").Append(EscapeJsonString(oldPath));
        }
        json.Append("}");
        Console.WriteLine(json.ToString());
    }

    private static void StartClipboardMonitor() {
        Thread thread = new Thread(() => {
            clipboardForm = new ClipboardForm();
            Application.Run(clipboardForm);
        });

        thread.SetApartmentState(ApartmentState.STA);
        thread.Start();
    }

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    private static extern IntPtr SendMessage(IntPtr hWnd, int Msg, IntPtr wParam, IntPtr lParam);

    private static void HandleClipboardChanged() {
        if (Clipboard.ContainsText()) {
            OutputEvent("clipboard", "text", Clipboard.GetText());
        }
        else if (Clipboard.ContainsImage()) {
            OutputEvent("clipboard", "image", "image_data");
        }
        else if (Clipboard.ContainsFileDropList()) {
            OutputEvent("clipboard", "files", string.Join(", ", Clipboard.GetFileDropList().Cast<string>()));
        }
    }

    private static void StartFileSystemMonitor(string path, string fileFilter, bool includeSubdirectories) {
        fsWatcher = new FileSystemWatcher(path);
        fsWatcher.Filter = fileFilter ?? "*.*";
        fsWatcher.IncludeSubdirectories = includeSubdirectories;

        FileSystemEventHandler handler = (s, e) => {
            OutputFileSystemEvent("filesystem", e.ChangeType.ToString().ToLower(), e.FullPath);
            if (listenOnce) {
                running = false;
                fsWatcher.Dispose();
            }
        };

        RenamedEventHandler renameHandler = (s, e) => {
            OutputFileSystemEvent("filesystem", "renamed", e.FullPath, e.OldFullPath);
            if (listenOnce) {
                running = false;
                fsWatcher.Dispose();
            }
        };

        fsWatcher.Created += handler;
        fsWatcher.Changed += handler;
        fsWatcher.Deleted += handler;
        fsWatcher.Renamed += renameHandler;

        fsWatcher.EnableRaisingEvents = true;
    }

    private static bool HasArgument(string[] args, string key) {
        return Array.Exists(args, arg => arg.Equals(key, StringComparison.OrdinalIgnoreCase));
    }

    public static void Main(string[] args) {
        if (args.Length == 0 || args[0] == "-h" || args[0] == "--help") {
            ShowHelp();
            return;
        }

        string type = GetArgumentValue(args, "-type");
        if (string.IsNullOrEmpty(type)) {
            Console.Error.WriteLine("Error: 必须指定监控类型 (-type)");
            return;
        }

        listenOnce = HasArgument(args, "-once");

        Console.CancelKeyPress += (s, e) => {
            running = false;
            if (fsWatcher != null) {
                fsWatcher.Dispose();
            }
            if (clipboardForm != null) {
                clipboardForm.Invoke(new Action(() => clipboardForm.Close()));
            }
            Environment.Exit(0);
        };

        try {
            switch (type.ToLower()) {
                case "clipboard":
                    StartClipboardMonitor();
                    break;

                case "filesystem":
                    string path = GetArgumentValue(args, "-path");
                    if (string.IsNullOrEmpty(path)) {
                        Console.Error.WriteLine("Error: 必须指定监控路径 (-path)");
                        return;
                    }

                    string filter = GetArgumentValue(args, "-filter");
                    bool recursive = true;
                    string recursiveArg = GetArgumentValue(args, "-recursive");
                    if (!string.IsNullOrEmpty(recursiveArg)) {
                        recursive = bool.Parse(recursiveArg);
                    }

                    StartFileSystemMonitor(path, filter, recursive);
                    break;

                default:
                    Console.Error.WriteLine(string.Format("Error: 不支持的监控类型: {0}", type));
                    return;
            }

            while (running) {
                Thread.Sleep(100);
            }
        }
        catch (Exception ex) {
            Console.Error.WriteLine(string.Format("Error: {0}", ex.Message));
        }
    }
}
