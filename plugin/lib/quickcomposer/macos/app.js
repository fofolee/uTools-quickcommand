module.exports = {
  // 获取前台应用
  getFrontmost: async function () {
    const result = await quickcommand.runAppleScript(`
      tell application "System Events"
        set frontApp to first application process whose frontmost is true
        set appName to name of frontApp
        set appDisplayName to displayed name of frontApp
        try
          set appPath to POSIX path of (application file of frontApp)
        on error
          try
            set appPath to POSIX path of (file of frontApp)
          on error
            set appPath to ""
          end try
        end try
        try
          set appVersion to short version of frontApp
        on error
          set appVersion to ""
        end try
        try
          set appPid to unix id of frontApp
        on error
          set appPid to 0
        end try
        try
          set appMemory to background only of frontApp
        on error
          set appMemory to false
        end try
        try
          set appVisible to visible of frontApp
        on error
          set appVisible to false
        end try
        try
          set theWindow to window 1 of frontApp
          set windowName to name of theWindow
          set windowPos to position of theWindow
          set windowSize to size of theWindow
          set isMinimized to value of attribute "AXMinimized" of theWindow
          set isFullscreen to value of attribute "AXFullScreen" of theWindow
          try
            set windowTitle to title of theWindow
          on error
            set windowTitle to windowName
          end try
          try
            set windowIndex to index of theWindow
          on error
            set windowIndex to 1
          end try
          set json to "{"
          set json to json & "\\"name\\":\\"" & appName & "\\","
          set json to json & "\\"displayedName\\":\\"" & appDisplayName & "\\","
          set json to json & "\\"path\\":\\"" & appPath & "\\","
          set json to json & "\\"version\\":\\"" & appVersion & "\\","
          set json to json & "\\"pid\\":" & appPid & ","
          set json to json & "\\"backgroundOnly\\":" & appMemory & ","
          set json to json & "\\"visible\\":" & appVisible & ","
          set json to json & "\\"frontmost\\":true,"
          set json to json & "\\"window\\":{"
          set json to json & "\\"name\\":\\"" & windowName & "\\","
          set json to json & "\\"title\\":\\"" & windowTitle & "\\","
          set json to json & "\\"index\\":" & windowIndex & ","
          set json to json & "\\"position\\":[" & (item 1 of windowPos as text) & "," & (item 2 of windowPos as text) & "],"
          set json to json & "\\"size\\":[" & (item 1 of windowSize as text) & "," & (item 2 of windowSize as text) & "],"
          set json to json & "\\"minimized\\":" & isMinimized & ","
          set json to json & "\\"fullscreen\\":" & isFullscreen
          set json to json & "}"
          set json to json & "}"
        on error
          set json to "{"
          set json to json & "\\"name\\":\\"" & appName & "\\","
          set json to json & "\\"displayedName\\":\\"" & appDisplayName & "\\","
          set json to json & "\\"path\\":\\"" & appPath & "\\","
          set json to json & "\\"version\\":\\"" & appVersion & "\\","
          set json to json & "\\"pid\\":" & appPid & ","
          set json to json & "\\"backgroundOnly\\":" & appMemory & ","
          set json to json & "\\"visible\\":" & appVisible & ","
          set json to json & "\\"frontmost\\":true,"
          set json to json & "\\"window\\":null"
          set json to json & "}"
        end try
        return json
      end tell
    `);
    return JSON.parse(result);
  },

  // 获取运行中的应用
  getRunningApps: async function () {
    const result = await quickcommand.runAppleScript(`
      tell application "System Events"
        set appList to "["
        set runningApps to application processes
        repeat with i from 1 to count of runningApps
          set theApp to item i of runningApps
          set appName to name of theApp
          set appDisplayName to displayed name of theApp
          try
            set appPath to POSIX path of (application file of theApp)
          on error
            try
              set appPath to POSIX path of (file of theApp)
            on error
              set appPath to ""
            end try
          end try
          try
            set appVersion to short version of theApp
          on error
            set appVersion to ""
          end try
          try
            set appPid to unix id of theApp
          on error
            set appPid to 0
          end try
          try
            set appMemory to background only of theApp
          on error
            set appMemory to false
          end try
          try
            set appVisible to visible of theApp
          on error
            set appVisible to false
          end try
          try
            set theWindow to window 1 of theApp
            set windowName to name of theWindow
            set windowPos to position of theWindow
            set windowSize to size of theWindow
            set isMinimized to value of attribute "AXMinimized" of theWindow
            set isFullscreen to value of attribute "AXFullScreen" of theWindow
            try
              set windowTitle to title of theWindow
            on error
              set windowTitle to windowName
            end try
            try
              set windowIndex to index of theWindow
            on error
              set windowIndex to 1
            end try
            set json to "{"
            set json to json & "\\"name\\":\\"" & appName & "\\","
            set json to json & "\\"displayedName\\":\\"" & appDisplayName & "\\","
            set json to json & "\\"path\\":\\"" & appPath & "\\","
            set json to json & "\\"version\\":\\"" & appVersion & "\\","
            set json to json & "\\"pid\\":" & appPid & ","
            set json to json & "\\"backgroundOnly\\":" & appMemory & ","
            set json to json & "\\"visible\\":" & appVisible & ","
            set json to json & "\\"frontmost\\":" & (frontmost of theApp) & ","
            set json to json & "\\"window\\":{"
            set json to json & "\\"name\\":\\"" & windowName & "\\","
            set json to json & "\\"title\\":\\"" & windowTitle & "\\","
            set json to json & "\\"index\\":" & windowIndex & ","
            set json to json & "\\"position\\":[" & (item 1 of windowPos as text) & "," & (item 2 of windowPos as text) & "],"
            set json to json & "\\"size\\":[" & (item 1 of windowSize as text) & "," & (item 2 of windowSize as text) & "],"
            set json to json & "\\"minimized\\":" & isMinimized & ","
            set json to json & "\\"fullscreen\\":" & isFullscreen
            set json to json & "}"
            set json to json & "}"
          on error
            set json to "{"
            set json to json & "\\"name\\":\\"" & appName & "\\","
            set json to json & "\\"displayedName\\":\\"" & appDisplayName & "\\","
            set json to json & "\\"path\\":\\"" & appPath & "\\","
            set json to json & "\\"version\\":\\"" & appVersion & "\\","
            set json to json & "\\"pid\\":" & appPid & ","
            set json to json & "\\"backgroundOnly\\":" & appMemory & ","
            set json to json & "\\"visible\\":" & appVisible & ","
            set json to json & "\\"frontmost\\":" & (frontmost of theApp) & ","
            set json to json & "\\"window\\":null"
            set json to json & "}"
          end try
          if i < count of runningApps then
            set appList to appList & json & ","
          else
            set appList to appList & json
          end if
        end repeat
        return appList & "]"
      end tell
    `);
    return JSON.parse(result);
  },

  // 启动应用
  launch: async function (appName) {
    if (!appName) return;
    await quickcommand.runAppleScript(`
      tell application "${appName}"
        activate
      end tell
    `);
  },

  // 退出应用
  quit: async function (appName) {
    if (!appName) return;
    await quickcommand.runAppleScript(`
      tell application "${appName}"
        quit
      end tell
    `);
  },

  // 隐藏应用
  hide: async function (appName) {
    if (!appName) return;
    await quickcommand.runAppleScript(`
      tell application "System Events"
        set visible of process "${appName}" to false
      end tell
    `);
  },

  // 显示应用
  show: async function (appName) {
    if (!appName) return;
    await quickcommand.runAppleScript(`
      tell application "System Events"
        set visible of process "${appName}" to true
      end tell
      tell application "${appName}"
        activate
      end tell
    `);
  },

  // 最小化窗口
  minimize: async function (appName) {
    if (!appName) return;
    await quickcommand.runAppleScript(`
      tell application "System Events"
        tell process "${appName}"
          try
            set value of attribute "AXMinimized" of window 1 to true
          end try
        end tell
      end tell
    `);
  },

  // 最大化窗口
  maximize: async function (appName) {
    if (!appName) return;
    await quickcommand.runAppleScript(`
      tell application "System Events"
        tell process "${appName}"
          try
            set value of attribute "AXMinimized" of window 1 to false
            set value of attribute "AXFullScreen" of window 1 to true
          end try
        end tell
      end tell
    `);
  },

  // 获取窗口信息
  getWindows: async function (appName) {
    if (!appName) return;
    const result = await quickcommand.runAppleScript(`
      tell application "System Events"
        tell process "${appName}"
          set appName to name
          set appDisplayName to displayed name
          set appPid to unix id
          set appMemory to background only
          set appVisible to visible
          set appFrontmost to frontmost

          try
            set appPath to POSIX path of (application file)
          on error
            try
              set appPath to POSIX path of file
            on error
              set appPath to ""
            end try
          end try

          try
            set appVersion to short version
          on error
            set appVersion to ""
          end try

          set windowList to "["
          set theWindows to windows
          repeat with i from 1 to count of theWindows
            set theWindow to item i of theWindows
            try
              set windowName to name of theWindow
              set windowPos to position of theWindow
              set windowSize to size of theWindow
              set isMinimized to value of attribute "AXMinimized" of theWindow
              set isFullscreen to value of attribute "AXFullScreen" of theWindow
              try
                set windowTitle to title of theWindow
              on error
                set windowTitle to windowName
              end try
              try
                set windowIndex to index of theWindow
              on error
                set windowIndex to i
              end try

              set json to "{"
              set json to json & "\\"name\\":\\"" & appName & "\\","
              set json to json & "\\"displayedName\\":\\"" & appDisplayName & "\\","
              set json to json & "\\"path\\":\\"" & appPath & "\\","
              set json to json & "\\"version\\":\\"" & appVersion & "\\","
              set json to json & "\\"pid\\":" & appPid & ","
              set json to json & "\\"backgroundOnly\\":" & appMemory & ","
              set json to json & "\\"visible\\":" & appVisible & ","
              set json to json & "\\"frontmost\\":" & appFrontmost & ","
              set json to json & "\\"window\\":{"
              set json to json & "\\"name\\":\\"" & windowName & "\\","
              set json to json & "\\"title\\":\\"" & windowTitle & "\\","
              set json to json & "\\"index\\":" & windowIndex & ","
              set json to json & "\\"position\\":[" & (item 1 of windowPos as text) & "," & (item 2 of windowPos as text) & "],"
              set json to json & "\\"size\\":[" & (item 1 of windowSize as text) & "," & (item 2 of windowSize as text) & "],"
              set json to json & "\\"minimized\\":" & isMinimized & ","
              set json to json & "\\"fullscreen\\":" & isFullscreen
              set json to json & "}"
              set json to json & "}"

              if i < count of theWindows then
                set windowList to windowList & json & ","
              else
                set windowList to windowList & json
              end if
            end try
          end repeat
          return windowList & "]"
        end tell
      end tell
    `);
    return JSON.parse(result);
  },

  // 获取应用脚本字典
  getScriptDictionary: async function (appName) {
    if (!appName) return;
    try {
      const { execSync } = require("child_process");

      // 获取应用路径
      const appPathResult = await quickcommand.runAppleScript(`
        tell application "System Events"
          tell process "${appName}"
            try
              set appPath to POSIX path of (application file)
            on error
              try
                set appPath to POSIX path of file
              on error
                set appPath to ""
              end try
            end try
            return appPath
          end tell
        end tell
      `);

      const appPath = appPathResult.trim();
      if (!appPath) {
        return {
          commands: [],
          properties: [],
          error: "找不到应用程序",
        };
      }

      // 使用 sdef 命令获取脚本字典
      let xmlContent;
      try {
        xmlContent = execSync(`/usr/bin/sdef "${appPath}"`).toString();
      } catch (e) {
        return {
          commands: [],
          properties: [],
          error: "该应用程序没有脚本字典",
        };
      }

      // 使用正则表达式提取命令和属性的详细信息
      const commands = [];
      const properties = [];

      // 匹配命令及其描述
      const commandRegex =
        /<command.*?name="([^"]+)".*?(?:description="([^"]*)")?.*?>([\s\S]*?)<\/command>/g;
      let match;
      while ((match = commandRegex.exec(xmlContent)) !== null) {
        const name = match[1];
        const description = match[2] || "";
        const content = match[3];

        // 解析参数
        const parameters = [];
        const paramRegex =
          /<parameter.*?name="([^"]+)".*?(?:description="([^"]*)")?.*?type="([^"]+)".*?(?:optional="([^"]+)")?/g;
        let paramMatch;
        while ((paramMatch = paramRegex.exec(content)) !== null) {
          parameters.push({
            name: paramMatch[1],
            description: paramMatch[2] || "",
            type: paramMatch[3],
            optional: paramMatch[4] === "yes",
          });
        }

        // 解析返回值
        const resultRegex =
          /<result.*?type="([^"]+)".*?(?:description="([^"]*)")?/;
        const resultMatch = content.match(resultRegex);
        const result = resultMatch
          ? {
              type: resultMatch[1],
              description: resultMatch[2] || "",
            }
          : null;

        commands.push({
          name,
          description,
          parameters,
          result,
          usage: `tell application "${appName}" to ${name}${
            parameters.length
              ? " " + parameters.map((p) => p.name).join(" ")
              : ""
          }`,
        });
      }

      // 匹配属性及其描述
      const propertyRegex =
        /<property.*?name="([^"]+)".*?(?:description="([^"]*)")?.*?(?:access="([^"]*)")?.*?type="([^"]+)".*?>/g;
      while ((match = propertyRegex.exec(xmlContent)) !== null) {
        properties.push({
          name: match[1],
          description: match[2] || "",
          access: match[3] || "read/write",
          type: match[4],
          usage: `tell application "${appName}" to get ${match[1]}`,
        });
      }

      return {
        commands,
        properties,
        summary: {
          totalCommands: commands.length,
          totalProperties: properties.length,
          hasScriptingSupport: true,
        },
      };
    } catch (e) {
      console.error("Error getting script dictionary:", e);
      return {
        commands: [],
        properties: [],
        error: e.message,
      };
    }
  },
};
