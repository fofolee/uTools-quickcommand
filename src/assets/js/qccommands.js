import qcfeatures from "./qcfeatures.js"
import qcprograms from "./qcprograms.js"
import qcshare from "./qcshare.js"
import UTOOLS from "./utools.js"
import qctemplates from "./qctemplates.js"
import iconpicker from "./iconpicker.js"

// **************************************************
// *********************新建命令**********************
// **************************************************
// 新建命令
let showCommandEditor = (readonly = false) => {
    $("#customize").remove();
    let programOpt = `<option>${Object.keys(qcprograms).join('</option><option>')}</option>`
    let tagsOpt = readonly ? '<option>默认</option>' : ''
    let alltags = []
    $('.sidebar li').each(function() {
        let val = $(this).text()
        if (val != "默认" && val != "未分类") alltags.push(`<option value=${val}>${val}</option>`)
    })
    tagsOpt += alltags.join("")
    $("#options").append(qctemplates.command.commandEditor)
    $("#program").append(programOpt)
    $("#tags").html(tagsOpt)
    if (readonly && !isDev()) $(".button .cmdBtn .save").remove()
    $("#icon").attr('src', 'logo/quickcommand.png');
    getSpecialVars()
    createEditor()
    createProgramSelect2('40%')
    createTypeSelect2('40%')
    var singleSelectOpt = {
        width: '40%',
        minimumResultsForSearch: Infinity,
        dropdownParent: $("#customize")
    }
    $('#output').select2(singleSelectOpt);
    singleSelectOpt.placeholder = "插入特殊变量"
    $('#vars').select2(singleSelectOpt);
    $('#tags').select2({
        width: '40%',
        placeholder: "选择或添加标签, 最多3个",
        tags: true,
        allowClear: true,
        tokenSeparators: [',', ' '],
        maximumSelectionLength: 3,
        dropdownParent: $("#customize")
    }).on("select2:unselecting", e => {
        (e.params.args.data.text == "默认") && !isDev() && e.preventDefault();
    }).on("select2:selecting", e => {
        (e.params.args.data.text == "默认" || e.params.args.data.text == "未分类") && !isDev() && e.preventDefault();
    })
}

// select2 设置
let getSelect2Option = (data, width, dropdownAutoWidth = false) => {
    var options = {
        data: data,
        minimumResultsForSearch: Infinity,
        dropdownParent: $("#customize"),
        dropdownAutoWidth: dropdownAutoWidth,
        escapeMarkup: markup => markup,
        templateSelection: data => data.text,
        templateResult: data => data.html
    }
    if (width) options.width = width
    return options
}

// 匹配类型
let getTypeSheet = () => {
    return [{
            id: "key",
            text: "关键字",
            html: "<img src='img/key.svg'><span>关键字</span><div>在主输入框输入对应关键字进入插件，最通用的一种模式，关键字可以设置多个</div>"
        },
        {
            id: "regex",
            text: "正则/划词",
            html: "<img src='img/regex.svg'><span>正则/划词</span><div>正则匹配主输入框文本或唤出超级面板时选中的文本，可以获取输入框文本或选中文本作为变量</div>"
        },
        {
            id: "window",
            text: "窗口/进程",
            html: "<img src='img/window.svg'><span>窗口/进程</span><div>匹配呼出uTools前或唤出超级面板时的活动窗口，可以获取窗口的信息或文件夹路径作为变量</div>"
        },
        {
            id: "files",
            text: "复制/选中文件",
            html: "<img src='img/file.svg'><span>复制/选中文件</span><div>匹配拖入主输入框的文件或唤出超级面板时选中的文件，可以获取复制及选中的文件信息作为变量</div>"
        },
        {
            id: "professional",
            text: "专业模式",
            html: "<img src='img/professional.svg'><span>专业模式</span><div>通过json格式的配置实现同时匹配关键字、窗口、文件甚至图片，或者指定文件数量、窗口类等</div>"
        }
    ]
}

// 生成匹配类型下拉列表
let createTypeSelect2 = (width = false) => {
    var data = getTypeSheet()
    $('#type').select2(getSelect2Option(data, width));
}

