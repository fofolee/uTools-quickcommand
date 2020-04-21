utools.onPluginEnter( async ({ code, type, payload }) => {
    // 配置页面
    if (code == 'options') {
        utools.setExpendHeight(600);
        $("#out").hide().html('');
        $("#options").show();
        showOptions();
    } else {
        $("#options").hide();
        $("#out").show().text('');
        var db = utools.db.get('customFts').data[code],
            cmd = db.cmd;
        if (db.robotjs) {
            utools.setExpendHeight(0);
            utools.hideMainWindow();
            eval(cmd);
            utools.outPlugin();
            return;
        }
        if (db.program == "custom") {
            option = db.customOptions;
        } else {
            option = programs[db.program];
        }
        // 正则
        if (type == 'regex') cmd = cmd.replace(/\{\{input\}\}/mg, payload);
        // 窗口
        if (type == 'window') {
            // 获取选中的文件
            if (cmd.includes('{{SelectFile}}')) {
                let repl = await getSelectFile(payload.id);
                cmd = cmd.replace(/\{\{SelectFile\}\}/mg, repl)
            }
            // 获取资源管理器或访达当前目录
            if (cmd.includes('{{pwd}}')) {
                let repl = await pwd(payload.id);
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
            $("#out").text('');
            var subinput = '';
            var setSubInput = () => {
                utools.setSubInput(({text}) => {
                    subinput = text;
                }, '');
            }
            var handleEnter = (event) => {
                if (event.keyCode == 13) {
                    $("#out").text('');
                    var execmd = cmd.replace(/\{\{subinput\}\}/mg, subinput);
                    runCmd(execmd, option, db.codec, db.output);
                }
            };
            setSubInput();
            document.addEventListener('keydown', handleEnter);
            // 移除监听
            utools.onPluginOut(() => {
                document.removeEventListener('keydown', handleEnter);
              })
        } else {
            runCmd(cmd, option, db.codec, db.output);
        }
    }
});

function runCmd(cmd, option, codec, output) {
    // 不需要输出的，提前关闭窗口
    if (['ignore', 'clip', 'send', 'notice', 'terminal'].indexOf(output) !== -1) {
        utools.hideMainWindow()
    }
    var terminal = false;
    if(output == 'terminal') terminal = true;
    // 运行脚本
    window.run(cmd, option, codec, terminal, (stdout, stderr) => {
        if (stderr) {
            // 报错
            utools.showMainWindow()
            Swal.fire({
                title: '啊嘞?!',
                text: stderr,
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '转至脚本目录',
                cancelButtonText: '退出',
              }).then((result) => {
                if (result.value) {
                    open(resolve(tmpdir, `QuickCommandTempScript.${option.ext}`));
                  }
                  copyTo(stderr);
                  utools.showNotification("已复制报错信息");
                  utools.outPlugin();
              })
        } else if (stdout) {
            // 有输出
            switch (output) {
                case "text":
                    $("#out").text(stdout);
                    break;
                case "html":
                    $("#out").html(stdout);
                    break;
                case "clip":
                    copyTo(stdout);
                    utools.outPlugin();
                    break;
                case "send":
                    // 暂存用户剪贴板
                    var historyData = storeClip();
                    copyTo(stdout);
                    paste();
                    setTimeout(() => {
                        restoreClip(historyData);
                    }, 500);
                    utools.outPlugin();
                    break;
                case "notice":
                    // 发送系统通知
                    utools.showNotification(stdout);
                    utools.outPlugin();
                    break;
                case "ignore":
                    utools.outPlugin();
                    break;
                default:
                    break;
            }
        } else {
            // 无输出
            utools.outPlugin()
        }
    })
}
