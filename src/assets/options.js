let getDB = id => {
    var db = utools.db.get(id),
        dbData = db ? db.data : {};
    return dbData;
}

let putDB = (code, pushData, id) => {
    var db = utools.db.get(id);
    if (db) {
        var rev = db._rev
        var data = db.data
        data[code] = pushData;
        utools.db.put({ _id: id, data: data, _rev: rev });
    } else {
        var data = {};
        data[code] = pushData;
        utools.db.put({ _id: id, data: data });
    }
}

// 导入
let importCommand = () => {
    var options = {
        filters: [{ name: 'json', extensions: ['json'] }, ]
    }
    var file = getFileInfo({ type: 'dialog', argvs: options, readfile: true })
    if (file) {
        try {
            var pushData = JSON.parse(file.data);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: '啊嘞?!',
                text: '格式错误!',
              })
            return
        }
        // 单个命令导入
        if (typeof(pushData.features)=='object') {
            var code = pushData.features.code;
            putDB(code, pushData, 'customFts');
            showOptions();
        // 多个命令导入
        } else {
            if (typeof (Object.values(pushData)[0].features) == 'object') {
                for (var code of Object.keys(pushData)){
                    putDB(code, pushData[code], 'customFts');
                }
                showOptions();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: '啊嘞?!',
                    text: '格式错误!',
                  })
            }
        }
    }
}

let exportAll = () => {
    json = utools.db.get('customFts').data,
    options = {
        title: '选择保存位置',
        defaultPath: 'quickCommand',
        filters: [
            { name: 'json', extensions: ['json'] },
        ]
    };
window.saveFile(options, JSON.stringify(json));
}


let clearAll = () => {
    Swal.fire({
        text: '将会清空所有命令，请确认！',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '确定！',
        cancelButtonText: '手抖...',
      }).then((result) => {
        if (result.value) {
            utools.db.remove('customFts');
            clearAllFeatures();
            showOptions();
          }
      })
}

let programs = {
        shell: {
            bin: 'bash',
            argv: '',
            ext: 'sh'
        },
        applescript: {
            bin: 'osascript',
            argv: '',
            ext: 'scpt'
        },
        cmd: {
            bin: '',
            argv: '',
            ext: 'bat',
            codec: 'gbk'
        },
        powershell: {
            bin: 'powershell',
            argv: '-NoProfile -File',
            ext: 'ps1',
            codec: utools.isWindows() ? 'gbk' : ''
        },
        python: {
            bin: 'python',
            argv: '-u',
            ext: 'py',
            codec: utools.isWindows() ? 'gbk' : ''
        },
        javascript: {
            bin: 'node',
            argv: '',
            ext: 'js'
        },
        ruby: {
            bin: 'ruby',
            argv: '',
            ext: 'rb'
        },
        php: {
            bin: 'php',
            argv: '',
            ext: 'php'
        },
        c: {
            bin: 'gcc',
            argv: '-o',
            ext: 'c',
            codec: utools.isWindows() ? 'gbk' : ''
        },
        csharp: {
            bin: 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe',
            argv: '/Nologo',
            ext: 'cs',
            codec: 'gbk'
        },
        lua: {
            bin: 'lua',
            argv: '',
            ext: 'lua'
        },
        perl: {
            bin: 'perl',
            argv: '',
            ext: 'pl'
    },
        custom: {
            bin: '',
            argv: '',
            ext: '',
            codec: ''
    }
}