// 生成环境下拉列表
let createProgramSelect2 = (width, dropdownAutoWidth = false) => {
    var programStyled = p => `<img src="logo/${p}.png"><span>${p}</span>`
    var data = [{
        id: "quickcommand",
        text: 'quickcommand',
        html: programStyled('quickcommand')
    }]
    data = data.concat(Object.keys(qcprograms).map(x => {
        return {
            id: x,
            text: x,
            html: programStyled(x)
        }
    }))
    $('#program').select2(getSelect2Option(data, width, dropdownAutoWidth));
}

// 获取命令类型
let getCommandType = cmds => {
    try {
        JSON.stringify(cmds)
    } catch (error) {
        return 'illegal'
    }
    if (cmds.length == 0) return 'null'
    if (cmds.length == 1) {
        let type = cmds[0].type
        if (!type) return 'key'
        if (type == 'window' || cmds[0].minNum) return type
        return 'professional'
    }
    let counts = cmds.filter(x => typeof x == 'string').length
    return counts == cmds.length ? 'key' : 'professional'
}

// 自动设置编码
let setCommandCharset = program => {
    let charset = {
        scriptCode: '',
        outputCode: ''
    }
    if (!utools.isWindows()) return charset
    if (program == 'powershell' || program == 'cmd') charset.scriptCode = 'GBK'
    if (['cmd', 'powershell', 'python', 'c', 'csharp'].includes(program)) charset.outputCode = 'GBK'
    return charset
}

let hasCustomIcon = () => {
    var src = $("#icon").attr('src');
    return /data:image\/\w+;base64,/.test(src)
}

// 获取特殊变量
let getSpecialVars = () => {
    var specialVars = []
    $("#vars option").each(i => {
        var selector = $("#vars option").eq(i)
        if (!selector.prop('disabled')) specialVars.push(selector.val())
    })
    localStorage['specialVars'] = specialVars
}

let showChangeIconWindow = () => {
    Swal.fire({
        title: "设置图标",
        onBeforeOpen: () => {
            iconpicker.getIcons8Icon('#networkImg', src => {
                $("#icon").attr('src', src)
            })
            iconpicker.getLocalIcon('#localImg', src => {
                $("#icon").attr('src', src)
                Swal.close()
            })
            iconpicker.getRemoteIcon('#networkImgUrl', src => {
                $("#icon").attr('src', src)
            }) 
        },
        html: qctemplates.command.setIcon,
        footer: '图标搜索来自<a href="#" onclick=utools.shellOpenExternal("https://icons8.com/")>icon8s</a>'
    })
}

