const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { getQuickcommandFolderFile } = require("./getQuickcommandFile");

// 读取 dialog.cs 模板
const dialogTemplate = fs.readFileSync(
  path.join(__dirname, "csharp", "dialog.cs"),
  "utf8"
);

// 辅助函数
const execCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

const checkZenity = async () => {
  try {
    await execCommand("which zenity");
    return true;
  } catch (error) {
    window.utools.showNotification(
      "请先安装 zenity：\nsudo apt install zenity 或\nsudo yum install zenity 或\nsudo pacman -S zenity"
    );
    return false;
  }
};

const getQuickcommandIconPath = () => {
  try {
    const iconPath = getQuickcommandFolderFile("logo", "png");
    if (!fs.existsSync(iconPath)) {
      const sourcePath = path.join(__dirname, "..", "logo.png");
      if (!fs.existsSync(sourcePath)) {
        console.error("Source icon not found:", sourcePath);
        return "";
      }
      fs.copyFileSync(sourcePath, iconPath);
    }
    return iconPath;
  } catch (error) {
    console.error("Error getting icon path:", error);
    return "";
  }
};

// 修改对话框函数，使用新的 dialog.cs
const showSystemMessageBox = async function (content, title = "") {
  try {
    const iconPath = getQuickcommandIconPath();
    if (window.utools.isWindows()) {
      const args = [
        "-type",
        "message",
        "-title",
        title,
        "-content",
        content.replace(/\r\n|\n/g, ""),
      ];

      if (iconPath) {
        args.push("-iconpath", iconPath.replace(/\\/g, "\\\\"));
      }

      const csharpCode = dialogTemplate;
      const result = await this.runCsharp(csharpCode, args);
      if (result && result.startsWith("Error:")) {
        throw new Error(result.substring(7));
      }
      return true;
    }
    if (window.utools.isMacOs()) {
      let iconParam = "note";
      if (iconPath) {
        const posixPath = iconPath.replace(/\\/g, "/");
        iconParam = `alias POSIX file "${posixPath}"`;
      }
      const script = `display dialog "${content}" with title "${title}" buttons {"确定"} default button "确定" with icon ${iconParam}`;
      await this.runAppleScript(script);
      return true;
    } else if (window.utools.isLinux()) {
      if (!(await checkZenity())) return false;
      try {
        const script = `zenity --info --title="${title}" --text="${content}" --width=400`;
        await execCommand(script);
        return true;
      } catch (error) {
        return false;
      }
    }
  } catch (error) {
    console.error("Dialog error:", error);
    window.utools.showNotification(`对话框错误: ${error.message}`);
    return false;
  }
};

const showSystemInputBox = async function (placeholders, title = "") {
  if (!Array.isArray(placeholders)) {
    placeholders = [placeholders];
  }

  const iconPath = getQuickcommandIconPath();
  if (window.utools.isMacOs()) {
    let iconParam = "note";
    if (iconPath) {
      const posixPath = iconPath.replace(/\\/g, "/");
      iconParam = `alias POSIX file "${posixPath}"`;
    }
    try {
      const results = [];
      for (let i = 0; i < placeholders.length; i++) {
        const isLast = i === placeholders.length - 1;
        const buttons = isLast ? '{"取消", "确定"}' : '{"取消", "继续"}';
        const defaultButton = isLast ? '"确定"' : '"继续"';
        const script = `display dialog "${placeholders[i]}" with title "${title}" default answer "" buttons ${buttons} default button ${defaultButton} with icon ${iconParam}`;
        const result = await this.runAppleScript(script);
        const buttonClicked = isLast ? "确定" : "继续";
        if (!result.includes(`button returned:${buttonClicked}`)) {
          return null;
        }
        const text = result.match(/text returned:(.+)/)[1];
        results.push(text);
      }
      return results;
    } catch (err) {
      console.error(err);
      return [];
    }
  } else if (window.utools.isWindows()) {
    const args = [
      "-type",
      "input",
      "-title",
      title,
      "-content",
      placeholders.join("|||||"),
    ];

    if (iconPath) {
      args.push("-iconpath", iconPath.replace(/\\/g, "\\\\"));
    }

    const csharpCode = dialogTemplate;
    const result = await this.runCsharp(csharpCode, args);
    return result ? JSON.parse(result) : [];
  } else if (window.utools.isLinux()) {
    if (!(await checkZenity())) return null;
    const results = [];
    for (let i = 0; i < placeholders.length; i++) {
      try {
        const script = `zenity --entry --title="${title}" --text="${placeholders[i]}" --width=400`;
        const result = await execCommand(script);
        if (!result) return [];
        results.push(result.trim());
      } catch (error) {
        console.error("执行 zenity 命令失败:", error);
        return [];
      }
    }
    return results;
  }
};

