const CDP = require("chrome-remote-interface");
const { exec } = require("child_process");
const path = require("path");
const os = require("os");
const http = require("http");
const axios = require("axios");
const fs = require("fs");

let clients = new Map(); // 存储每个标签页的CDP客户端

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
    const server = http.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
};

const waitForPort = async (port, timeout = 30000) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const response = await axios.get(`http://localhost:${port}/json/version`);
      if (response.status === 200) return true;
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

const launchBrowser = async (options) => {
  const {
    browserType = "msedge",
    useSingleUserDataDir = true,
    proxy = null,
    browserPath = getBrowserPath(browserType),
    windowSize = null,
    incognito = false,
    headless = false,
  } = options;

  if (!browserPath) {
    throw new Error("未找到浏览器，或未指定浏览器路径");
  }

  const port = await findAvailablePort(9222);

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
    proxy ? `--proxy-server=${proxy}` : "",
    incognito ? incognitoArg[browserType] : "",
    headless ? "--headless" : "",
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

const initCDP = async (targetId) => {
  if (!clients.has(targetId)) {
    try {
      const client = await CDP({ target: targetId });
      const { Page, Runtime, Target, Network, Emulation } = client;
      await Promise.all([Page.enable(), Runtime.enable()]);
      clients.set(targetId, {
        client,
        Page,
        Runtime,
        Target,
        Network,
        Emulation,
      });
    } catch (err) {
      console.log(err);
      throw new Error(`请先通过浏览器控制中的"启动浏览器"打开浏览器`);
    }
  }
  return clients.get(targetId);
};

const cleanupCDP = async (targetId) => {
  const client = clients.get(targetId);
  if (client) {
    await client.client.close();
    clients.delete(targetId);
  }
};

// 获取所有标签页
const getTabs = async () => {
  const targets = await CDP.List();
  return targets
    .filter((target) => target.type === "page")
    .map((target) => ({
      url: target.url,
      title: target.title,
      id: target.id,
    }));
};

// 获取当前活动标签页
const getCurrentTab = async () => {
  const targets = await CDP.List();
  // 一般排第一个的就是活动标签页
  const currentTarget = targets.find((target) => target.type === "page");

  if (!currentTarget) {
    throw new Error("未找到当前活动标签页");
  }

  return {
    url: currentTarget.url,
    title: currentTarget.title,
    id: currentTarget.id,
  };
};

// 搜索标签页
const searchTarget = async (tab) => {
  if (!tab || !tab.by || !tab.searchValue || tab.by === "active") {
    const currentTab = await getCurrentTab();
    return currentTab;
  }

  const targets = await CDP.List();
  const target = targets.find((target) =>
    target[tab.by].includes(tab.searchValue)
  );
  if (!target) {
    throw new Error(`未找到目标标签页: ${tab.by} = ${tab.searchValue}`);
  }
  return target;
};

// 激活指定标签页
const activateTab = async (tab) => {
  const target = await searchTarget(tab);
  await CDP.Activate({ id: target.id });
};

// 创建新标签页
const createNewTab = async (url = "about:blank") => {
  const currentTab = await getCurrentTab();
  const { Target } = await initCDP(currentTab.id);
  const { targetId } = await Target.createTarget({ url });
  const { targetInfo } = await Target.getTargetInfo({ targetId });
  await cleanupCDP(currentTab.id);
  return {
    url: targetInfo.url,
    title: targetInfo.title,
    id: targetId,
  };
};

// 关闭标签页
const closeTab = async (tab) => {
  const target = await searchTarget(tab);
  await cleanupCDP(target.id);
  await CDP.Close({ id: target.id });
};

const getUrl = async (tab) => {
  const target = await searchTarget(tab);
  const { Page } = await initCDP(target.id);
  const { frameTree } = await Page.getFrameTree();
  await cleanupCDP(target.id);
  return frameTree.frame.url;
};

const setUrl = async (tab, url) => {
  const target = await searchTarget(tab);
  const { Page } = await initCDP(target.id);
  await Page.navigate({ url });
  await Page.loadEventFired();
  await cleanupCDP(target.id);
};

const executeScript = async (tab, script, args = {}) => {
  const target = await searchTarget(tab);
  try {
    const { Runtime } = await initCDP(target.id);
    const argNames = Object.keys(args);
    const argValues = Object.values(args).map((v) => JSON.stringify(v));

    const wrappedScript = `
      (function(${argNames.join(", ")}) {
        ${script}
      })(${argValues.join(", ")})
    `;

    const { result } = await Runtime.evaluate({
      expression: wrappedScript,
      returnByValue: true,
      awaitPromise: true,
    });

    await cleanupCDP(target.id);
    return result.value;
  } catch (e) {
    console.log(e);
    throw new Error("执行脚本失败");
  }
};

const setCookie = async (tab, cookies, options = {}) => {
  const target = await searchTarget(tab);
  const { Network, Page } = await initCDP(target.id);
  try {
    // 直接从Page获取URL，避免创建新连接
    const { frameTree } = await Page.getFrameTree();
    const url = frameTree.frame.url;

    for (const cookie of cookies) {
      await Network.setCookie({
        name: cookie.name,
        value: cookie.value,
        domain: options.domain || url.split("/")[2],
        path: options.path || "/",
        secure: options.secure || false,
        expires: options.expires
          ? Math.floor(Date.now() / 1000) + options.expires * 3600
          : undefined,
      });
    }
  } finally {
    await cleanupCDP(target.id);
  }
};

const getCookie = async (tab, name) => {
  const target = await searchTarget(tab);
  const { Network } = await initCDP(target.id);
  const { cookies } = await Network.getCookies();
  await cleanupCDP(target.id);
  if (!name) return cookies;
  return cookies.find((cookie) => cookie.name === name);
};

// 捕获标签页截图
const captureScreenshot = async (tab, options = {}) => {
  const target = await searchTarget(tab);
  const { format = "png", quality = 100, fullPage = false, savePath } = options;

  try {
    const { Page, Emulation } = await initCDP(target.id);

    if (fullPage) {
      const metrics = await Page.getLayoutMetrics();
      const width = Math.max(
        metrics.contentSize.width,
        metrics.layoutViewport.clientWidth,
        metrics.visualViewport.clientWidth
      );
      const height = Math.max(
        metrics.contentSize.height,
        metrics.layoutViewport.clientHeight,
        metrics.visualViewport.clientHeight
      );
      await Emulation.setDeviceMetricsOverride({
        width,
        height,
        deviceScaleFactor: 1,
        mobile: false,
      });
    }

    const { data } = await Page.captureScreenshot({
      format,
      quality: format === "jpeg" ? quality : undefined,
      fromSurface: true,
      captureBeyondViewport: fullPage,
    });

    if (fullPage) {
      await Emulation.clearDeviceMetricsOverride();
    }

    if (savePath) {
      fs.writeFileSync(savePath, data, "base64");
    }

    return data;
  } finally {
    await cleanupCDP(target.id);
  }
};

module.exports = {
  launchBrowser,
  killRunningBrowser,
  getTabs,
  getCurrentTab,
  activateTab,
  createNewTab,
  closeTab,
  getUrl,
  setUrl,
  executeScript,
  setCookie,
  getCookie,
  captureScreenshot,
};
