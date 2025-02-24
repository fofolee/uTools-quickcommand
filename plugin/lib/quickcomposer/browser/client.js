const { exec } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");
const net = require("net");
const CDP = require("chrome-remote-interface");

let currentClientPort = null;

const getBrowserPath = (browser = "msedge") => {
  const platform = os.platform();
  let paths = null;
  if (platform === "win32") {
    paths = {
      chrome: [
        path.join(
          process.env["ProgramFiles"],
          "Google/Chrome/Application/chrome.exe"
        ),
        path.join(
          process.env["ProgramFiles(x86)"],
          "Google/Chrome/Application/chrome.exe"
        ),
        path.join(
          process.env["LocalAppData"],
          "Google/Chrome/Application/chrome.exe"
        ),
      ],
      msedge: [
        path.join(
          process.env["ProgramFiles"],
          "Microsoft/Edge/Application/msedge.exe"
        ),
        path.join(
          process.env["ProgramFiles(x86)"],
          "Microsoft/Edge/Application/msedge.exe"
        ),
        path.join(
          process.env["LocalAppData"],
          "Microsoft/Edge/Application/msedge.exe"
        ),
      ],
    };
  } else if (platform === "darwin") {
    paths = {
      chrome: ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"],
      msedge: [
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      ],
    };
  } else if (platform === "linux") {
    paths = {
      chrome: [
        "/opt/google/chrome/chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
      ],
      msedge: [
        "/opt/microsoft/msedge/msedge",
        "/usr/bin/microsoft-edge",
        "/usr/bin/microsoft-edge-stable",
      ],
    };
  } else {
    throw new Error("不支持的操作系统");
  }
  return paths[browser].find((p) => fs.existsSync(p));
};

const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    const onError = () => {
      socket.destroy();
      resolve(true);
    };

    socket.setTimeout(100);
    socket.once("error", onError);
    socket.once("timeout", onError);

    socket.connect(port, "127.0.0.1", () => {
      socket.destroy();
      resolve(false);
    });
  });
};

const waitForPort = async (port, timeout = 30000) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      await CDP.Version({ port });
      return true;
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  return false;
};

const findAvailablePort = async (startPort) => {
  let port = startPort;
  while (port < startPort + 100) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
    port++;
  }
  throw new Error("无法找到可用的调试端口");
};

const startClient = async (options) => {
  const {
    browserType = "msedge",
    useSingleUserDataDir = true,
    proxy = null,
    browserPath = getBrowserPath(browserType),
    windowSize = null,
    windowPosition = null,
    incognito = false,
    headless = false,
    disableExtensions = false,
  } = options;

  if (!browserPath) {
    throw new Error("未找到浏览器，或未指定浏览器路径");
  }

  const port = await findAvailablePort(9222);
  setCurrentClientPort(port);

  const automationArgs = [
    `--remote-debugging-port=${port}`,
    "--disable-infobars",
    "--disable-notifications",
    "--disable-popup-blocking",
    "--disable-save-password-bubble",
    "--disable-translate",
    "--no-first-run",
    "--no-default-browser-check",
    "--user-data-start-with-quickcomposer",
  ];

  const incognitoArg = {
    chrome: "--incognito",
    msedge: "--inprivate",
  };

  const optionArgs = [
    windowSize ? `--window-size=${windowSize}` : "--start-maximized",
    windowPosition ? `--window-position=${windowPosition}` : "",
    proxy ? `--proxy-server=${proxy}` : "",
    incognito ? incognitoArg[browserType] : "",
    headless ? "--headless" : "",
    disableExtensions ? "--disable-extensions" : "",
    useSingleUserDataDir
      ? `--user-data-dir=${path.join(
          os.tmpdir(),
          `${browserType}-debug-${port}`
        )}`
      : "",
  ].filter(Boolean);

  const args = [...automationArgs, ...optionArgs];

  return new Promise(async (resolve, reject) => {
    if (!useSingleUserDataDir) {
      try {
        await killRunningBrowser(browserType);
      } catch (e) {
        reject(e);
        return;
      }
    }
    const child = exec(
      `"${browserPath}" ${args.join(" ")}`,
      { windowsHide: true },
      async (error) => {
        if (error) {
          reject(error);
          return;
        }
      }
    );

    waitForPort(port).then((success) => {
      if (success) {
        resolve({ pid: child.pid, port });
      } else {
        reject(new Error("浏览器启动超时，请检查是否有权限问题或防火墙限制"));
      }
    });
  });
};

const killRunningBrowser = (browserType = "msedge") => {
  return new Promise((resolve, reject) => {
    if (os.platform() === "win32") {
      exec(`taskkill /F /IM ${browserType}.exe`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    } else {
      exec(`kill -9 $(pgrep ${browserType})`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    }
  });
};

const destroyClientByPort = async (port) => {
  const currentPort = await getCurrentClientPort();
  if (!port) {
    port = currentPort;
  }
  try {
    const client = await CDP({ port });
    await client.Browser.close();

    if (port === currentPort) {
      setCurrentClientPort(null);
    }
  } catch (error) {
    throw new Error(`销毁客户端失败，请手动关闭`);
  }
};

const switchClientByPort = async (port) => {
  try {
    const versionInfo = await CDP.Version({ port });
    if (!versionInfo) {
      throw new Error(`端口 ${port} 未找到活动的浏览器实例`);
    }
    setCurrentClientPort(port);
  } catch (error) {
    throw new Error(`切换客户端失败: ${error.message}`);
  }
};

const getClientPorts = async () => {
  try {
    // 创建所有端口检查的 Promise 数组
    const portChecks = [];
    for (let port = 9222; port < 9322; port++) {
      portChecks.push(
        CDP.List({ port })
          .then(() => port)
          .catch(() => null)
      );
    }

    // 如果不需要返回第一个端口或没有找到可用端口，并行执行所有检查
    const results = await Promise.all(portChecks);

    // 过滤出可用的端口
    return results.filter((port) => port !== null);
  } catch (error) {
    throw new Error(`获取客户端列表失败: ${error.message}`);
  }
};

const getCurrentClientPort = async () => {
  if (currentClientPort === null) {
    const ports = await getClientPorts();
    if (!ports || ports.length === 0) {
      throw new Error("未找到可用的浏览器实例，请先从实例管理里面启动新的实例");
    }
    currentClientPort = ports[0];
  }
  return currentClientPort;
};

const setCurrentClientPort = (port) => {
  currentClientPort = port;
};


module.exports = {
  startClient,
  destroyClientByPort,
  switchClientByPort,
  getClientPorts,
  getCurrentClientPort,
};
