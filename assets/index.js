utools.onPluginEnter(({ code, type, payload }) => {
    // checkUpdate();
    // 配置页面
    if (code == 'options') {
        utools.setExpendHeight(600);
        $("#out").hide();
        $("#options").show();
        showOptions();
    } else {
        utools.setExpendHeight(0);
        utools.hideMainWindow();
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
        // 运行脚本
        window.run(cmd, option, db.codec, (stdout, stderr) => {
            // 报错
            if (stderr) {
                window.messageBox({ type: 'error', icon: window.logo, message: stderr, buttons: ['纳尼?!'] })
                utools.outPlugin();
                return;
            }
            // 有输出
            if (stdout) {
                switch (db.output) {
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
});