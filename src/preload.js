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

ctlKey = utools.isMacOs() ? 'command' : 'control'

quickcommand = {
    // 模拟复制操作
    simulateCopy: function () {
        utools.simulateKeyboardTap('c', ctlKey);
    },

    // 模拟粘贴操作
    simulatePaste: function () {
        utools.simulateKeyboardTap('v', ctlKey);
    },

    // setTimout 不能在 vm2 中使用，同时在 electron 中有 bug
    sleep: function (ms) {
        var start = new Date().getTime()
        try {
            // node 16.13.1
            child_process.execSync(getSleepCodeByShell(ms), { timeout: ms, windowsHide: true })
        } catch (ex) { }
        var end = new Date().getTime()
        return (end - start)
    },

    // 重写 setTimeout
    setTimeout: function (callback, ms) {
        var start = new Date().getTime()
        child_process.exec(getSleepCodeByShell(ms), { timeout: ms }, (err, stdout, stderr) => {
            var end = new Date().getTime()
            callback(end - start)
        })
    },

    // 显示输入框
    showInputBox: function (placeHolders = [""], title = '') {
        return new Promise((reslove, reject) => {
            if (!(placeHolders instanceof Array)) placeHolders = [placeHolders.toString()]
            utools.setExpendHeight(550)
            var html = ""
            var inputBoxNumbers = placeHolders.length
            for (let i = 0; i < inputBoxNumbers; i++) {
                html += `<input class="swal2-input" id="inputBox${i}" placeholder="${placeHolders[i]}">`
            }
            var result = []
            var options = {
                onBeforeOpen: () => {
                    document.getElementById(`inputBox0`).focus()
                    $('.swal2-content').keydown(function (e) {
                        e.which == 13 && swal.clickConfirm()
                    })
                    $(".output").is(":parent") ? utools.setExpendHeight(550) : modWindowHeight($('.swal2-popup').outerHeight() + 20)
                },
                title: title,
                html: html,
                focusConfirm: false,
                showCancelButton: true,
                backdrop: utools.isDarkColors() ? '#ffffff26' : '#bbbbbb80',
                preConfirm: () => {
                    for (let i = 0; i < inputBoxNumbers; i++) {
                        result.push(document.getElementById(`inputBox${i}`).value)
                    }
                    reslove(result)
                }
            }
            swalOneByOne(options)
        });
    },

    // 显示选项按钮
    showButtonBox: function (buttons, title = '') {
        return new Promise((reslove, reject) => {
            if (!(buttons instanceof Array)) return reject(new TypeError(`应为 Array, 而非 ${typeof buttons}`))
            utools.setExpendHeight(550)
            var html = ``
            var buttonBoxNumbers = buttons.length
            for (let i = 0; i < buttonBoxNumbers; i++) {
                html += `<button class="swal2-confirm swal2-styled" style="width: 80%" onclick="clickButton(${i})">${buttons[i]}</button>`
            }
            var options = {
                onBeforeOpen: () => {
                    clickButton = i => {
                        reslove({ id: i, text: buttons[i] })
                        swal.clickConfirm()
                    }
                    $(".output").is(":parent") && utools.setExpendHeight(550) || modWindowHeight($('.swal2-popup').outerHeight() + 20)
                },
                html: html,
                title: title,
                backdrop: utools.isDarkColors() ? '#ffffff26' : '#bbbbbb80',
                showConfirmButton: false
            }
            swalOneByOne(options)
        });
    },

    // 显示自动消失的提示框
    showMessageBox: function (title, icon = "success", time = 3000) {
        var options = {
            icon: icon,
            title: title,
            toast: true,
            position: 'top',
            timer: time,
            showConfirmButton: false,
            // onBeforeOpen: () => {
            //     setTimeout(() => { Swal.clickConfirm() }, time);
            // }
        }
        swal.fire(options)
    },

    // 显示选项列表
    showSelectList: function (selects, opt = {}) {
        return new Promise((reslove, reject) => {
            if (!(selects instanceof Array)) return reject(new TypeError(`应为 Array, 而非 ${typeof selects}`))
            opt.optionType || (opt.optionType = 'plaintext')
            typeof opt.placeholder == 'undefined' && (opt.placeholder = "搜索，支持拼音")
            typeof opt.enableSearch == 'undefined' && (opt.enableSearch = true)
            if ($('#quickselect').length) $('#quickselect').remove()
            let cancelButton = opt.showCancelButton ? '<button class="circleButton">✕</button>' : ''
            $("body").append(`<div id="quickselect"><select id="selectBox"></select>${cancelButton}</div>`)
            let item, data = []
            selects.forEach((s, i) => {
                item = {}
                if (opt.optionType == 'json') {
                    item.text = ''
                    Object.keys(s).forEach(k => item[k] = s[k])
                    item.id = i
                    s.icon && (item.text += `<div class="icon"><img src="${s.icon}" onerror="this.src='./logo/quickcommand.png'"></div>`)
                    s.title && (item.text += `<div class="title">${s.title}</div>`)
                    s.description && (item.text += `<div class="description">${s.description}</div>`)
                } else {
                    item = { id: i, text: s }
                }
                data.push(item)
            })
            $('#selectBox').data('options', data)
            $('#selectBox').data('type', opt.optionType)
            var prefer = {
                // data: data,
                width: "100%",
                dropdownParent: $("#quickselect"),
                closeOnSelect: false,
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
            opt.optionType == 'plaintext' && $('.select2-results').css({ 'line-height': '40px' })
            modWindowHeight($('.select2-results').outerHeight())
            opt.enableSearch && utools.setSubInput(({ text }) => {
                $("#quickselect .select2-search__field").val(text).trigger('input')
                modWindowHeight($('.select2-results').outerHeight())
            }, opt.placeholder)
            // 关闭列表
            let closeSelect = () => {
                $('#selectBox').off('select2:select')
                utools.removeSubInput()
                $("#quickselect").remove()
            }
            $('#selectBox').on('select2:select', function (e) {
                let result = $('#selectBox').data('options')[$(this).val()]
                delete result.selected
                closeSelect()
                reslove(result)
            })
            $('.circleButton').click(() => {
                closeSelect()
                reslove(false)
            })
        });
    },

    // 更新选项列表
    updateSelectList: function (opt, id) {
        if (!$('#selectBox').length) throw '当前没有选择列表, 请结合 quickcommand.showSelectList 使用'
        let data = $('#selectBox').data('options')
        let num = data.length
        typeof id == 'undefined' && (id = num)
        if (id > num) throw 'id 不能大于当前列表数'
        let optionType = $('#selectBox').data('type')
        let item = { id: id }
        if (optionType == 'json') {
            item.text = ''
            if (!(opt instanceof Object)) throw '更新的选项格式与当前的不一致'
            Object.keys(opt).forEach(k => item[k] = opt[k])
            opt.icon && (item.text += `<div class="icon"><img src="${opt.icon}"></div>`)
            opt.title && (item.text += `<div class="title">${opt.title}</div>`)
            opt.description && (item.text += `<div class="description">${opt.description}</div>`)
        } else {
            item.text = opt
        }
        data[id] && (data[id] = item) || data.push(item)
        $('#selectBox').data('options', data).val(null).trigger('change')
        $("#quickselect .select2-search__field").trigger('input')
        modWindowHeight($('.select2-results').outerHeight())
    },

    // 显示文本输入框
    showTextAera: function (placeholder = "", value = "") {
        return new Promise((reslove, reject) => {
            utools.setExpendHeight(550)
            var html = `
            <div id="quicktextarea">
                <textarea placeholder="${placeholder}">${value}</textarea>
                <button class="circleButton">✔</button>
            </div>`
            $("body").append(html)
            $("#quicktextarea").addClass("fadeInUpWindow")
            $(".circleButton").click(function () {
                $("#quicktextarea").addClass("fadeOutDownWindow")
                setTimeout(() => { $("#quicktextarea").remove() }, 300);
                reslove($("#quicktextarea > textarea").val())
            })
        });
    },

    showConfirmBox: async function (title) {
        let options = {
            text: title,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '确定！',
            cancelButtonText: '手抖...'
        }
        utools.setExpendHeight(550)
        let result = await Swal.fire(options)
        if (result.value) return true;
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
    downloadFile: function (url, file = {}) {
        return new Promise((reslove, reject) => {
            if (file instanceof Object) file = utools.showSaveDialog(JSON.parse(JSON.stringify(file)))
            axios({
                method: 'get',
                url: url,
                responseType: 'arraybuffer'
            }).then(res => {
                var filebuffer = Buffer.from(res.data)
                fs.writeFile(file, filebuffer, err => {
                    if (err) reject(err)
                    else reslove(filebuffer)
                })
            }).catch(err => {
                reject(err)
            })
        })
    },

    // 上传文件
    uploadFile: function (url, file = {}, name = 'file', formData = {}) {
        return new Promise((reslove, reject) => {
            var objfile
            if (file instanceof File) {
                objfile = file
            } else {
                if (file instanceof Object) file = utools.showOpenDialog(JSON.parse(JSON.stringify(file)))[0]
                if (!fs.existsSync(file)) return reject('文件不存在')
                var arraybuffer = fs.readFileSync(file).buffer
                var objfile = new File([arraybuffer], path.basename(file))
            }
            var form = new FormData();
            form.append(name, objfile)
            var keys = Object.keys(formData)
            if (keys.length) keys.forEach(k => form.append(k, formData[k]))
            axios.post(url, form, {
                headers: {
                    'accept': 'application/json',
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                }
            }).then(res => {
                reslove(res)
            }).catch(err => {
                reject(err)
            })
        })
    },

    // 载入在线资源
    loadRemoteScript: async function (url, forceUpdate = false) {
        if (!/^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/.test(url)) throw 'url 不合法'
        let remote = url
        let root = path.join(os.tmpdir(), 'qcRemoteScript')
        if (!fs.existsSync(root)) fs.mkdirSync(root)
        let local = path.join(root, require('crypto').createHash('md5').update(url).digest('hex'))
        if (forceUpdate || !fs.existsSync(local)) await this.downloadFile(remote, local)
        return require(local)
    }
}

// 运行vbs脚本
if (process.platform == 'win32') quickcommand.runVbs = function (script) {
    return new Promise((reslove, reject) => {
        var tempfile = path.join(os.tmpdir(), 'TempVBSScript.vbs')
        fs.writeFile(tempfile, iconv.encode(script, 'gbk'), err => {
            child_process.exec(`cscript.exe /nologo "${tempfile}"`, {
                encoding: "buffer"
            }, (err, stdout, stderr) => {
                if (err) reject(iconv.decode(stderr, 'gbk'))
                else reslove(iconv.decode(stdout, 'gbk'))
            });
        })
    })
}


// 在终端中执行
if (process.platform !== 'linux') quickcommand.runInTerminal = function (cmdline, dir) {
    let command = getCommandToLaunchTerminal(cmdline, dir)
    child_process.exec(command)
}

let getCommandToLaunchTerminal = (cmdline, dir) => {
    let cd = ''
    if (utools.isWindows()) {
        let appPath = path.join(utools.getPath('home'), '/AppData/Local/Microsoft/WindowsApps/')
        // 直接 existsSync wt.exe 无效
        if (fs.existsSync(appPath) && fs.readdirSync(appPath).includes('wt.exe')) {
            cmdline = cmdline.replace(/"/g, `\\"`)
            if (dir) cd = `-d "${dir.replace(/\\/g, '/')}"`
            command = `${appPath}wt.exe ${cd} cmd /k "${cmdline}"`
        } else {
            cmdline = cmdline.replace(/"/g, `^"`)
            if (dir) cd = `cd /d "${dir.replace(/\\/g, '/')}" &&`
            command = `${cd} start "" cmd /k "${cmdline}"`
        }
    } else {
        cmdline = cmdline.replace(/"/g, `\\"`)
        if (dir) cd = `cd ${dir.replace(/ /g, `\\\\ `)} &&`
        if (fs.existsSync('/Applications/iTerm.app')) {
            command = `osascript -e 'tell application "iTerm"
            create window with default profile
            tell current session of current window to write text "clear && ${cd} ${cmdline}"
    end tell'`
        } else {
            command = `osascript -e 'tell application "Terminal"
        do script "clear && ${cd} ${cmdline}"
        activate
    end tell'`
        }
    }
    console.log(command);
    return command
}

swalOneByOne = options => {
    swal.getQueueStep() ? Swal.insertQueueStep(options) : Swal.queue([options])
}

pluginInfo = () => {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'plugin.json')))
}

