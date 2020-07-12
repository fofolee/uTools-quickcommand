const fs = require('fs');
const os = require('os');
const child_process = require("child_process")
const iconv = require('iconv-lite')
const electron = require('electron')
const { NodeVM } = require('vm2')
const path = require("path")
const util = require("util")
const PinyinMatch = require('pinyin-match');
const axios = require('axios');
// axios.defaults.adapter = require('axios/lib/adapters/http')
fofoCommon = require('./common').fofo

if (!utools.isWindows()) process.env.PATH += ':/usr/local/bin:/usr/local/sbin'

// window.startTime = new Date().getTime()

const shortCodes = [

    open = path => {
        utools.shellOpenItem(path)
    },

    locate = path => {
        utools.shellShowItemInFolder(path);
    },

    visit = url => {
        utools.shellOpenExternal(url);
    },

    system = cmd => {
        child_process.exec(cmd);
    },

    message = msg => {
        utools.showNotification(msg)
    },

    keyTap = (key, ...modifier) => utools.simulateKeyboardTap(key, ...modifier),
    
    copyTo = text => {
        electron.clipboard.writeText(text)
    },
        
    send = text => {
        copyTo(text);
        quickcommand.simulatePaste();
    }
]

quickcommand = {
    // 模拟复制操作
    simulateCopy: function() {
        var ctlKey = utools.isMacOs() ? 'command' : 'control';
        utools.simulateKeyboardTap('c', ctlKey);
    },

    // 模拟粘贴操作
    simulatePaste: function() {
        var ctlKey = utools.isMacOs() ? 'command' : 'control';
        utools.simulateKeyboardTap('v', ctlKey);
    },

    // setTimout 不能在 vm2 中使用，同时在 electron 中有 bug
    sleep: function(ms) {
        var start = new Date().getTime()
        try {
            child_process.execSync(getSleepCodeByShell(ms), { timeout: ms })
        } catch (ex) { }
        var end = new Date().getTime()
        return (end - start)
    },

    // 重写 setTimeout
    setTimeout: function(callback, ms) {
        var start = new Date().getTime()
        child_process.exec(getSleepCodeByShell(ms), { timeout: ms }, (err, stdout, stderr) => {
            var end = new Date().getTime()
            callback(end - start)
        })
    },

    // 显示输入框
    showInputBox: function (callback, placeHolders) {
        let helps = `正确用法：
        quickcommand.showInputBox(yourinput => {
            //do something...
        }, [placeholder of input1, placeholder of input2...])`
        if (!(callback instanceof Function)) throw helps
        placeHolders || (placeHolders = [""])
        if (!(placeHolders instanceof Array)) throw helps
        utools.setExpendHeight(600)
        var html = ""
        var inputBoxNumbers = placeHolders.length
        for (let i = 0; i < inputBoxNumbers; i++) {
            html += `<input class="swal2-input" id="inputBox${i}" placeholder="${placeHolders[i]}">`
        }
        var result = []
        var options = {
            onBeforeOpen: () => {
                document.getElementById(`inputBox0`).focus()
                $(".output").is(":parent") && utools.setExpendHeight(600) || modWindowHeight($('.swal2-popup').outerHeight() + 20)
            },
            html: html,
            focusConfirm: false,
            showCancelButton: true,
            backdrop: utools.isDarkColors() ? '#fff0' : '#bbb',
            preConfirm: () => {
                for (let i = 0; i < inputBoxNumbers; i++) {
                    result.push(document.getElementById(`inputBox${i}`).value)
                }
                callback(result)
            }
        }
        swalOneByOne(options)
    },

    // 显示选项按钮
    showButtonBox: function (callback, buttons) {
        let helps = `正确用法：
        quickcommand.showButtonBox(yourchoise => {
            var index = choise.index
            var text = choise.text
            //do something...
        }, [button1, button2...])`
        if (!(callback instanceof Function)) throw helps
        if (!(buttons instanceof Array)) throw helps
        utools.setExpendHeight(600)
        var html = ``
        var buttonBoxNumbers = buttons.length
        for (let i = 0; i < buttonBoxNumbers; i++) {
            html += `<button class="swal2-confirm swal2-styled" style="width: 80%" onclick="clickButton(${i})">${buttons[i]}</button>`
        }
        var options = {
            onBeforeOpen: () => {
                clickButton = i => {
                    callback({ index: i, text: buttons[i] })
                    swal.clickConfirm()
                }
                $(".output").is(":parent") && utools.setExpendHeight(600) || modWindowHeight($('.swal2-popup').outerHeight() + 20)
            },
            html: html,
            backdrop: utools.isDarkColors() ? '#fff0' : '#bbb',
            showConfirmButton: false
        }
        swalOneByOne(options)
    },

    // 显示自动消失的提示框
    showMessageBox: function (title, icon = "success", time = 3000) {
        var options = {
            icon: icon,
            title: title,
            toast: true,
            position: 'top',
            // timer: time,
            showConfirmButton: false,
            onOpen: toast => {
                // toast.addEventListener('mouseenter', Swal.stopTimer)
                // toast.addEventListener('mouseleave', Swal.resumeTimer)
                setTimeout(() => { Swal.clickConfirm() }, time);
            }
        }
        swalOneByOne(options)
    },

    // 显示选项列表
    showSelectList: function (callback, selects, opt = {}) {
        let helps = `正确用法：
        quickcommand.showSelectList(choise => {
            var index = choise.index
            var text = choise.text
            //do something...
        }, [option1, option2...], { placeholder, optionType, enableSearch, closeOnSelect })`
        if (!(callback instanceof Function)) throw helps
        if (!(selects instanceof Array)) throw helps
        opt.optionType || (opt.optionType = 'plaintext')
        typeof opt.placeholder == 'undefined' && (opt.placeholder = "搜索，支持拼音")
        typeof opt.enableSearch == 'undefined' && (opt.enableSearch = true)
        typeof opt.closeOnSelect == 'undefined' && (opt.closeOnSelect = true)
        if ($('#quickselect').length) $('#quickselect').remove()
        $("body").append(`<div id="quickselect"><select id="selectBox"></select></div>`)
        let item, data = []
        selects.forEach((s, i) => {
            item = {id: i}
            if (opt.optionType == 'json') {
                item.text = ''
                Object.keys(s).forEach(k => item[k] = s[k])
                s.icon && (item.text += `<div class="icon"><img src="${s.icon}"></div>`)
                s.title && (item.text += `<div class="title">${s.title}</div>`)
                s.description && (item.text += `<div class="description">${s.description}</div>`)
            } else {
                item.text = s
            }
            data.push(item)
        })
        $('#selectBox').data('options', data)
        $('#selectBox').data('type', opt.optionType)
        var prefer = {
            // data: data,
            width: "100%",
            dropdownParent: $("#quickselect"),
            closeOnSelect: opt.closeOnSelect,
            // 支持无限滚动
            ajax: {
                transport: (params, success, failure) => {
                    let cont, pageSize = 50
                    let term = (params.data.term || '').toLowerCase()
                    let page = (params.data.page || 1)
                    let items = $('#selectBox').data('options')
                    let results = items.filter(x => {
                        if (opt.optionType == 'json') cont = x.title
                        else if (opt.optionType == 'html') cont = x.text.replace(/<[^<>]+>/g, '')
                        else cont = x.text
                        return cont.toLowerCase().includes(term) || PinyinMatch.match(cont, term)
                    })
                    let paged = results.slice((page - 1) * pageSize, page * pageSize)
                    let options = { results: paged, pagination: { more: results.length >= page * pageSize } }
                    success(options)
                }
            },
        }
        // 显示html时不转义标签
        if (opt.optionType != 'plaintext') prefer.escapeMarkup = markup => markup
        $('#selectBox').select2(prefer)
        $('#selectBox').val(null).trigger('change')
        $('#selectBox').select2('open')
        $("#quickselect .select2-search__field").focus()
        $('#quickselect .select2').hide()
        opt.optionType == 'plaintext' && $('.select2-results').css({'line-height': '40px'})
        modWindowHeight($('.select2-results').outerHeight())
        opt.enableSearch && utools.setSubInput(({text})=>{
            $("#quickselect .select2-search__field").val(text).trigger('input')
            modWindowHeight($('.select2-results').outerHeight())
        }, opt.placeholder)
        $('#selectBox').on('select2:select', function (e) {
            let result = $('#selectBox').data('options')[$(this).val()]
            delete result.selected
            callback(result)
            if (opt.closeOnSelect) {
                $('#selectBox').off('select2:select')
                utools.removeSubInput()
                $("#quickselect").remove()
            }
        })
    },

    // 更新选项列表
    updateSelectList: function (selects) {
        if(!$('#selectBox').length) throw '当前没有选择列表, 请结合 quickcommand.showSelectList 使用'
        let data = $('#selectBox').data('options')
        let num = data.length
        let optionType = $('#selectBox').data('type')
        selects instanceof Array || (selects = [selects])
        let item
        selects.forEach(s => {
            item = {id: num++}
            if (optionType == 'json') {
                item.text = ''
                Object.keys(s).forEach(k => item[k] = s[k])
                s.icon && (item.text += `<div class="icon"><img src="${s.icon}"></div>`)
                s.title && (item.text += `<div class="title">${s.title}</div>`)
                s.description && (item.text += `<div class="description">${s.description}</div>`)
            } else {
                item.text = s
            }
            data.push(item)
        })
        $('#selectBox').data('options', data).val(null).trigger('change')
        $("#quickselect .select2-search__field").trigger('input')
        modWindowHeight($('.select2-results').outerHeight())
    },

    // 显示文本输入框
    showTextAera: function (callback, placeholder = "") {
        let helps = `正确用法：
        quickcommand.showTextAera(text => {
            //do something...
        }, placeholder)`
        if (!(callback instanceof Function)) throw helps
        utools.setExpendHeight(600)
        var html = `
        <div id="quicktextarea">
            <textarea placeholder="${placeholder}"></textarea>
            <button>✔</button>
        </div>`
        $("body").append(html)
        $("#quicktextarea").addClass("fadeInUpWindow")
        $("#quicktextarea > button").click(function () {
            $("#quicktextarea").addClass("fadeOutDownWindow")
            setTimeout(() => { $("#quicktextarea").remove() }, 300);
            callback($("#quicktextarea > textarea").val())
        })
    },

    // 关闭进程
    kill: function (pid, signal = 'SIGTERM') {
        process.kill(pid, signal)
    },

    // dom 解析
    htmlParse: function (html) {
        return new DOMParser().parseFromString(html, 'text/html')
    },

    // 下载文件
    downloadFile: function (url, defaultPath = '', showDialog = false) {
        return new Promise((reslove, reject) => {
            var filepath = showDialog ? utools.showSaveDialog({ defaultPath: defaultPath }) : defaultPath
            axios({
                method: 'get',
                url: url,
                responseType: 'arraybuffer'
            }).then(res => {
                var filebuffer = Buffer.from(res.data)
                if (!filepath) reslove(filebuffer)
                fs.writeFile(filepath, filebuffer, err => {
                    err && reject(err) || reslove(filebuffer)
                })
            }).catch(err => {
                reject(err)
            })
        })
    }
}