// **************************************************
// **********************编辑器***********************
// **************************************************
// 编辑器
let createEditor = (selector = "#cmd") => {
    let opts = {
        matchBrackets: true,
        // lineWrapping: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        keyMap: "sublime",
        theme: utools.isDarkColors() ? 'material-darker' : "mdn-like",
    }
    if ($("#customize").is(":parent")) {
        opts.extraKeys = {
            "Alt-Enter": () => {
                $('.CodeMirror').hasClass('CodeMirror-fullscreen') &&
                    $('.CodeMirror').removeClass('CodeMirror-fullscreen') ||
                    $('.CodeMirror').addClass('CodeMirror-fullscreen')
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
        opts.lineNumbers = true
    }
    window.editor = CodeMirror.fromTextArea(document.querySelector(selector), opts);
    window.editor.on("change", showHint);
    window.editor.setOption("mode", 'javascript');
}

window.showHint = () => {
    editor.showHint({
        completeSingle: false
    });
}

// 格式化
let beautifyCode = () => {
    if ($("#customize").is(":parent")) {
        var cmd = window.editor.getValue()
        switch ($("#program").val()) {
            case "quickcommand":
            case "javascript":
                window.editor.setValue(js_beautify(cmd, {
                    brace_style: "collapse,preserve-inline"
                }))
                break;
            case "python":
                py_beautify(cmd, data => {
                    window.editor.setValue(data)
                })
                break;
            default:
                quickcommand.showMessageBox('暂不支持该语言的格式化', 'error')
                break;
        }
    }
}

let highlightIfKnown = ext => {
    var lang = Object.keys(qcprograms).filter(p => qcprograms[p].ext == ext)
    if (lang.length) {
        if (lang[0] == 'python') getPythonMods()
        window.editor.setOption("mode", lang[0])
        return lang[0]
    }
}

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

// **************************************************
// ***********************监听************************
// **************************************************
// 编码设置
$("#options").on('click', '#charset', function() {
    Swal.fire({
        title: "编码设置",
        onBeforeOpen: () => {
            let charset = $('#charset').data()
            document.getElementById('scriptCode').value = charset.scriptCode || ''
            document.getElementById('outputCode').value = charset.outputCode || ''
        },
        html: qctemplates.command.setCharset,
        showCancelButton: true,
        footer: `基于 iconv-lite, 查看支持的<a href="#" onclick="utools.ubrowser.goto('https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings').run()">编码</a>`,
        preConfirm: () => {
            let scriptCode = document.getElementById('scriptCode').value
            let outputCode = document.getElementById('outputCode').value
            $('#charset').data({
                scriptCode: scriptCode,
                outputCode: outputCode
            })
        }
    })
})

// 运行
$("#options").on('click', '.cmdBtn.run, #runCode', function() {
    runCurrentCommand()
})

// 配置栏扩大
$("#options").on('click', '#expandBtn', function() {
    let placeholder = $('#rule').prop('placeholder')
    let rule = $('#rule').val()
    try {
        rule = JSON.stringify(JSON.parse(rule), null, 4)
    } catch (error) {}
    quickcommand.showTextAera(placeholder, rule).then(x => {
        try {
            x = JSON.stringify(JSON.parse(x))
        } catch (error) {}
        $('#rule').val(x)
    })
})

// 添加模拟按键
$("#options").on('click', '#addKey', function() {
    $("#addKey").text("▶ 录制中").addClass('record')
    quickcommand.showMessageBox('开始录制按键，可连续录制', 'info')
    Mousetrap.record(sequence => {
        sequence.forEach(s => {
            var keys = s
            if (s.includes('+') && s.length > 1) keys = s.split('+').reverse().map(x => x.trim().replace('meta', 'command')).join(`", "`)
            window.editor.replaceSelection(`keyTap("${keys}")\n`)
        })
        $("#addKey").text("﹢按键").removeClass('record')
    });
})

// quickCommand的帮助
$("#options").on('click', '#showHelp', function() {
    utools.createBrowserWindow('./helps/quickcommand.html', {
        width: 1280,
        height: 920
    })
})

// 添加动作
$("#options").on('click', '#addAction', function() {
    Swal.fire({
        title: "预设动作",
        onBeforeOpen: () => {
            $('#actionType').change(function() {
                $('#actionArgs').attr('placeholder', $(this).find(`[value=${$(this).val().replace('.', '\\.')}]`).attr('args'))
            })
        },
        html: qctemplates.command.addAction,
        showCancelButton: true,
        preConfirm: () => {
            var actionType = $("#actionType").val()
            var actionArgs = $("#actionArgs").val().replace(/\\/g, '\\\\')
            if ($("#isString").is(':checked')) actionArgs = `"` + actionArgs + `"`
            var action = `${actionType}(${actionArgs})`
            if (actionType == 'utools.ubrowser.goto') action += `.run()`
            window.editor.replaceSelection(`${action}\n`)
        }
    })
})

// 选择图标
$("#options").on('click', '#icon', function() {
    showChangeIconWindow()
})

// 格式化
$("#options").on('click', '#beautifyCode', function() {
    beautifyCode()
})

// 取消
$("#options").on('click', '.cmdBtn.cancel', function() {
    quitCurrentCommand()
})

// 保存
$("#options").on('click', '.cmdBtn.save', function() {
    SaveCurrentCommand()
})

// 语言选项改变时
$("#options").on('change', '#program', function() {
    programCheck()
})

// 变量选项改变时
$("#options").on('change', '#vars', function() {
    $("#vars").css({
        'color': 'black'
    })
    window.editor.replaceSelection($("#vars").val());
})

$("#options").on('change', '#action', function() {
    $("#action").css({
        'color': 'black'
    })
})

// 方式选项改变时
$("#options").on('change', '#type', function() {
    // resetVars();
    typeCheck();
})

$("#options").on('change', '#customext', function() {
    highlightIfKnown($('#customext').val())
})

// 平台按钮
$("#options").on('click', '.platform', function () {
    $(this).hasClass('disabled') ? $(this).removeClass('disabled') : $('.disabled').length != 2 && $(this).addClass('disabled')
})

// **************************************************
// *********************保存命令**********************
// **************************************************
// 保存命令
let SaveCurrentCommand = async () => {
    if ($('#output').is(":parent")) {
        var type = $('#type').val(),
            code = $("#code").val(),
            tags = $('#tags').val(),
            rule = $('#rule').val(),
            charset = $('#charset').data()
        var cmd = window.editor.getValue();
        if (tags && tags.includes("默认") && !isDev()) return
        if (type != "window" && !rule) return quickcommand.showMessageBox(`${$('#ruleWord').text().replace("　", "")} 不能留空！`, 'error')
        if (!cmdCheck(type, cmd)) return
        if (!code) {
            // 生成唯一code
            var uid = Number(Math.random().toString().substr(3, 3) + Date.now()).toString(36);
            var code = `${type}_${uid}`;
        }
        var output = $('#output').val(),
            scptarg = $('#scptarg').val(),
            program = $('#program').val(),
            desc = $('#desc').val(),
            icon = $("#icon").attr('src'),
            hasSubInput;
        if (!desc) desc = ' ';
        var cmds
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
        } else if (type == 'professional') {
            try {
                cmds = JSON.parse(rule)
            } catch (error) {
                return quickcommand.showMessageBox(`配置的格式有误，请核查！`, 'error')
            }
        }
        // 需要子输入框
        if (cmd.includes('{{subinput')) {
            hasSubInput = true;
        } else {
            hasSubInput = false;
        }
        // platform
        var platform = []
        $('.platform').not('.disabled').each((x, y) => platform.push(y.id))
        // 添加特性
        var extraInfo = $('#customize').data('extraInfo')
        var pushData = {
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
            scptarg: scptarg,
            charset: charset
        }
        if (extraInfo) {
            Object.assign(pushData, extraInfo)
            // 通过模拟访问页面来统计下载量
            extraInfo.fromShare && utools.ubrowser.goto(`https://www.yuque.com/${qcshare.yuQueShareVars.releaseRepo}/${code}`).run({
                show: false
            })
        }
        if (tags) pushData.tags = tags
        if (program == 'custom') {
            pushData.customOptions = {
                "bin": $('#custombin').val(),
                "argv": $('#customarg').val(),
                "ext": $('#customext').val()
            }
        }
        UTOOLS.putDB(pushData, UTOOLS.DBPRE.QC + code);
        $("#customize").animate({ top: '100%' }, () => {
            $("#customize").empty()
            if ($('#customize').data('returnShare')) {
                qcshare.getSharedQCFromYuQue()
            } else {
                qcfeatures.locateToFeature(pushData.tags, code)
                let checkSwitch = $(`#${code} .checked-switch`)
                checkSwitch.click()
                checkSwitch.is(':checked') || checkSwitch.click()
            }
        });
    }
}

// **************************************************
// *********************编辑命令**********************
// **************************************************
// 编辑命令
let editCurrentCommand = async (data, animate = true) => {
    let features = data.features || {}
    let code = features.code
    let platform = features.platform
    let readonly = false
    let extraInfo = {
        authorName: data.authorName,
        authorId: data.authorId,
        fromShare: data.fromShare
    }
    if (data.tags && data.tags.includes("默认")) readonly = true
    if ($('#options').is(":empty")) qcfeatures.showFeatureList()
    showCommandEditor(readonly);
    $('#customize').data('extraInfo', extraInfo)
    data.tags && $('#tags').val(data.tags).trigger('change')
    platform && ["win32", "darwin", "linux"].map(x => (!platform.includes(x) && $(`#${x}`).addClass('disabled')))
    let cmds = features.cmds
    if (cmds) {
        let type = getCommandType(cmds)
        $('#type').val(type).trigger("change")
        if (type == 'professional') {
            $('#rule').val(JSON.stringify(cmds))
        } else {
            cmds = cmds[0]
            if (type == 'regex' || type == 'files') {
                $('#rule').val(cmds.match);
            } else if (type == 'window') {
                if (!cmds.match) $('#rule').val('');
                else if (cmds.match.title || cmds.match.class) $('#rule').val(JSON.stringify(cmds.match));
                else $('#rule').val(cmds.match.app);
            } else {
                $('#type').val('key').trigger("change")
                $('#rule').val(features.cmds.toString());
            }
        }
    } else {
        $('#type').val('key').trigger("change")
    }
    $('#code').val(code);
    $('#program').val(data.program).trigger("change");
    $('#output').val(data.output).trigger("change");
    $('#desc').val(features.explain);
    $('#scptarg').val(data.scptarg);
    let icon = features.icon || ''
    if (icon && !/^(data:image\/png;base64,|logo\/)/.test(icon)) icon = await getBase64Ico(icon)
    $("#icon").attr('src', icon);
    let mode = data.program;
    if (mode == 'custom') {
        $('#custombin').show().val(data.customOptions.bin);
        $('#customarg').show().val(data.customOptions.argv);
        $('#customext').show().val(data.customOptions.ext);
    }
    typeCheck();
    programCheck();
    if (data.charset) $("#charset").data(data.charset);
    // 分段载入，保障动画流畅
    if (animate) {
        window.editor.setValue(data.cmd.slice(0, 2000));
        $("#customize").animate({
            top: '0px'
        }, () => {
            window.editor.replaceRange(data.cmd.slice(2000), {
                line: Infinity
            });
        });
    } else {
        $("#customize").css({
            top: '0px'
        })
        window.editor.setValue(data.cmd);
    }
}

// **************************************************
// *********************运行命令**********************
// **************************************************
let runCurrentCommand = async () => {
    if ($("#customize").is(":parent")) {
        var cmd = window.editor.getValue()
        cmd = special(cmd)
        cmd = await replaceTempInputVals(cmd)
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
        if (program == "quickcommand") {
            window.runCodeInVm(cmd, (stdout, stderr) => {
                if (stderr) return showRunResult(stderr, raw, false)
                showRunResult(stdout, raw, true)
            });
        } else {
            var option = qcprograms[program]
            if (program == "custom") option = {
                "bin": $('#custombin').val(),
                "argv": $('#customarg').val(),
                "ext": $('#customext').val()
            }
            option.scptarg = $('#scptarg').val()
            option.charset = $('#charset').data()
            window.runCodeFile(cmd, option, terminal, (stdout, stderr) => {
                if (terminal) return
                if (stderr) return showRunResult(stderr, raw, false)
                showRunResult(stdout, raw, true)
            })
        }
    }
}

// 变量临时赋值
let replaceTempInputVals = async cmd => {
    let tempInputVals = []
    let specilaVals = ['input', 'subinput', 'pwd', 'SelectFile', 'WindowInfo', 'MatchedFiles']
    specilaVals.forEach(x => {
        let m = cmd.match(new RegExp('{{' + x + '.*?}}', 'g'))
        m && m.forEach(y => tempInputVals.includes(y) || tempInputVals.push(y))
    })
    if (!tempInputVals.length) return cmd
    let inputs = await quickcommand.showInputBox(tempInputVals, '需要临时为以下变量赋值')
    tempInputVals.forEach((t, n) => {
        cmd = cmd.replace(new RegExp(t, 'g'), inputs[n])
    })
    return cmd
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
        Swal.fire(options)
    }
}

