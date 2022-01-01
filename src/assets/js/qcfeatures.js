import UTOOLS from "./utools.js"
import qcshare from "./qcshare.js"
import qccommands from "./qccommands.js"
import qcparser from "./qcparser.js"
import qcprograms from "./qcprograms.js"
import qctemplates from "./qctemplates.js"
import qcpanel from "./qcpanel.js"

// **************************************************
// *********************功能列表**********************
// **************************************************
let showFeatureList = (tag = "默认") => {
    $("#options").empty().fadeIn();
    var currentFts = getCurrentFts().currentFts
    var customFts = getAllQuickCommands()
    var allTags = ["默认"]
    var featureList = `
        <div id="featureList">
            <table>`;
    Object.values(customFts).forEach(fts => {
        // 跳过有问题的命令
        try {
            if (fts.tags) fts.tags.map(t => !allTags.includes(t) && allTags.push(t))
            featureList += getEveryFeature(fts, currentFts, tag)
        } catch (e) {
            console.log(e)
        }
    })
    featureList += `</tr></table></div>`
    var quickpanels = getCurrentFts().quickpanels
    var sidebar =
        `<div class="sidebar">` +
        allTags.map(x => {
            let cla = []
            if (x == tag) cla.push("currentTag")
            if (quickpanels.includes(x)) cla.push("panelTag")
            return `<li class="${cla.join(' ')}">${x}</li>`
        }).join("") +
        `<li ${tag == '未分类' ? 'class="currentTag"' : ''}>未分类</li></div>`
    var footer = qctemplates.featurelist.footer
    $("#options").append(sidebar + featureList + footer)
    if (tag == '默认' || tag == '未分类') {
        $('#addToPanel').css({
            "filter": "grayscale(1)",
            "cursor": "not-allowed"
        }).prop('disabled', true)
    }
    checkSharedQc()
}

// 获取所有 qc，等效于 1.6 版本 getDB('customFts')
let getAllQuickCommands = () => {
    let allQcs = {}
    UTOOLS.getDocs(UTOOLS.DBPRE.QC).forEach(x => allQcs[x.data.features.code] = x.data)
    return allQcs
}

let searchFeatures = keyword => {
    let fts = UTOOLS.getDocs(UTOOLS.DBPRE.QC).filter(x => x.data.features.explain.toLowerCase().includes(keyword.toLowerCase()))
    if (!fts.length) return quickcommand.showMessageBox(`${keyword} 未找到！`, "warning")
    if (fts.length == 1) return locateToFeature(fts[0].data.tags, fts[0].data.features.code)
    quickcommand.showButtonBox(fts.map(x => x.data.features.explain)).then(y =>
        locateToFeature(fts[y.id].data.tags, fts[y.id].data.features.code)
    )
}


let getCurrentFts = () => {
    let features = utools.getFeatures()
    let currentFts = []
    let quickpanels = []
    features.forEach(x => x.code.slice(0, 6) == 'panel_' ? quickpanels.push(hexDecode(x.code.slice(6))) : currentFts.push(x))
    return {
        currentFts: currentFts,
        quickpanels: quickpanels,
    }
}

let getEveryFeature = (fts, currentFts, tag) => {
    if (tag == "未分类") {
        if (fts.tags && fts.tags.length) return ''
    } else {
        if (!fts.tags) return ''
        if (!fts.tags.includes(tag)) return ''
    }
    var features = fts.features;
    var qcType = showCommandByType(features);
    var isChecked = '';
    for (var c of currentFts) {
        if (c.code == features.code) {
            isChecked = 'checked';
            break;
        }
    }
    var platformIcons
    if (features.platform) platformIcons = features.platform.map(x => `<img src="img/${x}.svg">`)
    else platformIcons = ['<img src="img/win32.svg">', '<img src="img/darwin.svg">', '<img src="img/linux.svg">']
    return `<tr id="${features.code}">
    <td><img class="logo" src="${features.icon}"></td>
    <td>
        <div class="topchild">${window.htmlEncode(features.explain, true)}</div>
        <div>
            <span class="info">
            <span style="margin: 0; font-size: smaller; color: ${fts.program == 'quickcommand' ? "#00af2c;" : qcprograms[fts.program].color}">●</span>
            ${fts.program} | ${platformIcons.join('')}
        </div>
    </td>
    <td>${qcType}</td>
    <td>
        <label class="switch-btn">
            <input class="checked-switch" type="checkbox" ${isChecked}>
            <span class="text-switch"></span>
            <span class="toggle-btn"></span>
        </label>
    </td>
    <td>
        <span class="Btn editBtn"><img src="img/${tag == "默认" ? "view" : "edit"}.svg"></span>
        ${(tag == "默认" && !window.isDev()) ? "" : `<span class="Btn exportBtn"><img src="img/export.svg"> </span><span class="Btn delBtn"><img src="img/del.svg"></span>`}
    </td>`
}

