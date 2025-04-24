const { ipcRenderer } = require("electron");

// 等待 DOM 加载完成
document.addEventListener("DOMContentLoaded", () => {
  let parentId = null;
  let windowId = null;
  let commandCode = null;

  // 监听父窗口发来的配置
  ipcRenderer.on("window-config", (event, config) => {
    parentId = event.senderId;
    windowId = config.windowId;
    commandCode = config.commandCode;

    // 设置主题
    document.documentElement.setAttribute(
      "data-theme",
      config.isDark ? "dark" : "light"
    );

    // 设置图标
    document.getElementById("command-icon").src = config.icon;
  });

  // 点击图标执行命令
  document.querySelector(".pin-container").addEventListener("click", () => {
    console.log("click", parentId, `pin-execute-${windowId}`);
    ipcRenderer.sendTo(parentId, `pin-execute-${windowId}`, commandCode);
  });
});