let showOptions = (tag = "默认") => {
    $("#options").empty().fadeIn();
    var currentFts = utools.getFeatures(),
        customFts = getDB('customFts');
    var allTags = ["默认"]
    var featureList = `
    <div id="featureList">
        <table>
            <tr>
                <td width="40"></td>
                <td width="200">模式</td>
                <td width="260">说明</td>
                <td>启用</td>
            </tr>`;
    Object.values(customFts).some(fts => {
        var features = fts.features;
        if (fts.tags) {
            fts.tags.map(t => !allTags.includes(t) && allTags.push(t))
        }
        if (tag == "未分类") {
            if (fts.tags && fts.tags.length) return false
        } else {
            if (!fts.tags) return false
            if (!fts.tags.includes(tag)) return false
        }
        var cmds = '';
        if (features.cmds[0].type == 'regex') {
            var reg = features.cmds[0].match;
            if (reg.length > 10) reg = reg.slice(0, 10) + '...';
            cmds = `<span class="keyword re">正则: ${reg}</span>`;
        } else if (features.cmds[0].type == 'window') {
            var app = features.cmds[0].match.app
            if (app.length > 10) app = app.slice(0, 10) + '...';
            cmds = `<span class="keyword win">窗口: ${app}</span>`;
        } else if (features.cmds[0].type == 'files') {
            var app = features.cmds[0].match
            if (app.length > 10) app = app.slice(0, 10) + '...';
            cmds = `<span class="keyword fil">文件: ${app}</span>`;
        } else {
            features.cmds.forEach(cmd => {
                cmds += `<span class="keyword">${cmd}</span>`;
            });
        }
        var isChecked = '';
        for(var c of currentFts){
            if (c.code == features.code) {
                isChecked = 'checked';
                break;
            }
        }
        featureList += `<tr>
        <td><img class="logo" src="${features.icon}"></td>
        <td>${cmds}</td>
        <td>${features.explain}</td>
        <td>
            <label class="switch-btn">
                <input class="checked-switch" id="${features.code}" type="checkbox" ${isChecked}>
                <span class="text-switch"></span>
                <span class="toggle-btn"></span>
            </label>
            <span class="Btn editBtn" code="${features.code}"><img src="img/edit.svg"></span>
            <span class="Btn exportBtn" code="${features.code}"><img src="img/export.svg"></span>
            <span class="Btn delBtn" code="${features.code}"><img src="img/del.svg"></span>
        </td>`
    })
    featureList += `</tr></table></div>`
    var sidebar = `
    <div class="sidebar">
        ${allTags.map(a => (a == tag ? '<li class="currentTag">' : '<li>') + a + '</li>').join('')}
        <li ${tag == '未分类' ? 'class="currentTag"' : ''}>未分类</li>
    </div>`
    var footer = `
    <div class="foot">
        <div id="add" class="footBtn">添加命令</div>
        <div id="import" class="footBtn">导入命令</div>
        <div id="exportAll" class="footBtn">全部导出</div>
        <div id="clear" class="footBtn danger">全部删除</div>
        <div id="disableAll" class="footBtn danger">全部禁用</div>
        <div id="enableAll" class="footBtn">全部启用</div>
        <div id="sample" class="footBtn">下载命令</div>
    </div>`
    $("#options").append(sidebar + featureList + footer)
}

