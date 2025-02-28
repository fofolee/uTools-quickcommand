utools.getAppVersion() < "2.6.1" && alert("请升级 uTools 至最新版本");
// -----------------------------------------------------------------
const fs = require("fs");
const os = require("os");
const child_process = require("child_process");
const iconv = require("iconv-lite");
const electron = require("electron");
const path = require("path");
const axios = require("axios");
const http = require("http");
const https = require("https");
const url = require("url");
const crypto = require("crypto");

require("ses");
const md5 = (input) => {
  return crypto.createHash("md5").update(input, "utf8").digest("hex");
};

window.lodashM = require("./lib/lodashMini");
window.pinyinMatch = require("pinyin-match");

const createTerminalCommand = require("./lib/createTerminalCommand");
const shortCodes = require("./lib/shortCodes");
const { pluginInfo, getUtoolsPlugins } = require("./lib/getUtoolsPlugins");
const {
  resolveFileToBase64,
  getFileInfo,
  getCurrentFolderPathFix,
  saveFile,
  getSelectFile,
  convertFilePathToUtoolsPayload,
} = require("./lib/utils");
window.pluginInfo = pluginInfo;
window.getUtoolsPlugins = getUtoolsPlugins;
window.resolveFileToBase64 = resolveFileToBase64;
window.getFileInfo = getFileInfo;
window.getCurrentFolderPathFix = getCurrentFolderPathFix;
window.saveFile = saveFile;
window.getSelectFile = getSelectFile;
window.convertFilePathToUtoolsPayload = convertFilePathToUtoolsPayload;

window.getuToolsLite = require("./lib/utoolsLite");
window.quickcommand = require("./lib/quickcommand");
window.quickcomposer = require("./lib/quickcomposer");
window.showUb = require("./lib/showDocs");
window.getQuickcommandTempFile =
  require("./lib/getQuickcommandFile").getQuickcommandTempFile;

window.getSharedQcById = async (id) => {
  const url = "https://qc.qaz.ink/home/quick/script/getScript";
  const timeStamp = parseInt(new Date().getTime() / 1000);
  const { data } = await axios.get(url, {
    params: {
      id,
    },
    headers: {
      "verify-encrypt": md5("quickcommand666" + timeStamp),
      "verify-time": timeStamp,
    },
  });
  return JSON.stringify(data.data);
};

// 检测进程是否存在
let isProcessExits = (pid) => {
  try {
    return process.kill(pid, 0);
  } catch (e) {
    return false;
  }
};

window.isAppVersion4 = () => utools.getAppVersion() >= "4.0.0";

// 多开检测
window.multiProcessDetection = () => {
  let pids = JSON.parse(localStorage.getItem("processes")) || [];
  if (pids.length) pids = pids.filter((x) => isProcessExits(x));
  pids.push(process.pid);
  localStorage.setItem("processes", JSON.stringify(pids));
  if (pids.length > 1) return true;
  return false;
};

/**
 * 忘了为什么之前注释下面的语句了 -_-!，保留浏览器的 axios
 * axios.defaults.adapter = require('axios/lib/adapters/http')
 * 另外创建一个 node 的 axios
 */
const nodeAxios = axios.create({
  httpAgent: new http.Agent(),
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});
nodeAxios.defaults.adapter = "http";

if (!window.utools.isWindows())
  process.env.PATH = `/usr/local/bin:/usr/local/sbin:${process.env.PATH}`;

if (window.utools.isMacOS())
  process.env.PATH = `/opt/homebrew/bin:/opt/homebrew/sbin:${process.env.PATH}`;

window.htmlEncode = (value) => {
  let dom = quickcommand.htmlParse().querySelector("body");
  dom.innerText = value;
  return dom.innerHTML;
};

window.removeHtmlTags = (value) => {
  return quickcommand.htmlParse(value).querySelector("body").innerText;
};

window.hexEncode = (text) => Buffer.from(text, "utf8").toString("hex");
window.hexDecode = (text) => Buffer.from(text, "hex").toString("utf8");
window.base64Decode = (text) => Buffer.from(text, "base64").toString("utf8");

