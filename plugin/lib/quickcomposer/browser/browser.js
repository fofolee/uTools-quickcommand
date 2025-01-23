const CDP = require("chrome-remote-interface");
const { exec } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");
const net = require("net");

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

const launchBrowser = async (options) => {
  const {
    browserType = "msedge",
    useSingleUserDataDir = true,
    proxy = null,
    browserPath = getBrowserPath(browserType),
    windowSize = null,
    incognito = false,
    headless = false,
    disableExtensions = false,
  } = options;

  if (!browserPath) {
    throw new Error("未找到浏览器，或未指定浏览器路径");
  }

  const port = await findAvailablePort(9222);
  currentClientPort = port;

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

const getClientPorts = async (returnFirstPort = false) => {
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

    if (returnFirstPort) {
      // 如果需要返回第一个可用端口，使用 Promise.race
      const firstPort = await Promise.race(portChecks);
      if (firstPort) {
        return firstPort;
      } else {
        return null;
      }
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
    const port = await getClientPorts(true);
    if (port === null) {
      throw new Error("未找到可用的浏览器实例，请先从实例管理里面启动新的实例");
    }
    currentClientPort = port;
  }
  return currentClientPort;
};

const getTargets = async () => {
  const port = await getCurrentClientPort();
  return await CDP.List({ port });
};

const initCDP = async (targetId) => {
  try {
    const port = await getCurrentClientPort();
    const client = await CDP({
      target: targetId,
      port,
    });

    const { Page, Runtime, Target, Network, Emulation, DOM } = client;
    await Promise.all([Page.enable(), Runtime.enable(), DOM.enable()]);

    return {
      client,
      Page,
      Runtime,
      Target,
      Network,
      Emulation,
      DOM,
    };
  } catch (err) {
    console.log(err);
    throw new Error(`连接到浏览器失败: ${err.message}`);
  }
};

const cleanupCDP = async (targetId) => {
  try {
    // 直接关闭传入的 client
    if (targetId?.client) {
      await targetId.client.close();
    }
  } catch (error) {
    console.log("关闭CDP连接失败:", error);
  }
};

const getTabs = async () => {
  const targets = await getTargets();
  return targets
    .filter((target) => target.type === "page")
    .map((target) => ({
      url: target.url,
      title: target.title,
      id: target.id,
    }));
};

const getCurrentTab = async () => {
  const targets = await getTargets();
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

const searchTarget = async (tab) => {
  if (!tab || !tab.by || !tab.searchValue || tab.by === "active") {
    const currentTab = await getCurrentTab();
    return currentTab;
  }

  const targets = await getTargets();
  const target = targets.find((target) =>
    target[tab.by].includes(tab.searchValue)
  );
  if (!target) {
    throw new Error(`未找到目标标签页: ${tab.by} = ${tab.searchValue}`);
  }
  return target;
};

const activateTab = async (tab) => {
  const target = await searchTarget(tab);
  const port = await getCurrentClientPort();
  await CDP.Activate({ id: target.id, port });
};

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

const closeTab = async (tab) => {
  const target = await searchTarget(tab);
  const port = await getCurrentClientPort();
  await cleanupCDP(target.id);
  await CDP.Close({ id: target.id, port });
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
      (async function(${argNames.join(", ")}) {
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
  const { format = "png", quality = 100, savePath, selector = null } = options;

  try {
    const { Page, DOM } = await initCDP(target.id);
    await DOM.enable();

    let clip = null;
    if (selector) {
      // 获取DOM节点
      const { root } = await DOM.getDocument();
      const { nodeId } = await DOM.querySelector({
        nodeId: root.nodeId,
        selector: selector,
      });

      if (!nodeId) {
        throw new Error(`未找到元素: ${selector}`);
      }

      // 获取元素的精确四边形坐标
      const { quads } = await DOM.getContentQuads({ nodeId });
      if (!quads || quads.length === 0) {
        throw new Error("无法获取元素位置信息");
      }

      // 获取布局指标
      const { visualViewport } = await Page.getLayoutMetrics();
      const { pageX, pageY } = visualViewport;

      // 计算边界框
      const quad = quads[0];
      const x = Math.min(quad[0], quad[2], quad[4], quad[6]);
      const y = Math.min(quad[1], quad[3], quad[5], quad[7]);
      const width = Math.max(quad[0], quad[2], quad[4], quad[6]) - x;
      const height = Math.max(quad[1], quad[3], quad[5], quad[7]) - y;

      clip = {
        x: Math.round(x - pageX),
        y: Math.round(y - pageY),
        width: Math.round(width),
        height: Math.round(height),
        scale: 1,
      };

      // 确保尺寸不为0
      if (clip.width === 0) clip.width = 1;
      if (clip.height === 0) clip.height = 1;
    }

    const screenshotParams = {
      format,
      quality: format === "jpeg" ? quality : undefined,
      fromSurface: true,
      captureBeyondViewport: !!selector,
    };

    if (clip) {
      screenshotParams.clip = clip;
    }

    const { data } = await Page.captureScreenshot(screenshotParams);

    await DOM.disable();

    if (savePath) {
      fs.writeFileSync(savePath, data, "base64");
    }

    return data;
  } finally {
    await cleanupCDP(target.id);
  }
};

const destroyClientByPort = async (port) => {
  try {
    const client = await CDP({ port });
    await client.Browser.close();

    if (port === currentClientPort) {
      currentClientPort = null;
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
    currentClientPort = port;
  } catch (error) {
    throw new Error(`切换客户端失败: ${error.message}`);
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
  getClientPorts,
  destroyClientByPort,
  switchClientByPort,
  getCurrentClientPort,
  getTargets,
};
