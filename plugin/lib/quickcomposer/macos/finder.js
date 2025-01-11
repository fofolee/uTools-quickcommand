module.exports = {
  // 获取选中项
  getSelection: async function () {
    return await quickcommand.runAppleScript(`
      tell application "Finder"
        set selectedItems to selection
        set itemList to {}
        repeat with theItem in selectedItems
          set end of itemList to {
            name: name of theItem,
            path: POSIX path of (theItem as alias),
            kind: kind of theItem,
            size: size of theItem,
            created: creation date of theItem,
            modified: modification date of theItem
          }
        end repeat
        return itemList
      end tell
    `);
  },

  // 获取当前文件夹
  getCurrentFolder: async function () {
    return await quickcommand.runAppleScript(`
      tell application "Finder"
        set currentFolder to (target of front window) as alias
        return {
          name: name of currentFolder,
          path: POSIX path of currentFolder,
          kind: kind of currentFolder,
          created: creation date of currentFolder,
          modified: modification date of currentFolder
        }
      end tell
    `);
  },

  // 新建文件夹
  newFolder: async function (name) {
    return await quickcommand.runAppleScript(`
      tell application "Finder"
        set currentFolder to (target of front window) as alias
        make new folder at currentFolder with properties {name:"${name}"}
      end tell
    `);
  },

  // 移到废纸篓
  moveToTrash: async function () {
    return await quickcommand.runAppleScript(`
      tell application "Finder"
        delete selection
      end tell
    `);
  },

  // 清空废纸篓
  emptyTrash: async function () {
    return await quickcommand.runAppleScript(`
      tell application "Finder"
        empty trash
      end tell
    `);
  },

  // 显示包内容
  showPackageContents: async function (path) {
    return await quickcommand.runAppleScript(`
      tell application "Finder"
        open package folder "${path}"
      end tell
    `);
  },

  // 设置显示隐藏文件
  setShowHiddenFiles: async function (show) {
    return await quickcommand.runAppleScript(`
      do shell script "defaults write com.apple.finder AppleShowAllFiles -bool ${show}"
      do shell script "killall Finder"
    `);
  },

  // 设置显示路径栏
  setShowPathbar: async function (show) {
    return await quickcommand.runAppleScript(`
      tell application "Finder"
        set ShowPathbar to ${show}
      end tell
    `);
  },

  // 设置显示状态栏
  setShowStatusBar: async function (show) {
    return await quickcommand.runAppleScript(`
      tell application "Finder"
        set StatusBar to ${show}
      end tell
    `);
  },

  // 设置显示预览面板
  setShowPreviewPane: async function (show) {
    return await quickcommand.runAppleScript(`
      tell application "Finder"
        set PreviewPaneIsVisible to ${show}
      end tell
    `);
  },
};
