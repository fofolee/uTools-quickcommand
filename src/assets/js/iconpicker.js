// 从 icons8 选择图标
let getIcons8Icon = (selector, callback) => {
    if (!$(selector).is('select')) return
    let showIcon = icon => {
        return $(`<img class="networkImg" src="https://img.icons8.com/color/1x/${icon.commonName}.png"> <span>${icon.name}</span>`)
    }
    let showItems = item => {
        if (item.loading) return item.text
        return showIcon(item)
    }
    let showSelection = selection => {
        if (!selection.commonName) return selection.text
        let imgUrl = `https://img.icons8.com/color/1x/${selection.commonName}.png`
        getImg(imgUrl, src => {
            src && callback(src)
        })
        return showIcon(selection)
    }
    $(selector).select2({
        dataType: 'json',
        delay: 250,
        ajax: {
            url: 'https://search.icons8.com/api/iconsets/v5/search',
            data: function(params) {
                return {
                    term: params.term,
                    offset: (params.page - 1) * 10 || 0,
                    platform: 'color',
                    amount: 10,
                    // token: 'JpOyWT5TW8yYThBIk1fCbsNDd3ISSChSD5vPgCON',
                    language: /[\u4e00-\u9fa5]/.test(params.term) ? 'zh' : 'en'
                }
            },
            processResults: function(data) {
                return {
                    results: data.icons,
                    pagination: {
                        more: (data.parameters.offset + 10) < data.parameters.countAll
                    }
                };
            },
            cache: true
        },
        placeholder: '搜索网络图标',
        minimumInputLength: 1,
        templateResult: showItems,
        templateSelection: showSelection
    })
}

let getLocalIcon = (selector, callback) => {
    $(selector).click(async () => {
        var options = { buttonLabel: '选择', properties: ['openFile'] }
        var file = window.getFileInfo({ type: 'dialog', argvs: options, readfile: false })
        if (file) {
            window.getBase64Ico(file.path).then(src => {
                callback(src)
            })
        }
    })
}

let getRemoteIcon = (selector, callback) => {
    if (!$(selector).is('input')) return
    $(selector).blur(async () => {
        let imgUrl = $(selector).val()
        if (!imgUrl) return
        getImg(imgUrl, src => {
            src && callback(src)
        })
    })
}

let getImg = (imgUrl, callback) => {
    let imgInfo = window.getFileInfo({ type: 'file', argvs: imgUrl, readfile: false })
    let imgPath = window.getQuickCommandScriptFile(imgInfo.ext)
    quickcommand.downloadFile(imgUrl, imgPath).then(() => {
        window.getBase64Ico(imgPath).then(src => {
            callback(src)
        })
    }).catch(e => {
        utools.showNotification('图片地址有误！')
    })
}

export default {
    getIcons8Icon,
    getLocalIcon,
    getRemoteIcon
}