let showCommandByType = features => {
    let qcType = ''
    let cmds = features.cmds
    let type = qccommands.getCommandType(cmds)
    if (type == 'professional') {
        qcType = `<div class="topchild">专业模式</div><div><span class="keyword">[{...}]</span></div>`;
    } else {
        let rules = cmds[0].match
        if (type == 'regex') {
            qcType += `<div class="topchild">文本</div><div>`
            if (!rules) {
                qcType += `<span class="keyword win">所有文本</span>`
            } else {
                if (rules.length > 14) rules = rules.slice(0, 14) + '...';
                qcType += `<span class="keyword re">${window.htmlEncode(rules, true)}</span></div>`;
            }
        } else if (type == 'window') {
            qcType += `<div class="topchild">窗口</div><div>`
            // if (!rules) {
            //     qcType += `<span class="keyword win">所有窗口</span>`
            // } else if (rules.title || rules.class) {
            if (rules.title || rules.class) {
                qcType += `<span class="keyword win">${window.htmlEncode(JSON.stringify(rules).slice(0, 14), true) + '...'}</span>`;
            } else if (rules.app) {
                rules = rules.app.join(",")
                if (rules.length > 14) rules = rules.slice(0, 14) + '...';
                rules.split(',').forEach(r => {
                    qcType += `<span class="keyword win">${window.htmlEncode(r, true)}</span>`;
                });
            }
            qcType += `</div>`
        } else if (type == 'files') {
            if (rules.length > 14) rules = rules.slice(0, 14) + '...';
            qcType = `<div class="topchild">文件</div><div><span class="keyword fil">${window.htmlEncode(rules, true)}</span></div>`;
        } else {
            rules = features.cmds.join(",")
            if (rules.length > 14) rules = rules.slice(0, 14) + '...';
            qcType += `<div class="topchild">关键字</div><div>`
            rules.split(',').forEach(r => {
                // qcType += `<span class="keyword"><a href="javascript:utools.redirect('${window.htmlEncode(r, true)}')">${window.htmlEncode(r, true)}</a></span>`;
                qcType += `<span class="keyword">${window.htmlEncode(r, true)}</span>`;
            });
            qcType += `</div>`
        }
    }
    return qcType
}

// let linkKeywords = features => {
//     if ($(`#${features.code} .checked-switch`).prop('checked')) {

//     }
// }


// **************************************************
// *********************功能按钮**********************
// **************************************************
// 开关
$("#options").on('change', 'input[type=checkbox]', function () {
    var customFts = getAllQuickCommands(),
        code = $(this).parents('tr').attr('id')
    if (!UTOOLS.whole.removeFeature(code)) {
        UTOOLS.whole.setFeature(customFts[code].features);
    }
});

// 编辑
$("#options").on('click', '.editBtn', function () {
    let code = $(this).parents('tr').attr('id')
    let data = UTOOLS.getDB(UTOOLS.DBPRE.QC + code)
    qccommands.editCurrentCommand(data)
})

// 删除
$("#options").on('click', '.delBtn', function () {
    quickcommand.showConfirmBox('删除这个快捷命令').then(x => {
        if (!x) return
        var code = $(this).parents('tr').attr('id')
        utools.copyText(JSON.stringify(UTOOLS.getDB(UTOOLS.DBPRE.QC + code)))
        UTOOLS.delDB(UTOOLS.DBPRE.QC + code)
        UTOOLS.whole.removeFeature(code);
        var currentTag = $('.currentTag').text()
        // 当前标签下最后一个命令的处理
        if ($('#featureList tr').length == 1) {
            UTOOLS.delDB(UTOOLS.DBPRE.PAN + hexEncode(currentTag))
            UTOOLS.whole.removeFeature("panel_" + hexEncode(currentTag))
            currentTag = "默认"
        }
        showFeatureList(currentTag);
        quickcommand.showMessageBox('删除成功，为防止误操作，已将删除的命令复制到剪贴板')
    })
})

