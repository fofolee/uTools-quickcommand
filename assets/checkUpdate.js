checkUpdate = () => {
    let p = window.pluginInfo;
    if (!utools.db.get(p.version)) {
        $.get(p.publishPage, data => {
            var re = new RegExp(`<title>\\[插件\\]\\[${p.pluginName} (.*?)\\](.*?) - 猿料<\\/title>`)
            data = re.exec(data);
            let lastVer = data[1],
                desc = data[2];
            if (lastVer != p.version) {
                options = {
                    type: 'info',
                    title: '插件有可用更新',
                    icon: window.logo,
                    cancelId: 1,
                    message: `发现新版本 ${lastVer}，是否前往更新？\n更新内容：\n${desc}`,
                    buttons: ['起驾', '朕知道了', '别再烦朕']
                };
                window.messageBox(options, index => {
                    if (index == 0) {
                        window.open(p.publishPage)
                    } else if (index == 2) {
                        utools.db.put({ _id: p.version, data: "pass" })
                    }
                })
            } else {
                console.log('当前已是最新版本!');
            }
        })
    }
}