const showSystemConfirmBox = async function (content, title = "") {
  const iconPath = getQuickcommandIconPath();
  if (window.utools.isMacOs()) {
    let iconParam = "note";
    if (iconPath) {
      const posixPath = iconPath.replace(/\\/g, "/");
      iconParam = `alias POSIX file "${posixPath}"`;
    }
    const script = `display dialog "${content}" with title "${title}" buttons {"取消", "确定"} default button "确定" with icon ${iconParam}`;
    try {
      const result = await this.runAppleScript(script);
      return result.includes("button returned:确定");
    } catch (err) {
      console.error(err);
      return false;
    }
  } else if (window.utools.isWindows()) {
    const args = [
      "-type",
      "confirm",
      "-title",
      title,
      "-content",
      content.replace(/\r\n|\n/g, "\\n"),
    ];

    if (iconPath) {
      args.push("-iconpath", iconPath.replace(/\\/g, "\\\\"));
    }

    const csharpCode = dialogTemplate;
    const result = await this.runCsharp(csharpCode, args);
    return result === "true";
  } else if (window.utools.isLinux()) {
    if (!(await checkZenity())) return false;
    try {
      const script = `zenity --question --title="${title}" --text="${content}" --width=400`;
      await execCommand(script);
      return true;
    } catch (error) {
      return false;
    }
  }
};

const showSystemButtonBox = async function (buttons, title = "") {
  const iconPath = getQuickcommandIconPath();
  if (window.utools.isMacOs()) {
    const itemList = buttons.map((item) => `"${item}"`).join(", ");
    const script = `choose from list {${itemList}} with title "${title}" default items {"${buttons[0]}"}`;
    try {
      const result = await this.runAppleScript(script);
      if (result.includes("false")) return {};
      const text = result.trim();
      const id = buttons.findIndex((item) => item === text);
      return { id, text };
    } catch (err) {
      console.error(err);
      return {};
    }
  } else if (window.utools.isWindows()) {
    const args = [
      "-type",
      "buttons",
      "-title",
      title,
      "-content",
      buttons.join("|||||"),
    ];

    if (iconPath) {
      args.push("-iconpath", iconPath.replace(/\\/g, "\\\\"));
    }

    const csharpCode = dialogTemplate;
    const result = await this.runCsharp(csharpCode, args);
    if (result) {
      return JSON.parse(result);
    }
    return {};
  } else if (window.utools.isLinux()) {
    if (!(await checkZenity())) return null;
    try {
      const script1 = `zenity --info --title="${title}" --width=400`;
      await execCommand(script1);

      const itemsList = buttons
        .map((btn, index) => `"${index}" "${btn}"`)
        .join(" ");
      const script2 = `zenity --list --title="${title}" --text="请选择：" --column="序号" --column="选项" ${itemsList} --width=400 --height=300`;
      const result = await execCommand(script2);
      if (!result) return {};
      const text = result.trim();
      const id = buttons.findIndex((btn) => btn === text);
      return { id, text };
    } catch (error) {
      console.error("执行 zenity 命令失败:", error);
      return null;
    }
  }
};

const showSystemTextArea = async function (defaultText = "", title = "") {
  const iconPath = getQuickcommandIconPath();
  if (window.utools.isWindows()) {
    const args = [
      "-type",
      "textarea",
      "-title",
      title,
      "-content",
      defaultText,
    ];

    if (iconPath) {
      args.push("-iconpath", iconPath.replace(/\\/g, "\\\\"));
    }

    const csharpCode = dialogTemplate;
    const result = await this.runCsharp(csharpCode, args);
    return result || null;
  } else if (window.utools.isLinux()) {
    if (!(await checkZenity())) return null;
    try {
      const script = `zenity --text-info --title="${title}" --editable --width=450 --height=350 --filename=<(echo "${defaultText}")`;
      const result = await execCommand(script);
      return result ? result.trim() : null;
    } catch (error) {
      console.error("执行 zenity 命令失败:", error);
      return null;
    }
  }
};

module.exports = {
  showSystemMessageBox,
  showSystemInputBox,
  showSystemConfirmBox,
  showSystemButtonBox,
  showSystemTextArea,
};
