/**
 * 所有的匹配类型
 */



const jsonSample = [
    "关键词",
    {
        "type": "img",
        "label": "图片匹配"
    },
    {
        "type": "files",
        "label": "文件匹配",
        "fileType": "file",
        "match": "/aaa/",
        "minLength": 1,
        "maxLength": 99
    },
    {
        "type": "regex",
        "label": "文本正则匹配",
        "match": "/bbb/i",
        "minLength": 1,
        "maxLength": 99
    },
    {
        "type": "over",
        "label": "无匹配时",
        "exclude": "/ccc/i",
        "minLength": 1,
        "maxLength": 99
    },
    {
        "type": "window",
        "label": "窗口动作",
        "match": {
            "app": [
                "ddd.app",
                "eee.exe"
            ],
            "title": "/fff/",
            "class": [
                "ggg"
            ]
        }
    }
]

const commandTypes = {
    key: {
        name: "key",
        label: "关键词",
        icon: "font_download",
        color: "teal",
        matchLabel: "关键词",
        desc: "直接在主输入框输入对应关键字，最通用的一种模式，关键字可以设置多个",
        valueType: "array",
        disabledSpecialVars: /{{input}}|{{SelectFile}}|{{pwd}}|{{WindowInfo.*?}}|{{MatchedFiles.*?}}/g,
        matchToCmds: (rules, desc) => rules,
        verify: (rules) => !_.isEmpty(rules) || "关键词不能为空",
    },
    regex: {
        name: "regex",
        label: "正则/划词",
        icon: "rule",
        color: "cyan",
        matchLabel: "正则",
        desc: "匹配主输入框或超级面板选中的文本，可以获取输入框文本或选中文本作为变量",
        valueType: "regex",
        disabledSpecialVars: /{{SelectFile}}|{{MatchImage}}|{{WindowInfo.*?}}|{{pwd}}|{{MatchedFiles.*?}}/g,
        matchToCmds: (rules, desc) => [{
            label: desc,
            type: "regex",
            match: rules,
            minNum: 1,
        }, ],
        verify: rules => !!rules > 0 || "正则不能为空",
        tempPayload: async() => {
            let values = await quickcommand.showInputBox(["需要处理的文本"])
            return values[0]
        }
    },
    over: {
        name: "over",
        label: "所有文本",
        matchLabel: "无需设置",
        icon: "emergency",
        color: "light-green",
        desc: "匹配主输入框的所有文本，但只有在该文本未设置对应的插件或功能时才生效",
        valueType: null,
        disabledSpecialVars: /{{SelectFile}}|{{MatchImage}}|{{WindowInfo.*?}}|{{pwd}}|{{MatchedFiles.*?}}/g,
        matchToCmds: (rules, desc) => [{
            label: desc,
            type: "over",
            minNum: 1,
        }],
        verify: rules => true,
        tempPayload: async() => {
            let values = await quickcommand.showInputBox(["需要处理的文本"])
            return values[0]
        }
    },
    window: {
        name: "window",
        label: "窗口/进程",
        matchLabel: "进程名",
        icon: "widgets",
        color: "indigo",
        desc: "匹配呼出uTools前或唤出超级面板时的活动窗口，可以获取窗口的信息或文件夹路径作为变量",
        valueType: "array",
        disabledSpecialVars: /{{input}}|{{MatchImage}}|{{MatchedFiles.*?}}/g,
        matchToCmds: (rules, desc) => [{
            type: "window",
            label: desc,
            match: {
                "app": rules
            }
        }],
        verify: rules => !_.isEmpty(rules) || "进程名不能为空",
    },
    img: {
        name: "img",
        label: "图片",
        matchLabel: "无需配置",
        icon: "panorama",
        color: "deep-orange",
        desc: "匹配剪贴板的图片，并返回图片的 DataUrl",
        valueType: null,
        disabledSpecialVars: /{{input}}|{{SelectFile}}|{{pwd}}|{{WindowInfo.*?}}|{{MatchedFiles.*?}}/g,
        matchToCmds: (rules, desc) => [{
            label: desc,
            type: "img",
        }],
        verify: rules => true,
        tempPayload: () => window.getBase64Ico(utools.showOpenDialog({
            title: "需要处理的图片",
            filters: [{
                name: 'Images',
                extensions: ['png',
                    'jpg',
                    'jpeg',
                    'bmp',
                    'gif',
                ]
            }]
        })[0])
    },
    files: {
        name: "files",
        label: "复制/选中文件",
        matchLabel: "正则",
        icon: "description",
        color: "light-blue",
        desc: "匹配主输入框或超级面板选中的文件，可以获取复制及选中的文件信息作为变量",
        valueType: "regex",
        disabledSpecialVars: /{{input}}|{{MatchImage}}|{{SelectFile}}|{{pwd}}|{{WindowInfo.*?}}/g,
        matchToCmds: (rules, desc) => [{
            type: "files",
            label: desc,
            match: rules.match,
            fileType: rules.fileType,
            minLength: 1,
        }, ],
        verify: rules => !!rules > 0 || "正则不能为空",
        tempPayload: () => window.convertFilePathToUtoolsPayload(utools.showOpenDialog({
            title: "需要处理的文件",
            properties: ['openFile', 'multiSelections']
        }))

    },
    professional: {
        name: "professional",
        label: "专业模式",
        matchLabel: "json配置",
        icon: "construction",
        desc: "通过json格式的配置实现同时匹配关键字、窗口、文件甚至图片，或者指定文件数量、窗口类等",
        valueType: "json",
        disabledSpecialVars: null,
        matchToCmds: (rules, desc) => JSON.parse(rules),
        verify: rules => {
            try {
                JSON.parse(rules);
                return true
            } catch (error) {
                return "专业模式json配置错误"
            }
        },
        jsonSample: jsonSample
    }
}

export default commandTypes
