utools.getAppVersion() < '2.6.1' && alert('请升级 uTools 至最新版本');
// -----------------------------------------------------------------
const fs = require('fs');
const os = require('os');
const child_process = require("child_process")
const iconv = require('iconv-lite')
const electron = require('electron')
const path = require("path")
const axios = require('axios');
const http = require('http');
const url = require('url')
const kill = require('tree-kill')
require('ses')

window._ = require("lodash")
window.getuToolsLite = require("./lib/utoolsLite")
window.yuQueClient = axios.create({
    baseURL: 'https://www.yuque.com/api/v2/',
    headers: {
        'Content-Type': 'application/json',
        // 只读权限
        'X-Auth-Token': 'WNrd0Z4kfCZLFrGLVAaas93DZ7sbG6PirKq7VxBL'
    }
});

// axios.defaults.adapter = require('axios/lib/adapters/http')

if (!utools.isWindows()) process.env.PATH += ':/usr/local/bin:/usr/local/sbin'

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

const ctlKey = utools.isMacOs() ? 'command' : 'control'

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

    // 关闭进程
    kill: function(pid, signal = 'SIGTERM', cb) {
        kill(pid, signal, cb)
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
    loadRemoteScript: async function(url) {
        if (!/^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/.test(url)) throw 'url 不合法'
        let local = getQuickcommandTempFile('js')
        await this.downloadFile(url, local)
        let source = require(local)
        fs.unlinkSync(local)
        return source
    },

    // 唤醒 uTools
    wakeUtools: function() {
        let uToolsPath = utools.isMacOs() ?
            process.execPath.replace(/\/Frameworks\/.*/, "/MacOS/uTools") :
            process.execPath
        child_process.exec(uToolsPath, () => {})
    },

    readClipboard: function() {
        return electron.clipboard.readText()
    },

    writeClipboard: function(text) {
        electron.clipboard.writeText(text)
    }
}

// 运行vbs脚本
if (process.platform == 'win32') quickcommand.runVbs = function(script) {
    return new Promise((reslove, reject) => {
        var tempfile = getQuickcommandTempFile('vbs', 'TempVBSScript')
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

// python -c
window.runPythonCommand = py => {
    try {
        let result = child_process.execFileSync("python", ["-c", py], {
            windowsHide: true,
            encoding: 'buffer'
        })
        return iconv.decode(result, utools.isWindows() ? 'gbk' : 'utf8').trim()
    } catch (e) {
        alert(e)
        return ""
    }
}

// 在终端中执行
if (process.platform !== 'linux') quickcommand.runInTerminal = function(cmdline, dir) {
    let command = getCommandToLaunchTerminal(cmdline, dir)
    child_process.exec(command)
}

let getCommandToLaunchTerminal = (cmdline, dir) => {
    let cd, command;
    if (utools.isWindows()) {
        let appPath = path.join(utools.getPath('home'), '/AppData/Local/Microsoft/WindowsApps/');
        // 直接 existsSync wt.exe 无效
        if (fs.existsSync(appPath) && fs.readdirSync(appPath).includes('wt.exe')) {
            cmdline = cmdline.replace(/"/g, `\\"`);
            cd = dir ? `-d "${dir.replace(/\\/g, '/')}"` : '';
            command = `${appPath}wt.exe ${cd} cmd /k "${cmdline}"`;
        } else {
            cmdline = cmdline.replace(/"/g, `^"`);
            cd = dir ? `cd /d "${dir.replace(/\\/g, '/')}" &&` : '';
            command = `${cd} start "" cmd /k "${cmdline}"`;
        }
    } else if (utools.isMacOs()) {
        cmdline = cmdline.replace(/"/g, `\\"`);
        cd = dir ? `cd ${dir.replace(/ /g, '\\\\ ')} &&` : '';
        command = fs.existsSync('/Applications/iTerm.app') ?
            `osascript -e 'tell application "iTerm"
            create window with default profile
            tell current session of current window to write text "clear && ${cd} ${cmdline}"
    end tell'` :
            `osascript -e 'tell application "Terminal"
          do script "clear && ${cd} ${cmdline}"
        activate
    end tell'`;

    }
    return command;
}

window.pluginInfo = () => {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'plugin.json')))
}

let getSleepCodeByShell = ms => {
    var cmd, tempFilePath
    if (utools.isWindows()) {
        tempFilePath = getQuickcommandTempFile('vbs', 'SleepVBSScript')
        cmd = `echo set ws=CreateObject("Wscript.Shell") > ${tempFilePath} && echo Wscript.sleep ${ms} >> ${tempFilePath} && cscript /nologo ${tempFilePath}`
    } else {
        cmd = `sleep ${ms / 1000}`
    }
    return cmd
}

window.htmlEncode = (value) => {
    let dom = quickcommand.htmlParse().querySelector('body')
    dom.innerText = value
    return dom.innerHTML
}

window.removeHtmlTags = value => {
    return quickcommand.htmlParse(value).querySelector('body').innerText
}

window.hexEncode = text => Buffer.from(text, 'utf8').toString('hex')
window.hexDecode = text => Buffer.from(text, 'hex').toString('utf8')
window.base64Decode = text => Buffer.from(text, 'base64').toString('utf8')

window.processPlatform = process.platform
window.joinPath = path.join

window.getUtoolsPlugins = () => {
    let root = utools.isMacOs() ?
        path.join(os.homedir(), 'Library/Application Support/uTools/plugins/') :
        (utools.isWindows() ?
            path.join(os.homedir(), 'AppData/Roaming/uTools/plugins') :
            path.join(os.homedir(), '.config/uTools/plugins'))
    let plugins = {};
    let files = fs.readdirSync(root);
    let deleted = path.join(root, "deleted");
    let deletedList = fs.existsSync(deleted) ?
        fs.readFileSync(path.join(root, "deleted"), "utf8").split("|") : [];
    files.forEach((file) => {
        if (/[a-zA-Z0-9\-]+\.asar$/.test(file) && !deletedList.includes(file)) {
            let pluginInfo = JSON.parse(
                fs.readFileSync(path.join(root, file, "plugin.json"))
            );
            pluginInfo.logoPath = path.join(root, file, pluginInfo.logo);
            let keyWordFeatures = [];
            pluginInfo.features.forEach((f) => {
                f.cmds.some((c) => {
                    c.length && (keyWordFeatures.push(c));
                    return true;
                });
            });
            if (!_.isEmpty(keyWordFeatures)) {
                pluginInfo["keyWordFeatures"] = keyWordFeatures
                plugins[pluginInfo.pluginName] = pluginInfo
            }
        }
    });
    return plugins;
}

window.getQuickcommandTempFile = (ext, name, dir = 'quickcommandTempDir') => {
    if (!name) name = new Date().getTime() + (Math.random() * 10 ** 6).toFixed()
    let tempDir = path.join(os.tmpdir(), dir)
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir)
    return path.join(tempDir, `${name}.${ext}`)
}

window.delTempFile = (...args) => {
    let tmpPath = path.join(os.tmpdir(), ...args)
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath)
}

