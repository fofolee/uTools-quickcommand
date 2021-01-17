import qctemplates from "./qctemplates.js"

// 从 icons8 选择图标
let getIcons8Icon = () => {
    let showIcon = icon => {
        return $(`<img class="networkImg" src="https://img.icons8.com/color/1x/${icon.commonName}.png"> <span>${icon.name}</span>`)
    }
    let showItems = item => {
        if (item.loading) return item.text
        return showIcon(item)
    }
    let showSelection = selection => {
        if (!selection.commonName) return selection.text
        $('#networkImgUrl').val(`https://img.icons8.com/color/1x/${selection.commonName}.png`)
        return showIcon(selection)
    }
    $('#networkImg').select2({
        dataType: 'json',
        width: '80%',
        delay: 250,
        ajax: {
            url: 'https://search.icons8.com/api/iconsets/v5/search',
            data: function(params) {
                return {
                    term: params.term,
                    offset: (params.page - 1) * 10 || 0,
                    platform: 'color',
                    amount: 10,
                    token: 'JpOyWT5TW8yYThBIk1fCbsNDd3ISSChSD5vPgCON',
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
        placeholder: '搜索icons8图标',
        minimumInputLength: 1,
        templateResult: showItems,
        templateSelection: showSelection
    })
}

let getRemoteImg = async imgUrl => {
    try {
        let imgInfo = window.getFileInfo({ type: 'file', argvs: imgUrl, readfile: false })
        let imgPath = window.getQuickCommandScriptFile(imgInfo.ext)
        await quickcommand.downloadFile(imgUrl, imgPath)
        $("#iconame").val(imgInfo.name);
        let src = await window.getBase64Ico(imgPath);
        $("#icon").attr('src', src);
    } catch (error) {
        quickcommand.showMessageBox('图片地址有误！', 'error')
    }
}

let showChangeIconWindow = () => {
    Swal.fire({
        title: "设置图标",
        onBeforeOpen: () => {
            getIcons8Icon()
            $('#localImg').click(async () => {
                var options = { buttonLabel: '选择', properties: ['openFile'] }
                var file = window.getFileInfo({ type: 'dialog', argvs: options, readfile: false })
                if (file) {
                    $("#iconame").val(file.name);
                    let src = await window.getBase64Ico(file.path);
                    $("#icon").attr('src', src);
                    Swal.close()
                }
            })
        },
        html: qctemplates.command.setIcon,
        showCancelButton: true,
        preConfirm: async () => {
            let imgUrl = $('#networkImgUrl').val()
            if (imgUrl) await getRemoteImg(imgUrl)
            else quickcommand.showMessageBox('没有输入图标地址', 'warning')
        }
    })
}

export default {
    showChangeIconWindow
}
