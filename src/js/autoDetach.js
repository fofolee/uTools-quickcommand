const winScpt = `Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }
    [DllImport("user32.dll", SetLastError=true)]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll", SetLastError=true)]
    public static extern bool GetWindowRect(IntPtr hwnd, out RECT lpRect);
}
"@
$foregroundWindow = [Win32]::GetForegroundWindow()
$windowRect = New-Object Win32+RECT
$_ = [Win32]::GetWindowRect($foregroundWindow, [ref]$windowRect)
$result = New-Object PSObject
$result | Add-Member -Type NoteProperty -Name Left -Value $windowRect.Left
$result | Add-Member -Type NoteProperty -Name Top -Value $windowRect.Top
$result | Add-Member -Type NoteProperty -Name Right -Value $windowRect.Right
$result | Add-Member -Type NoteProperty -Name Bottom -Value $windowRect.Bottom
$result | ConvertTo-Json`;

const macScpt = `tell application "System Events"
  set frontmostProcess to first application process where it is frontmost
  set frontmostWindow to first window of frontmostProcess
  set {windowLeft, windowTop} to position of frontmostWindow
  set {windowWidth, windowHeight} to size of frontmostWindow
  set windowRight to windowLeft + windowWidth
  set windowBottom to windowTop + windowHeight
end tell
return "{ \\"Left\\": " & windowLeft & ", \\"Top\\": " & windowTop & ", \\"Right\\": " & windowRight & ", \\"Bottom\\": " &windowBottom & " }"`;

const getForegroundWindowPos = async () => {
  let foregroundWindowPos;
  try {
    if (window.utools.isWindows()) {
      foregroundWindowPos = await window.quickcommand.runPowerShell(winScpt);
    } else if (window.utools.isMacOS()) {
      foregroundWindowPos = await window.quickcommand.runAppleScript(macScpt);
    }
  } catch (error) {
    console.log(error);
  }
  if (!foregroundWindowPos) return;
  return JSON.parse(foregroundWindowPos);
};

let autoDetach = async () => {
  const foregroundWindowPos = await getForegroundWindowPos();
  console.log(foregroundWindowPos);
  if (foregroundWindowPos) {
    const { Left, Top, Right, Bottom } = foregroundWindowPos;
    let { x, y } = window.utools.getCursorScreenPoint();
    window.utools.simulateMouseDoubleClick(Left + 200, Top + 30);
    window.utools.simulateMouseMove(x, y);
  }
};

export default {
  autoDetach,
};
