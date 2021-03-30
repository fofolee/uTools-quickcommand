import UTOOLS from "./utools.js"

// 替换上个版本弃用的功能
let oldVersionFix = () => {
    var customFts = UTOOLS.getDB('customFts');
    let ftsKeys = Object.keys(customFts);
    if (!ftsKeys.length) return;
    utools.showNotification('正在对老版本命令做兼容处理，如插件显示空白请稍候', 'warning')
    ftsKeys.forEach((x, i) => {
        let fts = customFts[x]
        // 旧版的 program
        if (fts.program == 'simulation') fts.program = 'quickcommand';
        // 旧版的 sleep
        if (fts.cmd.includes('await sleep')) fts.cmd = fts.cmd.replace(/await sleep/g, 'quickcommand.sleep')
        // 旧版的 match.app
        let type = fts.features.cmds[0].type || 'key'
        if (type == 'window') {
            let windowMatch = fts.features.cmds[0].match
            console.log(windowMatch)
            if (windowMatch && (typeof windowMatch.app == 'string')) {
                console.log(fts);
                fts.features.cmds[0].match.app = windowMatch.app.split(',')
            }
        }
        // 不规范的 code
        let code = fts.features.code
        if (!/^(window|key|regex|files|default)_/.test(code)) {
            console.log(code);
            UTOOLS.whole.removeFeature(code)
            let uid = Number(Math.random().toString().substr(3, 3) + (Date.now() + i * 10000)).toString(36)
            code = type + '_' + uid
            fts.features.code = code
        }
        // 每一个命令一个 id
        UTOOLS.putDB(fts, UTOOLS.DBPRE.QC + code)
    })
    UTOOLS.delDB('customFts')
}

let showChangeLog = () => {
    let ignoreVersions = ['2.3.5', '2.3.6']
    if (ignoreVersions.includes(pluginInfo().version)) return
    UTOOLS.putDB(pluginInfo().version, UTOOLS.DBPRE.CFG + 'version')
    utools.createBrowserWindow('./helps/CHANGELOG.html', { width: 1280, height: 920 })
}

let isRunningAtFirstTime = () => {
    var historyVersion = UTOOLS.getDB(UTOOLS.DBPRE.CFG + 'version')
    if (historyVersion instanceof Object) return 'init'
    if (pluginInfo().version > historyVersion) return 'update'
    return false
}

export default {
    oldVersionFix,
    showChangeLog,
    isRunningAtFirstTime
}
