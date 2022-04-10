/**
 * 所有的特殊变量
 */

let escapeItem = item => {
    if (typeof item === 'number') return item
    item = typeof item === 'object' ? JSON.stringify(item) : item.replace('\\', '\\\\')
    return item.replace('$', '$$$')
}

let handlingJsonVar = (jsonVar, name) => {
    try {
        return escapeItem(window.VmEval(jsonVar.slice(2, -2), {
            [name]: quickcommand.enterData.payload
        }))
    } catch {
        return ""
    }
}

let handlingJsExpression = js => {
    try {
        return window.VmEval(js.slice(5, -2), {
            utools: window.getuToolsLite(),
        })
    } catch {
        return ""
    }
}

const specialVars = {
    isWin: {
        name: "isWin",
        label: "{{isWin}}",
        desc: "是否为 windows 系统，返回 0 或 1",
        disabledType: [],
        match: /{{isWin}}/mg,
        repl: () => utools.isWindows() ? 1 : 0
    },
    LocalId: {
        name: "LocalId",
        label: "{{LocalId}}",
        desc: "本机唯一ID",
        disabledType: [],
        match: /{{LocalId}}/mg,
        repl: () => utools.getNativeId()
    },
    BrowserUrl: {
        name: "BrowserUrl",
        label: "{{BrowserUrl}}",
        disabledType: [],
        desc: "浏览器当前链接",
        match: /{{BrowserUrl}}/mg,
        repl: () => utools.getCurrentBrowserUrl()
    },
    ClipText: {
        name: "ClipText",
        label: "{{ClipText}}",
        disabledType: [],
        desc: "剪贴板内容",
        match: /{{ClipText}}/mg,
        repl: () => window.clipboardReadText()
    },
    subinput: {
        name: "subinput",
        label: "{{subinput:请输入}}",
        disabledType: [],
        desc: "子输入框的文本，冒号后为占位符",
        match: /{{subinput(:.+?){0,1}}}/mg,
    },
    input: {
        name: "input",
        label: "{{input}}",
        desc: "主输入框的文本",
        match: /{{input}}/mg,
        repl: () => quickcommand.enterData.payload
    },
    pwd: {
        name: "pwd",
        label: "{{pwd}}",
        desc: "文件管理器当前目录",
        match: /{{pwd}}/mg,
        repl: () => window.getCurrentFolderPathFix()
    },
    WindowInfo: {
        name: "WindowInfo",
        label: "{{WindowInfo}}",
        desc: "当前窗口信息，JSON格式，可以指定键值，如{{WindowInfo.id}}",
        type: "json",
        match: /{{WindowInfo(.*?)}}/mg,
        repl: jsonVar => handlingJsonVar(jsonVar, "WindowInfo")
    },
    SelectFile: {
        name: "SelectFile",
        label: "{{SelectFile}}",
        desc: "文件管理器选中的文件，不支持Linux",
        match: /{{SelectFile}}/mg,
        repl: () => window.getSelectFile(quickcommand.enterData.payload.id)
    },
    MatchedFiles: {
        name: "MatchedFiles",
        label: "{{MatchedFiles}}",
        desc: "匹配的文件，JSON格式，可以指定键值，如{{MatchedFiles[0].path}}",
        type: "json",
        match: /{{MatchedFiles(.*?)}}/mg,
        repl: jsonVar => handlingJsonVar(jsonVar, "MatchedFiles")
    },
    type: {
        name: "type",
        label: "{{type}}",
        desc: "onPluginEnter的type，匹配的类型",
        match: /{{type}}/mg,
        repl: () => quickcommand.enterData.type
    },
    payload: {
        name: "payload",
        label: "{{payload}}",
        desc: "onPluginEnter的payload,当为JSON时可以指定键值，如{{payload.id}}",
        type: "json",
        match: /{{payload(.*?)}}/mg,
        repl: jsonVar => handlingJsonVar(jsonVar, "payload")
    },
    js: {
        name: "js",
        label: "{{js:}}",
        desc: "获取js表达式的值，如{{js:utools.isMacOs()}}",
        tooltip: "注意，必须为表达式而非语句，类似Vue的文本插值。不支持异步/Node",
        type: "command",
        match: /{{js:(.*?)}}/mg,
        repl: js => handlingJsExpression(js)
    },
    python: {
        name: "python",
        label: "{{py:}}",
        desc: "模拟python -c，并获取返回值，如{{py:print(1)}}",
        tooltip: "只支持单行语句",
        type: "command",
        match: /{{py:(.*?)}}/mg,
        repl: py => window.runPythonCommand(py.slice(5, -2))
    }
}

export default specialVars