// **************************************************
// *********************退出命令**********************
// **************************************************
let quitCurrentCommand = () => {
    if ($("#customize").is(":parent") && $("#featureList").is(":parent")) {
        $("#customize").animate({
            top: '100%'
        });
        $("#customize").empty()
        if ($('#customize').data('returnShare')) qcshare.getSharedQCFromYuQue()
    }
}

// **************************************************
// ********************CodeRunner********************
// **************************************************
// CodeRunner
let showCodeEditor = file => {
    var customWindow = qctemplates.command.codeEditor
    $("#options").html(customWindow)
    createEditor()
    $(".CodeMirror").addClass('CodeMirror-coderunner')
    $("#customize").css({
        top: '0px',
        padding: '0px'
    });
    $("span.customscript > input").css({
        "height": "26px"
    })
    var history = UTOOLS.getDB(UTOOLS.DBPRE.CFG + 'codeHistory')
    createProgramSelect2(140, true)
    if (file) {
        var fileinfo = getFileInfo({
            type: 'file',
            argvs: file,
            readfile: true
        })
        window.editor.setValue(fileinfo.data)
        var program = Object.keys(qcprograms).filter(x => `.${qcprograms[x].ext}` == fileinfo.ext)
        if (program) $('#program').val(program[0]).trigger('change')
        // runCurrentCommand()
    } else if (history.program) {
        window.editor.setValue(history.cmd)
        $('#program').val(history.program).trigger('change')
        $('#scptarg').val(history.scptarg)
        var custom = history.customoptions
        if (history.program = 'custom' && custom) {
            $('#custombin').val(custom.custombin)
            $('#customarg').val(custom.customarg)
            $('#customext').val(custom.customext)
        }
    }
    programCheck()
    $("#options").show()
}