swalOneByOne = options => {
    swal.getQueueStep() && Swal.insertQueueStep(options) || Swal.queue([options])
}

let getSleepCodeByShell = ms => {
    var cmd, tempFilePath
    if (utools.isWindows()) {
        tempFilePath = getQuickCommandScriptFile('vbs')
        cmd = `echo set ws=CreateObject("Wscript.Shell") > ${tempFilePath} && echo Wscript.sleep ${ms} >> ${tempFilePath} && cscript /nologo ${tempFilePath}`
    } else {
        cmd = `sleep ${ms / 1000}`
    }
    return cmd
}

let modWindowHeight = height => {
    $('#options').is(':hidden') && utools.setExpendHeight(height > 600 ? 600 : height);
}

// 屏蔽危险函数
var getuToolsLite = () => {
    var utoolsLite = Object.assign({}, utools)
    delete utoolsLite.db
    delete utoolsLite.removeFeature
    delete utoolsLite.setFeature
    return utoolsLite
}

var getSandboxFuns = () => {
    var sandbox = {
        utools: getuToolsLite(),
        quickcommand: quickcommand,
        electron: electron,
        fs: fs,
        path: path,
        os: os,
        child_process: child_process,
        util: util,
        axios: axios,
        alert: alert
    }
    shortCodes.forEach(f => {
        sandbox[f.name] = f
    })
    return sandbox
}

