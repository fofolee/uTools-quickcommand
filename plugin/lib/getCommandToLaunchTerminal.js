const fs = require("fs");
const path = require("path");

const getCommandToLaunchTerminal = (cmdline, dir) => {
  let cd, command;
  if (window.utools.isWindows()) {
    let appPath = path.join(
      window.utools.getPath("home"),
      "/AppData/Local/Microsoft/WindowsApps/"
    );
    // 直接 existsSync wt.exe 无效
    if (fs.existsSync(appPath) && fs.readdirSync(appPath).includes("wt.exe")) {
      cmdline = cmdline.replace(/"/g, `\\"`);
      cd = dir ? `-d "${dir.replace(/\\/g, "/")}"` : "";
      command = `${appPath}wt.exe ${cd} cmd /k "${cmdline}"`;
    } else {
      cmdline = cmdline.replace(/"/g, `^"`);
      cd = dir ? `cd /d "${dir.replace(/\\/g, "/")}" &&` : "";
      command = `${cd} start "" cmd /k "${cmdline}"`;
    }
  } else if (window.utools.isMacOs()) {
    cmdline = cmdline.replace(/"/g, `\\"`);
    cd = dir ? `cd ${dir.replace(/ /g, "\\\\ ")} &&` : "";
    command = fs.existsSync("/Applications/iTerm.app")
      ? `osascript -e 'tell application "iTerm"
                if application "iTerm" is running then
                  create window with default profile
                end if
                tell current session of first window to write text "clear && ${cd} ${cmdline}"
                activate
              end tell'`
      : `osascript -e 'tell application "Terminal"
                if application "Terminal" is running then
                  do script "clear && ${cd} ${cmdline}"
                else
                  do script "clear && ${cd} ${cmdline}" in window 1
                end if
                activate
              end tell'`;
  }
  return command;
};

module.exports = getCommandToLaunchTerminal;
