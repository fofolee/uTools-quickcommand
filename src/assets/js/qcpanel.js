import iconpicker from "./iconpicker.js"
import qctemplates from "./qctemplates.js"
import qccommands from "./qccommands.js"
import UTOOLS from "./utools.js"

let showPanel = tag => {
    let data = UTOOLS.getDB(UTOOLS.DBPRE.PAN + hexEncode(tag))
    if (data.autoDetach) {
        // 分离窗口，暂时只能用模拟按键实现
        utools.simulateKeyboardTap('n', ctlKey)
        utools.simulateKeyboardTap('d', ctlKey)
    }
    let features = getPanelFeatures(tag)
    let panel = '<table>'
    let n = 0
    features.forEach(p => {
        if (n % 6 == 0) panel += '<tr>'
        panel += `<td>
        <img src="${p.data.features.icon}" cmd="${p.data.features.cmds[0]}" output="${p.data.output}">
        <div class="title">${p.data.features.explain}</div>
        </td>`
        n += 1
        if (n % 6 == 0) panel += '</tr>'
    });
    $('#quickpanel').html(panel + '</table>').show()
    $("img").click(e => {
        let cmd = e.target.getAttribute('cmd')
        utools.redirect(cmd)
        if (data.autoDetach) {
            let output = e.target.getAttribute('output')
            if (['ignore', 'clip', 'send', 'notice', 'terminal'].indexOf(output) == -1) {
                // 显示窗口，暂时只能用模拟按键实现
                utools.simulateKeyboardTap('space', 'alt')
            }
        }
    })
}

let addListenner = tag => {
    iconpicker.getIcons8Icon('#networkImg', src => {
        $("#icon").attr('src', src)
    })
    iconpicker.getLocalIcon('#icon', src => {
        $("#icon").attr('src', src)
    })
    iconpicker.getRemoteIcon('#networkImgUrl', src => {
        $("#icon").attr('src', src)
    })
    $(".platform").click(e => {
        let t = $(e.target)
        t.hasClass('disabled') ? t.removeClass('disabled') : $('.disabled').length != 2 && t.addClass('disabled')
    })
    $('.cancel').click(() => {
        Swal.close()
    })
    $('.enable').click(() => {
        changeConf(tag, 'enable')
    })
    $('.disable').click(() => {
        changeConf(tag, 'disable')
    })
    $('.modify').click(() => {
        changeConf(tag, 'modify')
    })
}

let changeConf = (tag, action) => {
    let cmds = $("#panelWord").val().split(',').map(x => x.trim())
    let description = $("#panelDesc").val()
    let icon = $("#icon").attr('src')
    let platform = []
    $('.platform').not('.disabled').each((x, y) => platform.push(y.id))
    let autoDetach = $('#panelConf .checked-switch').prop('checked')
    let inputCmd = window.editor.getValue()
    let code = `panel_${hexEncode(tag)}`
    let feature = {
        code: code,
        explain: description,
        cmds: cmds,
        icon: icon,
        platform: platform
    }
    let data = {
        feature: feature,
        autoDetach: autoDetach,
        inputCmd: inputCmd,
    }
    switch (action) {
        case 'enable':
            addFts(data)
            break;
        case 'disable':
            removeFts(data)
            break;
        case 'modify':
            removeFts(data)
            addFts(data)
            break;
    }
    UTOOLS.putDB(data, UTOOLS.DBPRE.PAN + hexEncode(tag))
}

let removeFts = data => {
    UTOOLS.whole.removeFeature(data.feature.code)
    data.activated = false
    $('.currentTag').removeClass('panelTag')
    quickcommand.showMessageBox("已取消当前标签的快捷面板")
}

let addFts = data => {
    data.activated = true
    UTOOLS.whole.setFeature(data.feature);
    $('.currentTag').addClass('panelTag')
    quickcommand.showMessageBox("已为当前标签启动快捷面板")
}

let loadConf = tag => {
    $('.currentTag').hasClass('panelTag') ? $('.enable').hide() : $('.disable, .modify').hide()
    let data = UTOOLS.getDB(UTOOLS.DBPRE.PAN + hexEncode(tag))
    if (data.feature) {
        $("#panelWord").val(data.feature.cmds.join(","));
        $("#panelDesc").val(data.feature.explain);
        $("#icon").attr('src', data.feature.icon);
        $('#panelConf .checked-switch').prop('checked', data.autoDetach);
        ["win32", "darwin", "linux"].forEach(x => (!data.feature.platform.includes(x) && $('#' + x).addClass('disabled')))
        window.editor.setValue(data.inputCmd);
    } else {
        $("#panelWord").val(tag);
        $("#panelDesc").val(`${tag}面板`);
    }
}

let panelConf = tag => {
    let features = getPanelFeatures(tag)
    if (features.length == 0) return quickcommand.showMessageBox('快捷面板仅支持匹配模式为关键词的命令，当前标签不存在该类型命令或者该命令未启用', 'error', 8000)
    Swal.fire({
        title: '快捷面板',
        width: 600,
        padding: 30,
        onBeforeOpen: () => {
            addListenner(tag)
            qccommands.createEditor()
            loadConf(tag)
        },
        html: qctemplates.panel.conf,
        showConfirmButton: false,
        footer: '图标搜索来自<a href="#" onclick=utools.shellOpenExternal("https://icons8.com/")>icon8s</a>'
    })
}

// 获取可添加至面板的功能
let getPanelFeatures = tag => {
    let activedCode = utools.getFeatures().map(x => x.code)
    let features = UTOOLS.whole.db.allDocs('qc_key_').filter(x => {
        if (!x.data.tags) return false
        if (!x.data.tags.includes(tag)) return false
        if (x.data.features.platform && !x.data.features.platform.includes(window.processPlatform)) return false
        if (!activedCode.includes(x.data.features.code)) return false
        return true
    })
    return features
}

export default {
    showPanel,
    panelConf
}