// 导出
$("#options").on('click', '.exportBtn', async function () {
    var code = $(this).parents('tr').attr('id')
    var jsonQc = UTOOLS.getDB(UTOOLS.DBPRE.QC + code)
    var stringifyQc = JSON.stringify(jsonQc, null, 4)
    var choise = await quickcommand.showButtonBox(createShareMenu(jsonQc))
    switch (choise.text) {
        case '复制到剪贴板':
            utools.copyText(stringifyQc) && quickcommand.showMessageBox('已复制到剪贴板')
            break;
        case '导出到文件':
            window.saveFile(stringifyQc, {
                title: '选择保存位置',
                defaultPath: `${jsonQc.features.explain}.json`,
                filters: [{ name: 'json', extensions: ['json'] },]
            })
            break;
        case '分享命令':
        case '更新分享':
            if (qcshare.yuQueShareVars.shareLock) {
                quickcommand.showMessageBox('分享速度太快了，请稍候', 'warning')
            } else {
                qcshare.yuQueShareVars.shareLock = true
                var result = await qcshare.shareQCToYuQue(jsonQc)
                qcshare.yuQueShareVars.shareLock = false
                result && quickcommand.showMessageBox('分享成功，等待发布后即可在分享中心直接下载')
            }
            break;
        case '我要分享':
            utools.createBrowserWindow('./helps/HELP.html?#分享命令', {
                width: 1280,
                height: 920
            })
            break;
        case '评论':
            utools.shellOpenExternal(`https://www.yuque.com/${qcshare.yuQueShareVars.releaseRepo}/${code}`)
            break;
        case '设置 Token':
            await setYuQueToken()
            break;
    }
})

// 分享菜单
let createShareMenu = jsonQc => {
    let menu = ['复制到剪贴板', '导出到文件', '', '设置 Token']
    let extraInfo = UTOOLS.getDB(UTOOLS.DBPRE.CFG + 'extraInfo')
    if (jsonQc.authorId) {
        if (jsonQc.authorId == extraInfo.authorId) menu[2] = '更新分享'
        else if (jsonQc.fromShare) menu[2] = '评论'
        else menu[2] = '分享自：' + jsonQc.authorName
    } else {
        if (extraInfo.yuQueToken) menu[2] = '分享命令'
        else menu[2] = '我要分享'
    }
    return menu
}

let setYuQueToken = async () => {
    let yuQueToken = await quickcommand.showInputBox(["请输入 Token"])
    if (!yuQueToken) return
    yuQueToken = yuQueToken[0]
    window.yuQueClient.defaults.headers['X-Auth-Token'] = yuQueToken
    try {
        let res = await window.yuQueClient('user')
        let extraInfo = {
            yuQueToken: yuQueToken,
            authorId: res.data.data.account_id,
            authorName: res.data.data.name
        }
        UTOOLS.putDB(extraInfo, UTOOLS.DBPRE.CFG + 'extraInfo')
        quickcommand.showMessageBox("设置成功~")
    } catch (e) {
        quickcommand.showMessageBox('Token 校验失败', "error")
    }
}

// **************************************************
// *********************底部按钮**********************
// **************************************************
$("#options").on('keydown', '#searchFts', function (e) {
    if (e.keyCode == 13) {
        searchFeatures($("#searchFts").val())
        e.preventDefault()
    }
})

$("#options").on('click', '.footBtn', async function () {
    switch ($(this).attr('id')) {
        case 'viewHelps':
            utools.createBrowserWindow('./helps/HELP.html', {
                width: 1280,
                height: 920
            });
            break;
        case 'getShares':
            qcshare.getSharedQCFromYuQue();
            break;
        case 'add':
            qccommands.showCommandEditor();
            $("#customize").animate({
                top: '0px'
            });
            break;
        case 'import':
            var success = await importCommand()
            if (success) {
                if (success instanceof Object) locateToFeature(success.tags, success.code)
                else showFeatureList()
                quickcommand.showMessageBox("导入成功")
            } else if (success == false) {
                quickcommand.showMessageBox("导入失败，格式错误", "error")
            }
            break;
        case 'enableAll':
            $(".checked-switch:not(:checked)").click();
            break;
        case 'disableAll':
            $(".checked-switch:checked").click();
            break;
        case 'exportAll':
            exportAll();
            break;
        case 'clear':
            clearAll();
            break;
        case 'addToPanel':
            addToPanel()
    }
})

