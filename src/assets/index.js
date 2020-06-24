utools.onPluginEnter(async ({ code, type, payload }) => {
    utools.onPluginOut(() => {
        var program = $('#program').val();
        $("#options").empty()
        $("#out").empty()
        if (code == "code") {
            var cmd = window.editor.getValue();
            putDB('history', { cmd: cmd, program: program }, 'codeHistory')
        }
    })
    // 配置页面
    if (code == 'options') {
        utools.setExpendHeight(600);
        // $("#options").show();
        showOptions();
    } else if (code == 'code') {
        var file = ""
        utools.setExpendHeight(600);
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
            var handleEnter = (event) => {
                if (event.keyCode == 13) {
                    $("#out").empty();
                    var execmd = cmd.replace(/\{\{subinput\}\}/mg, subinput);
                    runQuickCommand(execmd, option, db.output);
                }
            };
            setSubInput();
            document.addEventListener('keydown', handleEnter);
            // 移除监听
            utools.onPluginOut(() => {
                document.removeEventListener('keydown', handleEnter);
              })
        } else {
            runQuickCommand(cmd, option, db.output);
        }
    }
});


let runQuickCommand = (cmd, option, output) => {
    // 不需要输出的，提前关闭窗口
    if (['ignore', 'clip', 'send', 'notice', 'terminal'].indexOf(output) !== -1) {
        utools.hideMainWindow();
        setTimeout(() => {
            utools.outPlugin();
        }, 500);
    }
    var maxheight = true
    if (option == "simulation") {
        // 内置环境
        runCodeInVm(cmd, (stdout, stderr) => {
            if (cmd.includes("utools.setExpendHeight")) maxheight = false
            switchQuickCommandResult(stdout, stderr, output, maxheight)
        })
    } else {
        var terminal = output == 'terminal' ? true : false
        // 执行脚本
        runCodeFile(cmd, option, terminal, (stdout, stderr) => {
            switchQuickCommandResult(stdout, stderr, output, maxheight)
        })
    }
}

switchQuickCommandResult = (stdout, stderr, output, maxheight) => {
    if (stderr) {
        $("#out").addClass('error')
        // 报错
        if (output == 'text' || output == 'html')
        {
            utools.setExpendHeight(600);
            $("#out").append(stderr)
        } else {
            var index = utools.showMessageBox({
                type: 'error',
                title: '啊嘞?!',
                message: stderr,
                buttons: ['转至脚本目录', '退出']
            })
            if (index == 0) {
                locate(getQuickCommandScriptFile(option.ext));
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
                if(maxheight) utools.setExpendHeight(600);
                $("#out").append(htmlEncode(stdout, true))
                break;
            case "html":
                if(maxheight) utools.setExpendHeight(600);
                $("#out").append(stdout)
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