window.getBase64Ico = filepath => {
    let sourceImage, ext = path.extname(filepath).slice(1)
    if (['png', 'jpg', 'jpeg', 'bmp', 'ico', 'gif', 'svg'].includes(ext)) {
        if (ext == 'svg') ext = 'svg+xml'
        sourceImage = `data:image/${ext};base64,` + fs.readFileSync(filepath, 'base64')
        if (ext == 'png') return sourceImage
    } else {
        sourceImage = utools.getFileIcon(filepath)
        return sourceImage
    }
    return sourceImage
}

window.getFileInfo = options => {
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

window.getCurrentFolderPathFix = () => {
    let pwd = utools.getCurrentFolderPath()
    let pwdFix = pwd ? pwd : path.join(utools.getPath('home'), 'desktop')
    return pwdFix.replace(/\\/g, '\\\\')
}

window.saveFile = (content, file) => {
    if (file instanceof Object) file = utools.showSaveDialog(file)
    if (!file) return false
    try {
        fs.writeFileSync(file, content)
        return true
    } catch (error) {
        return false
    }
}

window.getSelectFile = hwnd => {
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
        return result ? result.trim() : ""
    }
}

let runUbrowser = path => {
    utools.ubrowser.goto(path).run({
        width: 1380,
        height: 750
    });
}

const docsRepoUrl = 'https://www.yuque.com/fofolee/mwsoos'

window.showUb = {
    help: function(path = '') {
        runUbrowser(docsRepoUrl + '/bg31vl' + path)
    },
    docs: function(path = '') {
        runUbrowser(docsRepoUrl + '/pt589p' + path)
    }
}

window.clipboardReadText = () => electron.clipboard.readText()

window.convertFilePathToUtoolsPayload = files => files.map(file => {
    let isFile = fs.statSync(file).isFile()
    return {
        isFile: isFile,
        isDirectory: !isFile,
        name: path.basename(file),
        path: file
    }
})