window.processPlatform = process.platform;
window.joinPath = path.join;

window.clipboardReadText = () => electron.clipboard.readText();

let getSandboxFuns = () => {
  var sandbox = {
    fetch: fetch.bind(window),
    utools: window.getuToolsLite(),
    electron,
    axios: nodeAxios,
    Audio,
    AbortController,
    AbortSignal,
    Buffer,
    require,
    // 兼容老版本
    fs,
    path,
    os,
    child_process,
    quickcomposer,
    // timeout
    setTimeout: quickcommand.setTimeout,
    clearTimeout: quickcommand.clearTimeout,
  };
  Object.keys(shortCodes).forEach((f) => {
    sandbox[f] = shortCodes[f];
  });
  return sandbox;
};

// 简化报错信息
let liteErr = (e) => {
  if (!e) return;
  if (typeof e === "string") return e;
  return e.error
    ? e.error.stack.replace(/([ ] +at.+)|(.+\.js:\d+)/g, "").trim()
    : e.message;
};

// vm 模块将无法在渲染进程中使用，改用 ses 来执行代码
window.evalCodeInSandbox = (code, addVars = {}) => {
  let sandboxWithAD = Object.assign(addVars, getSandboxFuns());
  sandboxWithAD.quickcommand = window.lodashM.cloneDeep(quickcommand);
  try {
    return new Compartment(sandboxWithAD).evaluate(code);
  } catch (error) {
    throw liteErr(error);
  }
};

let isWatchingError = false;
window.runCodeInSandbox = (code, callback, addVars = {}) => {
  let sandbox = getSandboxFuns();
  sandbox.console = {
    log: (...stdout) => {
      console.log("Result:", stdout);
      callback(stdout, null);
    },
    error: (...stderr) => {
      callback(null, stderr);
    },
    clear: () => {
      callback({ __clearQuickcommandRunResult: true }, null);
    },
  };
  let sandboxWithAD = Object.assign(addVars, sandbox);
  sandboxWithAD.quickcommand = window.lodashM.cloneDeep(quickcommand);
  if (addVars.enterData) {
    sandboxWithAD.quickcommand.enterData = addVars.enterData;
    sandboxWithAD.quickcommand.payload = addVars.enterData.payload;
  }
  try {
    new Compartment(sandboxWithAD).evaluate(code);
  } catch (e) {
    console.log("Error: ", e);
    callback(null, liteErr(e));
  }
  // 自动捕捉错误
  let cbUnhandledError = (e) => {
    removeAllListener();
    console.log("UnhandledError: ", e);
    callback(null, liteErr(e));
  };

  let cbUnhandledRejection = (e) => {
    removeAllListener();
    console.log("UnhandledRejection: ", e);
    callback(null, liteErr(e.reason));
  };

  let removeAllListener = () => {
    window.removeEventListener("error", cbUnhandledError);
    window.removeEventListener("unhandledrejection", cbUnhandledRejection);
    isWatchingError = false;
  };

  if (!isWatchingError) {
    window.addEventListener("error", cbUnhandledError);
    window.addEventListener("unhandledrejection", cbUnhandledRejection);
    isWatchingError = true;
  }
};

// 构建命令行字符串的工具函数
const buildCommandLine = (bin, argv, script, scptarg) => {
  if (bin.slice(-7) === "csc.exe") {
    const outFile = script.slice(0, -2) + "exe";
    return `${bin} ${argv} /out:"${outFile}" "${script}" && "${outFile}" ${scptarg}`;
  }

  if (bin === "gcc") {
    const suffix = utools.isWindows() ? ".exe" : "";
    const outFile = script.slice(0, -2) + suffix;
    return `${bin} ${argv} "${script.slice(
      0,
      -2
    )}" "${script}" && "${outFile}" ${scptarg}`;
  }

  if (utools.isWindows() && bin === "bash") {
    const wslPath = script.replace(/\\/g, "/").replace(/C:/i, "/mnt/c");
    return `wsl -e ${bin} ${argv} "${wslPath}" ${scptarg}`;
  }

  return `${bin} ${argv} "${script}" ${scptarg}`;
};

