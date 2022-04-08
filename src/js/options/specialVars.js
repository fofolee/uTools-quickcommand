/**
 * 所有的特殊变量
 */

const specialVars = {
    LocalId: {
        name: "LocalId",
        label: "{{LocalId}}",
        desc: "本机唯一ID"
    },
    BrowserUrl: {
        name: "BrowserUrl",
        label: "{{BrowserUrl}}",
        desc: "浏览器当前链接"
    },
    ClipText: {
        name: "ClipText",
        label: "{{ClipText}}",
        desc: "剪贴板内容"
    },
    subinput: {
        name: "subinput",
        label: "{{subinput}}",
        desc: "子输入框的文本"
    },
    input: {
        name: "input",
        label: "{{input}}",
        desc: "主输入框的文本"
    },
    pwd: {
        name: "pwd",
        label: "{{pwd}}",
        desc: "文件管理器当前目录"
    },
    WindowInfo: {
        name: "WindowInfo",
        label: "{{WindowInfo}}",
        desc: "当前窗口信息，JSON格式字符串",
        type: "json"
    },
    SelectFile: {
        name: "SelectFile",
        label: "{{SelectFile}}",
        desc: "文件管理器选中的文件，不支持Linux"
    },
    MatchedFiles: {
        name: "MatchedFiles",
        label: "{{MatchedFiles}}",
        desc: "匹配的文件，JSON格式字符串",
        type: "json"
    },
    type: {
        name: "type",
        label: "{{type}}",
        desc: "专业模式的type"
    },
    payload: {
        name: "payload",
        label: "{{payload}}",
        desc: "专业模式的payload,JSON格式字符串",
        type: "json"
    }
}

export default specialVars