runCodeInVm = (cmd, cb, payload = "") => {
    var sandbox = getSandboxFuns()
    sandbox.quickcommand.payload = payload
    const vm = new NodeVM({
        require: {
            external: true,
            builtin: ["*"],
        },
        console: 'redirect',
        env: process.env,
        sandbox: sandbox,
    });

    var parseItem = item => {
        if (typeof (item) == "object") {
            if (Buffer.isBuffer(item)) {
                var bufferString = `[Buffer ${item.slice(0, 50).toString('hex').match(/\w{1,2}/g).join(" ")}`
                if (item.length > 50) bufferString += `... ${(item.length / 1000).toFixed(2)}kb`
                return bufferString + ']'
            } else {
                try {
                    var cache = [];
                    var string = JSON.stringify(item, (key, value) => {
                        if (typeof value === 'object' && value !== null) {
                            if (cache.indexOf(value) !== -1) return
                            cache.push(value);
                        }
                        return value;
                    }, '\t')
                    if (string != "{}") return string
                } catch (error) { }
            }
        } else if (typeof (item) == "undefined") {
            return "undefined"
        }
        return item.toString()
    }
    
    //重定向 console 
    vm.on('console.log', stdout => {
        console.log(stdout);
        cb(parseItem(stdout), null)
    });

    vm.on('console.error', stderr => {
        cb(null, stderr.toString())
    });

    // 错误处理
    try {
        vm.run(cmd, path.join(__dirname, 'preload.js'));
    } catch (error) {
        console.log(error)
        cb(null, error.toString())
    }
    
    let cbUnhandledError = e => {
        removeAllListener()
        console.log(e)
        cb(null, e.error.toString())
    }

    let cbUnhandledRejection = e => {
        removeAllListener()
        console.log(e)
        cb(null, e.reason.toString())
    }
    
    let removeAllListener = () => {
        window.removeEventListener('error', cbUnhandledError)
        window.removeEventListener('unhandledrejection', cbUnhandledRejection)
        delete window.isWatchingError
    }

    if (!window.isWatchingError) {
        window.addEventListener('error', cbUnhandledError)
        window.addEventListener('unhandledrejection', cbUnhandledRejection)
        window.isWatchingError = true
    }
}