// **************************************************
// *********************检查器************************
// **************************************************
// 环境检查
let programCheck = () => {
    let mode = $('#program').val();
    $('.customscript').hide();
    $('.quickactions').hide();
    $('#scptarg, #charset').show();
    if (!utools.isLinux()) $('#showInTerm').prop("disabled", false)
    $('#charset').data(setCommandCharset(mode));
    if (!hasCustomIcon()) $("#icon").attr('src', `logo/${mode}.png`);
    switch (mode) {
        case 'custom':
            $('.customscript').show();
            var customext = $('#customext').val()
            customext && (mode = highlightIfKnown(customext))
            break;
        case 'quickcommand':
            $('.quickactions').show();
            $('#scptarg, #charset').hide();
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

// 合规性校验
let cmdCheck = (type, cmd) => {
    var blacklist
    switch (type) {
        case 'key':
            blacklist = cmd.match(/{{input}}|{{SelectFile}}|{{pwd}}|{{WindowInfo}}|{{MatchedFiles}}/g)
            break;
        case 'regex':
            blacklist = cmd.match(/{{SelectFile}}|{{WindowInfo}}|{{pwd}}|{{MatchedFiles}}/g)
            if (/^(|\/)\.[*+](|\/)$/.test($('#rule').val())) return quickcommand.showMessageBox('正则匹配 .* 和 .+ 已被uTools禁用！', 'error')
            break;
        case 'window':
            blacklist = cmd.match(/{{input}}|{{MatchedFiles}}/g)
            break;
        case 'files':
            blacklist = cmd.match(/{{input}}|{{SelectFile}}|{{pwd}}|{{WindowInfo}}/g)
            break;
        default:
            break;
    }
    if (blacklist) {
        quickcommand.showMessageBox(`当前模式无法使用${Array.from(new Set(blacklist)).join("、")}`, 'error')
        return false
    } else {
        return true
    }
}

// 匹配类型检查
let typeCheck = () => {
    var type = $("#type").val();
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
            $("#rule").prop("placeholder", '多个窗口进程逗号隔开，留空匹配所有窗口');
            break;
        case 'professional':
            $("#ruleWord").html("配&#12288;置");
            $(".var.regex, .var.window, .var.files").prop("disabled", false)
            $("#rule").prop("placeholder", '等效于 features.cmds');
            let sample = `["关键词",{"type":"img","label":"图片匹配"},{"type":"files","label":"文件匹配","fileType":"file","match":"/aaa/","minLength":1,"maxLength":99},{"type":"regex","label":"文本正则匹配","match":"/bbb/i","minLength":1,"maxLength":99},{"type":"over","label":"无匹配时","exclude":"/ccc/i","minLength":1,"maxLength":99},{"type":"window","label":"窗口动作","match":{"app":["ddd.app","eee.exe"],"title":"/fff/","class":["ggg"]}}]`;
            !$('#rule').val() && $('#rule').val(sample)
        default:
            break;
    }
    getSpecialVars()
}

export default {
    showCommandEditor,
    showCodeEditor,
    createEditor,
    editCurrentCommand,
    getCommandType,
    setCommandCharset,
    getTypeSheet
}
