const electron = require("electron");
const child_process = require("child_process");
const iconv = require("iconv-lite");

const shortCodes = {
  open: (path) => {
    window.utools.shellOpenItem(path);
  },
  locate: (path) => {
    window.utools.shellShowItemInFolder(path);
  },
  visit: (url) => {
    window.utools.shellOpenExternal(url);
  },
  system: (cmd) => {
    let result = child_process.execSync(cmd, {
      windowsHide: true,
      encoding: "buffer",
    });
    return iconv.decode(result, window.utools.isWindows() ? "gbk" : "utf8");
  },
  message: (msg) => {
    window.utools.showNotification(msg);
  },
  keyTap: (key, ...modifier) =>
    window.utools.simulateKeyboardTap(key, ...modifier),
  copyTo: (text) => {
    electron.clipboard.writeText(text);
  },
  send: (text) => {
    window.utools.hideMainWindowPasteText(text);
  },
};

module.exports = shortCodes;