// shell代码提示，当前环境变量下的所有命令
getShellCommand = () => {
    var shellCommands = localStorage['shellCommands']
    if (shellCommands) return
    localStorage['shellCommands'] = '[]'
    if(utools.isWindows()) return
    process.env.PATH.split(':').forEach(d => {
        fs.readdir(d, (err, files) => {
            if (!err) {
                var commands = files.filter(x => x[0] != "." || x[0] != '[')
                localStorage['shellCommands'] = JSON.stringify(JSON.parse(localStorage['shellCommands']).concat(commands))                    
            }
        })
    })
}

// cmd代码提示，当前环境变量下的所有命令
getCmdCommand = () => {
    var cmdCommands = localStorage['cmdCommands']
    if (cmdCommands) return
    localStorage['cmdCommands'] = '[]'
    if(!utools.isWindows()) return
    process.env.Path.split(';').forEach(d => {
        fs.readdir(d, (err, files) => {
            if (!err) {
                var commands = []
                files.forEach(x => (x.length > 4 && x.slice(-4) == '.exe') && commands.push(x.slice(0, -4)))
                localStorage['cmdCommands'] = JSON.stringify(JSON.parse(localStorage['cmdCommands']).concat(commands))                    
            }
        })
    })
}

// python 代码提示，已安装的模块以及脚本内导入的模块的属性（方法）
getPythonMods = () => {
    var pyModules = localStorage['pyModules']
    if (pyModules) return
    localStorage['pyModules'] = '[]'
    child_process.exec(`python -c "print(__import__('sys').path)"`, (err, stdout, stderr) => {
        if (err) return
        stdout = JSON.parse(stdout.replace(/'/g, `"`)).forEach(s => {
            fs.readdir(s, (err, m) => {
                if (!err) {
                    var mods = []
                    m.forEach(d => (/\.py$|^[^-.]+$/.test(d)) && (d = d.split('.py')[0]) && (!mods.includes(d)) && mods.push(d))
                    localStorage['pyModules'] = JSON.stringify(JSON.parse(localStorage['pyModules']).concat(mods))                    
                }
            })
        })
    })
}