isDev = () => {
    return /[a-zA-Z0-9\-]+\.asar/.test(__dirname) ? false : true
}

let GetFilePath = (Path, File) => {
    if (isDev()) {
        return path.join(__dirname, Path, File)
    } else {
        return path.join(__dirname.replace(/([a-zA-Z0-9\-]+\.asar)/, '$1.unpacked'), Path, File)
    }
}

let getSleepCodeByShell = ms => {
    var cmd, tempFilePath
    if (utools.isWindows()) {
        tempFilePath = getQuickcommandTempFile('vbs')
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
getuToolsLite = () => {
    var utoolsLite = Object.assign({}, utools)
    // 数据库相关接口
    delete utoolsLite.db
    delete utoolsLite.dbStorage
    delete utoolsLite.removeFeature
    delete utoolsLite.setFeature
    // 支付相关接口
    delete utoolsLite.fetchUserServerTemporaryToken
    delete utoolsLite.getUser
    delete utoolsLite.openPayment
    delete utoolsLite.fetchUserPayments
    return utoolsLite
}

let getSandboxFuns = () => {
    var sandbox = {
        utools: getuToolsLite(),
        quickcommand: quickcommand,
        electron: electron,
        fs: fs,
        path: path,
        os: os,
        child_process: child_process,
        util: util,
        TextDecoder: TextDecoder,
        TextEncoder: TextEncoder,
        URL: URL,
        URLSearchParams: URLSearchParams,
        axios: axios,
        alert: alert,
        confirm: confirm,
        Audio: Audio,
        fetch: fetch
    }
    shortCodes.forEach(f => {
        sandbox[f.name] = f
    })
    return sandbox
}

let createNodeVM = (enterData = {}) => {
    var sandbox = getSandboxFuns()
    sandbox.quickcommand.enterData = enterData
    sandbox.quickcommand.payload = enterData.payload
    const vm = new NodeVM({
        require: {
            external: true,
            builtin: ["*"],
        },
        console: 'redirect',
        env: process.env,
        sandbox: sandbox,
    });
    return vm
}

let stringifyAll = item => {
    var cache = [];
    var string = JSON.stringify(item, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) return
            cache.push(value);
        }
        return value;
    }, '\t')
    if (string != "{}") return string
    else return item.toString()
}

