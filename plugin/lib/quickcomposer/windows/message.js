/**
 * 发送窗口消息
 * @param {string} method 查找方式：title/handle/active
 * @param {string} value 查找值（handle时为数字）
 * @param {string} type 消息类型：click/key/text/custom
 * @param {Object} params 消息参数
 */
async function sendMessage(method, value, type, params) {
  let messageScript = "";

  switch (type) {
    case "click":
      messageScript = `
        const uint WM_LBUTTONDOWN = 0x0201;
        const uint WM_LBUTTONUP = 0x0202;
        const uint WM_RBUTTONDOWN = 0x0204;
        const uint WM_RBUTTONUP = 0x0205;
        const uint WM_MBUTTONDOWN = 0x0207;
        const uint WM_MBUTTONUP = 0x0208;

        IntPtr wParam = IntPtr.Zero;
        IntPtr lParam = (IntPtr)((${params.y} << 16) | ${params.x});

        switch("${params.button}") {
          case "left":
            PostMessage(hwnd, WM_LBUTTONDOWN, wParam, lParam);
            PostMessage(hwnd, WM_LBUTTONUP, wParam, lParam);
            break;
          case "right":
            PostMessage(hwnd, WM_RBUTTONDOWN, wParam, lParam);
            PostMessage(hwnd, WM_RBUTTONUP, wParam, lParam);
            break;
          case "middle":
            PostMessage(hwnd, WM_MBUTTONDOWN, wParam, lParam);
            PostMessage(hwnd, WM_MBUTTONUP, wParam, lParam);
            break;
        }`;
      break;

    case "key":
      messageScript = `
        const uint WM_KEYDOWN = 0x0100;
        const uint WM_KEYUP = 0x0101;
        const uint WM_CHAR = 0x0102;

        // 处理组合键
        int modifiers = 0;
        if(${params.ctrl}) modifiers |= 0x0008;
        if(${params.alt}) modifiers |= 0x0001;
        if(${params.shift}) modifiers |= 0x0004;

        IntPtr wParam = (IntPtr)${params.keyCode};
        IntPtr lParam = (IntPtr)((0x00000001 | (modifiers << 16)));

        PostMessage(hwnd, WM_KEYDOWN, wParam, lParam);
        if(!${params.hold}) {
          PostMessage(hwnd, WM_KEYUP, wParam, lParam);
        }`;
      break;

    case "text":
      messageScript = `
        const uint WM_CHAR = 0x0102;
        string text = @"${params.text}";

        foreach(char c in text) {
          PostMessage(hwnd, WM_CHAR, (IntPtr)c, IntPtr.Zero);
        }`;
      break;

    case "custom":
      messageScript = `
        uint msg = ${params.message};
        IntPtr wParam = (IntPtr)${params.wParam};
        IntPtr lParam = (IntPtr)${params.lParam};

        PostMessage(hwnd, msg, wParam, lParam);`;
      break;
  }

  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;

    public class Program {
      [DllImport("user32.dll")]
      static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      [DllImport("user32.dll")]
      static extern IntPtr GetForegroundWindow();

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          ${messageScript}
        }
      }
    }
  `;

  await quickcommand.runCsharp(script);
}

/**
 * 发送鼠标点击消息
 */
async function sendMouseClick(method, value, params) {
  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;

    public class Program {
      [DllImport("user32.dll")]
      static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      [DllImport("user32.dll")]
      static extern IntPtr GetForegroundWindow();

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          const uint WM_LBUTTONDOWN = 0x0201;
          const uint WM_LBUTTONUP = 0x0202;
          const uint WM_RBUTTONDOWN = 0x0204;
          const uint WM_RBUTTONUP = 0x0205;
          const uint WM_MBUTTONDOWN = 0x0207;
          const uint WM_MBUTTONUP = 0x0208;

          IntPtr wParam = IntPtr.Zero;
          IntPtr lParam = (IntPtr)((${params.y} << 16) | ${params.x});

          switch("${params.button}") {
            case "left":
              PostMessage(hwnd, WM_LBUTTONDOWN, wParam, lParam);
              PostMessage(hwnd, WM_LBUTTONUP, wParam, lParam);
              break;
            case "right":
              PostMessage(hwnd, WM_RBUTTONDOWN, wParam, lParam);
              PostMessage(hwnd, WM_RBUTTONUP, wParam, lParam);
              break;
            case "middle":
              PostMessage(hwnd, WM_MBUTTONDOWN, wParam, lParam);
              PostMessage(hwnd, WM_MBUTTONUP, wParam, lParam);
              break;
          }
        }
      }
    }
  `;
  await quickcommand.runCsharp(script);
}

