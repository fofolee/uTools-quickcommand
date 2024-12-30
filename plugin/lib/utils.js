const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");
const child_process = require("child_process");

const resolveFileToBase64 = (filepath) => {
  let imageBase64,
    ext = path.extname(filepath).slice(1);
  if (["png", "jpg", "jpeg", "bmp", "ico", "gif", "svg"].includes(ext)) {
    if (ext == "svg") ext = "svg+xml";
    imageBase64 =
      `data:image/${ext};base64,` + fs.readFileSync(filepath, "base64");
  } else {
    imageBase64 = window.utools.getFileIcon(filepath);
  }
  return imageBase64;
};

const getFileInfo = (options) => {
  var file;
  if (options.type == "file") {
    file = options.argvs;
  } else if (options.type == "dialog") {
    var dialog = window.utools.showOpenDialog(options.argvs);
    if (!dialog) return false;
    file = dialog[0];
  } else {
    return false;
  }
  var information = {
    name: path.basename(file),
    ext: path.extname(file),
    path: file,
  };
  if (options.readfile) {
    var codec =
      information.ext == ".bat" || information == ".ps1" ? "gbk" : "utf8";
    information.data = iconv.decode(fs.readFileSync(file), codec);
  }
  return information;
};

const getCurrentFolderPathFix = () => {
  let pwd = window.utools.getCurrentFolderPath();
  let pwdFix = pwd ? pwd : path.join(window.utools.getPath("home"), "desktop");
  return pwdFix.replace(/\\/g, "\\\\");
};

const saveFile = (content, file) => {
  if (file instanceof Object) file = window.utools.showSaveDialog(file);
  if (!file) return false;
  try {
    fs.writeFileSync(file, content);
    return true;
  } catch (error) {
    return false;
  }
};

const getSelectFile = (hwnd) => {
  if (window.utools.isWindows()) {
    var cmd = `powershell.exe -NoProfile "(New-Object -COM 'Shell.Application').Windows() | Where-Object { $_.HWND -eq ${hwnd} } | Select-Object -Expand Document | select @{ n='SelectItems'; e={$_.SelectedItems()} }  | select -Expand SelectItems | select -Expand Path "`;
    let result = child_process.execSync(cmd, {
      encoding: "buffer",
      windowsHide: true,
    });
    return iconv.decode(result, "GBK").trim().replace(/\\/g, "/");
  } else {
    var cmd = `osascript -e 'tell application "Finder" to set selectedItems to selection as alias list
            if selectedItems is {} then return
            set parentPath to do shell script "dirname " & quoted form of POSIX path of (item 1 of selectedItems)
            set pathData to ""
            repeat with theItem in selectedItems
                set pathData to pathData & POSIX path of theItem & linefeed
            end repeat
            '
            `;
    let result = child_process.execSync(cmd, {
      encoding: "utf8",
      windowsHide: true,
    });
    return result ? result.trim() : "";
  }
};

const convertFilePathToUtoolsPayload = (files) => {
  return files.map((file) => {
    let isFile = fs.statSync(file).isFile();
    return {
      isFile: isFile,
      isDirectory: !isFile,
      name: path.basename(file),
      path: file,
    };
  });
};

module.exports = {
  resolveFileToBase64,
  getFileInfo,
  getCurrentFolderPathFix,
  saveFile,
  getSelectFile,
  convertFilePathToUtoolsPayload,
};
