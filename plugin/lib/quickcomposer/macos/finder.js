module.exports = {
  // 获取选中项
  getSelection: async function () {
    const result = await quickcommand.runAppleScript(`
      tell application "Finder"
        set selectedItems to selection
        set json to "["
        repeat with i from 1 to count of selectedItems
          set theItem to item i of selectedItems
          set json to json & "{"
          set json to json & "\\"name\\":\\"" & name of theItem & "\\","
          set json to json & "\\"path\\":\\"" & POSIX path of (theItem as alias) & "\\","
          set json to json & "\\"kind\\":\\"" & kind of theItem & "\\","
          set json to json & "\\"size\\":" & size of theItem & ","
          set json to json & "\\"created\\":\\"" & creation date of theItem & "\\","
          set json to json & "\\"modified\\":\\"" & modification date of theItem & "\\""
          set json to json & "}"
          if i < count of selectedItems then
            set json to json & ","
          end if
        end repeat
        set json to json & "]"
        return json
      end tell
    `);
    return JSON.parse(result.replace(/missing value/g, "null"));
  },

  // 获取当前文件夹
  getCurrentFolder: async function () {
    const result = await quickcommand.runAppleScript(`
      tell application "Finder"
        set currentFolder to (target of front window) as alias
        set json to "{"
        set json to json & "\\"name\\":\\"" & name of currentFolder & "\\","
        set json to json & "\\"path\\":\\"" & POSIX path of currentFolder & "\\","
        set json to json & "\\"kind\\":\\"" & kind of currentFolder & "\\","
        set json to json & "\\"created\\":\\"" & creation date of currentFolder & "\\","
        set json to json & "\\"modified\\":\\"" & modification date of currentFolder & "\\""
        set json to json & "}"
        return json
      end tell
    `);
    return JSON.parse(result);
  },

  // 设置显示隐藏文件
  setShowHiddenFiles: async function (show) {
    return await quickcommand.runAppleScript(`
      do shell script "defaults write com.apple.finder AppleShowAllFiles -bool ${show}"
      do shell script "killall Finder"
    `);
  },

  // 获取窗口列表
  getWindows: async function () {
    const result = await quickcommand.runAppleScript(`
      tell application "Finder"
        set windowList to every window
        set json to "["
        repeat with i from 1 to count of windowList
          set theWindow to item i of windowList
          set json to json & "{"
          set json to json & "\\"name\\":\\"" & name of theWindow & "\\","
          set json to json & "\\"index\\":" & index of theWindow & ","
          set json to json & "\\"bounds\\":\\"" & bounds of theWindow & "\\","
          set json to json & "\\"target\\":\\"" & POSIX path of (target of theWindow as alias) & "\\""
          set json to json & "}"
          if i < count of windowList then
            set json to json & ","
          end if
        end repeat
        set json to json & "]"
        return json
      end tell
    `);
    return JSON.parse(result);
  },

  // 激活指定窗口
  activateWindow: async function (index) {
    return await quickcommand.runAppleScript(`
      tell application "Finder"
        activate
        set theWindow to window ${index}
        set index of theWindow to 1
      end tell
    `);
  },
};
