const fs = require('fs');
const os = require('os');
const child_process = require("child_process")
const iconv = require('iconv-lite')
const electron = require('electron')
const {
    NodeVM
} = require('./lib/vm2')
const path = require("path")
const util = require("util")
const PinyinMatch = require('pinyin-match');
const axios = require('axios');

_ = require("lodash")
window.pinYinMatch = PinyinMatch

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

window.quickcommand = {
    // 模拟复制操作
    simulateCopy: function() {
        utools.simulateKeyboardTap('c', ctlKey);
    },

    // 模拟粘贴操作
    simulatePaste: function() {
        utools.simulateKeyboardTap('v', ctlKey);
    },

    // setTimout 不能在 vm2 中使用，同时在 electron 中有 bug
    sleep: function(ms) {
        var start = new Date().getTime()
        try {
            // node 16.13.1
            child_process.execSync(getSleepCodeByShell(ms), {
                timeout: ms,
                windowsHide: true
            })
        } catch (ex) {}
        var end = new Date().getTime()
        return (end - start)
    },

    // 重写 setTimeout
    setTimeout: function(callback, ms) {
        var start = new Date().getTime()
        child_process.exec(getSleepCodeByShell(ms), {
            timeout: ms
        }, (err, stdout, stderr) => {
            var end = new Date().getTime()
            callback(end - start)
        })
    },

    // 显示选项列表
    showSelectList: function(selects, opt = {}) {
        return new Promise((reslove, reject) => {})
    },
    // 更新选项列表
    updateSelectList: function(opt, id) {

    },

    // 关闭进程
    kill: function(pid, signal = 'SIGTERM') {
        process.kill(pid, signal)
    },

    // dom 解析
    htmlParse: function(html) {
        return new DOMParser().parseFromString(html, 'text/html')
    },

    // 下载文件
    downloadFile: function(url, file = {}) {
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
    uploadFile: function(url, file = {}, name = 'file', formData = {}) {
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
    loadRemoteScript: async function(url, forceUpdate = false) {
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
if (process.platform == 'win32') quickcommand.runVbs = function(script) {
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
if (process.platform !== 'linux') quickcommand.runInTerminal = function(cmdline, dir) {
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


let GetFilePath = (Path, File) => {
    if (utools.isDev()) {
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

// 屏蔽危险函数
getuToolsLite = () => {
    var utoolsLite = Object.assign({}, utools)
    if (utools.isDev()) return utoolsLite
    // 数据库相关接口
    delete utoolsLite.db
    delete utoolsLite.dbStorage
    delete utoolsLite.removeFeature
    delete utoolsLite.setFeature
    delete utoolsLite.onDbPull
    // 支付相关接口
    delete utoolsLite.fetchUserServerTemporaryToken
    delete utoolsLite.getUserServerTemporaryToken
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
        Audio: Audio,
        fetch: fetch
    }
    shortCodes.forEach(f => {
        sandbox[f.name] = f
    })
    return sandbox
}

let createNodeVM = () => {
    var sandbox = getSandboxFuns()
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
            try {
                return stringifyAll(item)
            } catch (error) {}
        }
    } else if (typeof item == "undefined") {
        return "undefined"
    }
    return item.toString()
}

// The vm module of Node.js is deprecated in the renderer process and will be removed
runCodeInVm = (cmd, cb) => {
    const vm = createNodeVM()
    //重定向 console
    vm.on('console.log', stdout => {
        console.log(stdout);
        cb(parseItem(stdout), null)
    });

    vm.on('console.error', stderr => {
        cb(null, stderr.toString())
    });

    let liteErr = e => {
        if (!e) return
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


htmlEncode = (value) => {
    return String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
}

hexEncode = text => Buffer.from(text, 'utf8').toString('hex')
hexDecode = text => Buffer.from(text, 'hex').toString('utf8')

py_beautify = (code, cb) => {
    var file = getQuickcommandTempFile('py')
    fs.writeFile(file, code, {
        encoding: 'utf8'
    }, err => {
        var cmd = `python "${GetFilePath('assets/plugins', 'autopep8.py')}" "${file}"`
        child_process.exec(cmd, {
            encoding: "buffer"
        }, (err, stdout, stderr) => {
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
    let compressedImage = await pictureCompress({
        img: img,
        width: width,
        height: width,
        type: 'png',
        quality: 1
    })
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

getMatchedFilesFix = payload => {
    let MatchedFiles = payload
    let Matched = cmd.match(/\{\{MatchedFiles(\[\d+\]){0,1}(\.\w{1,11}){0,1}\}\}/g)
    Matched && Matched.forEach(m => {
        repl = eval(m.slice(2, -2))
        typeof repl == 'object' ? (repl = JSON.stringify(repl)) : (repl = repl.replace('\\', '\\\\'))
        cmd = cmd.replace(m, repl.replace('$', '$$$'))
    })
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

getSelectFile = hwnd => {
    if (utools.isWindows()) {
        var cmd = `powershell.exe -NoProfile "(New-Object -COM 'Shell.Application').Windows() | Where-Object { $_.HWND -eq ${hwnd} } | Select-Object -Expand Document | select @{ n='SelectItems'; e={$_.SelectedItems()} }  | select -Expand SelectItems | select -Expand Path "`;
        let result = child_process.execSync(cmd, {
            encoding: "buffer",
            windowsHide: true
        })
        return iconv.decode(result, 'GBK').trim().replace(/\\/g, '/');
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
        let result = child_process.execSync(cmd, {
            encoding: "utf8",
            windowsHide: true
        })
        console.log(result);
        return result ? result.trim() : ""
    }
}

clipboardReadText = () => electron.clipboard.readText()

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
    child = child_process.spawn(cmdline, {
        encoding: 'buffer',
        shell: true
    })
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