let getSandboxFuns = () => {
    var sandbox = {
        fetch: fetch.bind(window),
        utools: getuToolsLite(),
        electron,
        axios,
        Audio,
        _,
        AbortController,
        AbortSignal,
        Buffer,
        require,
        // 兼容老版本
        fs,
        path,
        os,
        child_process,
    }
    shortCodes.forEach(f => {
        sandbox[f.name] = f
    })
    return sandbox
}

// 简化报错信息
let liteErr = e => {
    if (!e) return
    return e.error ? e.error.stack.replace(/([ ] +at.+)|(.+\.js:\d+)/g, '').trim() : e.message
}

// vm 模块将无法在渲染进程中使用，改用 ses 来执行代码
window.evalCodeInSandbox = (code, addVars = {}) => {
    let sandboxWithAD = Object.assign(addVars, getSandboxFuns())
    sandboxWithAD.quickcommand = _.cloneDeep(quickcommand)
    try {
        return new Compartment(sandboxWithAD).evaluate(code);
    } catch (error) {
        throw liteErr(error)
    }
}

let isWatchingError = false
window.runCodeInSandbox = (code, callback, addVars = {}) => {
    let sandbox = getSandboxFuns()
    sandbox.console = {
        log: (...stdout) => {
            console.log("Result:", stdout);
            callback(stdout, null)
        },
        error: (...stderr) => {
            callback(null, stderr)
        }
    }
    let sandboxWithAD = Object.assign(addVars, sandbox)
    sandboxWithAD.quickcommand = _.cloneDeep(quickcommand)
    if (addVars.enterData) {
        sandboxWithAD.quickcommand.enterData = addVars.enterData
        sandboxWithAD.quickcommand.payload = addVars.enterData.payload
    }
    try {
        new Compartment(sandboxWithAD).evaluate(code)
    } catch (e) {
        console.log('Error: ', e)
        callback(null, liteErr(e))
    }
    // 自动捕捉错误
    let cbUnhandledError = e => {
        removeAllListener()
        console.log('UnhandledError: ', e)
        callback(null, liteErr(e))
    }

    let cbUnhandledRejection = e => {
        removeAllListener()
        console.log('UnhandledRejection: ', e)
        callback(null, liteErr(e.reason))
    }

    let removeAllListener = () => {
        window.removeEventListener('error', cbUnhandledError)
        window.removeEventListener('unhandledrejection', cbUnhandledRejection)
        isWatchingError = false
    }

    if (!isWatchingError) {
        window.addEventListener('error', cbUnhandledError)
        window.addEventListener('unhandledrejection', cbUnhandledRejection)
        isWatchingError = true
    }
}

window.runCodeFile = (cmd, option, terminal, callback) => {
    var bin = option.bin,
        argv = option.argv,
        ext = option.ext,
        charset = option.charset,
        scptarg = option.scptarg || "";
    let script = getQuickcommandTempFile(ext, 'quickcommandTempScript')
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
    console.log('Running: ' + cmdline);
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
    return child
}

let httpServer
window.quickcommandHttpServer = () => {
    let run = (cmd = '', port = 33442) => {
        let httpResponse = (res, code, result) => {
            // 只收受一次 console.log，接收后就关闭连接
            if (res.finished) return
            res.writeHead(code, {
                'Content-Type': 'text/html'
            });
            if (result) res.write(result);
            res.end();
        }
        let runUserCode = (res, cmd, userVars) => {
            // 不需要返回输出的提前关闭连接
            if (!cmd.includes('console.log')) httpResponse(res, 200)
            window.runCodeInSandbox(cmd, (stdout, stderr) => {
                // 错误返回 500
                if (stderr) return httpResponse(res, 500, stderr)
                return httpResponse(res, 200, stdout)
            }, userVars)
        }
        httpServer = http.createServer()
        httpServer.on('request', (req, res) => {
            if (req.method === 'GET') {
                let parsedParams = _.cloneDeep(url.parse(req.url, true).query)
                runUserCode(res, cmd, parsedParams)
            } else if (req.method === 'POST') {
                let data = []
                req.on('data', (chunk) => {
                    data.push(chunk)
                })
                req.on('end', () => {
                    let parsedParams
                    let params = data.join("").toString()
                        // 先尝试作为 json 解析
                    try {
                        parsedParams = JSON.parse(params)
                    } catch (error) {
                        parsedParams = _.cloneDeep(url.parse('?' + params, true).query)
                    }
                    runUserCode(res, cmd, parsedParams)
                })
            } else {
                httpResponse(res, 405)
            }
        })
        httpServer.listen(port, 'localhost');
        httpServer.on('error', err => {
            console.log('httpErr:', err)
        })
    }
    let stop = () => {
        if (!httpServer) return
        httpServer.close()
    }
    return {
        run,
        stop
    }
}
