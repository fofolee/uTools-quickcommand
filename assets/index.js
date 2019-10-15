utools.onPluginEnter(({ code, type, payload }) => {
    // checkUpdate();
    // 配置页面
    if (code == 'options') {
        utools.setExpendHeight(600);
        $("#out").hide();
        $("#options").show();
        showOptions();
    } else {
        $("#options").hide();
        $("#out").show();
        var db = utools.db.get('customFts').data[code],
            cmd = db.cmd;
        if (db.program == "custom") {
            option = db.customOptions;
        } else {
            option = programs[db.program];
        }
        // 通过主输入框直接进入
        if (type == 'over') cmd = cmd.replace(/\{\{input\}\}/mg, payload);
        // 无输出的批处理
        if (db.output == 'ignore' && option.ext == 'bat') option.bin = 'explorer';
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
        } else {
            utools.setExpendHeight(0);
            utools.hideMainWindow();
            runCmd(cmd, option, db.codec, db.output);
        }
    }
});

function runCmd(cmd, option, codec, output) {
        // 运行脚本
    window.run(cmd, option, codec, (stdout, stderr) => {
            // 报错
        if (stderr) {
            window.messageBox({ type: 'error', icon: window.logo, message: stderr, buttons: ['纳尼?!'] })
            utools.outPlugin();
            return;
        }
        // 有输出
        if (stdout) {
            switch (output) {
                case "ignore":
                    utools.outPlugin();
                    break;
                case "text":
                    utools.showMainWindow();
                    utools.setExpendHeight(600);
                    $("#out").text(stdout);
                    break;
                case "html":
                    utools.showMainWindow();
                    utools.setExpendHeight(600);
                    $("#out").html(stdout);
                    break;
                case "clip":
                    copyTo(stdout);
                    utools.outPlugin();
                    break;
                case "send":
                    copyTo(stdout);
                    paste();
                    utools.outPlugin();
                    break;
            }
        // 无输出
        } else {
            utools.outPlugin();
        }
    })
}
