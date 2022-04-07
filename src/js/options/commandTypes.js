const commandTypes = {
    key: {
        name: "key",
        label: "关键词",
        icon: "font_download",
        matchLabel: "关键词",
        desc: "在主输入框输入对应关键字进入插件，最通用的一种模式，关键字可以设置多个",
        valueType: "array",
        disabledSpecialVars: /{{input}}|{{SelectFile}}|{{pwd}}|{{WindowInfo}}|{{MatchedFiles}}/g,
        matchToCmds: (rules, desc) => rules,
        verify: (rules) => rules.length > 0 || "关键词不能为空",
    },
    regex: {
        name: "regex",
        label: "正则/划词",
        matchLabel: "正则",
        icon: "rule",
        desc: "匹配主输入框或超级面板选中的文本，可以获取输入框文本或选中文本作为变量",
        valueType: "regex",
        disabledSpecialVars: /{{SelectFile}}|{{WindowInfo}}|{{pwd}}|{{MatchedFiles}}/g,
        matchToCmds: (rules, desc) => [{
            label: desc,
            type: "regex",
            match: rules,
            minNum: 1,
        }, ],
        verify: rules => !!rules > 0 || "正则不能为空"
    },
    over: {
        name: "over",
        label: "所有文本",
        matchLabel: "无需设置",
        icon: "emergency",
        desc: "匹配主输入框的所有文本，但只有在该文本未设置对应的插件或功能时才生效",
        valueType: null,
        disabledSpecialVars: /{{SelectFile}}|{{WindowInfo}}|{{pwd}}|{{MatchedFiles}}/g,
        matchToCmds: (rules, desc) => [{
            label: desc,
            type: "over",
            minNum: 1,
        }],
        verify: rules => true
    },
    window: {
        name: "window",
        label: "窗口/进程",
        matchLabel: "进程名",
        icon: "widgets",
        desc: "匹配呼出uTools前或唤出超级面板时的活动窗口，可以获取窗口的信息或文件夹路径作为变量",
        valueType: "array",
        disabledSpecialVars: /{{input}}|{{MatchedFiles}}/g,
        matchToCmds: (rules, desc) => [{
            type: "window",
            label: desc,
            match: {
                "app": rules
            }
        }],
        verify: rules => rules.length > 0 || "进程名不能为空"
    },
    img: {
        name: "img",
        label: "图片",
        matchLabel: "无需配置",
        icon: "panorama",
        desc: "匹配主输入框或超级面板选中的图片，并返回图片的 base64",
        valueType: null,
        disabledSpecialVars: /{{input}}|{{SelectFile}}|{{pwd}}|{{WindowInfo}}|{{MatchedFiles}}/g,
        matchToCmds: (rules, desc) => [{
            label: desc,
            type: "img",
        }],
        verify: rules => true
    },
    files: {
        name: "files",
        label: "复制/选中文件",
        matchLabel: "正则",
        icon: "description",
        desc: "匹配主输入框或超级面板选中的文件，可以获取复制及选中的文件信息作为变量",
        valueType: "regex",
        disabledSpecialVars: /{{input}}|{{SelectFile}}|{{pwd}}|{{WindowInfo}}/g,
        matchToCmds: (rules, desc) => [{
            type: "files",
            label: desc,
            match: rules,
            "minLength": 1,
        }, ],
        verify: rules => !!rules > 0 || "正则不能为空"

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
        jsonSample: [
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
    }
}

export default commandTypes