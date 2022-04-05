const commandTypes = {
    keyword: {
        name: "keyword",
        label: "关键词",
        icon: "font_download",
        matchLabel: "关键词",
        desc: "在主输入框输入对应关键字进入插件，最通用的一种模式，关键字可以设置多个",
        valueType: "array"
    },
    regex: {
        name: "regex",
        label: "正则/划词",
        matchLabel: "正则",
        icon: "rule",
        desc: "匹配主输入框或超级面板选中的文本，可以获取输入框文本或选中文本作为变量",
        valueType: "regex"
    },
    over: {
        name: "over",
        label: "所有文本",
        matchLabel: "无需设置",
        icon: "emergency",
        desc: "匹配主输入框的所有文本，但只有在该文本未设置对应的插件或功能时才生效",
        valueType: "null"
    },
    window: {
        name: "window",
        label: "窗口/进程",
        matchLabel: "进程名",
        icon: "widgets",
        desc: "匹配呼出uTools前或唤出超级面板时的活动窗口，可以获取窗口的信息或文件夹路径作为变量",
        valueType: "array"
    },
    img: {
        name: "img",
        label: "图片",
        matchLabel: "无需配置",
        icon: "panorama",
        desc: "匹配主输入框或超级面板选中的图片，并返回图片的 base64",
        valueType: "null"
    },
    files: {
        name: "files",
        label: "复制/选中文件",
        matchLabel: "正则",
        icon: "description",
        desc: "匹配主输入框或超级面板选中的文件，可以获取复制及选中的文件信息作为变量",
        valueType: "regex"

    },
    professional: {
        name: "professional",
        label: "专业模式",
        matchLabel: "json配置",
        icon: "construction",
        desc: "通过json格式的配置实现同时匹配关键字、窗口、文件甚至图片，或者指定文件数量、窗口类等",
        valueType: "json"
    }
}

export default commandTypes