/**
 * 发送键盘按键消息
 */
async function sendKeyPress(method, value, params) {
  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;

    public class Program {
      [DllImport("user32.dll")]
      static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      [DllImport("user32.dll")]
      static extern IntPtr GetForegroundWindow();

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          const uint WM_KEYDOWN = 0x0100;
          const uint WM_KEYUP = 0x0101;
          const uint WM_CHAR = 0x0102;

          int modifiers = 0;
          if(${params.ctrl}) modifiers |= 0x0008;
          if(${params.alt}) modifiers |= 0x0001;
          if(${params.shift}) modifiers |= 0x0004;

          IntPtr wParam = (IntPtr)${params.keyCode};
          IntPtr lParam = (IntPtr)((0x00000001 | (modifiers << 16)));

          PostMessage(hwnd, WM_KEYDOWN, wParam, lParam);
          if(!${params.hold}) {
            PostMessage(hwnd, WM_KEYUP, wParam, lParam);
          }
        }
      }
    }
  `;
  await quickcommand.runCsharp(script);
}

/**
 * 发送文本输入消息
 */
async function sendText(method, value, params) {
  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;

    public class Program {
      [DllImport("user32.dll")]
      static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      [DllImport("user32.dll")]
      static extern IntPtr GetForegroundWindow();

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          const uint WM_CHAR = 0x0102;
          string text = @"${params.text}";

          foreach(char c in text) {
            PostMessage(hwnd, WM_CHAR, (IntPtr)c, IntPtr.Zero);
          }
        }
      }
    }
  `;
  await quickcommand.runCsharp(script);
}

/**
 * 发送窗口命令消息
 */
async function sendCommand(method, value, params) {
  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;

    public class Program {
      [DllImport("user32.dll")]
      static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      [DllImport("user32.dll")]
      static extern IntPtr GetForegroundWindow();

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          uint msg = ${params.message};
          IntPtr wParam = (IntPtr)${params.wParam};
          IntPtr lParam = (IntPtr)${params.lParam};

          PostMessage(hwnd, msg, wParam, lParam);
        }
      }
    }
  `;
  await quickcommand.runCsharp(script);
}

/**
 * 发送自定义消息
 */
async function sendCustom(method, value, params) {
  const script = `
    using System;
    using System.Runtime.InteropServices;
    using System.Text;

    public class Program {
      [DllImport("user32.dll")]
      static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

      [DllImport("user32.dll")]
      static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

      [DllImport("user32.dll")]
      static extern IntPtr GetForegroundWindow();

      public static void Main() {
        ${findWindowByMethod(method, value)}
        if (hwnd != IntPtr.Zero) {
          uint msg = ${params.message};
          IntPtr wParam = (IntPtr)${params.wParam};
          IntPtr lParam = (IntPtr)${params.lParam};

          PostMessage(hwnd, msg, wParam, lParam);
        }
      }
    }
  `;
  await quickcommand.runCsharp(script);
}

module.exports = {
  sendMessage,
  sendMouseClick,
  sendKeyPress,
  sendText,
  sendCommand,
  sendCustom,
};
