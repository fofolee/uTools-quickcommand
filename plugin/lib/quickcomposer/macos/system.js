module.exports = {
  // 设置系统音量
  setVolume: async function (volume) {
    return await quickcommand.runAppleScript(`
      set volume output volume ${volume}
    `);
  },

  // 锁定屏幕
  lockScreen: async function () {
    return await quickcommand.runAppleScript(`
      tell application "System Events"
        keystroke "q" using {command down, control down}
      end tell
    `);
  },

  // 进入睡眠
  sleep: async function () {
    return await quickcommand.runAppleScript(`
      tell application "System Events"
        sleep
      end tell
    `);
  },

  // 设置Dock位置
  setDockPosition: async function (position) {
    return await quickcommand.runAppleScript(`
      do shell script "defaults write com.apple.dock orientation -string ${position}"
      do shell script "killall Dock"
    `);
  },

  // 设置Dock大小
  setDockSize: async function (size) {
    return await quickcommand.runAppleScript(`
      do shell script "defaults write com.apple.dock tilesize -int ${size}"
      do shell script "killall Dock"
    `);
  },

  // 设置Dock自动隐藏
  toggleDockAutohide: async function (enabled) {
    return await quickcommand.runAppleScript(`
      do shell script "defaults write com.apple.dock autohide -bool ${enabled}"
      do shell script "killall Dock"
    `);
  },

  // 设置菜单栏自动隐藏
  toggleMenuBarAutohide: async function (enabled) {
    return await quickcommand.runAppleScript(`
      tell application "System Events"
        tell dock preferences
          set autohide menu bar to ${enabled}
        end tell
      end tell
    `);
  },

  // 切换深色模式
  toggleDarkMode: async function (enabled) {
    return await quickcommand.runAppleScript(`
      tell application "System Events"
        tell appearance preferences
          set dark mode to ${enabled}
        end tell
      end tell
    `);
  },
};
