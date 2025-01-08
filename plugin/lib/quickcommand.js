const child_process = require("child_process");
const electron = require("electron");
const fs = require("fs");
const kill = require("tree-kill");
const iconv = require("iconv-lite");
const path = require("path");
const axios = require("axios");

const getQuickcommandTempFile = require("./getQuickcommandTempFile");
const getCommandToLaunchTerminal = require("./getCommandToLaunchTerminal");

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
    var start = new Date().getTime();
    try {
      // node 16.13.1
      child_process.execSync(getSleepCodeByShell(ms), {
        timeout: ms,
        windowsHide: true,
      });
    } catch (ex) {}
    var end = new Date().getTime();
    return end - start;
  },

  // 重写 setTimeout
  setTimeout: function (callback, ms) {
    var start = new Date().getTime();
    child_process.exec(
      getSleepCodeByShell(ms),
      {
        timeout: ms,
      },
      (err, stdout, stderr) => {
        var end = new Date().getTime();
        callback(end - start);
      }
    );
  },

  // 关闭进程
  kill: function (pid, signal = "SIGTERM", cb) {
    kill(pid, signal, cb);
  },

  // dom 解析
  htmlParse: function (html) {
    return new DOMParser().parseFromString(html, "text/html");
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
  loadRemoteScript: async function (url) {
    if (
      !/^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/.test(
        url
      )
    )
      throw "url 不合法";
    let local = getQuickcommandTempFile("js");
    await this.downloadFile(url, local);
    let source = require(local);
    fs.unlinkSync(local);
    return source;
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
};

if (process.platform === "win32") {
  // 运行vbs脚本
  quickcommand.runVbs = function (script) {
    return new Promise((reslove, reject) => {
      var tempfile = getQuickcommandTempFile("vbs", "TempVBSScript");
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

  // 运行C#脚本
  quickcommand.runCsharp = function (script) {
    return new Promise((reslove, reject) => {
      // 找到csc.exe
      let cscPath = path.join(
        process.env.WINDIR,
        "Microsoft.NET",
        "Framework",
        "v4.0.30319",
        "csc.exe"
      );
      if (!fs.existsSync(cscPath)) {
        cscPath = path.join(
          process.env.WINDIR,
          "Microsoft.NET",
          "Framework",
          "v3.5",
          "csc.exe"
        );
      }
      if (!fs.existsSync(cscPath)) {
        return reject("未安装.NET Framework");
      }
      // 写入临时文件
      let tempCsharpFile = getQuickcommandTempFile("cs", "TempCsharpScript");
      let tempBuildFile = getQuickcommandTempFile("exe", "TempCsharpBuildExe");

      fs.writeFile(tempCsharpFile, iconv.encode(script, "gbk"), (err) => {
        if (err) return reject(err.toString());
        // 运行csc.exe
        child_process.exec(
          `${cscPath} /nologo /out:${tempBuildFile} ${tempCsharpFile} && ${tempBuildFile}`,
          {
            encoding: "buffer",
            windowsHide: true,
          },
          (err, stdout) => {
            if (err) reject(iconv.decode(stdout, "gbk"));
            else reslove(iconv.decode(stdout, "gbk"));
            fs.unlink(tempCsharpFile, () => {});
            fs.unlink(tempBuildFile, () => {});
          }
        );
      });
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

// 在终端中执行
if (process.platform !== "linux")
  quickcommand.runInTerminal = function (cmdline, dir) {
    let command = getCommandToLaunchTerminal(cmdline, dir);
    child_process.exec(command);
  };

module.exports = quickcommand;
