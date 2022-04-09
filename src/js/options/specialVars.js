/**
 * 所有的特殊变量
 */

let escapeItem = item => {
    if (typeof item === 'number') return item
    item = typeof item === 'object' ? JSON.stringify(item) : item.replace('\\', '\\\\')
    return item.replace('$', '$$$')
}

let parseTheFirstLayerOfObjects = obj => {
    let matched = /{{(\w+)(\[(\d+)\]){0,1}\.(\w+)}}/.exec(obj);
    return matched ? {
        obj: matched[1],
        index: matched[3],
        prop: matched[4],
    } : {};
}

let handlingJsonVar = (jsonVar, srcObj) => {
    try {
        let parsed = parseTheFirstLayerOfObjects(jsonVar);
        if (!parsed.obj) return escapeItem(srcObj)
        else if (!parsed.index) return escapeItem(srcObj[parsed.prop])
        else return escapeItem(srcObj[parsed.index][parsed.prop])
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
        label: "{{subinput}}",
        disabledType: [],
        tooltip: `可以自定义占位符，如{{subinput:请输入}}`,
        desc: "子输入框的文本",
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
        desc: "当前窗口信息，JSON格式字符串",
        tooltip: `可以选择性读取其中的某一个属性，如{{WindowInfo.id}}`,
        type: "json",
        match: /{{WindowInfo(\.\w{1,7}){0,1}}}/mg,
        repl: jsonVar => handlingJsonVar(jsonVar, quickcommand.enterData.payload)
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
        tooltip: `可以选择性读取其中的某一个属性，如{{MatchedFiles[0].path}}`,
        desc: "匹配的文件，JSON格式字符串",
        type: "json",
        match: /{{MatchedFiles(\[\d+\]){0,1}(\.\w{1,11}){0,1}}}/mg,
        repl: jsonVar => handlingJsonVar(jsonVar, quickcommand.enterData.payload)
    },
    type: {
        name: "type",
        label: "{{type}}",
        desc: "专业模式的type",
        match: /{{type}}/mg,
        repl: () => quickcommand.enterData.type
    },
    payload: {
        name: "payload",
        label: "{{payload}}",
        desc: "专业模式的payload",
        match: /{{payload}}/mg,
        repl: () => escapeItem(quickcommand.enterData.payload)
    }
}

export default specialVars