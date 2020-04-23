getCustomFts = () => {
    var db = utools.db.get("customFts"),
        customFts = db ? db.data : {};
    return customFts;
}

putCustomFts = (code, pushData) => {
    var db = utools.db.get("customFts");
    if (db) {
        var rev = db._rev
        var data = db.data
        data[code] = pushData;
        utools.db.put({ _id: "customFts", data: data, _rev: rev });
    } else {
        var data = {};
        data[code] = pushData;
        utools.db.put({ _id: "customFts", data: data });
    }
}

// 导入
importCommand = () => {
    var options = {
        filters: [{ name: 'json', extensions: ['json'] }, ]
    }
    var file = window.openFolder(options)[0];
    var customFts = getCustomFts();
    $.get(file, data => {
        try {
            var pushData = JSON.parse(data);
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
            putCustomFts(code, pushData);
            showOptions();
        // 多个命令导入
        } else {
            if (typeof (Object.values(pushData)[0].features) == 'object') {
                for (var code of Object.keys(pushData)){
                    putCustomFts(code, pushData[code]);
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
    })
}

exportAll = () => {
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


clearAll = () => {
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

programs = {
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
            ext: 'bat'
        },
        powershell: {
            bin: 'powershell',
            argv: '-NoProfile -File',
            ext: 'ps1'
        },
        python: {
            bin: 'python',
            argv: '-u',
            ext: 'py'
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
            ext: ''
    }
}

showOptions = () => {
    $("#featureList").remove();
    var currentFts = utools.getFeatures(),
        customFts = getCustomFts();
    let featureList = '<div id="featureList"><table><tr><td width="40"></td><td width="240">模式</td><td width="270">说明</td><td>启用</td></tr>';
    for (var fts in customFts) {
        let features = customFts[fts].features;
        var cmds = '';
        if (features.cmds[0].type == 'regex') {
            var reg = features.cmds[0].match;
            if (reg.length > 15) reg = reg.slice(0, 15) + '...';
            cmds = `<span class="keyword re">正则: ${reg}</span>`;
        } else if (features.cmds[0].type == 'window') {
            var app = features.cmds[0].match.app
            if (app.length > 15) app = app.slice(0, 15) + '...';
            cmds = `<span class="keyword win">窗口: ${app}</span>`;
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
        featureList += `<tr><td><img class="logo" src="${features.icon}"></td>
        <td>${cmds}</td><td>${features.explain}</td><td>
        <label class="switch-btn">
        <input class="checked-switch" id="${features.code}" type="checkbox" ${isChecked}>
        <span class="text-switch"></span>
        <span class="toggle-btn"></span>
        </label>
        <span class="Btn editBtn" code="${features.code}">✎</span>
        <span class="Btn exportBtn" code="${features.code}">➦</span>
        <span class="Btn delBtn" code="${features.code}">✖</span>
        </td>`
    };
    featureList += `</tr></table><div class="foot">
    <div id="add" class="footBtn">添加命令</div>
    <div id="import" class="footBtn">导入命令</div>
    <div id="exportAll" class="footBtn">全部导出</div>
    <div id="clear" class="footBtn danger">全部删除</div>
    <div id="disableAll" class="footBtn danger">全部禁用</div>
    <div id="enableAll" class="footBtn">全部启用</div>
    <div id="sample" class="footBtn">下载命令</div>
    </div></div>`
    $("#options").append(featureList);
}

showCustomize = () => {
    $("#customize").remove();
    let options = `<option>${Object.keys(programs).join('</option><option>')}</option>`
    customWindow = `<div id="customize">
    <p><input type="text" id="code" style="display: none">
    <span class="word">模&#12288;式</span>
    <select id="type">
            <option value="key">通过输入关键字进入插件</option>
            <option value="regex">通过正则匹配主输入框文本</option>
            <option value="window">通过呼出uTools前的活动窗口匹配</option>
        </select>
    <span class="word" id="ruleWord">关键字</span><input type="text" id="rule" placeholder="多个关键字用逗号隔开"></p>
    <p><span class="word">说&#12288;明</span><input type="text" id="desc" placeholder="命令功能的描述"></p>
    <p>
        <span class="word">类&#12288;型</span>
        <select id="program">
        <option value="simulation">模拟操作</option>
        ${options}
        </select>
        <span class="word">图&#12288;标</span><input type="text" readonly id="iconame" placeholder="更改图标">
        <img id="icon" src="">
    </p>
    <p class="varoutput">
        <span class="word">变&#12288;量</span>
        <select id="vars">
            <option value="" style="display:none">插入特殊变量</option>
            <option value="{{isWin}}">是否Window系统</option>
            <option value="{{LocalId}}">本机唯一ID</option>
            <option value="{{input}}" class="var regex">主输入框的文本</option>
            <option value="{{subinput}}">子输入框的文本</option>
            <option value="{{pwd}}" class="var window">文件管理器当前目录</option>
            <option value="{{WindowInfo}}" class="var window">当前窗口信息(JSON格式)</option>
            <option value="{{BrowserUrl}}">浏览器当前链接</option>
            <option value="{{ClipText}}">剪切板的文本</option>
            aa<option value="{{SelectText}}" class="selectText">选中的文本</option>
            <option value="{{SelectFile}}" class="var window">选中的文件</option>
        </select>
        <span class="word">输&#12288;出</span>
        <select id="output">
            <option value="ignore">忽略输出</option>
            <option value="text">显示纯文本输出</option>
            <option value="html">显示html格式的输出</option>
            <option value="clip">复制到剪贴板</option>
            <option value="send">发送到活动窗口</option>
            <option value="notice">发送系统通知</option>
            <option value="terminal">在终端显示</option>
        </select>
    </p>
    <p class="simulation">
        <span class="word">操&#12288;作</span>
        <select id="modifier1" class="robot keys">
            <option value=""></option>
            <option value="control">control</option>
            <option value="alt">alt</option>
            <option value="shift">shift</option>
            <option value="command">⌘/win</option>
        </select>
        <select id="modifier2" class="robot keys">
            <option value=""></option>
            <option value="control">control</option>
            <option value="alt">alt</option>
            <option value="shift">shift</option>
            <option value="command">⌘/win</option>
        </select>
        <input type="text" id="presskey" class="robot keys" placeholder="模拟按键">
        <span id="addKey" class="robot footBtn">﹢按键</span>
        <input type="text" id="keydelay" class="robot keys" placeholder="等待时间">
        <span id="addDelay" class="robot footBtn">﹢延时</span>
        <select id="action" class="robot keys">
            <option value="" style="display:none">预设动作</option>
            <option value="open">打开文件</option>
            <option value="visit">打开网址</option>
            <option value="locate">定位文件</option>
            <option value="system">执行命令</option>
            <option value="copyTo">写剪贴板</option>
            <option value="message">系统消息</option>
            <option value="alert">弹窗显示</option>
        </select>
        <span id="addAction" class="robot footBtn">﹢动作</span>
    </p>
    <p>
        <span class="word">脚&#12288;本</span>
        <span>
            <input type="text" id="custombin" class="customscript" placeholder="解释器绝对路径">
            <input type="text" id="customarg" class="customscript" placeholder="参数">
            <input type="text" id="customext" class="customscript" placeholder="脚本后缀,不含.">
        </span>
    </p>
    <p><textarea id="cmd" placeholder="可以直接拖放脚本文件至此处"></textarea></p>
    <p>
        <button class="saveBtn">保存</button>
        <button class="cancelBtn">取消</button>
    </p>`
    $("#options").append(customWindow)
    $("#icon").attr('src', 'logo/simulation.png');
    window.editor = CodeMirror.fromTextArea(document.getElementById("cmd"), {
        lineNumbers: true,
        lineWrapping: true
    });
    window.editor.setOption("mode", 'javascript');
    $("#customize").animate({ top: '0px' });
}

// 重置变量下拉框
resetVars = () => {
    $('#vars').val("");
    $("#vars").css({ 'color': '#999' });
}

// 检查输出选项
outputCheck = () => {
    var output = $("#output").val()
    if (output == 'text' || output == 'html') {
        $(".selectText").hide()
    } else {
        $(".selectText").show()
    }
}

// 检查模式选项
typeCheck = () => {
    var type = $("#type").val();
    // $("#output, #program, #vars").prop("disabled", false);
    // $('.varoutput').show()
    // $(".simulation").hide()
    // $("#program").prop("disabled", false)
    switch (type) {
        case 'key':
            $("#ruleWord").html("关键字");
            $(".var.regex").hide()
            $(".var.window").hide()
            $("#rule").prop("placeholder", '多个关键字用逗号隔开');
            break;
        case 'regex':
            $("#ruleWord").html("正&#12288;则");
            $(".var.regex").show()
            $(".var.window").hide()
            $("#rule").prop("placeholder", '匹配的正则规则，如/\\w+/i');
            break;
        case 'window':
            $("#ruleWord").html("进&#12288;程");
            $(".var.regex").hide()
            $(".var.window").show()
            $("#rule").prop("placeholder", '窗口的进程名，支持正则，如explorer.exe');
            break;
        default:
            break;
    }
}

clearAllFeatures = () => {
    for (var fts of utools.getFeatures()) {
        utools.removeFeature(fts.code)
    }
}

// 开关
$("#options").on('change', 'input[type=checkbox]', function () {
    var customFts = getCustomFts(),
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

// 取消
$("#options").on('click', '.cancelBtn', function () {
    $("#customize").animate({ top: '100%'});
})

// 编辑
$("#options").on('click', '.editBtn', function () {
    var code = $(this).attr('code');
    var data = utools.db.get("customFts").data[code];
    showCustomize();
    var cmds = data.features.cmds[0]
    if (cmds.type == 'regex') {
        $('#type').val('regex')
        $('#rule').val(cmds.match);
    } else if (cmds.type == 'window') {
        $('#type').val('window');
        $('#rule').val(cmds.match.app);
    } else {
        $('#type').val('key')
        $('#rule').val(data.features.cmds.toString());
    }
    $('#code').val(code);
    $('#program').val(data.program);
    $('#output').val(data.output);
    $('#desc').val(data.features.explain);
    $("#icon").attr('src', data.features.icon);
    let mode = data.program;
    if (mode == 'custom') {
        $('#custombin').show().val(data.customOptions.bin);
        $('#customarg').show().val(data.customOptions.argv);
        $('#customext').show().val(data.customOptions.ext);
    }
    // mode == 'applescript' && (mode = 'shell');
    // mode == 'cmd' && (mode = 'powershell');
    // window.editor.setOption("mode", mode);
    window.editor.setValue(data.cmd);
    resetVars();
    typeCheck();
    programCheck();
    outputCheck();
})

// 添加模拟按键
$("#options").on('click', '#addKey', function () {
    var m1 = $('#modifier1').val();
    var m2 = $('#modifier2').val();
    var k = $('#presskey').val();
    var code = 'utools.robot.keyTap';
    if (/^(\S|f1[0-2]|f[1-9]|backspace|delete|enter|tab|escape|up|down|right|left|home|end|pageup|pagedown|command|alt|control|shift|right_shift|space|printscreen|insert')$/.test(k)) {
        if (!m1 && !m2) {
            code += `('${k}');\n`;
        } else if(m1 && m2){
            code += `('${k}', ['${m1}', '${m2}']);\n`
        } else {
            code += `('${k}', '${m1}${m2}');\n`
        }
        window.editor.replaceSelection(code);
    } else {
        Swal.fire({
            text: '请输入正确的按键',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '帮助',
            cancelButtonText: '确定',
          }).then((result) => {
            if (result.value) {
                visit('https://robotjs.io/docs/syntax#keys');
              }
          })
    }
})

// 添加延时
$("#options").on('click', '#addDelay', function () {
    var t = $('#keydelay').val();
    if (/\d+/.test(t)) {
        window.editor.replaceSelection(`await sleep(${t});\n`)
    } else {
        Swal.fire({
            icon: 'warning',
            text: '请输入正确的时间, 单位 ms',
          })
    }
})

// 添加动作
$("#options").on('click', '#addAction', async function () {
    var a = $('#action').val();
    var text;
    switch (a) {
        case 'open':
            text = '要打开的文件';
            break;
        case 'visit':
            text = '要访问的网址';
            break;
        case 'locate':
            text = '要定位的文件'
            break;
        case 'system':
            text = '要执行的命令'
            break;
        case 'message':
            text = '要发送的消息'
            break;
        case 'copyTo':
            text = '要写入的内容'
            break;
        case 'alert':
            text = '要弹窗的消息'
            break;
        default:
            Swal.fire({
                icon: 'warning',
                text: '未选中任何动作',
              })
            return;
    }
    const { value: content } = await Swal.fire({
        title: text,
        input: 'text',
        showCancelButton: true,
      })
      if (content) {
        window.editor.replaceSelection(`${a}("${content.replace(/\\/g, '\\\\')}");\n`)
      }
})

// 导出
$("#options").on('click', '.exportBtn', function () {
    var code = $(this).attr('code'),
        json = getCustomFts()[code],
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
    var code = $(this).attr('code'),
        db = utools.db.get("customFts"),
        data = db.data;
    delete data[code];
    utools.removeFeature(code);
    utools.db.put({ _id: "customFts", data: data, _rev: db._rev });
    showOptions();
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
    let iconpath = window.openFolder(options)[0];
    $("#iconame").val(basename(iconpath));
    $("#icon").attr('src', iconpath);
})

// 保存
$("#options").on('click', '.saveBtn', function () {
    var type = $('#type').val();
    var code = $("#code").val();
    if (!code) {
        // 生成唯一code
        var uid = Number(Math.random().toString().substr(3, 3) + Date.now()).toString(36);
        var code = `${type}_${uid}`;
    }
    var output = $('#output').val();
    var cmd = window.editor.getValue();
    // 合规性校验
    if (type == 'key'
        && ['{{input}}', '{{SelectFile}}', '{{pwd}}', '{{WindowInfo}}'].map(x => cmd.includes(x)).includes(true)) {
            Swal.fire({
                icon: 'error',
                title: '啊嘞?!',
                text: '关键字模式无法使用{{input}}、{{SelectFile}}、{{WindowInfo}}、{{pwd}}!',
              })
    } else if (type == 'regex'
        && ['{{SelectFile}}', '{{WindowInfo}}', '{{pwd}}'].map(x => cmd.includes(x)).includes(true)) {
            Swal.fire({
                icon: 'error',
                title: '啊嘞?!',
                text: '正则模式无法使用{{SelectFile}}、{{WindowInfo}}、{{pwd}}!',
              })
    } else if (type == 'window' && cmd.includes('{{input}}')) {
        Swal.fire({
            icon: 'error',
            title: '啊嘞?!',
            text: '窗口模式无法使用{{input}}!',
          })
    } else if (['text', 'html'].includes($('#output').val()) && cmd.includes('{{SelectText}}')) {
        Swal.fire({
            icon: 'error',
            title: '啊嘞?!',
            text: '显示文本或html输出时无法使用{{SelectText}}!',
          })
    } else {
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
            cmds = rule.split(',')
        }
        if (type == 'regex') {
            cmds = [{
                "label": desc,
                "type": "regex",
                "match": rule,
                "minNum": 1
            }];
        } 
        if (type == 'window') {
            cmds = [{
                "label": desc,
                "type": "window",
                "match": {
                    "app": rule
                }
            }];
        }
        // 需要子输入框
        if (cmd.includes('{{subinput}}')) {
            hasSubInput = true;
        } else {
            hasSubInput = false;
        }
        $("#customize").animate({ top: '100%' });
        // if (type == "robotjs") {
        //     program = "";
        //     output = "";
        //     robotjs = true;
        // }
        // 添加特性
        pushData = {
            features: {
                "code": code,
                "explain": desc,
                "cmds": cmds,
                "icon": icon
            },
            program: program,
            cmd: cmd,
            output: output,
            hasSubInput: hasSubInput
            // robotjs: robotjs
        }
        if (program == 'custom') {
            pushData.customOptions = {
                "bin": $('#custombin').val(),
                "argv": $('#customarg').val(),
                "ext": $('#customext').val()
            }
        }
        if (program == 'simulation') {
            $('#output').val('');
        }
        putCustomFts(code, pushData);
        showOptions();
        $(`#${code}`).click();
        if (!$(`#${code}`).is(':checked')) {
            $(`#${code}`).click();
        }
    }
})

hasCustomIcon = () => {
    var src = $("#icon").attr('src');
    var iconame = $("#iconame").val();
    return /data:image\/png;base64,/.test(src) || iconame
}

programCheck = () => {
    let mode = $('#program').val();
    if (!hasCustomIcon()) $("#icon").attr('src', `logo/${mode}.png`);
    switch (mode) {
        case 'custom':
            $('.customscript').show();
            break;
        case 'simulation':
            $('.varoutput').hide();
            $('.simulation').show();
            mode = 'javascript';
            break;
        default:
            $('.customscript').hide();
            $('.simulation').hide();
            $('.varoutput').show();
            break;
    }
    if('applescript') mode = 'shell';
    if('cmd') mode = 'powershell';
    window.editor.setOption("mode", mode);
}

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
$("#options").on('change', '#output', function () {
    resetVars();
    outputCheck();
})


// 方式选项改变时
$("#options").on('change', '#type', function () {
    resetVars();
    typeCheck();
})
