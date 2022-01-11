import qcprograms from "./qcprograms.js"
import init from "./init.js"
import UTOOLS from "./utools.js"
import qccommands from "./qccommands.js"
import qcfeatures from "./qcfeatures.js"
import qcpanel from "./qcpanel.js"
import qcparser from "./qcparser.js"
import spring from "./springeggs.js"

! function () {
    // 解析日期
    let parseDate = dateString => {
        return {
            year: dateString.getFullYear(),
            month: dateString.getMonth() + 1,
            day: dateString.getDate(),
            hour: dateString.getHours(),
            minute: dateString.getMinutes(),
            second: dateString.getSeconds()
        }
    }
    // 春节彩蛋
    let showSpringFestivalEgg = parsedDate => {
        let eggs = UTOOLS.getDB(UTOOLS.DBPRE.CFG + 'eggs')
        let thisYear = parsedDate.year
        if (!eggs.years) eggs.years = []
        if (eggs.years.includes(thisYear)) return
        spring.springFestivalEgg(parsedDate)
        eggs.years.push(thisYear)
        UTOOLS.putDB(eggs, UTOOLS.DBPRE.CFG + 'eggs')
    }
    // 使用情况统计
    let usageStatistics = (commandName, commandCode, runTime) => {
        let statisticsData = UTOOLS.getDB(UTOOLS.DBPRE.CFG + 'statisticsData')
        let thisYear = runTime.year
        if (!statisticsData[thisYear]) statisticsData[thisYear] = []
        statisticsData[thisYear].push({
            command: {
                name: commandName,
                code: commandCode
            },
            time: {
                month: runTime.month,
                day: runTime.day,
                hour: runTime.hour,
                minute: runTime.minute
            }
        })
        UTOOLS.putDB(statisticsData, UTOOLS.DBPRE.CFG + 'statisticsData')
    }
    // 进入插件
    utools.onPluginEnter(async ({ code, type, payload }) => {
        var enterDate = new Date()
        var parsedDate = parseDate(enterDate)
        var db = UTOOLS.getDB(UTOOLS.DBPRE.QC + code);
        // 使用情况统计
        usageStatistics(db.features ? db.features.explain : payload, code, parsedDate)
        // 春节彩蛋
        showSpringFestivalEgg(parsedDate)
        // 暗黑模式
        if (utools.isDarkColors()) {
            !$('#darkmode').length && $('head').append(`
            <link id="darkmode" rel="stylesheet" href="assets/style/darkmode.css">
            <link id="darkswal" rel="stylesheet" href="assets/plugins/sweetalert2/dark.min.css">`)
        } else {
            $('#darkmode').length && $('#darkmode, #darkswal').remove()
        }
        // 会员皮肤 ~ 然而没啥卵用
        if (utools.getUser() && utools.getUser().type == 'member') {
            !$('#membermode').length && $('head').append(`
            <link id="membermode" rel="stylesheet" href="assets/style/member.css">`)
        } else {
            $('#membermode').length && $('#membermode').remove()
        }
        if (init.isRunningAtFirstTime()) {
            // init.showChangeLog()
            // init.oldVersionFix()
            qcfeatures.importDefaultCommands()
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
                UTOOLS.putDB({ cmd: cmd, program: program, scptarg: scptarg, customoptions: customoptions }, UTOOLS.DBPRE.CFG + 'codeHistory')
            }
            // 初始化
            $("#options, #out, #quickpanel").empty()
            $('body').children(':not(#wrapper)').remove()
            $('body').css({ overflow: 'hidden' })
            if (handleEnter) document.removeEventListener('keydown', handleEnter)
        })
        // 配置页面
        if (code == 'options') {
            utools.setExpendHeight(550);
            $("#quickpanel").hide()
            // $("#options").show();
            qcfeatures.showFeatureList();
        } else if (code == 'code') {
            var file = ""
            // utools.setExpendHeight(550);
            if (type == 'files') file = payload[0].path
            qccommands.showCodeEditor(file)
        } else if (code == 'newcommand') {
            utools.setExpendHeight(550)
            $("#quickpanel").hide()
            $("#options").empty().fadeIn();
            let qc = { "program": "quickcommand", "cmd": "", "output": "ignore" }
            if (payload != 'NewCommand' && payload != '新建快捷命令') {
                let parser = qcparser(payload, false)
                if (parser.single) qc = parser.qc
            }
            qccommands.editCurrentCommand(qc, false)
        } else if (code.slice(0, 6) == 'panel_') {
            utools.setExpendHeight(550)
            qcpanel.showPanel(hexDecode(code.slice(6)))
        } else {
            // console.log(new Date().getTime() - window.startTime);
            $('body').css({ overflow: 'auto' })
            utools.setExpendHeight(0);
            $("#options, #quickpanel").hide();
            var cmd = db.cmd;
            var option
            if (db.program == "custom") {
                option = db.customOptions;
            } else if (db.program == "quickcommand") {
                option = { mode: "quickcommand", enterData: { code, type, payload } };
            } else {
                option = qcprograms[db.program];
            }
            option.scptarg = db.scptarg
            option.charset = db.charset ? db.charset : qccommands.setCommandCharset(db.program)
            cmd = window.special(cmd);
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
                    cmd = cmd.replace(m, repl.replace('$', '$$$'))
                })
            }
            // 窗口
            var repl
            if (type == 'window') {
                // 获取选中的文件
                if (cmd.includes('{{SelectFile}}')) {
                    repl = await window.getSelectFile(payload.id);
                    cmd = cmd.replace(/\{\{SelectFile\}\}/mg, repl)
                }
                // 获取资源管理器或访达当前目录
                if (cmd.includes('{{pwd}}')) {
                    repl = window.getCurrentFolderPathFix();
                    cmd = cmd.replace(/\{\{pwd\}\}/mg, repl)
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
                    utools.setSubInput(({ text }) => {
                        subinput = text;
                    }, placeholder.slice(1));
                }
                var querySubInput = () => {
                    $("#out").append(`<p style="color: #438eff">>> ${new Date()}</p>`);
                    var cmdToRun = cmd.replace(new RegExp(rule, 'g'), subinput);
                    runQuickCommand(cmdToRun, option, db.output, true);
                }
                // 自动粘贴的情况下自动执行
                setTimeout(() => {
                    if (subinput) querySubInput()
                }, 100)
                handleEnter = event => {
                    if (event.keyCode == 13) querySubInput()
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
            window.runCodeInVm(cmd, (stdout, stderr) => {
                if (cmd.includes("utools.setExpendHeight")) outputOpts.autoHeight = false
                switchQuickCommandResult(stdout, stderr, outputOpts)
            }, option.enterData)
        } else {
            var terminal = output == 'terminal' ? true : false
            outputOpts.scriptPath = window.getQuickcommandTempFile(option.ext)
            // 执行脚本
            window.runCodeFile(cmd, option, terminal, (stdout, stderr) => {
                switchQuickCommandResult(stdout, stderr, outputOpts)
            })
        }
    }

    let switchQuickCommandResult = (stdout, stderr, outputOpts) => {
        var output = outputOpts.type,
            autoScroll = outputOpts.autoScroll,
            autoHeight = outputOpts.autoHeight;
        var outputAutoFix = (autoScroll, autoHeight) => {
            var outputHeight = $("#out").outerHeight()
            if (outputHeight > 600) outputHeight = 600
            if (autoHeight && $('#options').is(':hidden')) utools.setExpendHeight(outputHeight);
            if (outputHeight == 600 && autoScroll) $(document).scrollTop($(document).height());
        }
        if (stderr) {
            $("#out").addClass('error')
            // 报错
            if (output == 'text' || output == 'html') {
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
                    window.locate(outputOpts.scriptPath);
                }
                window.copyTo(stderr);
                window.message("已复制报错信息");
                utools.outPlugin();
            }
        } else if (stdout) {
            $("#out").removeClass("error")
            // 有输出
            switch (output) {
                case "text":
                    $("#out").append(window.htmlEncode(stdout, true))
                    outputAutoFix(autoScroll, autoHeight)
                    break;
                case "html":
                    $("#out").append(stdout)
                    outputAutoFix(autoScroll, autoHeight)
                    break;
                case "clip":
                    window.copyTo(stdout)
                    break;
                case "send":
                    window.send(stdout)
                    break;
                case "notice":
                    // 发送系统通知
                    window.message(stdout)
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

    Mousetrap.bind('ctrl+f', () => {
        showSearchBox()
        return false
    });

}()
