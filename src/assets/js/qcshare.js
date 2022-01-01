import qccommands from "./qccommands.js"
import UTOOLS from "./utools.js"

// 分享相关
const yuQueShareVars = {
    imgBedApi: 'https://imgkr.com/api/v2/files/upload',
    imgBedBaseLink: 'https://imgkr.cn-bj.ufileos.com/',
    yuQueImgBedBaseLink: 'https://cdn.nlark.com/yuque/',
    releaseRepo: 'fofolee/qcreleases',
    shareRepo: 'fofolee/qcshares',
    shareLock: false
}

// 一键分享到语雀
let shareQCToYuQue = async jsonQc => {
    let extraInfo = UTOOLS.getDB(UTOOLS.DBPRE.CFG + 'extraInfo')
    if (!extraInfo.yuQueToken) return quickcommand.showMessageBox("请先设置 Token，点击底部「查看帮助」可查看 Token 设置方法", "error")
    jsonQc.authorId = extraInfo.authorId
    jsonQc.authorName = extraInfo.authorName
    let stringifyQc = JSON.stringify(jsonQc, null, 4)
    if (stringifyQc.length > 5000000) return quickcommand.showMessageBox('命令大小超过5M无法分享，请检查图标或脚本内容是否过大', "error")
    let type = jsonQc.features.cmds[0].type || 'key'
    let tags = jsonQc.tags ? jsonQc.tags.join(' ') : ""
    let typeDescription = qccommands.getTypeSheet().filter(x => x.id == type)[0].text
    let custom_description = {
        authorName: jsonQc.authorName,
        program: jsonQc.program,
        type: typeDescription,
        platform: jsonQc.features.platform || ['win32', 'darwin', 'linux'],
        tags: tags
    }
    let parameters = {
        title: jsonQc.features.explain,
        slug: jsonQc.features.code,
        public: 1,
        format: "markdown",
        body: '```json\n' + stringifyQc + '\n```',
        custom_description: JSON.stringify(custom_description)
    }
    // if (jsonQc.imgLink) parameters.cover = jsonQc.imgLink.replace(yuQueShareVars.imgBedBaseLink, yuQueShareVars.yuQueImgBedBaseLink)
    window.yuQueClient.defaults.headers['X-Auth-Token'] = extraInfo.yuQueToken
    let res, repo = extraInfo.authorId == 1496740 ? yuQueShareVars.releaseRepo : yuQueShareVars.shareRepo
    try {
        res = await window.yuQueClient.post(`repos/${repo}/docs`, parameters)
        if (!res.data.data) return quickcommand.showMessageBox("分享失败，不知道为啥", "error")
        let docId = res.data.data.id
        res = await window.yuQueClient.put(`repos/${repo}/docs/${docId}`, parameters)
        if (!res.data.data) return quickcommand.showMessageBox("分享失败，不知道为啥", "error")
        UTOOLS.putDB(jsonQc, jsonQc.features.code);
        return jsonQc
    } catch (error) {
        return quickcommand.showMessageBox(error, "error")
    }
}

// 获取语雀数据
let getDocsFromYuQue = async () => {
    let res, extraInfo = UTOOLS.getDB(UTOOLS.DBPRE.CFG + 'extraInfo')
    if (extraInfo.yuQueToken) window.yuQueClient.defaults.headers['X-Auth-Token'] = extraInfo.yuQueToken
    try {
        res = await window.yuQueClient(`repos/${yuQueShareVars.releaseRepo}/docs`)
    } catch (error) {
        return false
    }
    let platform = window.processPlatform
    let docs = res.data.data
        .filter(d => {
            try {
                return JSON.parse(d.custom_description).platform.includes(platform)
            } catch (error) {
                console.log(error)
            }
        })
    return docs
}

// 获取分享
let getSharedQCFromYuQue = async () => {
    $('#options').hide()
    let description
    let docs = await getDocsFromYuQue()
    if (!docs) return
    let sharedQcCounts = UTOOLS.getDB(UTOOLS.DBPRE.CFG + 'sharedQcCounts')
    sharedQcCounts[window.processPlatform] = docs.length
    UTOOLS.putDB(sharedQcCounts, UTOOLS.DBPRE.CFG + 'sharedQcCounts')
    $('#getShares span').text('分享中心')
    $('#getShares').attr('style', "")
    docs = docs
        .sort((x, y) => {
            if (y.published_at > x.published_at) return 1
            else return -1
        })
        .map(d => {
            description = JSON.parse(d.custom_description)
            return {
                title: d.title,
                description: `<span class="iconfont icon-yonghu"></span> ${description.authorName}
                &nbsp; <span class="iconfont icon-code"></span> ${description.program}
                &nbsp; <span class="iconfont icon-wenjianleixingpeizhi"></span> ${description.type}
                &nbsp; <span class="iconfont icon-biaoqian"></span> ${description.tags}
                &nbsp; <span class="iconfont icon-shijian"></span> ${d.updated_at.split('T')[0]}`,
                slug: d.slug,
                icon: d.last_editor.avatar_url
            }
        })
    let choise = await quickcommand.showSelectList(docs, {
        optionType: 'json',
        showCancelButton: true
    })
    if (choise) {
        let doc = await window.yuQueClient(`repos/${yuQueShareVars.releaseRepo}/docs/${choise.slug}?raw=1`)
        let body = doc.data.data.body
        let stringifyQc = body.match(/```json([\s\S]*)```/)[1]
        let qc = JSON.parse(stringifyQc)
        qc.fromShare = true
        $('#options').show()
        qccommands.editCurrentCommand(qc)
        $('#customize').data('returnShare', true)
    } else {
        $('#options').show()
        $('#customize').removeData('returnShare')
    }
    utools.setExpendHeight(550)
}

export default {
    yuQueShareVars,
    shareQCToYuQue,
    getDocsFromYuQue,
    getSharedQCFromYuQue
}
