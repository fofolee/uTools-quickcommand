/**
 * 所有支持的编程语言
*/

const programs = {
  quickcommand: {
    name: "quickcommand",
    highlight: "javascript",
    bin: "",
    argv: "",
    ext: "",
    color: "#006e54",
  },
  shell: {
    name: "shell",
    bin: "bash",
    argv: "",
    ext: "sh",
    color: "#89e051",
  },
  applescript: {
    name: "applescript",
    bin: "osascript",
    argv: "",
    ext: "scpt",
    color: "#101F1F",
  },
  cmd: {
    name: "cmd",
    highlight: "bat",
    bin: "",
    argv: "",
    ext: "bat",
    color: "#C1F12E",
  },
  powershell: {
    name: "powershell",
    bin: "powershell",
    argv: "-NoProfile -File",
    ext: "ps1",
    color: "#012456",
  },
  python: {
    name: "python",
    bin: "python",
    argv: "-u",
    ext: "py",
    color: "#3572A5",
  },
  javascript: {
    name: "javascript",
    bin: "node",
    argv: "",
    ext: "js",
    color: "#f1e05a",
  },
  ruby: {
    name: "ruby",
    bin: "ruby",
    argv: "",
    ext: "rb",
    color: "#701516",
  },
  php: {
    name: "php",
    bin: "php",
    argv: "",
    ext: "php",
    color: "#4F5D95",
  },
  c: {
    name: "c",
    bin: "gcc",
    argv: "-o",
    ext: "c",
    color: "#555555",
  },
  csharp: {
    name: "csharp",
    bin: "C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe",
    argv: "/Nologo",
    ext: "cs",
    color: "#178600",
  },
  lua: {
    name: "lua",
    bin: "lua",
    argv: "",
    ext: "lua",
    color: "#000080",
  },
  perl: {
    name: "perl",
    bin: "perl",
    argv: "",
    ext: "pl",
    color: "#0298c3",
  },
  custom: {
    name: "custom",
    bin: "",
    argv: "",
    ext: "",
    color: "#438eff",
  },
};
export default programs
