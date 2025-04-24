const { ipcRenderer } = require("electron");
const { createBrowserWindow } = utools;

const pinPath = "lib/pin/view.html";
const preloadPath = "lib/pin/controller.js";

// 存储所有pin窗口的信息
const pinWindows = new Map();

/**
 * 创建pin窗口
 * @param {object} commandInfo - 命令信息
 * @param {object} position - 窗口位置 {x, y}
 * @returns {Promise} 返回窗口对象
 */
const createPinWindow = (commandInfo, position = null) => {
  return new Promise((resolve) => {
    const windowOptions = {
      width: 52,
      height: 52,
      transparent: true,
      frame: false,
      resizable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      focusable: false,
      movable: true,
      webPreferences: {
        preload: preloadPath,
        devTools: utools.isDev(),
      },
    };

    // 如果指定了位置，添加到选项中
    if (position) {
      windowOptions.x = position.x;
      windowOptions.y = position.y;
    }

    // 创建窗口
    const UBrowser = createBrowserWindow(pinPath, windowOptions, () => {
      const windowId = UBrowser.webContents.id;
      UBrowser.webContents.openDevTools({
        mode: "undocked",
      });

      // 监听命令执行请求
      ipcRenderer.once(`pin-execute-${windowId}`, (event, code) => {
        // 执行命令
        console.log("execute command", event, code, commandInfo);
      });

      // 保存窗口信息
      pinWindows.set(commandInfo.features.code, {
        window: UBrowser,
        windowId,
        position: UBrowser.getPosition(),
      });

      // 发送配置到子窗口
      ipcRenderer.sendTo(windowId, "window-config", {
        isDark: utools.isDarkColors(),
        icon: commandInfo.features.icon,
        commandCode: commandInfo.features.code,
        windowId,
      });

      resolve(UBrowser);
    });
  });
};

/**
 * 移除pin窗口
 * @param {string} commandCode - 命令代码
 */
const removePinWindow = (commandCode) => {
  const pinInfo = pinWindows.get(commandCode);
  if (pinInfo) {
    pinInfo.window.destroy();
    pinWindows.delete(commandCode);
  }
};

/**
 * 获取所有pin窗口信息
 * @returns {Map} pin窗口信息Map
 */
const getPinWindows = () => {
  return pinWindows;
};

/**
 * 恢复所有pin窗口
 * @param {Array} pinnedCommands - pin命令列表
 */
const restorePinWindows = async (pinnedCommands) => {
  for (const command of pinnedCommands) {
    await createPinWindow(command.info, command.position);
  }
};

module.exports = {
  createPinWindow,
  removePinWindow,
  getPinWindows,
  restorePinWindows,
};
