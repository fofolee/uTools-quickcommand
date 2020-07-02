!function () {
    utools.onPluginEnter(async ({ code, type, payload }) => {
        adaptDarkMode()
        // oldVersionFix()
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
                    customext: $('#customext').val(),
                    customcodec: $('#customcodec').val()
                }
                putDB('history', { cmd: cmd, program: program, scptarg: scptarg, customoptions: customoptions }, 'codeHistory')
            }
            // 初始化
            $("#options").empty()
            $("#out").empty()
            $("[id^=quick").remove()
            $('body').css({overflow: 'hidden'})
            swal.close()
            if (handleEnter) document.removeEventListener('keydown', handleEnter)
        })
        // 配置页面
        if (code == 'options') {
            utools.setExpendHeight(600);
            // $("#options").show();
            showOptions();
        } else if (code == 'code') {
            var file = ""
            // utools.setExpendHeight(600);
            if (type == 'files') file = payload[0].path
            showCodeEditor(file)
        } else {
            // console.log(new Date().getTime() - window.startTime);
            $('body').css({overflow: 'auto'})
            utools.setExpendHeight(0);
            $("#options").hide();
            var db = utools.db.get('customFts').data[code],
                cmd = db.cmd;
            if (db.program == "custom") {
                option = db.customOptions;
            } else if(db.program == "quickcommand"){
                option = { mode: "quickcommand", payload: payload };
            }else{
                option = programs[db.program];
            }
            option.scptarg = db.scptarg
            cmd = special(cmd);
            // 正则
            if (type == 'regex') cmd = cmd.replace(/\{\{input\}\}/mg, payload);
            // 文件
            if (type == 'files') cmd = cmd.replace(/\{\{MatchedFiles\}\}/mg, JSON.stringify(payload));
            // 窗口
            if (type == 'window') {
                // 获取选中的文件
                if (cmd.includes('{{SelectFile}}')) {
                    let repl = await getSelectFile(payload.id);
                    cmd = cmd.replace(/\{\{SelectFile\}\}/mg, repl)
                }
                // 获取资源管理器或访达当前目录
                if (cmd.includes('{{pwd}}')) {
                    let repl = utools.getCurrentFolderPath().replace(/\\/g, '\\\\');
                    cmd = cmd.replace(/\{\{pwd\}\}/mg, repl)
                }
                // 获取窗口信息
                if (cmd.includes('{{WindowInfo}}')) {
                    let repl = JSON.stringify(payload);
                    cmd = cmd.replace(/\{\{WindowInfo\}\}/mg, repl)
                }
            }
            // 无输出的批处理
            // if (db.output == 'ignore' && option.ext == 'bat') option.bin = 'explorer';
            if (db.hasSubInput) {
                // 启动子命令输入
                // 清空输出
                $("#out").empty();
                var subinput = '';
                var setSubInput = () => {
                    utools.setSubInput(({text}) => {
                        subinput = text;
                    }, '请输入');
                }
                handleEnter = (event) => {
                    if (event.keyCode == 13) {
                        $("#out").append(`<p style="color: #438eff">>> ${new Date()}</p>`);
                        var execmd = cmd.replace(/\{\{subinput\}\}/mg, subinput);
                        runQuickCommand(execmd, option, db.output, true);
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
            }, option.payload)
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
            var outputHeight = $("#out").height() + 20
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
                    break;
                default:
                    break;
            }
        } else {
            // 无输出
            utools.outPlugin()
        }
    }
    
    // 替换上个版本弃用的功能
    let oldVersionFix = () => {
        var customFts = getDB('customFts');
        Object.keys(customFts).forEach(x => {
            if (customFts[x].program == 'simulation') customFts[x].program = 'quickcommand';
            if (customFts[x].cmd.includes('await sleep')) customFts[x].cmd = customFts[x].cmd.replace(/await sleep/g, 'quickcommand.sleep')
            putDB(x, customFts[x], 'customFts');
        })
    }

    // 兼容暗黑模式
    let adaptDarkMode = () => {
        if (utools.isDarkColors()) {
            !$('#darkmode').length && $('head').append(`
            <link id="darkmode" rel="stylesheet" href="assets/style/darkmode.css">
            <link id="darkswal" rel="stylesheet" href="assets/plugins/sweetalert2/dark.min.css">`)
        } else {
            $('#darkmode').length && $('#darkmode, #darkswal').remove()
        }
    }
}()