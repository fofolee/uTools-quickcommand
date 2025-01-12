const fs = require("fs");
const path = require("path");

// 终端配置
const DEFAULT_TERMINALS = {
  windows: ["wt", "cmd"],
  macos: ["warp", "iterm", "terminal"],
};

// Windows 终端命令生成器
const getWindowsTerminalCommand = (cmdline, options = {}) => {
  const { dir, terminal = "wt" } = options;
  const appPath = path.join(
    window.utools.getPath("home"),
    "/AppData/Local/Microsoft/WindowsApps/"
  );

  const terminalCommands = {
    wt: () => {
      if (
        fs.existsSync(appPath) &&
        fs.readdirSync(appPath).includes("wt.exe")
      ) {
        const escapedCmd = cmdline.replace(/"/g, `\\"`);
        const cd = dir ? `-d "${dir.replace(/\\/g, "/")}"` : "";
        return `${appPath}wt.exe ${cd} cmd /k "${escapedCmd}"`;
      }
      return null;
    },
    cmd: () => {
      const escapedCmd = cmdline.replace(/"/g, `^"`);
      const cd = dir ? `cd /d "${dir.replace(/\\/g, "/")}" &&` : "";
      return `${cd} start "" cmd /k "${escapedCmd}"`;
    },
  };

  // 按优先级尝试不同终端
  const terminalPriority =
    terminal === "default"
      ? DEFAULT_TERMINALS.windows
      : [terminal, ...DEFAULT_TERMINALS.windows];

  for (const term of terminalPriority) {
    const command = terminalCommands[term]?.();
    if (command) return command;
  }

  // 如果都失败了，返回默认的 cmd 命令
  return terminalCommands.cmd();
};

// macOS 终端命令生成器
const getMacTerminalCommand = (cmdline, options = {}) => {
  const { dir, terminal = "warp" } = options;

  const terminalCommands = {
    warp: () => {
      if (fs.existsSync("/Applications/Warp.app")) {
        const workingDir = dir || process.cwd();
        // 创建临时的 launch configuration
        const configName = `temp_${Date.now()}`;
        const configPath = path.join(
          window.utools.getPath("home"),
          ".warp/launch_configurations",
          `${configName}.yml`
        );

        // 确保目录存在
        const configDir = path.dirname(configPath);
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }

        // 创建配置文件，对于 Warp，命令不需要转义，因为是通过 YAML 配置传递
        const config = `---
name: ${configName}
windows:
  - tabs:
      - layout:
          cwd: "${workingDir}"
          commands:
            - exec: ${cmdline}`;

        fs.writeFileSync(configPath, config);

        // 使用配置文件启动 Warp
        return `open "warp://launch/${configName}" && sleep 0.5 && rm "${configPath}"`;
      }
      return null;
    },
    iterm: () => {
      const escapedCmd = cmdline.replace(/"/g, `\\"`);
      const cd = dir ? `cd ${dir.replace(/ /g, "\\\\ ")} &&` : "";
      if (fs.existsSync("/Applications/iTerm.app")) {
        return `osascript -e 'tell application "iTerm"
          if application "iTerm" is running then
            create window with default profile
          end if
          tell current session of first window to write text "clear && ${cd} ${escapedCmd}"
          activate
        end tell'`;
      }
      return null;
    },
    terminal: () => {
      const escapedCmd = cmdline.replace(/"/g, `\\"`);
      const cd = dir ? `cd ${dir.replace(/ /g, "\\\\ ")} &&` : "";
      return `osascript -e 'tell application "Terminal"
        if application "Terminal" is running then
          do script "clear && ${cd} ${escapedCmd}"
        else
          do script "clear && ${cd} ${escapedCmd}" in window 1
        end if
        activate
      end tell'`;
    },
  };

  // 按优先级尝试不同终端
  const terminalPriority =
    terminal === "default"
      ? DEFAULT_TERMINALS.macos
      : [terminal, ...DEFAULT_TERMINALS.macos];

  for (const term of terminalPriority) {
    const command = terminalCommands[term]?.();
    if (command) return command;
  }

  // 如果都失败了，返回默认终端命令
  return terminalCommands.terminal();
};

// 主函数
const createTerminalCommand = (cmdline, options = {}) => {
  const { windows = "default", macos = "default" } = options;

  if (window.utools.isWindows()) {
    return getWindowsTerminalCommand(cmdline, {
      ...options,
      terminal: windows,
    });
  } else if (window.utools.isMacOs()) {
    return getMacTerminalCommand(cmdline, { ...options, terminal: macos });
  }

  throw new Error("Unsupported operating system");
};

module.exports = createTerminalCommand;
