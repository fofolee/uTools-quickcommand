utools.onPluginEnter(async ({ code, type, payload }) => {
    var handleEnter
    utools.onPluginOut(() => {
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
        swal.close()
        if(handleEnter) document.removeEventListener('keydown', handleEnter)
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
        utools.setExpendHeight(0);
        $("#options").hide();
        var db = utools.db.get('customFts').data[code],
            cmd = db.cmd;
        if (db.program == "custom") {
            option = db.customOptions;
        } else if(db.program == "simulation"){
            option = "simulation";
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
                }, '');
            }
            handleEnter = (event) => {
                if (event.keyCode == 13) {
                    $("#out").append('\n-------------------------------------\n\n');
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
    if (option == "simulation") {
        // 内置环境
        runCodeInVm(cmd, (stdout, stderr) => {
            if (cmd.includes("utools.setExpendHeight")) outputOpts.autoHeight = false
            switchQuickCommandResult(stdout, stderr, outputOpts)
        })
    } else {
        var terminal = output == 'terminal' ? true : false
        outputOpts.scriptPath = getQuickCommandScriptFile(option.ext)
        // 执行脚本
        runCodeFile(cmd, option, terminal, (stdout, stderr) => {
            switchQuickCommandResult(stdout, stderr, outputOpts)
        })
    }
}

switchQuickCommandResult = (stdout, stderr, outputOpts) => {
    var output = outputOpts.output, autoScroll = outputOpts.autoScroll, autoHeight = outputOpts.autoHeight;
    var outputAutoFix = (autoScroll, autoHeight) => {
        var outputHeight = $("#out").height() + 26
        if (outputHeight > 600) outputHeight = 600
        if (autoHeight) utools.setExpendHeight(outputHeight);
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