// 处理进程输出的工具函数
const handleProcessOutput = (child, charset, callback, realTime) => {
  const chunks = [];
  const errChunks = [];

  child.stdout.on("data", (chunk) => {
    const decodedChunk = charset.outputCode
      ? iconv.decode(chunk, charset.outputCode)
      : chunk;
    realTime
      ? callback(decodedChunk.toString(), null)
      : chunks.push(decodedChunk);
  });

  child.stderr.on("data", (errChunk) => {
    const decodedChunk = charset.outputCode
      ? iconv.decode(errChunk, charset.outputCode)
      : errChunk;
    realTime
      ? callback(null, decodedChunk.toString())
      : errChunks.push(decodedChunk);
  });

  if (!realTime) {
    child.on("close", () => {
      callback(chunks.join(""), errChunks.join(""));
    });
  }
};

window.runCodeFile = (
  cmd,
  option,
  terminalOptions,
  callback,
  realTime = true
) => {
  const { bin, argv, ext, charset, scptarg, envPath, alias } = option;
  const script = getQuickcommandTempFile(ext, "quickcommandTempScript");

  // 处理编码和换行
  const processedCmd = charset.scriptCode
    ? iconv.encode(cmd.replace(/\n/g, "\r\n"), charset.scriptCode)
    : cmd;
  fs.writeFileSync(script, processedCmd);
  // 构建命令行
  let cmdline = buildCommandLine(bin, argv, script, scptarg);

  // 处理环境变量
  const processEnv = window.lodashM.cloneDeep(process.env);
  if (envPath) processEnv.PATH = envPath;
  if (alias) cmdline = `${alias}\n${cmdline}`;
  if (!!terminalOptions) {
    cmdline = createTerminalCommand(cmdline, terminalOptions);
  }

  // 创建子进程
  const child = child_process.spawn(cmdline, {
    encoding: "buffer",
    shell: true,
    env: processEnv,
  });

  console.log("Running: " + cmdline);
  handleProcessOutput(child, charset, callback, realTime);
  return child;
};

const dbStorage = utools.dbStorage;
let httpServer;
window.quickcommandHttpServer = () => {
  let run = (port = 33442) => {
    let httpResponse = (res, code, result) => {
      // 只收受一次 console.log，接收后就关闭连接
      if (res.finished) return;
      res.writeHead(code, {
        "Content-Type": "text/html",
      });
      if (result) res.write(result);
      res.end();
    };
    let runUserCode = (res, userVars) => {
      let cmd = dbStorage.getItem("cfg_serverCode");
      // 不需要返回输出的提前关闭连接
      if (!cmd.includes("console.log")) httpResponse(res, 200);
      window.runCodeInSandbox(
        cmd,
        (stdout, stderr) => {
          // 错误返回 500
          if (stderr) return httpResponse(res, 500, stderr.join(" "));
          return httpResponse(res, 200, stdout.join(" "));
        },
        userVars
      );
    };
    httpServer = http.createServer();
    httpServer.on("request", (req, res) => {
      if (req.method === "GET") {
        let parsedParams = window.lodashM.cloneDeep(
          url.parse(req.url, true).query
        );
        runUserCode(res, parsedParams);
      } else if (req.method === "POST") {
        let data = [];
        req.on("data", (chunk) => {
          data.push(chunk);
        });
        req.on("end", () => {
          let parsedParams;
          let params = data.join("").toString();
          // 先尝试作为 json 解析
          try {
            parsedParams = JSON.parse(params);
          } catch (error) {
            parsedParams = window.lodashM.cloneDeep(
              url.parse("?" + params, true).query
            );
          }
          runUserCode(res, parsedParams);
        });
      } else {
        httpResponse(res, 405);
      }
    });
    httpServer.listen(port, "localhost");
    httpServer.on("error", (err) => {
      utools.showNotification("快捷命令服务:", err);
    });
  };
  let stop = () => {
    if (!httpServer) return;
    httpServer.close();
  };
  return {
    run,
    stop,
  };
};