let showCustomize = () => {
    $("#customize").remove();
    // $("#featureList").fadeOut()
    let options = `<option>${Object.keys(programs).join('</option><option>')}</option>`
    let allTags = []
    $('.sidebar li').each(function () {
        let val = $(this).text()
        if (val != "默认" && val != "未分类") allTags.push(`<option value=${val}>${val}</option>`)
    })
    let customWindow = `<div id="customize">
    <p><input type="text" id="code" style="display: none">
    <span class="word">模&#12288;式</span>
    <select id="type">
            <option value="key">通过关键字进入插件</option>
            <option value="regex">正则匹配主输入框文本</option>
            <option value="window">窗口匹配</option>
            <option value="files">文件匹配</option>
        </select>
    <span class="word" id="ruleWord">关键字</span><input class="customize" type="text" id="rule" placeholder="多个关键字用逗号隔开"></p>
    <p><span class="word">说&#12288;明</span><input class="customize" type="text" id="desc" placeholder="命令功能的描述">
    <img id="icon" src="">
    </p>
    <p>
        <span class="word">类&#12288;型</span>
        <select id="program">
            <option value="simulation">内置环境</option>
            ${options}
        </select>
        <span class="word">标&#12288;签</span>
        <select id="tags" multiple="multiple">
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
            <option value="{{WindowInfo}}" disabled class="var window">当前窗口信息，返回JSON格式字符串</option>
            <option value="{{SelectFile}}" disabled class="var window">文件管理器选中的文件，不支持Linux</option>
            <option value="{{MatchedFiles}}" disabled class="var files">匹配的文件，返回JSON格式字符串</option>
        </select>
        <span class="word">输&#12288;出</span>
        <select id="output">
            <option value="ignore">隐藏并忽略输出</option>
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
            <input type="text" id="customext" placeholder="后缀,不含." onchange="highlightIfKnown(this.value)">
            <input type="text" id="customcodec" placeholder="输出编码">
        </span>
            <span class="simulation">
            <span id="addAction" class="footBtn robot">﹢动作</span>
            <span id="addKey" class="footBtn robot">﹢按键</span>
            <span id="showHelp" class="footBtn robot">？帮助</span>
            <span id="beautifyCode" class="footBtn robot">格式化</span>
        </span>
    </p>
    <textarea id="cmd" placeholder="◆基础◆\n内置环境模式下，点击“﹢按键”来执行模拟按键的操作;点击“﹢动作”添加打开软件，访问网址等常用动作\n◆进阶◆\n内置环境模式：可使用nodejs、electron、uTools的api、$.ajax以及本插件封装的用户交互命令，详情查看帮助\n其他脚本模式：本机装了相应环境即可执行，可以直接拖放脚本文件至此处\n列表里没有的语言，可以选择custom手动设置解释器路径\n◆快捷键◆\n支持VSCode快捷键\nAlt+Enter 全屏\nCtrl+B 运行\nCtrl+F 搜索\nShift+Alt+F 格式化（仅JS/PY）"></textarea>
    <p>
        <img id="win32" class="platform" src="./img/windows.svg">
        <img id="darwin" class="platform" src="./img/macos.svg">
        <img id="linux" class="platform" src="./img/linux.svg">
        <button class="button cmdBtn save">保存</button>
        <button class="button cmdBtn run">运行</button>
        <button class="button cmdBtn cancel">取消</button>
    </p>`
    $("#options").append(customWindow)
    $("#icon").attr('src', 'logo/simulation.png');
    getSpecialVars()
    createEditor()
    $('#program, #type, #output').select2({
        width: '40%',
        minimumResultsForSearch: Infinity,
        dropdownParent: $("#customize")
    });
    $('#vars').select2({
        width: '40%',
        placeholder: "插入特殊变量",
        minimumResultsForSearch: Infinity,
        dropdownParent: $("#customize")
    });
    $('#tags').select2({
        width: '40%',
        placeholder: "选择或添加标签, 最多3个",
        tags: true,
        allowClear: true,
        tokenSeparators: [',', ' '],
        maximumSelectionLength: 3,
        dropdownParent: $("#customize")
    });
    $("#customize").animate({ top: '0px' });
}

