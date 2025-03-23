/**
 * 所有的输出类型
 */

const outputTypes = {
    ignore: {
        name: "ignore",
        label: "忽略输出并隐藏",
        icon: "more_horiz",
        outPlugin: true,
        action: result => null
    },
    nothing: {
        name: "nothing",
        label: "忽略输出且不隐藏",
        icon: "blur_linear",
        action: result => null
    },
    text: {
        name: "text",
        label: "纯文本输出",
        icon: "text_snippet",
        action: result => true
    },
    html: {
        name: "html",
        label: "html格式输出",
        icon: "html",
        action: result => true
    },
    terminal: {
        name: "terminal",
        label: "在终端显示",
        icon: "terminal",
        outPlugin: true,
        action: result => null

    },
    clip: {
        name: "clip",
        label: "复制到剪贴板",
        icon: "content_paste",
        outPlugin: true,
        action: result => window.utools.copyText(result)
    },
    send: {
        name: "send",
        label: "发送到活动窗口",
        icon: "web_asset",
        outPlugin: true,
        action: result => window.utools.hideMainWindowPasteText(result)
    },
    notice: {
        name: "notice",
        label: "发送系统通知",
        icon: "sms",
        outPlugin: true,
        action: result => window.utools.showNotification(result)
    },
};

export default outputTypes
