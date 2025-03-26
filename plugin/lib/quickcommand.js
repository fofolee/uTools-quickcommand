const child_process = require("child_process");
const electron = require("electron");
const fs = require("fs");
const kill = require("tree-kill");
const iconv = require("iconv-lite");
const path = require("path");
const axios = require("axios");
const marked = require("marked");
const { chat, getModels } = require("./ai");

const { dbStorage } = utools;

window.getModelsFromAiApi = getModels;

const systemDialog = require("./dialog/service");

const {
  getQuickcommandTempFile,
  getQuickcommandFolderFile,
} = require("./getQuickcommandFile");

const createTerminalCommand = require("./createTerminalCommand");

const ctlKey = window.utools.isMacOs() ? "command" : "control";

const getSleepCodeByShell = (ms) => {
  var cmd, tempFilePath;
  if (window.utools.isWindows()) {
    tempFilePath = getQuickcommandTempFile("vbs", "SleepVBSScript");
    cmd = `echo set ws=CreateObject("Wscript.Shell") > ${tempFilePath} && echo Wscript.sleep ${ms} >> ${tempFilePath} && cscript /nologo ${tempFilePath}`;
  } else {
    cmd = `sleep ${ms / 1000}`;
  }
  return cmd;
};

const quickcommand = {
  // 模拟复制操作
  simulateCopy: function () {
    window.utools.simulateKeyboardTap("c", ctlKey);
  },

  // 模拟粘贴操作
  simulatePaste: function () {
    window.utools.simulateKeyboardTap("v", ctlKey);
  },

  // setTimout 不能在 vm2 中使用，同时在 electron 中有 bug
  sleep: function (ms) {
    try {
      // node 16.13.1
      child_process.execSync(getSleepCodeByShell(ms), {
        timeout: ms,
        windowsHide: true,
      });
    } catch (ex) {}
    return;
  },

  // 重写 setTimeout
  setTimeout: function (callback, ms) {
    const child = child_process.exec(
      getSleepCodeByShell(ms),
      {
        timeout: ms,
      },
      () => {
        if (child.signalCode === "SIGKILL") return;
        callback();
      }
    );
    return child.pid;
  },

  clearTimeout: function (pid) {
    kill(pid, "SIGKILL");
  },

  asyncSleep: async function (ms) {
    return new Promise((resolve) => {
      this.setTimeout(resolve, ms);
    });
  },

  // 关闭进程
  kill: function (pid, signal = "SIGTERM", cb) {
    kill(pid, signal, cb);
  },

  // dom 解析
  htmlParse: function (html) {
    return new DOMParser().parseFromString(html, "text/html");
  },

  // markdown 解析
  markdownParse: function (markdown) {
    return marked.parse(markdown);
  },

  // 下载文件
  downloadFile: function (url, file) {
    return new Promise((reslove, reject) => {
      if (!file || file instanceof Object)
        file = window.utools.showSaveDialog(JSON.parse(JSON.stringify(file)));
      axios({
        method: "get",
        url: url,
        responseType: "arraybuffer",
      })
        .then((res) => {
          var filebuffer = Buffer.from(res.data);
          fs.writeFile(file, filebuffer, (err) => {
            if (err) reject(err);
            else reslove(filebuffer);
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  // 上传文件
  uploadFile: function (url, file, name = "file", formData = {}) {
    return new Promise((reslove, reject) => {
      var objfile;
      if (file instanceof File) {
        objfile = file;
      } else {
        if (!file || file instanceof Object)
          file = window.utools.showOpenDialog(
            JSON.parse(JSON.stringify(file))
          )[0];
        if (!fs.existsSync(file)) return reject("文件不存在");
        var arraybuffer = fs.readFileSync(file).buffer;
        var objfile = new File([arraybuffer], path.basename(file));
      }
      var form = new FormData();
      form.append(name, objfile);
      var keys = Object.keys(formData);
      if (keys.length) keys.forEach((k) => form.append(k, formData[k]));
      axios
        .post(url, form, {
          headers: {
            accept: "application/json",
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          },
        })
        .then((res) => {
          reslove(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  // 载入在线资源
  loadRemoteScript: async function (url, options) {
    const urlReg =
      /^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/;
    if (!urlReg.test(url)) throw "url 不合法";
    const { useCache = false } = options;
    if (useCache) {
      const urlHash = quickcomposer.coding.md5Hash(url);
      const fileName = path.basename(url, ".js") + "." + urlHash.slice(8, -8);
      const local = getQuickcommandFolderFile(fileName, "js");
      if (!fs.existsSync(local)) {
        await this.downloadFile(url, local);
      }
      return require(local);
    } else {
      const local = getQuickcommandTempFile("js");
      await this.downloadFile(url, local);
      let source = require(local);
      fs.unlinkSync(local);
      return source;
    }
  },

  // 唤醒 uTools
  wakeUtools: function () {
    let uToolsPath = window.utools.isMacOs()
      ? process.execPath.replace(/\/Frameworks\/.*/, "/MacOS/uTools")
      : process.execPath;
    child_process.exec(uToolsPath, () => {});
  },

  readClipboard: function () {
    return electron.clipboard.readText();
  },

  writeClipboard: function (text) {
    electron.clipboard.writeText(text.toString());
  },

  readClipboardImage: function () {
    // 从剪贴板获取图片
    const image = electron.clipboard.readImage();
    if (!image.isEmpty()) {
      return image.toDataURL();
    }

    // 尝试获取文本（可能是base64格式的图片）
    const clipboardText = electron.clipboard.readText();
    if (clipboardText && clipboardText.startsWith("data:image")) {
      return clipboardText;
    }
    return null;
  },

  askAI: async function (content, apiConfig, options) {
    if (window.lodashM.isEmpty(apiConfig)) {
      apiConfig = dbStorage.getItem("cfg_aiConfigs")?.[0] || {};
    }
    return await chat(content, apiConfig, options);
  },

  ...systemDialog,
};

if (process.platform === "win32") {
  // 运行vbs脚本
  quickcommand.runVbs = function (script) {
    return new Promise((reslove, reject) => {
      var tempfile = getQuickcommandTempFile("vbs");
      fs.writeFile(tempfile, iconv.encode(script, "gbk"), () => {
        child_process.exec(
          `cscript.exe /nologo "${tempfile}"`,
          {
            encoding: "buffer",
            windowsHide: true,
          },
          (err, stdout, stderr) => {
            if (err) reject(iconv.decode(stderr, "gbk"));
            else reslove(iconv.decode(stdout, "gbk"));
            fs.unlink(tempfile, () => {});
          }
        );
      });
    });
  };
  // 运行powershell脚本
  quickcommand.runPowerShell = function (script) {
    return new Promise((reslove, reject) => {
      let base64str = Buffer.from(script, "utf16le").toString("base64");
      child_process.exec(
        `powershell.exe -e "${base64str}"`,
        {
          encoding: "buffer",
          windowsHide: true,
        },
        (err, stdout, stderr) => {
          if (err) reject(iconv.decode(stderr, "gbk"));
          else reslove(iconv.decode(stdout, "gbk"));
        }
      );
    });
  };
}

if (process.platform === "darwin") {
  // 运行AppleScript脚本
  quickcommand.runAppleScript = function (script) {
    return new Promise((reslove, reject) => {
      child_process.execFile(
        "osascript",
        ["-e", script],
        (err, stdout, stderr) => {
          if (err) reject(stderr);
          else reslove(stdout);
        }
      );
    });
  };
}

// python -c
window.runPythonCommand = (py) => {
  try {
    let result = child_process.execFileSync("python", ["-c", py], {
      windowsHide: true,
      encoding: "buffer",
    });
    return iconv
      .decode(result, window.utools.isWindows() ? "gbk" : "utf8")
      .trim();
  } catch (e) {
    alert(e);
    return "";
  }
};

if (process.platform !== "linux") {
  // 在终端中执行
  quickcommand.runInTerminal = function (cmdline, options) {
    // 兼容老版本接口, 老版本第二个参数是dir
    if (typeof options === "string") options = { dir: options };
    let command = createTerminalCommand(cmdline, options);
    child_process.exec(command);
  };
}

module.exports = quickcommand;