// 检查分享中心更新
let checkSharedQc = async () => {
    let localShares = UTOOLS.getDB(UTOOLS.DBPRE.CFG + 'sharedQcCounts')[window.processPlatform] || 0
    let remoteShares = await qcshare.getDocsFromYuQue()
    if (!remoteShares) return
    let updates = remoteShares.length - localShares
    if (updates == 0) {
        return
    }
    $('#getShares span').text('有新分享')
    $('#getShares').css({
        'background': '#b80233'
    })
}

// 快捷面板
let addToPanel = () => {
    let tag = $('.currentTag').text()
    qcpanel.panelConf(tag)
}

// 全部导出
let exportAll = (copy = false) => {
    let allQcs = getAllQuickCommands()
    let options = {
        title: '选择保存位置',
        defaultPath: 'quickCommand',
        filters: [{
            name: 'json',
            extensions: ['json']
        },]
    };
    if (!window.isDev()) Object.keys(allQcs).forEach(k => {
        if (k.includes('default_')) delete allQcs[k]
    })
    let stringifyQcs = JSON.stringify(allQcs)
    if (copy) utools.copyText(stringifyQcs)
    else window.saveFile(stringifyQcs, options);
}

// 清空
let clearAll = () => {
    quickcommand.showConfirmBox('将会清空所有自定义命令，请确认！').then(x => {
        if (!x) return
        exportAll(true)
        UTOOLS.getDocs(UTOOLS.DBPRE.QC).map(x => x._id).forEach(y => UTOOLS.delDB(y))
        importDefaultCommands();
        clearAllFeatures();
        showFeatureList();
        quickcommand.showMessageBox('清空完毕，为防止误操作，已将所有命令复制到剪贴板，可通过导入命令恢复')
    })
}

let importDefaultCommands = () => {
    let defaultCommands = window.getDefaultCommands()
    Object.values(defaultCommands).forEach(async d => {
        await importCommand(d)
    })
}

let clearAllFeatures = () => {
    for (var fts of utools.getFeatures()) {
        UTOOLS.whole.removeFeature(fts.code)
    }
}

// 导入
let importCommand = async file => {
    let options, fileinfo, command, pushData
    if (file) {
        options = {
            type: 'file',
            argvs: file,
            readfile: true
        }
        fileinfo = getFileInfo(options)
        if (!fileinfo) return
        command = fileinfo.data
    } else {
        let choise = await quickcommand.showButtonBox(['从文件导入', '从剪贴板导入'])
        if (choise.id == 0) {
            options = { type: 'dialog', argvs: { filters: [{ name: 'json', extensions: ['json'] }] }, readfile: true }
            fileinfo = getFileInfo(options)
            if (!fileinfo) return
            command = fileinfo.data
        } else if (choise.id == 1) {
            command = clipboardReadText()
        }
    }
    pushData = qcparser(command)
    if (!pushData) return false
    // 单个命令导入
    if (pushData.single) {
        var code = pushData.qc.features.code;
        UTOOLS.putDB(pushData.qc, UTOOLS.DBPRE.QC + code);
        return {
            tags: pushData.qc.tags,
            code: code
        }
        // 多个命令导入
    } else {
        for (var code of Object.keys(pushData.qc)) {
            UTOOLS.putDB(pushData.qc[code], UTOOLS.DBPRE.QC + code);
        }
        return true
    }
}

// **************************************************
// *********************标签跳转**********************
// **************************************************
// 保存后标签跳转处理
let locateToFeature = (tags, code) => {
    let redirectTag
    let currentTag = $('.currentTag').text()
    // let AllTags = Array.from($('.sidebar li')).map(x => x.innerText)
    if (tags && tags.length) {
        if (tags.includes(currentTag)) {
            redirectTag = currentTag
        } else {
            redirectTag = tags[0]
        }
    } else {
        redirectTag = "未分类"
    }
    showFeatureList(redirectTag);
    location.href = '#' + code;
    $(`#${code}`).fadeOut(function(){
        $(this).fadeIn();
    });
}

// 切换TAGS
$("#options").on('click', '.sidebar li', function () {
    showFeatureList($(this).text());
})

export default {
    showFeatureList,
    locateToFeature,
    importDefaultCommands
}
