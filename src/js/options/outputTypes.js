const outputTypes = {
    ignore: {
        name: "ignore",
        label: "忽略输出并隐藏",
        icon: "more_horiz"
    },
    nothing: {
        name: "nothing",
        label: "忽略输出且不隐藏",
        icon: "blur_linear"
    },
    text: {
        name: "text",
        label: "纯文本输出",
        icon: "text_snippet"
    },
    html: {
        name: "html",
        label: "html格式输出",
        icon: "html"
    },
    terminal: {
        name: "terminal",
        label: "在终端显示",
        icon: "terminal"
    },
    clip: {
        name: "clip",
        label: "复制到剪贴板",
        icon: "content_paste"
    },
    send: {
        name: "send",
        label: "发送到活动窗口",
        icon: "web_asset"
    },
    notice: {
        name: "notice",
        label: "发送系统通知",
        icon: "sms"
    },
};

export default outputTypes