createEditor = () => {
    window.editor = CodeMirror.fromTextArea(document.getElementById("cmd"), {
        lineNumbers: true,
        matchBrackets: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        keyMap: "sublime",
        theme: "mdn-like",
        extraKeys: {
            "Alt-Enter": cm => {
              cm.setOption("fullScreen", !cm.getOption("fullScreen"));
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

let showHint = () => {
    editor.showHint({ completeSingle: false });
}

let beautifyCode = () => {
    if ($("#customize").is(":parent")) {
        var cmd = window.editor.getValue()
        switch ($("#program").val()) {
            case "simulation":
            case "javascript":
                window.editor.setValue(js_beautify(cmd, { brace_style: "collapse,preserve-inline" }))
                break;
            case "python":
                py_beautify(cmd, data => {
                    window.editor.setValue(data)
                })
                break;
            default:
                message('暂不支持该语言的格式化')
                break;
        }
    }
}


// 获取特殊变量
let getSpecialVars = () => {
    var specialVars = []
    $("#vars option").each(i => {
        var selector = $("#vars option").eq(i)
        if (selector.css('display') != 'none') specialVars.push(selector.val())
    })
    localStorage['specialVars'] = specialVars
}

// 重置变量下拉框
// let resetVars = () => {
//     $('#vars').val("");
//     $("#vars").css({ 'color': '#999' });
// }

// 检查输出选项
// let outputCheck = () => {
//     var output = $("#output").val()
//     if (output == 'text' || output == 'html') {
//         $(".selectText").hide()
//     } else {
//         $(".selectText").show()
//     }
// }

// 检查模式选项
let typeCheck = () => {
    var type = $("#type").val();
    // $("#output, #program, #vars").prop("disabled", false);
    // $('.varoutput').show()
    // $(".simulation").hide()
    // $("#program").prop("disabled", false)
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
            $("#rule").prop("placeholder", '窗口的进程名，多个用逗号隔开');
            break;
        default:
            break;
    }
    getSpecialVars()
}

let clearAllFeatures = () => {
    for (var fts of utools.getFeatures()) {
        utools.removeFeature(fts.code)
    }
}

let hasCustomIcon = () => {
    var src = $("#icon").attr('src');
    var iconame = $("#iconame").val();
    return /data:image\/png;base64,/.test(src) || iconame
}

let programCheck = () => {
    let mode = $('#program').val();
    $('.customscript').hide();
    $('.simulation').hide();
    $('#scptarg').show();
    $('#showInTerm').prop("disabled", false);
    if (!hasCustomIcon()) $("#icon").attr('src', `logo/${mode}.png`);
    switch (mode) {
        case 'custom':
            $('.customscript').show();
            var customext = $('#customext').val()
            customext && (mode = highlightIfKnown(customext))
            break;
        case 'simulation':
            $('.simulation').show();
            $('#scptarg').hide();
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

// 开关
$("#options").on('change', 'input[type=checkbox]', function () {
    var customFts = getDB('customFts'),
        code = $(this).attr('id');
    if (!utools.removeFeature(code)) {
        utools.setFeature(customFts[code].features);
    }
});

// 底部功能按钮
$("#options").on('click', '.footBtn', function () {
    switch ($(this).attr('id')) {
        case 'sample': visit('https://github.com/fofolee/uTools-QuickerCommand/tree/master/CommandCollections');
            break;
        case 'add': showCustomize();
            break;
        case 'import': importCommand();
            break;
        case 'enableAll': $(".checked-switch:not(:checked)").click();
            break;
        case 'disableAll': $(".checked-switch:checked").click();
            break;
        case 'exportAll': exportAll();
            break;
        case 'clear': clearAll();
            break;
    }
})

// 编辑
$("#options").on('click', '.editBtn', function () {
    var code = $(this).attr('code');
    var data = utools.db.get("customFts").data[code];
    showCustomize();
    data.tags && $('#tags').val(data.tags).trigger('change')
    var cmds = data.features.cmds[0]
    var platform = data.features.platform
    if (platform) ["win32", "darwin", "linux"].map(x => (!platform.includes(x) && $(`#${x}`).addClass('disabled')))
    $('#type').val(cmds.type).trigger("change")
    if (cmds.type == 'regex' || cmds.type == 'files') {
        $('#rule').val(cmds.match);
    } else if (cmds.type == 'window') {
        $('#rule').val(cmds.match.app);
    } else {
        $('#type').val('key').trigger("change")
        $('#rule').val(data.features.cmds.toString());
    }
    $('#code').val(code);
    $('#program').val(data.program).trigger("change");
    $('#output').val(data.output).trigger("change");
    $('#desc').val(data.features.explain);
    $('#scptarg').val(data.scptarg);
    $("#icon").attr('src', data.features.icon);
    let mode = data.program;
    if (mode == 'custom') {
        $('#custombin').show().val(data.customOptions.bin);
        $('#customarg').show().val(data.customOptions.argv);
        $('#customext').show().val(data.customOptions.ext);
        $('#customcodec').show().val(data.customOptions.codec);
    }
    window.editor.setValue(data.cmd);
    // resetVars();
    typeCheck();
    programCheck();
    // outputCheck();
})

// 添加模拟按键
$("#options").on('click', '#addKey', function () {
    $("#addKey").text("▶ 录制中").addClass('record')
    message('开始录制按键，可连续录制')
    Mousetrap.record(sequence => {
        sequence.forEach(s => {
            var keys = s
            if (s.includes('+') && s.length > 1) keys = s.split('+').reverse().map(x=>x.trim().replace('meta', 'command')).join(`", "`)
            window.editor.replaceSelection(`keyTap("${keys}")\n`)
        })
        $("#addKey").text("﹢按键").removeClass('record')
    });
})

// 内置环境的帮助
$("#options").on('click', '#showHelp', function () {
    $.get('./HELP.md', r => {
        utools.ubrowser.goto(r).run()
    })
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
        <option value="utools.redirect" args="要跳转至的插件名称">跳转到指定插件</option>
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
            var actionArgs = $("#actionArgs").val()
            if ($("#isString").is(':checked')) actionArgs = "String.raw\`" + actionArgs + "\`"
            var action = `${actionType}(${actionArgs})`
            if (actionType == 'utools.ubrowser.goto') action += `.run()`
            window.editor.replaceSelection(`${action}\n`)
        }
    })
})

// 导出
$("#options").on('click', '.exportBtn', function () {
    var code = $(this).attr('code'),
        json = getDB('customFts')[code],
        options = {
            title: '选择保存位置',
            filters: [
                { name: 'json', extensions: ['json'] },
            ]
        };
    window.saveFile(options, JSON.stringify(json));
})

// 删除
$("#options").on('click', '.delBtn', function () {
    Swal.fire({
        text: '删除这个快捷命令',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '确定！',
        cancelButtonText: '手抖...',
      }).then((result) => {
        if (result.value) {
            var code = $(this).attr('code'),
            db = utools.db.get("customFts"),
            data = db.data;
            delete data[code];
            utools.removeFeature(code);
            utools.db.put({ _id: "customFts", data: data, _rev: db._rev });
            var currentTag = $('.currentTag').text()
            if ($('#featureList tr').length == 2) currentTag = "默认"
            showOptions(currentTag);
          }
      })
})

// 选择图标
$("#options").on('click', '#icon, #iconame', function () {
    var options = {
        buttonLabel: '选择',
        filters: [{
            name: 'Images',
            extensions: ['png']
        }, ]
    }
    var file = getFileInfo({ type: 'dialog', argvs: options, readfile: false })
    if (file) {
        $("#iconame").val(file.name);
        $("#icon").attr('src', file.path); 
    }
})

let SaveCurrentCommand = async () => {
    if ($("#customize").is(":parent") && $("#featureList").is(":parent")) {
        var type = $('#type').val();
        var code = $("#code").val();
        var tags = $('#tags').val()
        if (!code) {
            // 生成唯一code
            var uid = Number(Math.random().toString().substr(3, 3) + Date.now()).toString(36);
            var code = `${type}_${uid}`;
        }
        var output = $('#output').val();
        var scptarg = $('#scptarg').val();
        var cmd = window.editor.getValue();
        // 合规性校验
        if (type == 'key'
            && ['{{input}}', '{{SelectFile}}', '{{pwd}}', '{{WindowInfo}}', '{{MatchedFiles}}'].map(x => cmd.includes(x)).includes(true)) {
            Swal.fire('关键字模式无法使用{{input}}、{{SelectFile}}、{{WindowInfo}}、{{pwd}}、{{MatchedFiles}}!')
        } else if (type == 'regex'
            && ['{{SelectFile}}', '{{WindowInfo}}', '{{pwd}}', '{{MatchedFiles}}'].map(x => cmd.includes(x)).includes(true)) {
            Swal.fire('正则模式无法使用{{SelectFile}}、{{WindowInfo}}、{{pwd}}、{{MatchedFiles}}!')
        } else if (type == 'window' && cmd.includes('{{input}}', '{{MatchedFiles}}')) {
            Swal.fire('窗口模式无法使用{{input}}、{{MatchedFiles}}!')
        } else if (type == 'files' && cmd.includes('{{input}}', '{{MatchedFiles}}')) {
            Swal.fire('窗口模式无法使用{{input}}、{{MatchedFiles}}!')
        // } else if (['text', 'html'].includes($('#output').val()) && cmd.includes('{{SelectText}}')) {
        //     Swal.fire('显示文本或html输出时无法使用{{SelectText}}!')
        } else if (type == 'regex' && /^(|\/)\.[*+](|\/)$/.test($('#rule').val())) {
            Swal.fire('正则匹配 .* 和 .+ 已被uTools禁用！')
         }
        else {
            var program = $('#program').val(),
                desc = $('#desc').val(),
                iconame = $("#iconame").val(),
                iconpath = $("#icon").attr('src'),
                icon,
                base64ico,
                hasSubInput;
            if (!desc) desc = ' ';
            // 选择了图标的情况下
            if (iconame) {
                base64ico = window.getBase64Ico(iconpath);
                icon = "data:image/png;base64," + base64ico;
            // 未自定义使用默认
            } else {
                icon = iconpath;
            }
            var rule = $('#rule').val();
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
            }
            // 需要子输入框
            if (cmd.includes('{{subinput}}')) {
                hasSubInput = true;
            } else {
                hasSubInput = false;
            }
            // platform
            var platform = []
            $('.platform').not('.disabled').each(function() { platform.push($(this).attr('id')) })
            // 添加特性
            pushData = {
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
                scptarg: scptarg
            }
            if (tags) pushData.tags = tags
            if (program == 'custom') {
                pushData.customOptions = {
                    "bin": $('#custombin').val(),
                    "argv": $('#customarg').val(),
                    "ext": $('#customext').val(),
                    'codec': $('#customcodec').val()
                }
            }
            putDB(code, pushData, 'customFts');
            $("#customize").animate({ top: '100%' }, () => {
                // 保存后标签跳转处理
                var redirectTag, currentTag = $('.currentTag').text()
                if (tags.length) {
                    if (pushData.tags.includes(currentTag)) {
                        redirectTag = currentTag
                    } else {
                        redirectTag = pushData.tags[0]
                    }
                } else {
                    redirectTag = "未分类"
                }
                showOptions(redirectTag);
                $("#customize").empty()
                $(`#${code}`).click();
                if (!$(`#${code}`).is(':checked')) {
                    $(`#${code}`).click();
                }
            });
        }
    }
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
        success ? swalOneByOne(options) : Swal.fire(options)
    }
}

let runCurrentCommand = async () => {
    if ($("#customize").is(":parent")) {
        var cmd = window.editor.getValue()
        cmd = special(cmd)
        var requireInputVal = ['{{input}}', '{{subinput}}', '{{pwd}}', '{{SelectFile}}']
            .filter(x => cmd.includes(x));
        if (requireInputVal.length) {
            var html = requireInputVal
                .map(r => `<input id="${r}" class="swal2-input" style="text-align: center; margin: 0.5rem auto" placeholder="${r}">`)
                .join("")
            await Swal.fire({
                title: "需要临时为以下变量赋值",
                html: html,
                focusConfirm: false,
                preConfirm: () => {
                    requireInputVal.forEach(r => {
                        cmd = cmd.replace(new RegExp(r, 'g'), document.getElementById(r).value)
                    })
                }
            })
        }
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
        if (program == "simulation") {
            runCodeInVm(cmd, (stdout, stderr) => {
                if (stderr) return showRunResult(stderr, raw, false)
                showRunResult(stdout, raw, true)
            });
        } else {
            var option = programs[program]
            if (program == "custom") option = {
                "bin": $('#custombin').val(),
                "argv": $('#customarg').val(),
                "ext": $('#customext').val(),
                'codec': $('#customcodec').val()
            }
            option.scptarg = $('#scptarg').val()
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
        $("#featureList").fadeIn()
        $("#customize").empty()
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

showCodeEditor = file => {
    let options = `<option>${Object.keys(programs).join('</option><option>')}</option>`
    var customWindow = `
    <div id="customize">
    <select id="program">
        <option value="simulation">内置环境</option>
        ${options}
        </select>
    <span class="customscript">
        <input type="text" id="custombin" placeholder="解释器路径">
        <input type="text" id="customarg" placeholder="解释器参数">
        <input type="text" id="customext" placeholder="后缀,不含." onchange="highlightIfKnown(this.value)">
        <input type="text" id="customcodec" placeholder="输出编码">
    </span>
    <span id="runCode" class="footBtn robot">运  行</span>
    <input type="text" id="scptarg" placeholder="脚本参数">
    <span class="simulation">
        <span id="beautifyCode" class="footBtn robot">格式化</span>
        <span id="addAction" class="footBtn robot">﹢动作</span>
        <span id="addKey" class="footBtn robot">﹢按键</span>
        <span id="showHelp" class="footBtn robot">？帮助</span>
    </span>
    <textarea id="cmd" placeholder="可以直接拖放脚本文件至此处, 支持VSCode快捷键\nCtrl+B 运行\nCtrl+F 搜索\nShift+Alt+F 格式化（仅JS/PY）"></textarea>
    </div>
    `
    $("#options").html(customWindow)
    createEditor()
    $(".CodeMirror").css({ position: "fixed", bottom: "0", top: "33px", height: "auto" })
    $("#customize").css({ top: '0px', padding: '0px' });
    $("span.customscript > input").css({"height": "30px"})
    var db = getDB('codeHistory')
    window.editor.setOption("theme", "ambiance")
    if (file) {
        var fileinfo = getFileInfo({ type: 'file', argvs: file, readfile: true })
        console.log(fileinfo);
        window.editor.setValue(fileinfo.data)
        var program = Object.keys(programs).filter(x => `.${programs[x].ext}` == fileinfo.ext)
        if (program) $('#program').val(program[0])
        // runCurrentCommand()
    } else if(db.history){
        window.editor.setValue(db.history.cmd)
        $('#program').val(db.history.program)
        $('#scptarg').val(db.history.scptarg)
        var custom = db.history.customoptions
        if (db.history.program = 'custom' && custom) {
            $('#custombin').val(custom.custombin)
            $('#customarg').val(custom.customarg)
            $('#customext').val(custom.customext)
            $('#customcodec').val(custom.customcodec)
        }
    }
    programCheck()
    $('#program').select2({
        width: 120,
        minimumResultsForSearch: Infinity,
        dropdownParent: $("#customize"),
        dropdownAutoWidth: true
    });
    $("#options").show()
}

// 切换TAGS
$("#options").on('click', '.sidebar li', function () {
    showOptions($(this).text());
})

// 运行
$("#options").on('click', '.cmdBtn.run, #runCode', function () {
    runCurrentCommand()
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

// 输出选项改变时
// $("#options").on('change', '#output', function () {
//     resetVars();
//     outputCheck();
// })

// 方式选项改变时
$("#options").on('change', '#type', function () {
    // resetVars();
    typeCheck();
})

// 平台按钮
$("#options").on('click', '.platform', function () {
    if ($(this).hasClass('disabled')){
        $(this).removeClass('disabled')
    } else {
        if ($('.disabled').length == 2) message('至少保留一个平台')
        else $(this).addClass('disabled')
    } 
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