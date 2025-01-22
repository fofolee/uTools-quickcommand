const CDP = require("chrome-remote-interface");
const { exec } = require("child_process");
const path = require("path");
const os = require("os");
const http = require("http");
const axios = require("axios");
const fs = require("fs");

let client = null;
let Page = null;
let Runtime = null;
let DOM = null;

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
    headless = false,
    proxy = null,
    browserPath = getBrowserPath(browserType),
    windowSize = null,
  } = options;

  if (!browserPath) {
    throw new Error("未找到浏览器，或未指定浏览器路径");
  }

  // 查找可用端口
  const port = await findAvailablePort(9222);

  const args = [
    `--remote-debugging-port=${port}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--start-maximized",
    headless ? "--headless" : "",
    windowSize ? `--window-size=${windowSize}` : "",
    proxy ? `--proxy-server=${proxy}` : "",
    useSingleUserDataDir
      ? `--user-data-dir=${path.join(
          os.tmpdir(),
          `${browserType}-debug-${port}`
        )}`
      : "",
  ].filter(Boolean);

  return new Promise(async (resolve, reject) => {
    // 如果使用独立用户数据目录，则需要先杀死已有的浏览器进程
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
      {
        windowsHide: true,
      },
      async (error) => {
        if (error) {
          reject(error);
          return;
        }
      }
    );

    // 等待端口可用
    waitForPort(port).then((success) => {
      if (success) {
        resolve({
          pid: child.pid,
          port,
        }); // 返回使用的端口号
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

const initCDP = async (port) => {
  if (!client) {
    try {
      client = await CDP({ port });
      ({ Page, Runtime, DOM } = client);
      await Promise.all([Page.enable(), Runtime.enable(), DOM.enable()]);
    } catch (err) {
      console.log(err);
      throw new Error(`请先通过浏览器控制中的"启动浏览器"打开浏览器`);
    }
  }
  return { Page, Runtime, DOM };
};

const getUrl = async () => {
  const { Page } = await initCDP();
  const { frameTree } = await Page.getFrameTree();
  return frameTree.frame.url;
};

const setUrl = async (url) => {
  const { Page } = await initCDP();
  await Page.navigate({ url });
  await Page.loadEventFired();
};

const executeScript = async (script, args = {}) => {
  const { Runtime } = await initCDP();
  // 构建参数列表
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
  return result.value;
};

const setCookie = async (cookies, options = {}) => {
  const { Network } = await initCDP();
  for (const cookie of cookies) {
    await Network.setCookie({
      name: cookie.name,
      value: cookie.value,
      domain: options.domain || undefined,
      path: options.path || "/",
      secure: options.secure || false,
      expires: options.expires
        ? Math.floor(Date.now() / 1000) + options.expires * 3600
        : undefined,
    });
  }
};

const getCookie = async (name) => {
  const { Network } = await initCDP();
  const cookies = await Network.getCookies();
  return cookies.find((cookie) => cookie.name === name);
};

module.exports = {
  launchBrowser,
  getUrl,
  setUrl,
  executeScript,
  setCookie,
  getCookie,
};
