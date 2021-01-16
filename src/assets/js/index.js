import { programs } from "./programs.js"

!function () {
    // 禁用危险函数
    let utoolsFull = utools
    if (!isDev()) utools = getuToolsLite()
    // 数据库前缀
    const QC_PREFIX = 'qc_'
    const CFG_PREFIX = 'cfg_'
    // 数据库函数封装
    let getDB = id => {
        let db = utoolsFull.db.get(id)
        return db ? db.data : {}
    }

    let putDB = (value, id) => {
        let db = utoolsFull.db.get(id);
        if (db) utoolsFull.db.put({ _id: id, data: value, _rev: db._rev })
        else utoolsFull.db.put({ _id: id, data: value });
    }

    let delDB = id => {
        return utoolsFull.db.remove(id)
    }

    let getDocs = key => {
        return utoolsFull.db.allDocs(key)
    }
    // 获取所有 qc，等效于 1.6 版本 getDB('customFts')
    let getAllQuickCommands = () => {
        let allQcs = {}
        getDocs(QC_PREFIX).forEach(x => allQcs[x.data.features.code] = x.data)
        return allQcs
    }

    // 进入插件
    utools.onPluginEnter(async ({ code, type, payload }) => {
        // 暗黑模式
        if (utools.isDarkColors()) {
            !$('#darkmode').length && $('head').append(`
            <link id="darkmode" rel="stylesheet" href="assets/style/darkmode.css">
            <link id="darkswal" rel="stylesheet" href="assets/plugins/sweetalert2/dark.min.css">`)
        } else {
            $('#darkmode').length && $('#darkmode, #darkswal').remove()
        }
        if (isRunningAtFirstTime()) {
            showChangeLog()
            importDefaultCommands()
            oldVersionFix()
        }
        var handleEnter
        utools.onPluginOut(() => {
            // 暂存 codeRunner 的内容
            if (code == "code") {
                var cmd = window.editor.getValue();
                var program = $('#program').val(),
                scptarg = $('#scptarg').val(),
                customoptions;
                if (program == 'custom') customoptions = {
                    custombin: $('#custombin').val(),
                    customarg: $('#customarg').val(),
                    customext: $('#customext').val()
                }
                putDB({ cmd: cmd, program: program, scptarg: scptarg, customoptions: customoptions }, CFG_PREFIX + 'codeHistory')
            }
            // 初始化
            $("#options, #out, #quickpanel").empty()
            $('body').children(':not(#wrapper)').remove()
            $('body').css({overflow: 'hidden'})
            if (handleEnter) document.removeEventListener('keydown', handleEnter)
        })
        // 配置页面
        if (code == 'options') {
            utools.setExpendHeight(600);
            $("#quickpanel").hide()
            // $("#options").show();
            showOptions();
        } else if (code == 'code') {
            var file = ""
            // utools.setExpendHeight(600);
            if (type == 'files') file = payload[0].path
            showCodeEditor(file)
        } else if (code == 'newcommand') {
            utools.setExpendHeight(600)
            $("#options").empty().fadeIn();
            qc = {"program": "quickcommand","cmd": "","output": "ignore"}
            if (payload != 'NewCommand' && payload != '新建快捷命令') {
                let qcparser = quickCommandParser(payload, false)
                if (qcparser.single) qc = qcparser.qc
            }
            editCurrentCommand(qc, false)
        } else if (code.slice(0,6) == 'panel_') {
            utools.setExpendHeight(600)
            let features = getPanelFeatures(payload)
            showPanel(features)
        } else {
            // console.log(new Date().getTime() - window.startTime);
            $('body').css({overflow: 'auto'})
            utools.setExpendHeight(0);
            $("#options, #quickpanel").hide();
            var db = getDB(QC_PREFIX + code),
                cmd = db.cmd;
            if (db.program == "custom") {
                option = db.customOptions;
            } else if(db.program == "quickcommand"){
                option = { mode: "quickcommand", enterData: { code, type, payload } };
            }else{
                option = programs[db.program];
            }
            option.scptarg = db.scptarg
            option.charset = db.charset ? db.charset : autoCharset(db.program)
            cmd = special(cmd);
            if (cmd.includes('{{type}}')) {
                cmd = cmd.replace(/\{\{type\}\}/mg, type)
            }
            if (cmd.includes('{{payload}}')) {
                cmd = cmd.replace(/\{\{payload\}\}/mg, typeof payload == 'object' ? (payload = JSON.stringify(payload)) : (payload = payload.replace('\\', '\\\\')))
            }
            // 正则
            if (type == 'regex') cmd = cmd.replace(/\{\{input\}\}/mg, payload);
            // 文件
            if (type == 'files' && cmd.includes('{{MatchedFiles')) {
                let MatchedFiles = payload
                let Matched = cmd.match(/\{\{MatchedFiles(\[\d+\]){0,1}(\.\w{1,11}){0,1}\}\}/g)
                Matched && Matched.forEach(m => {
                    repl = eval(m.slice(2, -2))
                    typeof repl == 'object' ? (repl = JSON.stringify(repl)) : (repl = repl.replace('\\', '\\\\'))
                    cmd = cmd.replace(m, repl.replace('$','$$$'))
                })
            }
            // 窗口
            var repl
            if (type == 'window') {
                // 获取选中的文件
                if (cmd.includes('{{SelectFile}}')) {
                    repl = await getSelectFile(payload.id);
                    cmd = cmd.replace(/\{\{SelectFile\}\}/mg, repl)
                }
                // 获取资源管理器或访达当前目录
                if (cmd.includes('{{pwd}}')) {
                    repl = getCurrentFolderPathFix();
                    console.log(repl);
                    cmd = cmd.replace(/\{\{pwd\}\}/mg, repl)
                    console.log(cmd)
                }
                // 获取窗口信息
                if (cmd.includes('{{WindowInfo')) {
                    let WindowInfo = payload
                    let Matched = cmd.match(/\{\{WindowInfo(\.\w{1,7}){0,1}\}\}/g)
                    Matched && Matched.forEach(m => {
                        repl = eval(m.slice(2, -2))
                        typeof repl == 'object' && (repl = JSON.stringify(repl))
                        cmd = cmd.replace(m, repl)
                    })
                }
            }
            // 无输出的批处理
            // if (db.output == 'ignore' && option.ext == 'bat') option.bin = 'explorer';
            if (db.hasSubInput) {
                // 启动子命令输入
                // 清空输出
                // $("#out").empty();
                var rule = String.raw`\{\{subinput(:.+?){0,1}\}\}`
                var matched = cmd.match(new RegExp(rule))
                var placeholder = matched[1] || ':请输入'
                var subinput = '';
                var setSubInput = () => {
                    utools.setSubInput(({text}) => {
                        subinput = text;
                    }, placeholder.slice(1));
                }
                handleEnter = (event) => {
                    if (event.keyCode == 13) {
                        $("#out").append(`<p style="color: #438eff">>> ${new Date()}</p>`);
                        var cmdToRun = cmd.replace(new RegExp(rule, 'g'), subinput);
                        runQuickCommand(cmdToRun, option, db.output, true);
                    }
                };
                setSubInput();
                document.addEventListener('keydown', handleEnter);
            } else {
                runQuickCommand(cmd, option, db.output, false);
            }
        }
    });

    let runQuickCommand = (cmd, option, output, autoScroll = false, autoHeight = true) => {
        // 不需要输出的，提前关闭窗口
        if (['ignore', 'clip', 'send', 'notice', 'terminal'].indexOf(output) !== -1) {
            utools.hideMainWindow();
            setTimeout(() => { utools.outPlugin(); }, 500);
        }
        var outputOpts = { type: output, autoScroll: autoScroll, autoHeight: autoHeight }
        if (option.mode) {
            // 内置环境
            runCodeInVm(cmd, (stdout, stderr) => {
                if (cmd.includes("utools.setExpendHeight")) outputOpts.autoHeight = false
                switchQuickCommandResult(stdout, stderr, outputOpts)
            }, option.enterData)
        } else {
            var terminal = output == 'terminal' ? true : false
            outputOpts.scriptPath = getQuickCommandScriptFile(option.ext)
            // 执行脚本
            runCodeFile(cmd, option, terminal, (stdout, stderr) => {
                switchQuickCommandResult(stdout, stderr, outputOpts)
            })
        }
    }

    let switchQuickCommandResult = (stdout, stderr, outputOpts) => {
        var output = outputOpts.type, autoScroll = outputOpts.autoScroll, autoHeight = outputOpts.autoHeight;
        var outputAutoFix = (autoScroll, autoHeight) => {
            var outputHeight = $("#out").outerHeight()
            if (outputHeight > 600) outputHeight = 600
            if (autoHeight && $('#options').is(':hidden')) utools.setExpendHeight(outputHeight);
            if (outputHeight == 600 && autoScroll) $(document).scrollTop($(document).height());
        }
        if (stderr) {
            $("#out").addClass('error')
            // 报错
            if (output == 'text' || output == 'html')
            {
                $("#out").append(stderr)
                outputAutoFix(autoScroll, autoHeight)
            } else {
                var index = utools.showMessageBox({
                    type: 'error',
                    title: '啊嘞?!',
                    message: stderr,
                    buttons: outputOpts.scriptPath ? ['转至脚本目录', '退出'] : ['退出']
                })
                if (outputOpts.scriptPath && index == 0) {
                    locate(outputOpts.scriptPath );
                }
                copyTo(stderr);
                message("已复制报错信息");
                utools.outPlugin();
            }
        } else if (stdout) {
            $("#out").removeClass("error")
            // 有输出
            switch (output) {
                case "text":
                    $("#out").append(htmlEncode(stdout, true))
                    outputAutoFix(autoScroll, autoHeight)
                    break;
                case "html":
                    $("#out").append(stdout)
                    outputAutoFix(autoScroll, autoHeight)
                    break;
                case "clip":
                    copyTo(stdout)
                    break;
                case "send":
                    send(stdout)
                    break;
                case "notice":
                    // 发送系统通知
                    message(stdout)
                    break;
                case "ignore":
                case "nothing":
                    break;
                default:
                    break;
            }
        // } else {
        //     // 无输出
        //     utools.outPlugin()
        }
    }

    // 替换上个版本弃用的功能
    let oldVersionFix = () => {
        var customFts = getDB('customFts');
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
                utoolsFull.removeFeature(code)
                let uid = Number(Math.random().toString().substr(3, 3) + (Date.now() + i * 10000)).toString(36)
                code = type + '_' + uid
                fts.features.code = code
            }
            // 每一个命令一个 id
            putDB(fts, QC_PREFIX + code)
        })
        delDB('customFts')
    }

    let showChangeLog = () => {
        putDB(pluginInfo().version, CFG_PREFIX + 'version')
        utools.createBrowserWindow('./helps/CHANGELOG.html', {width: 1280, height: 920})
    }

    let isRunningAtFirstTime = () => {
        var historyVersion = getDB(CFG_PREFIX + 'version')
        if (historyVersion instanceof Object) return 'init'
        if (pluginInfo().version > historyVersion) return 'update'
        return false
    }

    // 导入默认命令
    let importDefaultCommands = () => {
        let defaultCommands = getDefaultCommands()
        Object.values(defaultCommands).forEach(async d => {
            await importCommand(d)
        })
    }

    // 是否含有 quickcommand 键值
    let isJsonQc = (obj, strict = true) => {
        var keys = strict ? ["features", "program", "cmd", "output"] : ["program", "cmd"]
        if (keys.filter(x => typeof obj[x] == 'undefined').length) return false
        return true
    }

    // 判断是否为可导入的快捷命令
    let quickCommandParser = (json, strict = true) => {
        try {
            var qc = JSON.parse(json)
        } catch (error) {
            return false
        }
        if (isJsonQc(qc, strict)) return { single: true, qc: qc }
        else if (!Object.values(qc).filter(q => !isJsonQc(q, strict)).length) return { single: false, qc: qc }
        else return false
    }

    // 导入
    let importCommand = async file => {
        let options, fileinfo, command, pushData
        if (file) {
            options = { type: 'file', argvs: file, readfile: true }
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
        pushData = quickCommandParser(command)
        if (!pushData) return false
        // 单个命令导入
        if (pushData.single) {
            var code = pushData.qc.features.code;
            putDB(pushData.qc, QC_PREFIX + code);
            return { tags: pushData.qc.tags, code: code }
        // 多个命令导入
        } else {
            for (var code of Object.keys(pushData.qc)) {
                putDB(pushData.qc[code], QC_PREFIX + code);
            }
            return true
        }
    }

    // 全部导出
    let exportAll = (copy = false) => {
        let allQcs = getAllQuickCommands()
        let options = {
                title: '选择保存位置',
                defaultPath: 'quickCommand',
                filters: [
                    { name: 'json', extensions: ['json'] },
                ]
            };
        if (!isDev()) Object.keys(allQcs).forEach(k => {
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
            getDocs(QC_PREFIX).map(x => x._id).forEach(y => delDB(y))
            importDefaultCommands();
            clearAllFeatures();
            showOptions();
            quickcommand.showMessageBox('清空完毕，为防止误操作，已将所有命令复制到剪贴板，可通过导入命令恢复')
        })
    }



    // 自动设置编码
    let autoCharset = program => {
        let charset = { scriptCode: '', outputCode: '' }
        if (!utools.isWindows()) return charset
        if (program == 'powershell' || program == 'cmd') charset.scriptCode = 'GBK'
        if (['cmd', 'powershell', 'python', 'c', 'csharp'].includes(program)) charset.outputCode = 'GBK'
        return charset
    }    

    let getCmdsType = cmds => {
        try {
            JSON.stringify(cmds)
        } catch (error) {
            return 'illegal'
        }
        if (cmds.length == 0) return 'null'
        if (cmds.length == 1) {
            let type = cmds[0].type
            if (!type) return 'key'
            if (type == 'window' || cmds[0].minNum) return type
            return 'professional'
        }
        let counts = cmds.filter(x => typeof x == 'string').length
        return counts == cmds.length ? 'key' : 'professional'
    }

    let showCommandByType = features => {
        let qcType = ''
        let cmds = features.cmds
        let type = getCmdsType(cmds)
        if (type == 'professional') {
            qcType = `<div class="topchild">专业模式</div><div><span class="keyword">[{...}]</span></div>`;
        } else {
            let rules = cmds[0].match
            if (type == 'regex') {
                if (rules.length > 14) rules = rules.slice(0, 14) + '...';
                qcType = `<div class="topchild">正则</div><div><span class="keyword re">${htmlEncode(rules, true)}</span></div>`;
            } else if (type == 'window') {
                qcType += `<div class="topchild">窗口</div><div>`
                if (!rules) {
                    qcType += `<span class="keyword win">所有窗口</span>`
                } else if (rules.title || rules.class) {
                    qcType += `<span class="keyword win">${htmlEncode(JSON.stringify(rules).slice(0,  14), true) + '...'}</span>`;
                } else if (rules.app) {
                    rules = rules.app.join(",")
                    if (rules.length > 14) rules = rules.slice(0, 14) + '...';
                    rules.split(',').forEach(r => {
                        qcType += `<span class="keyword win">${htmlEncode(r, true)}</span>`;
                    });
                }
                qcType += `</div>`
            } else if (type == 'files') {
                if (rules.length > 14) rules = rules.slice(0, 14) + '...';
                qcType = `<div class="topchild">文件</div><div><span class="keyword fil">${htmlEncode(rules, true)}</span></div>`;
            } else {
                rules = features.cmds.join(",")
                if (rules.length > 14) rules = rules.slice(0, 14) + '...';
                qcType += `<div class="topchild">关键字</div><div>`
                rules.split(',').forEach(r => {
                    qcType += `<span class="keyword">${htmlEncode(r, true)}</span>`;
                });
                qcType += `</div>`
            }
        }
        return qcType
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
        for(var c of currentFts){
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
            <div class="topchild">${htmlEncode(features.explain, true)}</div>
            <div>
                <span class="info">
                <span style="margin: 0; font-size: smaller; color: ${fts.program == 'quickcommand' ? "#00af2c;" : programs[fts.program].color}">●</span>
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
            ${(tag == "默认" && !isDev()) ? "" : `<span class="Btn exportBtn"><img src="img/export.svg"> </span><span class="Btn delBtn"><img src="img/del.svg"></span>`}
        </td>`
    }

    let getCurrentFts = () => {
        let features = utools.getFeatures()
        let currentFts = []
        let quickpanels = []
        features.forEach(x => x.code.slice(0, 6) == 'panel_' ? quickpanels.push(decodeURI(x.code.slice(6))) : currentFts.push(x))
        return {
            currentFts: currentFts,
            quickpanels: quickpanels,
        }
    }

    // 显示设置界面
    let showOptions = (tag = "默认") => {
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
        `<div class="sidebar">`+
            allTags.map(x => {
                let cla = []
                if (x == tag) cla.push("currentTag")
                if (quickpanels.includes(x)) cla.push("panelTag")
                return `<li class="${cla.join(' ')}">${x}</li>`
            }).join("")
            +`<li ${tag == '未分类' ? 'class="currentTag"' : ''}>未分类</li></div>`
        var footer = `
        <div class="foot">
            <div id="clear" class="footBtn danger"><img src="img/clear.svg"><span>清除数据</span></div>
            <div id="disableAll" class="footBtn danger"><img src="img/disable.svg"><span>禁用本页</span></div>
            <div id="enableAll" class="footBtn"><img src="img/enable.svg"><span>启用本页</span></div>
            <div id="exportAll" class="footBtn"><img src="img/exportAll.svg"><span>全部导出</span></div>
            <div id="viewHelps" class="footBtn"><img src="img/help.svg"><span>查看帮助</span></div>
            <div id="getShares" class="footBtn"><img src="img/share.svg"><span>分享中心</span></div>
            <div id="addToPanel" class="footBtn"><img src="img/panel.svg"><span>快捷面板</span></div>
            <div id="import" class="footBtn"><img src="img/import.svg"><span>导入命令</span></div>
            <div id="add" class="footBtn"><img src="img/add.svg"><span>新建命令</span></div>
        </div>`
        $("#options").append(sidebar + featureList + footer)
        if (tag != '默认' || tag != '未分类') {
            if (quickpanels.includes(tag)) $('#addToPanel').css({ "filter": "none" })
        }
        checkSharedQc()
    }

    // 显示新建命令界面
    let showCustomize = (readonly = false) => {
        $("#customize").remove();
        let options = `<option>${Object.keys(programs).join('</option><option>')}</option>`
        let allTags = []
        $('.sidebar li').each(function () {
            let val = $(this).text()
            if (val != "默认" && val != "未分类") allTags.push(`<option value=${val}>${val}</option>`)
        })
        let customWindow = `<div id="customize">
        <p><input type="text" id="code" style="display: none">
        <span class="word">匹&#12288;配</span>
        <select id="type"></select>
        <span class="word" id="ruleWord">关键字</span><input class="customize" type="text" id="rule" placeholder="多个关键字用逗号隔开"><img id="expandBtn" src="./img/expand.svg"></p>
        <p><span class="word">说&#12288;明</span><input class="customize" type="text" id="desc" placeholder="命令功能的描述">
        <img id="icon" src="">
        </p>
        <p>
            <span class="word">环&#12288;境</span>
            <select id="program">
                <option value="quickcommand">quickcommand</option>
                ${options}
            </select>
            <span class="word">标&#12288;签</span>
            <select id="tags" multiple="multiple">
                ${readonly ? '<option>默认</option>' : ''}
                ${allTags.join("")}
            </select>
            <input type="text" readonly id="iconame" placeholder="更改图标">
        </p>
        <p class="varoutput">
            <span class="word">变&#12288;量</span>
            <select id="vars">
                <option value="" style="display:none"></option>
                <option value="{{isWin}}">是否Window系统, 返回1或0</option>
                <option value="{{LocalId}}">本机唯一ID</option>
                <option value="{{BrowserUrl}}">浏览器当前链接</option>
                <option value="{{ClipText}}">剪切板的文本</option>
                <option value="{{subinput}}">子输入框的文本</option>
                <option value="{{input}}" disabled class="var regex">主输入框的文本</option>
                <option value="{{pwd}}" disabled class="var window">文件管理器当前目录</option>
                <option value="{{WindowInfo}}" disabled class="var window">当前窗口信息，JSON格式字符串</option>
                <option value="{{SelectFile}}" disabled class="var window">文件管理器选中的文件，不支持Linux</option>
                <option value="{{MatchedFiles}}" disabled class="var files">匹配的文件，JSON格式字符串</option>
                <option value="{{type}}">专业模式的type</option>
                <option value="{{payload}}">专业模式的payload，JSON格式字符串</option>
            </select>
            <span class="word">输&#12288;出</span>
            <select id="output">
                <option value="ignore">忽略输出并隐藏</option>
                <option value="nothing">忽略输出并保留窗口</option>
                <option value="text">显示纯文本输出</option>
                <option value="html">显示html格式的输出</option>
                <option value="terminal" id="showInTerm" disabled>在终端显示输出</option>
                <option value="clip">复制到剪贴板</option>
                <option value="send">发送到活动窗口</option>
                <option value="notice">发送系统通知</option>
            </select>
        </p>
        <p>
            <span class="word">脚&#12288;本</span>
            <span><input type="text" id="scptarg" placeholder="脚本参数"></span>
            <span class="customscript">
                <input type="text" id="custombin" placeholder="解释器路径">
                <input type="text" id="customarg" placeholder="解释器参数">
                <input type="text" id="customext" placeholder="后缀,不含.">
            </span>
                <span id="charset" class="footBtn robot">编码设置</span>
                <span class="quickactions">
                <span id="addAction" class="footBtn robot">﹢动作</span>
                <span id="addKey" class="footBtn robot">﹢按键</span>
                <span id="showHelp" class="footBtn robot">？文档</span>
                <span id="beautifyCode" class="footBtn robot">格式化</span>
            </span>
        </p>
        <textarea id="cmd" placeholder="◆基础◆\nquickcommand环境下，点击“﹢按键”来执行模拟按键的操作;点击“﹢动作”添加打开软件，访问网址等\n常用动作\n◆进阶◆\nquickcommand：可使用nodejs、electron、uTools、quickCommand的api，详情查看文档\n其他脚本：本机装了相应环境即可执行，可以直接拖放脚本文件至此处，可在脚本参数输入框处填写传递\n给脚本的参数\ncustom：可以手动设置解释器路径、参数及脚本后缀\n◆快捷键◆\n支持VSCode快捷键\nAlt+Enter 全屏\nCtrl+B 运行\nCtrl+F 搜索\nShift+Alt+F 格式化（仅JS/PY）"></textarea>
        <p class="bottom">
            <img id="win32" class="platform" src="./img/win32.svg">
            <img id="darwin" class="platform" src="./img/darwin.svg">
            <img id="linux" class="platform" src="./img/linux.svg">
            ${(readonly && !isDev()) ? '' : '<button class="button cmdBtn save">保存</button>'}
            <button class="button cmdBtn run">运行</button>
            <button class="button cmdBtn cancel">取消</button>
        </p>`
        $("#options").append(customWindow)
        $("#icon").attr('src', 'logo/quickcommand.png');
        getSpecialVars()
        createEditor()
        createProgramSelect2('40%')
        createTypeSelect2('40%')
        var singleSelectOpt = { width: '40%', minimumResultsForSearch: Infinity, dropdownParent: $("#customize") }
        $('#output').select2(singleSelectOpt);
        singleSelectOpt.placeholder = "插入特殊变量"
        $('#vars').select2(singleSelectOpt);
        $('#tags').select2({
            width: '40%',
            placeholder: "选择或添加标签, 最多3个",
            tags: true,
            allowClear: true,
            tokenSeparators: [',', ' '],
            maximumSelectionLength: 3,
            dropdownParent: $("#customize")
        }).on("select2:unselecting", e => {
            (e.params.args.data.text == "默认") && !isDev() && e.preventDefault();
        }).on("select2:selecting", e => {
            (e.params.args.data.text == "默认" || e.params.args.data.text == "未分类") && !isDev() && e.preventDefault();
        })
    }

    let getPanelFeatures = tag => {
        let activedCode = utools.getFeatures().map(x => x.code)
        let features = utoolsFull.db.allDocs('qc_key_').filter(x => {
            if (!x.data.tags) return false
            if (!x.data.tags.includes(tag)) return false
            if (x.data.features.platform && !x.data.features.platform.includes(window.processPlatform)) return false
            if (!activedCode.includes(x.data.features.code)) return false
            return true
        })
        return features
    }

    let showPanel = features => {
        let panel = '<table>'
        let n = 0
        features.forEach(p => {
            if (n % 6 == 0) panel += '<tr>'
            panel += `<td>
            <img src="${p.data.features.icon}" cmd="${p.data.features.cmds[0]}">
            <div class="title">${p.data.features.explain}</div>
            </td>`
            n += 1
            if (n % 6 == 0) panel +='</tr>'
        });
        $('#quickpanel').html(panel + '</table>').show()
    }

    let checkSharedQc = async () => {
        let localShares = getDB(CFG_PREFIX + 'sharedQcCounts')[window.processPlatform] || 0
        let remoteShares = await getDocsFromYuQue()
        if (!remoteShares) return
        let updates = remoteShares.length - localShares
        if (updates == 0) {
            return
        }
        $('#getShares span').text('有新分享')
        $('#getShares').css({ 'background': '#b80233' })
    }

    let getSelect2Option = (data, width, dropdownAutoWidth = false) => {
        var options = {
            data: data,
            minimumResultsForSearch: Infinity,
            dropdownParent: $("#customize"),
            dropdownAutoWidth: dropdownAutoWidth,
            escapeMarkup: markup => markup,
            templateSelection: data => data.text,
            templateResult: data => data.html
        }
        if (width) options.width = width
        return options
    }

    let getTypeSheet = () => {
        return [
            {
                id: "key",
                text: "关键字",
                html: "<img src='img/key.svg'><span>关键字</span><div>在主输入框输入对应关键字进入插件，最通用的一种模式，关键字可以设置多个</div>"
            },
            {
                id: "regex",
                text: "正则/划词",
                html: "<img src='img/regex.svg'><span>正则/划词</span><div>正则匹配主输入框文本或唤出超级面板时选中的文本，可以获取输入框文本或选中文本作为变量</div>"
            },
            {
                id: "window",
                text: "窗口/进程",
                html: "<img src='img/window.svg'><span>窗口/进程</span><div>匹配呼出uTools前或唤出超级面板时的活动窗口，可以获取窗口的信息或文件夹路径作为变量</div>"
            },
            {
                id: "files",
                text: "复制/选中文件",
                html: "<img src='img/file.svg'><span>复制/选中文件</span><div>匹配拖入主输入框的文件或唤出超级面板时选中的文件，可以获取复制及选中的文件信息作为变量</div>"
            },
            {
                id: "professional",
                text: "专业模式",
                html: "<img src='img/professional.svg'><span>专业模式</span><div>通过json格式的配置实现同时匹配关键字、窗口、文件甚至图片，或者指定文件数量、窗口类等</div>"
            }
        ]
    }

    let createTypeSelect2 = (width = false) => {
        var data = getTypeSheet()
        $('#type').select2(getSelect2Option(data, width));
    }

    let createProgramSelect2 = (width, dropdownAutoWidth = false) => {
        var programStyled = p => `<img src="logo/${p}.png"><span>${p}</span>`
        var data = [{ id: "quickcommand", text: 'quickcommand', html: programStyled('quickcommand') }]
        data = data.concat(Object.keys(programs).map(x => { return { id: x, text: x, html: programStyled(x) } }))
        $('#program').select2(getSelect2Option(data, width, dropdownAutoWidth));
    }

    let createEditor = () => {
        window.editor = CodeMirror.fromTextArea(document.getElementById("cmd"), {
            lineNumbers: true,
            matchBrackets: true,
            // lineWrapping: true,
            autoCloseBrackets: true,
            styleActiveLine: true,
            keyMap: "sublime",
            theme: utools.isDarkColors() ? 'material-darker' : "mdn-like",
            extraKeys: {
                "Alt-Enter": () => {
                    $('.CodeMirror').hasClass('CodeMirror-fullscreen') &&
                        $('.CodeMirror').removeClass('CodeMirror-fullscreen') ||
                        $('.CodeMirror').addClass('CodeMirror-fullscreen')
                },
                "Ctrl-B": () => {
                    runCurrentCommand()
                },
                "Ctrl-S": () => {
                    SaveCurrentCommand()
                },
                "Ctrl-Q": () => {
                    quitCurrentCommand()
                },
                "Shift-Alt-F": () => {
                    beautifyCode()
                },
                "Alt-Up": "swapLineUp",
                "Alt-Down": "swapLineDown",
                "Shift-Alt-Down": "duplicateLine"
            }
        });
        window.editor.on("change", showHint);
        window.editor.setOption("mode", 'javascript');
    }

    window.showHint = () => {
        editor.showHint({ completeSingle: false });
    }

    let beautifyCode = () => {
        if ($("#customize").is(":parent")) {
            var cmd = window.editor.getValue()
            switch ($("#program").val()) {
                case "quickcommand":
                case "javascript":
                    window.editor.setValue(js_beautify(cmd, { brace_style: "collapse,preserve-inline" }))
                    break;
                case "python":
                    py_beautify(cmd, data => {
                        window.editor.setValue(data)
                    })
                    break;
                default:
                    quickcommand.showMessageBox('暂不支持该语言的格式化', 'error')
                    break;
            }
        }
    }

    // 获取特殊变量
    let getSpecialVars = () => {
        var specialVars = []
        $("#vars option").each(i => {
            var selector = $("#vars option").eq(i)
            if (!selector.prop('disabled')) specialVars.push(selector.val())
        })
        localStorage['specialVars'] = specialVars
    }

    let typeCheck = () => {
        var type = $("#type").val();
        switch (type) {
            case 'key':
                $("#ruleWord").html("关键字");
                $(".var.regex, .var.window, .var.files").prop("disabled", true)
                $("#rule").prop("placeholder", '多个关键字用逗号隔开');
                break;
            case 'regex':
                $("#ruleWord").html("正&#12288;则");
                $(".var.window, .var.files").prop("disabled", true)
                $(".var.regex").prop("disabled", false)
                $("#rule").prop("placeholder", '匹配文本的正则，如 /.*?\\.exe$/i');
                break;
            case 'files':
                $("#ruleWord").html("正&#12288;则");
                $(".var.regex, .var.window").prop("disabled", true)
                $(".var.files").prop("disabled", false)
                $("#rule").prop("placeholder", '匹配文件的正则，如 /.*?\\.exe$/i');
                break;
            case 'window':
                $("#ruleWord").html("进&#12288;程");
                $(".var.regex, .var.files").prop("disabled", true)
                $(".var.window").prop("disabled", false)
                $("#rule").prop("placeholder", '多个窗口进程逗号隔开，留空匹配所有窗口');
                break;
            case 'professional':
                $("#ruleWord").html("配&#12288;置");
                $(".var.regex, .var.window, .var.files").prop("disabled", false)
                $("#rule").prop("placeholder", '等效于 features.cmds');
                let sample = `["关键词",{"type":"img","label":"图片匹配"},{"type":"files","label":"文件匹配","fileType":"file","match":"/aaa/","minLength":1,"maxLength":99},{"type":"regex","label":"文本正则匹配","match":"/bbb/i","minLength":1,"maxLength":99},{"type":"over","label":"无匹配时","exclude":"/ccc/i","minLength":1,"maxLength":99},{"type":"window","label":"窗口动作","match":{"app":["ddd.app","eee.exe"],"title":"/fff/","class":["ggg"]}}]`
                !$('#rule').val() && $('#rule').val(sample) 
            default:
                break;
        }
        getSpecialVars()
    }

    let clearAllFeatures = () => {
        for (var fts of utools.getFeatures()) {
            utoolsFull.removeFeature(fts.code)
        }
    }

    let hasCustomIcon = () => {
        var src = $("#icon").attr('src');
        var iconame = $("#iconame").val();
        return /data:image\/\w+;base64,/.test(src) || iconame
    }

    let programCheck = () => {
        let mode = $('#program').val();
        $('.customscript').hide();
        $('.quickactions').hide();
        $('#scptarg, #charset').show();
        if (!utools.isLinux()) $('#showInTerm').prop("disabled", false)
        $('#charset').data(autoCharset(mode));
        if (!hasCustomIcon()) $("#icon").attr('src', `logo/${mode}.png`);
        switch (mode) {
            case 'custom':
                $('.customscript').show();
                var customext = $('#customext').val()
                customext && (mode = highlightIfKnown(customext))
                break;
            case 'quickcommand':
                $('.quickactions').show();
                $('#scptarg, #charset').hide();
                $('#showInTerm').prop("disabled", true);
                mode = 'javascript';
                break;
            case 'csharp':
            case 'c':
                mode = 'text/x-' + mode
                break;
            case 'python':
                getPythonMods()
                break;
            case 'cmd':
                getCmdCommand()
                break;
            case 'shell':
                getShellCommand()
                break;
            default:
                break;
        }
        window.editor.setOption("mode", mode);
    }

    // 合规性校验
    let cmdCheck = (type, cmd) => {
        var blacklist
        switch (type) {
            case 'key':
                blacklist = cmd.match(/{{input}}|{{SelectFile}}|{{pwd}}|{{WindowInfo}}|{{MatchedFiles}}/g)
                break;
            case 'regex':
                blacklist = cmd.match(/{{SelectFile}}|{{WindowInfo}}|{{pwd}}|{{MatchedFiles}}/g)
                if (/^(|\/)\.[*+](|\/)$/.test($('#rule').val())) return quickcommand.showMessageBox('正则匹配 .* 和 .+ 已被uTools禁用！', 'error')
                break;
            case 'window':
                blacklist = cmd.match(/{{input}}|{{MatchedFiles}}/g)
                break;
            case 'files':
                blacklist = cmd.match(/{{input}}|{{SelectFile}}|{{pwd}}|{{WindowInfo}}/g)
                break;
            default:
                break;
            }
        if (blacklist) {
            quickcommand.showMessageBox(`当前模式无法使用${Array.from(new Set(blacklist)).join("、")}`, 'error')
            return false
        } else {
            return true
        }
    }

    // 开关
    $("#options").on('change', 'input[type=checkbox]', function () {
        var customFts = getAllQuickCommands(),
            code = $(this).parents('tr').attr('id')
        if (!utoolsFull.removeFeature(code)) {
            utoolsFull.setFeature(customFts[code].features);
        }
    });

    // 底部功能按钮
    $("#options").on('click', '.footBtn', async function () {
        switch ($(this).attr('id')) {
            case 'viewHelps': utools.createBrowserWindow('./helps/HELP.html', {width: 1280, height: 920});
                break;
            case 'getShares': getSharedQCFromYuQue();
                break;
            case 'add': showCustomize();
                $("#customize").animate({ top: '0px' });
                break;
            case 'import':
                var success = await importCommand()
                if (success) {
                    if (success instanceof Object) locateToCode(success.tags, success.code)
                    else showOptions()
                    quickcommand.showMessageBox("导入成功")
                }
                else if (success == false) {
                    quickcommand.showMessageBox("导入失败，格式错误", "error")
                }
                break;
            case 'enableAll': $(".checked-switch:not(:checked)").click();
                break;
            case 'disableAll': $(".checked-switch:checked").click();
                break;
            case 'exportAll': exportAll();
                break;
            case 'clear': clearAll();
                break;
            case 'addToPanel': addToPanel()
        }
    })

    let addToPanel = () => {
        let tag = $('.currentTag').text()
        if (tag == '默认' || tag == '未分类') return quickcommand.showMessageBox('当前标签不支持', 'error')
        let code = `panel_${encodeURI(tag)}`
        if (!utoolsFull.removeFeature(code)) {
            let features = getPanelFeatures(tag)
            if (features.length == 0) return quickcommand.showMessageBox('快捷面板仅支持匹配模式为关键词的命令，当前标签不存在该类型命令或者该命令未启用', 'error', 8000)
            let feature = {
                code: code,
                explain: `${tag}面板`,
                cmds: [tag],
                icon: "logo/quickpanel.png"
            }
            utoolsFull.setFeature(feature);
            $('#addToPanel').css({ "filter": "none" })
            $('.currentTag').addClass('panelTag')
            quickcommand.showMessageBox(`已为当前标签启动快捷面板<br>utools 中直接输入<b style="color: #b80233;display: contents;">${tag}</b>即可进入`, 'success', 5000)
        } else {
            $('#addToPanel').attr("style", "")
            $('.currentTag').removeClass('panelTag')
            quickcommand.showMessageBox("已取消当前标签的快捷面板")
        }
    }

    let editCurrentCommand = async (data, animate = true) => {
        let features = data.features || {}
        let code = features.code
        let platform = features.platform
        let readonly = false
        let extraInfo = {
            authorName: data.authorName,
            authorId: data.authorId,
            fromShare: data.fromShare
        }
        if (data.tags && data.tags.includes("默认")) readonly = true
        if($('#options').is(":empty")) showOptions()
        showCustomize(readonly);
        $('#customize').data('extraInfo', extraInfo)
        data.tags && $('#tags').val(data.tags).trigger('change')
        platform && ["win32", "darwin", "linux"].map(x => (!platform.includes(x) && $(`#${x}`).addClass('disabled')))
        let cmds = features.cmds
        if (cmds) {
            let type = getCmdsType(cmds)
            $('#type').val(type).trigger("change")
            if (type == 'professional') {
                $('#rule').val(JSON.stringify(cmds))
            } else {
                cmds = cmds[0]
                if (type == 'regex' || type == 'files') {
                    $('#rule').val(cmds.match);
                } else if (type == 'window') {
                    if (!cmds.match) $('#rule').val('');
                    else if (cmds.match.title || cmds.match.class) $('#rule').val(JSON.stringify(cmds.match));
                    else $('#rule').val(cmds.match.app);
                } else {
                    $('#type').val('key').trigger("change")
                    $('#rule').val(features.cmds.toString());
                }
            }     
        } else {
            $('#type').val('key').trigger("change")
        }
        $('#code').val(code);
        $('#program').val(data.program).trigger("change");
        $('#output').val(data.output).trigger("change");
        $('#desc').val(features.explain);
        $('#scptarg').val(data.scptarg);
        let icon = features.icon || ''
        if (icon && !/^(data:image\/png;base64,|logo\/)/.test(icon) ) icon = await getBase64Ico(icon)
        $("#icon").attr('src', icon);
        let mode = data.program;
        if (mode == 'custom') {
            $('#custombin').show().val(data.customOptions.bin);
            $('#customarg').show().val(data.customOptions.argv);
            $('#customext').show().val(data.customOptions.ext);
        }
        typeCheck();
        programCheck();
        if (data.charset) $("#charset").data(data.charset);
        // 分段载入，保障动画流畅
        if (animate) {
            window.editor.setValue(data.cmd.slice(0, 2000));
            $("#customize").animate({ top: '0px' }, () => {
                window.editor.replaceRange(data.cmd.slice(2000), {line: Infinity});
            });
        } else {
            $("#customize").css({ top: '0px' })
            window.editor.setValue(data.cmd);
        }
    }

    // 编辑
    $("#options").on('click', '.editBtn', function () {
        let code = $(this).parents('tr').attr('id')
        let data = getDB(QC_PREFIX + code)
        editCurrentCommand(data)
    })


    // 编码设置
    $("#options").on('click', '#charset', function () {
        var html = `
        脚本编码： <input id="scriptCode" class="swal2-input" placeholder="未出现乱码问题请留空">
        输出解码： <input id="outputCode" class="swal2-input" placeholder="未出现乱码问题请留空">
        `
        Swal.fire({
            title: "编码设置",
            onBeforeOpen: () => {
                let charset = $('#charset').data()
                document.getElementById('scriptCode').value = charset.scriptCode || ''
                document.getElementById('outputCode').value = charset.outputCode || ''
            },
            html: html,
            showCancelButton: true,
            footer: `基于 iconv-lite, 查看支持的<a href="#" onclick="utools.ubrowser.goto('https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings').run()">编码</a>`,
            preConfirm: () => {
                let scriptCode = document.getElementById('scriptCode').value
                let outputCode = document.getElementById('outputCode').value
                $('#charset').data({scriptCode: scriptCode, outputCode: outputCode})
            }
        })
    })

    // 添加模拟按键
    $("#options").on('click', '#addKey', function () {
        $("#addKey").text("▶ 录制中").addClass('record')
        quickcommand.showMessageBox('开始录制按键，可连续录制', 'info')
        Mousetrap.record(sequence => {
            sequence.forEach(s => {
                var keys = s
                if (s.includes('+') && s.length > 1) keys = s.split('+').reverse().map(x=>x.trim().replace('meta', 'command')).join(`", "`)
                window.editor.replaceSelection(`keyTap("${keys}")\n`)
            })
            $("#addKey").text("﹢按键").removeClass('record')
        });
    })

    // quickCommand的帮助
    $("#options").on('click', '#showHelp', function () {
        utools.createBrowserWindow('./helps/quickcommand.html', {width: 1280, height: 920})
    })

    // 添加动作
    $("#options").on('click', '#addAction', function () {
        var html = `
        <select id="actionType" class="swal2-select" style="width: 80%; height: 3rem;">
            <option value="open" args="文件、文件夹或软件的绝对路径">打开文件/文件夹/软件</option>
            <option value="locate" args="要在文件管理器里显示的文件路径">在文件管理器中定位文件</option>
            <option value="visit" args="要访问的网址链接">用默认浏览器打开网址</option>
            <option value="utools.ubrowser.goto" args="要访问的网址链接">用ubrowser打开网址</option>
            <option value="system" args="要执行的命令行">执行系统命令</option>
            <option value="copyTo" args="要写入剪切板的内容">将内容写入剪贴板</option>
            <option value="message" args="要发送的系统消息文本">发送系统消息</option>
            <option value="alert" args="要弹窗显示的消息文本">弹窗显示消息</option>
            <option value="send" args="要发送到窗口的文本内容">发送文本到活动窗口</option>
            <option value="utools.redirect" args="要跳转至的插件名称">转至指定插件(自定义关键字)</option>
            <option value="quickcommand.sleep" args="延迟的毫秒数，不要勾选“加引号”">添加延时</option>
        </select>
        <input placeholder="文件、文件夹或软件的绝对路径" id="actionArgs" class="swal2-input" style="width: 80%; height: 3rem;">
        <input type="checkbox" checked id="isString" style="margin-left: 60%;">加引号
        `
        Swal.fire({
            title: "预设动作",
            onBeforeOpen: () => {
                $('#actionType').change(function () {
                    $('#actionArgs').attr('placeholder', $(this).find(`[value=${$(this).val().replace('.', '\\.')}]`).attr('args'))
                })
            },
            html: html,
            showCancelButton: true,
            preConfirm: () => {
                var actionType = $("#actionType").val()
                var actionArgs = $("#actionArgs").val().replace(/\\/g, '\\\\')
                if ($("#isString").is(':checked')) actionArgs = `"` + actionArgs + `"`
                var action = `${actionType}(${actionArgs})`
                if (actionType == 'utools.ubrowser.goto') action += `.run()`
                window.editor.replaceSelection(`${action}\n`)
            }
        })
    })

    let setYuQueToken = async () => {
        let yuQueToken = await quickcommand.showInputBox(["请输入 Token"])
        if (!yuQueToken) return
        yuQueToken = yuQueToken[0]
        yuQueClient.defaults.headers['X-Auth-Token'] = yuQueToken
        try {
            let res = await yuQueClient('user')
            let extraInfo = {
                yuQueToken: yuQueToken,
                authorId: res.data.data.account_id,
                authorName: res.data.data.name
            }
            putDB(extraInfo, CFG_PREFIX + 'extraInfo')
            quickcommand.showMessageBox("设置成功~")
        } catch (e) {
            quickcommand.showMessageBox('Token 校验失败', "error")
        }
    }

    let createShareMenu = jsonQc => {
        let menu = ['复制到剪贴板', '导出到文件', '', '设置 Token']
        let extraInfo = getDB(CFG_PREFIX + 'extraInfo')
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

    // 分享相关
    const yuQueShareVars = {
        imgBedApi: 'https://imgkr.com/api/v2/files/upload',
        imgBedBaseLink: 'https://imgkr.cn-bj.ufileos.com/',
        yuQueImgBedBaseLink: 'https://cdn.nlark.com/yuque/',
        releaseRepo: 'fofolee/qcreleases',
        shareRepo: 'fofolee/qcshares',
        shareLock: false
    }

    // 导出
    $("#options").on('click', '.exportBtn', async function () {
        var code = $(this).parents('tr').attr('id')
        var jsonQc = getDB(QC_PREFIX + code)
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
                    filters: [ { name: 'json', extensions: ['json'] }, ]
                })
                break;
            case '分享命令':
            case '更新分享':
                if (yuQueShareVars.shareLock) {
                    quickcommand.showMessageBox('分享速度太快了，请稍候', 'warning')
                } else {
                    yuQueShareVars.shareLock = true
                    // jsonQc = await updateImgLink(jsonQc)
                    var result = await shareQCToYuQue(jsonQc)
                    yuQueShareVars.shareLock = false
                    result && quickcommand.showMessageBox('分享成功，等待发布后即可在分享中心直接下载')
                }
                break;
            case '我要分享':
                utools.createBrowserWindow('./helps/HELP.html?#分享命令', {width: 1280, height: 920})
                break;
            case '评论':
                utools.shellOpenExternal(`https://www.yuque.com/${yuQueShareVars.releaseRepo}/${code}`)
                break;
            case '设置 Token':
                await setYuQueToken()
                break;
        }
    })

    let updateImgLink = async jsonQc => {
        let icon = jsonQc.features.icon
        if (!jsonQc.imgLink && icon.includes('base64')) {
            try {
                if (icon.length > 2000) icon = await getCompressedIco(icon)
                jsonQc.features.icon = icon
                let res = await quickcommand.uploadFile(yuQueShareVars.imgBedApi, dataURLtoFile(icon, jsonQc.features.code + '.png'))
                jsonQc.imgLink = res.data.data
            } catch (error) {
                console.log(error);
            }
        }
        return jsonQc
    }

    let dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    // 一键分享到语雀
    let shareQCToYuQue = async jsonQc => {
        let extraInfo = getDB(CFG_PREFIX + 'extraInfo')
        if (!extraInfo.yuQueToken) return quickcommand.showMessageBox("请先设置 Token，点击底部「查看帮助」可查看 Token 设置方法", "error")
        jsonQc.authorId = extraInfo.authorId
        jsonQc.authorName = extraInfo.authorName
        let stringifyQc = JSON.stringify(jsonQc, null, 4)
        if (stringifyQc.length > 5000000) return quickcommand.showMessageBox('命令大小超过5M无法分享，请检查图标或脚本内容是否过大', "error")
        let type = jsonQc.features.cmds[0].type || 'key'
        let tags = jsonQc.tags ? jsonQc.tags.join(' ') : ""
        let typeDescription = getTypeSheet().filter(x => x.id == type)[0].text
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
        yuQueClient.defaults.headers['X-Auth-Token'] = extraInfo.yuQueToken
        let res, repo = extraInfo.authorId == 1496740 ? yuQueShareVars.releaseRepo : yuQueShareVars.shareRepo
        try {
            res = await yuQueClient.post(`repos/${repo}/docs`, parameters)
            if (!res.data.data) return quickcommand.showMessageBox("分享失败，不知道为啥", "error")
            let docId = res.data.data.id
            res = await yuQueClient.put(`repos/${repo}/docs/${docId}`, parameters)
            if (!res.data.data) return quickcommand.showMessageBox("分享失败，不知道为啥", "error")
            putDB(jsonQc, jsonQc.features.code);
            return jsonQc
        } catch (error) {
            return quickcommand.showMessageBox(error, "error")
        }
    }

    let getDocsFromYuQue = async () => {
        let res, extraInfo = getDB(CFG_PREFIX + 'extraInfo')
        if (extraInfo.yuQueToken) yuQueClient.defaults.headers['X-Auth-Token'] = extraInfo.yuQueToken
        try {
            res = await yuQueClient(`repos/${yuQueShareVars.releaseRepo}/docs`)
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

    let getSharedQCFromYuQue = async () => {
        $('#options').hide()
        let description
        let docs = await getDocsFromYuQue()
        if (!docs) return
        let sharedQcCounts = getDB(CFG_PREFIX + 'sharedQcCounts')
        sharedQcCounts[window.processPlatform] = docs.length
        putDB(sharedQcCounts, CFG_PREFIX + 'sharedQcCounts')
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
        let choise = await quickcommand.showSelectList(docs, { optionType: 'json', showCancelButton: true })
        if (choise) {
            let doc = await yuQueClient(`repos/${yuQueShareVars.releaseRepo}/docs/${choise.slug}?raw=1`)
            let body = doc.data.data.body
            let stringifyQc = body.match(/```json([\s\S]*)```/)[1]
            let qc = JSON.parse(stringifyQc)
            qc.fromShare = true
            $('#options').show()
            editCurrentCommand(qc)
            $('#customize').data('returnShare', true)
        } else {
            $('#options').show()
            $('#customize').removeData('returnShare')
        }
        utools.setExpendHeight(600)
    }

    $("#out").on('click', '#importSharedQc', async function () {
        await importCommand() ? quickcommand.showMessageBox("导入成功") : quickcommand.showMessageBox("导入失败，格式错误", "error")
        showOptions()
        utools.setExpendHeight(600)
        $('#out').empty()
    })

    // 删除
    $("#options").on('click', '.delBtn', function () {
        quickcommand.showConfirmBox('删除这个快捷命令').then(x => {
            if (!x) return
            var code = $(this).parents('tr').attr('id')
            utools.copyText(JSON.stringify(getDB(QC_PREFIX + code)))
            delDB(QC_PREFIX + code)
            utoolsFull.removeFeature(code);
            var currentTag = $('.currentTag').text()
            if ($('#featureList tr').length == 1) currentTag = "默认"
            showOptions(currentTag);
            quickcommand.showMessageBox('删除成功，为防止误操作，已将删除的命令复制到剪贴板')
        })
    })

    // 选择图标
    $("#options").on('click', '#icon', function () {
        showChangeIconWindow()
    })

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
                data: function (params) {
                    return {
                        term: params.term,
                        offset: (params.page - 1) * 10 || 0,
                        platform: 'color',
                        amount: 10,
                        token: 'JpOyWT5TW8yYThBIk1fCbsNDd3ISSChSD5vPgCON',
                        language: /[\u4e00-\u9fa5]/.test(params.term) ? 'zh' : 'en'
                    }
                },
                processResults: function (data) {
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
            let imgInfo = getFileInfo({ type: 'file', argvs: imgUrl, readfile: false })
            let imgPath = getQuickCommandScriptFile(imgInfo.ext)
            await quickcommand.downloadFile(imgUrl, imgPath)
            $("#iconame").val(imgInfo.name);
            let src = await getBase64Ico(imgPath);
            $("#icon").attr('src', src);
        } catch (error) {
            quickcommand.showMessageBox('图片地址有误！', 'error')
        }
    }

    let showChangeIconWindow = () => {
        var html = `
        <button id="localImg" class="swal2-confirm swal2-styled" style="width: 80%; height: 3rem; margin: 1em">选择本地图标</button>
        <select id="networkImg"></select>
        <input id="networkImgUrl" placeholder="使用网络图片" class="swal2-input" style="width: 80%; height: 3rem; text-align: center">
        `
        Swal.fire({
            title: "设置图标",
            onBeforeOpen: () => {
                getIcons8Icon()
                $('#localImg').click(async () => {
                    var options = { buttonLabel: '选择', properties: ['openFile'] }
                    var file = getFileInfo({ type: 'dialog', argvs: options, readfile: false })
                    if (file) {
                        $("#iconame").val(file.name);
                        let src = await getBase64Ico(file.path);
                        $("#icon").attr('src', src);
                        Swal.close()
                    }
                })
            },
            html: html,
            showCancelButton: true,
            preConfirm: async () => {
                let imgUrl = $('#networkImgUrl').val()
                if (imgUrl) await getRemoteImg(imgUrl)
                else quickcommand.showMessageBox('没有输入图标地址', 'warning')
            }
        })
    }

    let SaveCurrentCommand = async () => {
        if ($('#tags').is(":parent")) {
            var type = $('#type').val(),
                code = $("#code").val(),
                tags = $('#tags').val(),
                rule = $('#rule').val(),
                charset = $('#charset').data()
                cmd = window.editor.getValue();
            if (tags && tags.includes("默认") && !isDev()) return
            if (type != "window" && !rule) return quickcommand.showMessageBox(`${$('#ruleWord').text().replace("　", "")} 不能留空！`, 'error')
            if (!cmdCheck(type, cmd)) return
            if (!code) {
                // 生成唯一code
                var uid = Number(Math.random().toString().substr(3, 3) + Date.now()).toString(36);
                var code = `${type}_${uid}`;
            }
            var output = $('#output').val(),
                scptarg = $('#scptarg').val(),
                program = $('#program').val(),
                desc = $('#desc').val(),
                icon = $("#icon").attr('src'),
                hasSubInput;
            if (!desc) desc = ' ';
            if (type == 'key') {
                cmds = rule.split(",").map(x => x.trim())
            } else if (type == 'regex') {
                if (!/^\/.*?\/[igm]*$/.test(rule)) {
                    rule = "/" + rule + "/"
                }
                cmds = [{
                    "label": desc,
                    "type": "regex",
                    "match": rule,
                    "minNum": 1
                }];
            } else if (type == 'window') {
                var cmdOfWin = {
                    "label": desc,
                    "type": "window"
                }
                if (rule) {
                    try {
                        cmdOfWin.match = JSON.parse(rule)
                    } catch (error) {
                        cmdOfWin.match = {
                            "app": rule.split(',')
                        }
                    }
                }
                cmds = [cmdOfWin];
            } else if (type == 'files') {
                if (!/^\/.*?\/[igm]*$/.test(rule)) {
                    rule = "/" + rule + "/"
                }
                cmds = [{
                    "label": desc,
                    "type": "files",
                    "match": rule,
                    "minNum": 1
                }];
            } else if (type == 'professional') {
                try {
                    cmds = JSON.parse(rule)
                } catch (error) {
                    return quickcommand.showMessageBox(`配置的格式有误，请核查！`, 'error')
                }
            }
            // 需要子输入框
            if (cmd.includes('{{subinput')) {
                hasSubInput = true;
            } else {
                hasSubInput = false;
            }
            // platform
            var platform = []
            $('.platform').not('.disabled').each(function () { platform.push($(this).attr('id')) })
            // 添加特性
            var extraInfo = $('#customize').data('extraInfo')
            var pushData = {
                features: {
                    "code": code,
                    "explain": desc,
                    "cmds": cmds,
                    "icon": icon,
                    "platform": platform
                },
                program: program,
                cmd: cmd,
                output: output,
                hasSubInput: hasSubInput,
                scptarg: scptarg,
                charset: charset
            }
            if (extraInfo) {
                Object.assign(pushData, extraInfo)
                // 通过模拟访问页面来统计下载量
                extraInfo.fromShare && utools.ubrowser.goto(`https://www.yuque.com/${yuQueShareVars.releaseRepo}/${code}`).run({
                    show: false
                })
            }
            if (tags) pushData.tags = tags
            if (program == 'custom') {
                pushData.customOptions = {
                    "bin": $('#custombin').val(),
                    "argv": $('#customarg').val(),
                    "ext": $('#customext').val()
                }
            }
            putDB(pushData, QC_PREFIX + code);
            $("#customize").animate({ top: '100%' }, () => {
                $("#customize").empty()
                if ($('#customize').data('returnShare')) {
                    getSharedQCFromYuQue()
                } else {
                    locateToCode(pushData.tags, code)
                    let checkSwitch = $(`#${code} .checked-switch`)
                    checkSwitch.click()
                    checkSwitch.is(':checked') || checkSwitch.click()
                }
            });
        }
    }

    // 保存后标签跳转处理
    let locateToCode = (tags, code) => {
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
        showOptions(redirectTag);
        location.href = '#' + code
    }

    // 显示运行结果
    let showRunResult = (content, raw, success) => {
        var options, position, showClass, hideClass, maxlength = 100000
        if ($("#vars").is(":parent")) {
            position = 'top'
            showClass = 'fadeInDownWindow'
            hideClass = 'fadeOutUpWindow'
        } else {
            position = 'bottom'
            showClass = 'fadeInUpWindow'
            hideClass = 'fadeOutDownWindow'
        }
        var preView = () => {
            var result = $('#swal2-content').text()
            result = htmlEncode(result, raw)
            $(".swal2-content").css("width", "100%")
            $('#swal2-content').html(`<pre class="output ${success ? "" : "error"}">${result}</pre>`)
            $('.swal2-popup').addClass('swal2-toast')
        }
        var contlength = content.length
        if (contlength > maxlength) content = content.slice(0, maxlength - 100) + `\n\n...\n${contlength - maxlength - 100} 字省略\n...\n\n` + content.slice(contlength - 100)
        content += '\n'
        var outputchannel = $("#swal2-content > pre")
        if (outputchannel.is(":parent")) {
            outputchannel.append(htmlEncode(content, raw))
        } else {
            options = {
                onBeforeOpen: preView,
                icon: success ? "success" : "error",
                text: content,
                position: position,
                width: 800,
                showConfirmButton: true,
                showClass: { popup: showClass },
                hideClass: { popup: hideClass }
            }
            Swal.fire(options)
        }
    }

    let replaceTempInputVals = async cmd => {
        let tempInputVals = []
        let specilaVals = ['input', 'subinput', 'pwd', 'SelectFile', 'WindowInfo', 'MatchedFiles']
        specilaVals.forEach(x => {
            let m = cmd.match(new RegExp('{{' + x + '.*?}}', 'g'))
            m && m.forEach(y => tempInputVals.includes(y) || tempInputVals.push(y))
        })
        if (!tempInputVals.length) return cmd
        let inputs = await quickcommand.showInputBox(tempInputVals, '需要临时为以下变量赋值')
        tempInputVals.forEach((t, n) => {
            cmd = cmd.replace(new RegExp(t, 'g'), inputs[n])
        })
        return cmd
    }

    let runCurrentCommand = async () => {
        if ($("#customize").is(":parent")) {
            var cmd = window.editor.getValue()
            cmd = special(cmd)
            cmd = await replaceTempInputVals(cmd)
            var program = $("#program").val()
            var output = $("#output").val()
            var terminal = false
            var raw = true
            switch (output) {
                case "html":
                    raw = false
                    break;
                case "terminal":
                    terminal = true
                    break;
                case "ignore":
                    utools.hideMainWindow()
                    break;
            }
            if (program == "quickcommand") {
                runCodeInVm(cmd, (stdout, stderr) => {
                    if (stderr) return showRunResult(stderr, raw, false)
                    showRunResult(stdout, raw, true)
                });
            } else {
                var option = programs[program]
                if (program == "custom") option = {
                    "bin": $('#custombin').val(),
                    "argv": $('#customarg').val(),
                    "ext": $('#customext').val()
                }
                option.scptarg = $('#scptarg').val()
                option.charset = $('#charset').data()
                runCodeFile(cmd, option, terminal, (stdout, stderr) => {
                    if (terminal) return
                    if (stderr) return showRunResult(stderr, raw, false)
                    showRunResult(stdout, raw, true)
                })
            }
        }
    }

    let killCurrentCommand = () => {
    }

    let quitCurrentCommand = () => {
        if ($("#customize").is(":parent") && $("#featureList").is(":parent")) {
            $("#customize").animate({ top: '100%' });
            $("#customize").empty()
            if ($('#customize').data('returnShare')) getSharedQCFromYuQue()
        }
    }

    let highlightIfKnown = ext => {
        var lang = Object.keys(programs).filter(p => programs[p].ext == ext)
        if (lang.length) {
            if (lang[0] == 'python') getPythonMods()
            window.editor.setOption("mode", lang[0])
            return lang[0]
        }
    }

    let showCodeEditor = file => {
        var customWindow = `
        <div id="customize">
        <select id="program"></select>
        <span class="customscript">
            <input type="text" id="custombin" placeholder="解释器路径">
            <input type="text" id="customarg" placeholder="解释器参数">
            <input type="text" id="customext" placeholder="后缀,不含.">
        </span>
        <span id="runCode" class="robot">运  行</span>
        <span id="charset" class="robot">编码设置</span>
        <input type="text" id="scptarg" placeholder="脚本参数">
        <span class="quickactions">
            <span id="beautifyCode" class="robot">格式化</span>
            <!--<span id="addAction" class="robot">﹢动作</span>
            <span id="addKey" class="robot">﹢按键</span>-->
            <span id="showHelp" class="robot">？文档</span>
        </span>
        <textarea id="cmd" placeholder="可以直接拖放脚本文件至此处, 支持VSCode快捷键\nCtrl+B 运行\nCtrl+F 搜索\nAlt+Enter 全屏\nShift+Alt+F 格式化（仅JS/PY）"></textarea>
        </div>
        `
        $("#options").html(customWindow)
        createEditor()
        $(".CodeMirror").addClass('CodeMirror-coderunner')
        $("#customize").css({ top: '0px', padding: '0px' });
        $("span.customscript > input").css({"height": "26px"})
        var history = getDB(CFG_PREFIX + 'codeHistory')
        createProgramSelect2(140, true)
        if (file) {
            var fileinfo = getFileInfo({ type: 'file', argvs: file, readfile: true })
            window.editor.setValue(fileinfo.data)
            var program = Object.keys(programs).filter(x => `.${programs[x].ext}` == fileinfo.ext)
            if (program) $('#program').val(program[0]).trigger('change')
            // runCurrentCommand()
        } else if(history.program){
            window.editor.setValue(history.cmd)
            $('#program').val(history.program).trigger('change')
            $('#scptarg').val(history.scptarg)
            var custom = history.customoptions
            if (history.program = 'custom' && custom) {
                $('#custombin').val(custom.custombin)
                $('#customarg').val(custom.customarg)
                $('#customext').val(custom.customext)
            }
        }
        programCheck()
        $("#options").show()
    }

    // 输出搜索
    let showSearchBox = () => {
        if ($('#options').is(':hidden') && $('#out').is(":parent")) {
            $('#out').append(`<div id="outputSearch"><input autofocus="autofocus"><kbd id="find-next">↓</kbd><kbd id="find-prev">↑</kbd><kbd id="find-close">✕</kbd></div>`)
            $('#outputSearch').animate({ opacity: 1, top: '10px', })
            document.getElementById('find-next').onclick = () => {
                utools.findInPage($('#outputSearch > input').val())
            }
            document.getElementById('find-prev').onclick = () => {
                utools.findInPage($('#outputSearch > input').val(), { forward: false })
            }
            document.getElementById('find-close').onclick = () => {
                utools.stopFindInPage()
                $('#outputSearch').animate({ opacity: 0, top: '-30px', }, () => {
                    $('#outputSearch').remove()
                })
            }
        }
    }

    // 切换TAGS
    $("#options").on('click', '.sidebar li', function () {
        showOptions($(this).text());
    })

    // 运行
    $("#options").on('click', '.cmdBtn.run, #runCode', function () {
        runCurrentCommand()
    })

    // 配置栏扩大
    $("#options").on('click', '#expandBtn', function () {
        let placeholder = $('#rule').prop('placeholder')
        let rule = $('#rule').val()
        try {
            rule = JSON.stringify(JSON.parse(rule), null, 4)
        } catch (error) { }
        quickcommand.showTextAera(placeholder, rule).then(x => {
            try {
                x = JSON.stringify(JSON.parse(x))
            } catch (error) { }
            $('#rule').val(x)
        })
    })

    // 格式化
    $("#options").on('click', '#beautifyCode', function () {
        beautifyCode()
    })

    // 取消
    $("#options").on('click', '.cmdBtn.cancel', function () {
        quitCurrentCommand()
    })

    // 保存
    $("#options").on('click', '.cmdBtn.save', function () {
        SaveCurrentCommand()
    })

    // 语言选项改变时
    $("#options").on('change', '#program', function () {
        programCheck()
    })

    // 变量选项改变时
    $("#options").on('change', '#vars', function () {
        $("#vars").css({'color':'black'})
        window.editor.replaceSelection($("#vars").val());
    })

    $("#options").on('change', '#action', function () {
        $("#action").css({ 'color': 'black' })
    })

    // 方式选项改变时
    $("#options").on('change', '#type', function () {
        // resetVars();
        typeCheck();
    })

    $("#options").on('change', '#customext', function () {
        highlightIfKnown($('#customext').val())
    })

    // 平台按钮
    $("#options").on('click', '.platform', function () {
        if ($(this).hasClass('disabled')){
            $(this).removeClass('disabled')
        } else {
            if ($('.disabled').length == 2) quickcommand.showMessageBox('至少保留一个平台', 'error')
            else $(this).addClass('disabled')
        }
    })

    $("#quickpanel").on('click', 'img', function () {
        let cmd = $(this).attr('cmd')
        utools.redirect(cmd)
    })

    Mousetrap.bind('ctrl+s', () => {
        SaveCurrentCommand()
        return false
    });

    Mousetrap.bind('ctrl+q', () => {
        quitCurrentCommand()
        return false
    });

    Mousetrap.bind('ctrl+b', () => {
        runCurrentCommand()
        return false
    });

    Mousetrap.bind('ctrl+f', () => {
        showSearchBox()
        return false
    });

}()
