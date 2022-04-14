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
        color: "primary",
    },
    shell: {
        name: "shell",
        bin: "bash",
        argv: "",
        ext: "sh",
        color: "green-6",
    },
    applescript: {
        name: "applescript",
        bin: "osascript",
        argv: "",
        ext: "scpt",
        color: "cyan-10",
    },
    cmd: {
        name: "cmd",
        highlight: "bat",
        bin: "",
        argv: "",
        ext: "bat",
        color: "orange-10",
    },
    powershell: {
        name: "powershell",
        bin: "powershell",
        argv: "-NoProfile -File",
        ext: "ps1",
        color: "amber-14",
    },
    python: {
        name: "python",
        bin: "python",
        argv: "-u",
        ext: "py",
        color: "light-blue-10",
    },
    javascript: {
        name: "javascript",
        bin: "node",
        argv: "",
        ext: "js",
        color: "teal",
    },
    ruby: {
        name: "ruby",
        bin: "ruby",
        argv: "",
        ext: "rb",
        color: "red-10",
    },
    php: {
        name: "php",
        bin: "php",
        argv: "",
        ext: "php",
        color: "deep-purple",
    },
    c: {
        name: "c",
        bin: "gcc",
        argv: "-o",
        ext: "c",
        color: "blue-7",
    },
    csharp: {
        name: "csharp",
        bin: "C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe",
        argv: "/Nologo",
        ext: "cs",
        color: "light-blue-13",
    },
    lua: {
        name: "lua",
        bin: "lua",
        argv: "",
        ext: "lua",
        color: "light-green-8",
    },
    perl: {
        name: "perl",
        bin: "perl",
        argv: "",
        ext: "pl",
        color: "purple",
    },
    custom: {
        name: "custom",
        bin: "",
        argv: "",
        ext: "",
        color: "indigo-6",
    },
};
export default programs
