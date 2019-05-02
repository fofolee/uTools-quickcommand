getCustomFts = () => {
    var db = utools.db.get("customFts"),
        customFts = db ? db.data : {};
    return customFts;
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
            agrv: '',
            ext: 'bat'   
        },
        powershell: {
            bin: 'powershell',
            agrv: '-NoProfile -File',
            ext: 'ps1'   
        },
        python: {
            bin: 'python',
            agrv: '-u',
            ext: 'py'   
        },
        javascript: {
            bin: 'node',
            agrv: '',
            ext: 'js'   
        },
        ruby: {
            bin: 'ruby',
            agrv: '',
            ext: 'rb'   
        },
        php: {
            bin: 'php',
            agrv: '',
            ext: 'php'   
        },
        lua: {
            bin: 'lua',
            agrv: '',
            ext: 'lua'   
        },
        perl: {
            bin: 'perl',
            agrv: '',
            ext: 'pl'   
        }
    }

showOptions = () => {
    var currentFts = utools.getFeatures(),
        customFts = getCustomFts();
    let featureList = '<table><tr><td></td><td>关键字</td><td>说明</td><td>启用</td></tr>';
    for (var fts in customFts) {
        let features = customFts[fts].features;
        var cmds = '';
        if (customFts[fts].noKeyword) {
            cmds = '<span class="keyword">匹配主输入框文本进入</span>';
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
        var iconpath = pjoin(dirname, features.icon),
            base64Ico = customFts[fts].base64Ico;
        if (!exists(iconpath) && base64Ico) saveBase64Ico(iconpath, base64Ico);
        featureList += `<tr><td><img class="logo" src="${iconpath}"></td>
        <td>${cmds}</td><td width="300px">${features.explain}</td><td>
        <label class="switch-btn">
        <input class="checked-switch" id="${features.code}" type="checkbox" ${isChecked}>
        <span class="text-switch"></span>
        <span class="toggle-btn"></span>
        </label>
        <span class="editBtn" code="${features.code}">✎</span>
        <span class="delBtn" code="${features.code}">✘</span>
        </td>`
    };
    featureList += `</tr></table><div class="foot">
    <div id="add" class="footBtn">添加命令</div>
    <div id="disableAll" class="footBtn">全部禁用</div>
    <div id="enableAll" class="footBtn">全部启用</div>
    </div>`
    $("#options").html(featureList);
}

showCustomize = () => {
    $("#customize").remove();
    let options = `<option>${Object.keys(programs).join('</option><option>')}</option>`
    customWindow = `<div id="customize">
    <p><span class="word">关键字</span><input type="text" id="kw" placeholder="多个关键字用逗号隔开"></p>
    <p><span class="word">说&#12288;明</span><input type="text" id="desc" placeholder="命令功能的描述"></p>
    <p>
        <span class="word">类&#12288;型</span>
        <select id="program">
        ${options}
        </select>
        <span class="word">图&#12288;标</span><input type="text" readonly id="iconame" placeholder="更改图标">
        <img id="icon" src="">
    </p>
    <p>
        <span class="word">变&#12288;量</span>
        <select id="vars">
            <option value="" style="display:none">插入特殊变量</option>
            <option value="{{isWin}}">是否Window系统</option>
            <option value="{{input}}">主输入框的文本</option>
            <option value="{{pwd}}">文件管理器当前目录</option>
            <option value="{{ChromeUrl}}">Chrome当前链接</option>
            <option value="{{ClipText}}">剪切板的文本</option>
            <option value="{{SelectText}}">选中的文本</option>
            <option value="{{SelectFile}}">选中的文件</option>
        </select>
        <span class="word">输&#12288;出</span>
        <select id="output">
            <option value="ignore">忽略输出</option>
            <option value="text">显示纯文本输出</option>
            <option value="html">显示html格式的输出</option>
            <option value="clip">复制到剪贴板</option>
            <option value="send">发送到活动窗口</option>
        </select>
    </p>
    <p>
        <span class="word">脚&#12288;本</span>
        <select id="codec">
            <option value="gbk">GBK 编码</option>
            <option value="utf8">UTF8 编码</option>
        </select>
    </p>
    <p><textarea id="cmd" placeholder="可以直接拖放脚本文件至此处"></textarea></p>
    <p>
        <button class="saveBtn">保存</button>
        <button class="cancelBtn">取消</button>
    </p>`
    $("#options").append(customWindow)
    if (window.isWin) {
        var shell = 'cmd',
            mode = 'powershell';
    } else {
        var shell = 'shell',
            mode = 'shell';
        $("#codec").hide();
    }
    $("#program").val(shell);
    $("#icon").attr('src', `logo/${shell}.png`);
    window.editor = CodeMirror.fromTextArea(document.getElementById("cmd"), {
        lineNumbers: true,
        lineWrapping: true
    });
    window.editor.setOption("mode", mode);
    $("#customize").animate({ top: '0px' });
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
        case 'add': showCustomize();
            break;
        case 'enableAll': $(".checked-switch:not(:checked)").click();
            break;
        case 'disableAll': $(".checked-switch:checked").click();
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
    // 判断是通过关键词进入还是主输入框进入
    if (data.noKeyword) {
        $('#kw').val(data.features.code);
        $('#kw').prop('disabled', true);
    } else {
        $('#kw').val(data.features.cmds.toString());
    }
    $('#kw').attr('edit', true);   
    $('#program').val(data.program);
    $('#output').val(data.output);
    $('#desc').val(data.features.explain);
    $('#codec').val(data.codec);
    $("#icon").attr('src', data.features.icon);
    let mode = data.program;
    let iconame = basename(data.features.icon);
    if (iconame != `${mode}.png`) $('#iconame').val(iconame);
    mode == 'applescript' && (mode = 'shell');
    mode == 'cmd' && (mode = 'powershell');
    window.editor.setOption("mode", mode);
    window.editor.setValue(data.cmd);
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
    let iconpath = window.openFolder()[0];
    $("#iconame").val(basename(iconpath));
    $("#icon").attr('src', iconpath);
})

