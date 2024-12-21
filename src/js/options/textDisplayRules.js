export const textDisplayRules = {
  string: (cmd) => cmd,
  window: (cmd, isTooltip) => isTooltip ? cmd.match.app.join(", ") : cmd.match.app[0],
  files: (cmd) => cmd.match || (cmd.fileType === "directory" ? "所有文件夹" : "所有文件"),
  regex: (cmd) => cmd.match,
  over: () => "所有文本",
  img: () => "图片",
  add: (cmd) => cmd.count,
};