dirPythonMod = (mod, cb) => {
    child_process.exec(`python -c "print(dir(__import__('${mod}')))"`, (err, stdout, stderr) => {
        if (err) return cb([])
        cb(JSON.parse(stdout.replace(/'/g, `"`)).filter(x => x.slice(0, 2) != '__'))
    })
}

// NodeJs 代码提示，所有在沙箱内支持的对象
getNodeJsCommand = () => {
    var obj = getSandboxFuns()
    obj.Buffer = Buffer
    obj.quickcommand.payload = ''
    return obj
}

htmlEncode = (value, raw) => {
    return raw ? String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;") : value
}

py_beautify = (code, cb) => {
    var file = getQuickCommandScriptFile('py')
    fs.writeFile(file, code, { encoding: 'utf8' }, err => {
        var cmd = `python "${fofoCommon.GetFilePath('assets/plugins', 'autopep8.py')}" "${file}"`
        child_process.exec(cmd, { encoding: "buffer" }, (err, stdout, stderr) => {
            var codec = utools.isWindows() ? 'cp936' : 'utf8'
            cb(iconv.decode(stdout, codec).trim())
        })
    })
}

getQuickCommandScriptFile = ext => {
    return path.join(os.tmpdir(), `QuickCommandTempScript.${ext}`)
}

getBase64Ico = path => {
    return fs.readFileSync(path, 'base64');
}

getFileInfo = options => {
    var file
    if (options.type == 'file') {
        file = options.argvs
    } else if (options.type == 'dialog') {
        var dialog = utools.showOpenDialog(options.argvs);
        if (!dialog) return false
        file = dialog[0]
    } else {
        return false
    }
    var information = {
        name: path.basename(file),
        ext: path.extname(file),
        path: file
    }
    if (options.readfile) {
        var codec = (information.ext == '.bat' || information == '.ps1') ? 'gbk' : 'utf8'
        information.data = iconv.decode(fs.readFileSync(file), codec)
    }
    return information
}

getCurrentFolderPathFix = () => {
    let pwd = utools.getCurrentFolderPath()
    let pwdFix = pwd ? pwd : path.join(utools.getPath('home'), 'desktop')
    return pwdFix.replace(/\\/g, '\\\\')
}

saveFile = (options, content) => {
    var filename = utools.showSaveDialog(options)
    filename && fs.writeFile(filename, content, 'utf8', err => {
        err && console.log(err)
    })
}

// 保存剪贴板
// storeClip = () => {
//     var formats = electron.clipboard.availableFormats("clipboard");
//     if (formats.includes("text/plain")) {
//         return ['text', electron.clipboard.readText()]
//     }
//     if (formats.includes("image/png") || formats.includes("image/jpeg")) {
//         return ['image', electron.clipboard.readImage()]
//     }
//     var file;
//     if (utools.isWindows()) {
//         file = electron.clipboard.readBuffer('FileNameW').toString('ucs2').replace(/\\/g, '/');
//         file = file.replace(new RegExp(String.fromCharCode(0), 'g'), '');
//     } else {
//         file = electron.clipboard.read('public.file-url').replace('file://', '');
//     }
//     if (file) {
//         return ['file', file]
//     }
//     return []
// }

// 恢复剪贴板
// restoreClip = historyData => {
//     if (historyData[0] == 'text') {
//         electron.clipboard.writeText(historyData[1]);
//         return
//     }
//     if (historyData[0] == 'image') {
//         electron.clipboard.writeImage(historyData[1]);
//         return
//     }
//     if (historyData[0] == 'file') {
//         utools.copyFile(historyData[1])
//         return
//     }
//     electron.clipboard.writeText('')
// }

// getSelectText = () => {
//     var historyData = storeClip();
//     electron.clipboard.writeText('');
//     quickcommand.simulateCopy();
//     var selectText = electron.clipboard.readText()
//     setTimeout(() => {
//         restoreClip(historyData)
//     }, 500);
//     return selectText
// }

getSelectFile = hwnd =>
    new Promise((reslove, reject) => {
        if (utools.isWindows()) {
            var cmd = `powershell.exe -NoProfile "(New-Object -COM 'Shell.Application').Windows() | Where-Object { $_.HWND -eq ${hwnd} } | Select-Object -Expand Document | select @{ n='SelectItems'; e={$_.SelectedItems()} }  | select -Expand SelectItems | select -Expand Path "`;
            child_process.exec(cmd, { encoding: "buffer" }, (err, stdout, stderr) => {
                if (err) reject(stderr)
                reslove(iconv.decode(stdout, 'GBK').trim().replace(/\\/g, '/'));
            })
        } else {
            var cmd = `osascript -e 'tell application "Finder" to set selectedItems to selection as alias list
            if selectedItems is {} then return
            set parentPath to do shell script "dirname " & quoted form of POSIX path of (item 1 of selectedItems)
            set pathData to ""
            repeat with theItem in selectedItems
                set pathData to pathData & POSIX path of theItem & linefeed
            end repeat
            '
            `
            child_process.exec(cmd, (err, stdout, stderr) => {
                if (err) reject(stderr)
                reslove(stdout.trim());
            });
        }
    })   

special = cmd => {
    // 判断是否 windows 系统
    if (cmd.includes('{{isWin}}')) {
        let repl = utools.isWindows() ? 1 : 0;
        cmd = cmd.replace(/\{\{isWin\}\}/mg, repl)
    }

    // 获取本机唯一ID
    if (cmd.includes('{{LocalId}}')) {
        let repl = utools.getLocalId();
        cmd = cmd.replace(/\{\{LocalId\}\}/mg, repl)
    }

    // 获取浏览器当前链接
    if (cmd.includes('{{BrowserUrl}}')) {
        let repl = utools.getCurrentBrowserUrl();
        cmd = cmd.replace(/\{\{BrowserUrl\}\}/mg, repl)
    }

    // 获取剪切板的文本
    if (cmd.includes('{{ClipText}}')) {
        let repl = electron.clipboard.readText();
        cmd = cmd.replace(/\{\{ClipText\}\}/mg, repl)
    }

    // 获取选中的文本
    // if (cmd.includes('{{SelectText}}')) {
    //     let repl = getSelectText();
    //     cmd = cmd.replace(/\{\{SelectText\}\}/mg, repl)
    // }
    return cmd;
}

runCodeFile = (cmd, option, terminal, callback) => {
    var bin = option.bin,
        argv = option.argv,
        ext = option.ext,
        scptarg = option.scptarg || "";
    let script = getQuickCommandScriptFile(ext)
    // 批处理和 powershell 默认编码为 GBK, 解决批处理的换行问题
    if (ext == 'bat' || ext == 'ps1') cmd = iconv.encode(cmd.replace(/\n/g, '\r\n'), 'GBK');
    fs.writeFileSync(script, cmd);
    // var argvs = [script]
    // if (argv) {
    //     argvs = argv.split(' ')
    //     argvs.push(script);
    // }
    var child, cmdline
    if (bin.slice(-7) == 'csc.exe') {
        cmdline = `${bin} ${argv} /out:"${script.slice(0, -2) + 'exe'}" "${script}" && "${script.slice(0, -2) + 'exe'}" ${scptarg}`
    } else if (bin == 'gcc') {
        var suffix = utools.isWindows() ? '.exe' : ''
        cmdline = `${bin} ${argv} "${script.slice(0, -2)}" "${script}" && "${script.slice(0, -2) + suffix}" ${scptarg}`
    } else if (utools.isWindows() && bin == 'bash') {
        cmdline = `${bin} ${argv} "${script.replace(/\\/g, '/').replace(/C:/i, '/mnt/c')}" ${scptarg}`
    } else {
        cmdline = `${bin} ${argv} "${script}" ${scptarg}`
    }
    // 在终端中输出
    if (terminal) {
        if (utools.isWindows()) {
            if (bin.slice(-7) == 'csc.exe' || bin == 'gcc') {
                cmdline = cmdline.split("&&")
                cmdline = cmdline[0] + "&& start cmd /k " + cmdline[1]
            } else {
                cmdline = `start cmd /k ${cmdline}`
            }
        } else if(utools.isMacOs()){
            var appleScript = `if application "Terminal" is running then 
            tell application "Terminal"   
                do script "clear;${cmdline.replace(/"/g, `\\"`)}"             
                activate                          
            end tell                              
        else                                      
            tell application "Terminal"   
                do script "clear;${cmdline.replace(/"/g, `\\"`)}" in window 1 
                activate
            end tell
        end if`;
            cmdline = `osascript -e '${appleScript}'`
        } else {
            return message('Linux 不支持在终端输出')
        }
    }
    child = child_process.spawn(cmdline, { encoding: 'buffer', shell: true })            
    // var chunks = [],
    //     err_chunks = [];
    console.log('running: ' + cmdline);
    child.stdout.on('data', chunk => {
        if (option.codec) chunk = iconv.decode(chunk, option.codec)
        callback(chunk.toString(), null)
        // chunks.push(chunk)
    })
    child.stderr.on('data', stderr => {
        if (option.codec) stderr = iconv.decode(stderr, option.codec)
        callback(null, stderr.toString())
        // err_chunks.push(err_chunk)
    })
    // child.on('close', code => {
    //     let stdout = chunks.join("");
    //     let stderr = err_chunks.join("");
    //     callback(stdout, stderr)
    // })
}