let parseItem = item => {
    if (typeof item == "object") {
        if (Buffer.isBuffer(item)) {
            var bufferString = `[Buffer ${item.slice(0, 50).toString('hex').match(/\w{1,2}/g).join(" ")}`
            if (item.length > 50) bufferString += `... ${(item.length / 1000).toFixed(2)}kb`
            return bufferString + ']'
        } else if (item instanceof ArrayBuffer) {
            return `ArrayBuffer(${item.byteLength})`
        } else if (item instanceof Blob) {
            return `Blob {size: ${item.size}, type: "${item.type}"}`
        } else {
            try { return stringifyAll(item) }
            catch (error) { }
        }
    } else if (typeof item == "undefined") {
        return "undefined"
    }
    return item.toString()
}

// The vm module of Node.js is deprecated in the renderer process and will be removed
runCodeInVm = (cmd, cb, enterData = {}) => {
    const vm = createNodeVM(enterData)
    //重定向 console
    vm.on('console.log', stdout => {
        console.log(stdout);
        cb(parseItem(stdout), null)
    });

    vm.on('console.error', stderr => {
        cb(null, stderr.toString())
    });

    let liteErr = e => {
        return e.stack.replace(/([ ] +at.+)|(.+\.js:\d+)/g, '').trim()
    }

    // 错误处理
    try {
        vm.run(cmd, path.join(__dirname, 'preload.js'));
    } catch (e) {
        console.log('Error: ', e)
        cb(null, liteErr(e))
    }

    let cbUnhandledError = e => {
        removeAllListener()
        console.log('UnhandledError: ', e)
        cb(null, liteErr(e.error))
    }

    let cbUnhandledRejection = e => {
        removeAllListener()
        console.log('UnhandledRejection: ', e)
        cb(null, liteErr(e.reason))
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
    if (utools.isWindows()) return
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
    if (!utools.isWindows()) return
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
    obj.quickcommand.enterData = { code: '', type: '', payload: '' }
    return obj
}

htmlEncode = (value, raw = true) => {
    return raw ? String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;") : value
}

hexEncode = text => Buffer.from(text, 'utf8').toString('hex')
hexDecode = text => Buffer.from(text, 'hex').toString('utf8')

py_beautify = (code, cb) => {
    var file = getQuickcommandTempFile('py')
    fs.writeFile(file, code, { encoding: 'utf8' }, err => {
        var cmd = `python "${GetFilePath('assets/plugins', 'autopep8.py')}" "${file}"`
        child_process.exec(cmd, { encoding: "buffer" }, (err, stdout, stderr) => {
            var codec = utools.isWindows() ? 'cp936' : 'utf8'
            cb(iconv.decode(stdout, codec).trim())
        })
    })
}

processPlatform = process.platform

getQuickcommandTempFile = ext => {
    return path.join(os.tmpdir(), `quickcommandTempFile.${ext}`)
}

getBase64Ico = async filepath => {
    let sourceImage, ext = path.extname(filepath).slice(1)
    if (['png', 'jpg', 'jpeg', 'bmp', 'ico', 'gif', 'svg'].includes(ext)) {
        if (ext == 'svg') ext = 'svg+xml'
        sourceImage = `data:image/${ext};base64,` + fs.readFileSync(filepath, 'base64')
        if (ext == 'png') return sourceImage
    } else {
        sourceImage = utools.getFileIcon(filepath)
        return sourceImage
    }
    let compressedImage = await getCompressedIco(sourceImage)
    return compressedImage
}

getCompressedIco = async (img, width = 80) => {
    let compressedImage = await pictureCompress({ img: img, width: width, height: width, type: 'png', quality: 1 })
    return compressedImage.img
}

getDefaultCommands = () => {
    let baseDir = path.join(__dirname, 'defaults')
    let defaultCommands = {}
    fs.readdirSync(baseDir).forEach(f => {
        defaultCommands[f.slice(0, -5)] = path.join(baseDir, f)
    })
    return defaultCommands
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

saveFile = (content, file) => {
    if (file instanceof Object) {
        file = utools.showSaveDialog(file)
    }
    file && fs.writeFileSync(file, content)
}

yuQueClient = axios.create({
    baseURL: 'https://www.yuque.com/api/v2/',
    headers: {
        'Content-Type': 'application/json',
        // 只读权限
        'X-Auth-Token': 'WNrd0Z4kfCZLFrGLVAaas93DZ7sbG6PirKq7VxBL'
    }
});

getSelectFile = hwnd =>
    new Promise((reslove, reject) => {
        if (utools.isWindows()) {
            var cmd = `powershell.exe -NoProfile "(New-Object -COM 'Shell.Application').Windows() | Where-Object { $_.HWND -eq ${hwnd} } | Select-Object -Expand Document | select @{ n='SelectItems'; e={$_.SelectedItems()} }  | select -Expand SelectItems | select -Expand Path "`;
            child_process.exec(cmd, { encoding: "buffer" }, (err, stdout, stderr) => {
                if (err) reject(stderr)
                else reslove(iconv.decode(stdout, 'GBK').trim().replace(/\\/g, '/'));
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
                else reslove(stdout.trim());
            });
        }
    })

clipboardReadText = () => {
    return electron.clipboard.readText()
},

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
            let repl = clipboardReadText();
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
        charset = option.charset,
        scptarg = option.scptarg || "";
    let script = getQuickcommandTempFile(ext)
    // 批处理和 powershell 默认编码为 GBK, 解决批处理的换行问题
    if (charset.scriptCode) cmd = iconv.encode(cmd.replace(/\n/g, '\r\n'), charset.scriptCode);
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
    if (terminal) cmdline = getCommandToLaunchTerminal(cmdline)
    child = child_process.spawn(cmdline, { encoding: 'buffer', shell: true })
    // var chunks = [],
    //     err_chunks = [];
    console.log('running: ' + cmdline);
    child.stdout.on('data', chunk => {
        if (charset.outputCode) chunk = iconv.decode(chunk, charset.outputCode)
        callback(chunk.toString(), null)
        // chunks.push(chunk)
    })
    child.stderr.on('data', stderr => {
        if (charset.outputCode) stderr = iconv.decode(stderr, charset.outputCode)
        callback(null, stderr.toString())
        // err_chunks.push(err_chunk)
    })
    // child.on('close', code => {
    //     let stdout = chunks.join("");
    //     let stderr = err_chunks.join("");
    //     callback(stdout, stderr)
    // })
}
