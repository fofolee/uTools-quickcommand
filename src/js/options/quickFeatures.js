const quickFeatures = {
  favFile: {
    code: "feature_favFile",
    explain: "快速将选中的文件收藏到快捷命令当中",
    cmds: [
      {
        label: "收藏文件",
        type: "files",
        match: "/.*+/i",
      },
    ],
    icon: "features/fav.png",
    platform: ["win32", "darwin", "linux"],
    mainHide: true,
  },
  favUrl: {
    code: "feature_favUrl",
    explain: "快速将选中的网址收藏到快捷命令当中",
    mainHide: true,
    cmds: [
      {
        label: "收藏网址",
        type: "window",
        match: {
          app: [
            "chrome.exe",
            "firefox.exe",
            "MicrosoftEdge.exe",
            "iexplore.exe",
            "msedge.exe",
            "Google Chrome.app",
            "Safari.app",
            "Microsoft Edge.app",
            "chrome",
            "firefox",
          ],
        },
      },
    ],
    icon: "features/fav.png",
    platform: ["win32", "darwin", "linux"],
  },
  pluNickName: {
    code: "feature_pluNickName",
    explain: "为插件设置别名",
    cmds: ["插件别名"],
    icon: "features/plugin.png",
    platform: ["win32", "darwin", "linux"],
  },
};

export default quickFeatures;
