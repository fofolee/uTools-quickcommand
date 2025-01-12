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

const getCommandToLaunchTerminal = require("./lib/getCommandToLaunchTerminal");
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
window.getQuickcommandTempFile = require("./lib/getQuickcommandFile").getQuickcommandTempFile;

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
  };
  Object.keys(shortCodes).forEach((f) => {
    sandbox[f] = shortCodes[f];
  });
  return sandbox;
};

// 简化报错信息
let liteErr = (e) => {
  if (!e) return;
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

window.runCodeFile = (cmd, option, terminal, callback, realTime = true) => {
  let { bin, argv, ext, charset, scptarg, envPath, alias } = option;
  let script = getQuickcommandTempFile(ext, "quickcommandTempScript");
  // 批处理和 powershell 默认编码为 GBK, 解决批处理的换行问题
  if (charset.scriptCode)
    cmd = iconv.encode(cmd.replace(/\n/g, "\r\n"), charset.scriptCode);
  fs.writeFileSync(script, cmd);
  // var argvs = [script]
  // if (argv) {
  //     argvs = argv.split(' ')
  //     argvs.push(script);
  // }
  let child, cmdline;
  if (bin.slice(-7) == "csc.exe") {
    cmdline = `${bin} ${argv} /out:"${
      script.slice(0, -2) + "exe"
    }" "${script}" && "${script.slice(0, -2) + "exe"}" ${scptarg}`;
  } else if (bin == "gcc") {
    var suffix = utools.isWindows() ? ".exe" : "";
    cmdline = `${bin} ${argv} "${script.slice(0, -2)}" "${script}" && "${
      script.slice(0, -2) + suffix
    }" ${scptarg}`;
  } else if (utools.isWindows() && bin == "bash") {
    cmdline = `${bin} ${argv} "${script
      .replace(/\\/g, "/")
      .replace(/C:/i, "/mnt/c")}" ${scptarg}`;
  } else {
    cmdline = `${bin} ${argv} "${script}" ${scptarg}`;
  }
  let processEnv = window.lodashM.cloneDeep(process.env);
  if (envPath) processEnv.PATH = envPath;
  if (alias) cmdline = alias + "\n" + cmdline;
  // 在终端中输出
  if (terminal) cmdline = getCommandToLaunchTerminal(cmdline);
  child = child_process.spawn(cmdline, {
    encoding: "buffer",
    shell: true,
    env: processEnv,
  });
  let chunks = [],
    err_chunks = [];
  console.log("Running: " + cmdline);
  child.stdout.on("data", (chunk) => {
    if (charset.outputCode) chunk = iconv.decode(chunk, charset.outputCode);
    realTime ? callback(chunk.toString(), null) : chunks.push(chunk);
  });
  child.stderr.on("data", (err_chunk) => {
    if (charset.outputCode)
      err_chunk = iconv.decode(err_chunk, charset.outputCode);
    realTime
      ? callback(null, err_chunk.toString())
      : err_chunks.push(err_chunk);
  });
  if (!realTime) {
    child.on("close", (code) => {
      let stdout = chunks.join("");
      let stderr = err_chunks.join("");
      callback(stdout, stderr);
    });
  }
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