// 保存
$("#options").on('click', '.saveBtn', function () {
    var code = $('#kw').val().split(',')[0].trim()
    var customFts = getCustomFts();
    // 如果 code 重复, 编辑状态下不检测
    if (code in customFts && !$('#kw').attr('edit')) {
        $('#kw').css({ 'border-bottom-color': '#ec1212' })
        window.messageBox({ type: 'error', icon: window.logo, message: "命令名称与现有的重复！", buttons: ['朕知道了'] })
    } else {
        var kw = $('#kw').val().split(','),
            program = $('#program').val(),
            desc = $('#desc').val(),
            output = $('#output').val(),
            codec = $('#codec').val(),
            iconame = $("#iconame").val(),
            iconpath = $("#icon").attr('src'),
            cmd = window.editor.getValue(),
            icon,
            base64ico;
        // 自定义了图标的情况下
        if (iconame) {
            icon = window.getIconPath(iconame);
            if (iconpath == icon) {
                base64ico = window.getBase64Ico(pjoin(dirname, iconpath));
            } else {
                base64ico = window.getBase64Ico(iconpath);
            }   
        // 未自定义使用默认
        } else {
            icon = iconpath;
            base64ico = '';
        }
        // 通过主输入框直接进入
        if (cmd.includes('{{input}}')) {
            kw = [{
                "label": desc,
                "type": "over",
                "minNum": 1
            }];
            noKeyword = true;
        } else {
            noKeyword = false;
        }
        $("#customize").animate({ top: '100%' });
        var pushData = {};
        // 添加特性
        pushData[code] = {
            features: {
                "code": code,
                "explain": desc,
                "cmds": kw,
                "icon": icon
            },
            program: program,
            cmd: cmd,
            output: output,
            codec: codec,
            base64Ico: base64ico,
            noKeyword: noKeyword
        }
        var db = utools.db.get("customFts");
        if (db) {
            var rev = db._rev
            var data = db.data
            data[code] = pushData[code];
            utools.db.put({ _id: "customFts", data: data, _rev: rev });
        } else {
            utools.db.put({ _id: "customFts", data: pushData });
        }
        showOptions();
    }
})

// 语言选项改变时
$("#options").on('change', '#program', function () {
    let mode = $(this).val();
    if (!$("#iconame").val()) $("#icon").attr('src', `logo/${mode}.png`);
    mode == 'applescript' && (mode = 'shell');
    mode == 'cmd' && (mode = 'powershell');
    window.editor.setOption("mode", mode);
})

// 变量选项改变时
$("#options").on('change', '#vars', function () {
    $("#vars").css({'color':'black'})
    window.editor.replaceSelection($("#vars").val());
})
