const fs = require('fs');
const os = require('os');
const child_process = require("child_process")
const iconv = require('iconv-lite')
const electron = require('electron')
const { NodeVM } = require('vm2')
const path = require("path")
const util = require("util")

if (!utools.isWindows()) process.env.PATH += ':/usr/local/bin:/usr/local/sbin'

// window.startTime = new Date().getTime()

const QuickCommandActions = [

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
        return child_process.execSync(cmd);
    },

    message = msg => {
        utools.showNotification(msg)
    },

    keyTap = (key, ...modifier) => utools.simulateKeyboardTap(key, ...modifier),

    simulateCopy = () => {
        var ctlKey = utools.isMacOs() ? 'command' : 'control';
        utools.simulateKeyboardTap('c', ctlKey);
    },
    
    copyTo = text => {
        electron.clipboard.writeText(text)
    },
    
    simulatePaste = () => {
        var ctlKey = utools.isMacOs() ? 'command' : 'control';
        utools.simulateKeyboardTap('v', ctlKey);
    },
    
    send = text => {
        copyTo(text);
        simulatePaste();
    },

    // setTimout 不能在 vm2 中使用，同时在 electron 中有 bug
    sleep = ms => {
        var start = new Date().getTime()
        var cmd, tempFilePath
        if (utools.isWindows()) {
            tempFilePath = getQuickCommandScriptFile('vbs')
            cmd = `echo set ws=CreateObject("Wscript.Shell") > ${tempFilePath} && echo Wscript.sleep ${ms} >> ${tempFilePath} && cscript /nologo ${tempFilePath}`
        } else {
            cmd = `sleep ${ms / 1000}`
        }
        try {
            child_process.execSync(cmd, { timeout: ms, })
        } catch (ex) {
            if (ex.code !== 'ETIMEDOUT') {
              throw ex;
            }
          }
        var end = new Date().getTime()
        return (end - start)
    }
]

var getSandboxFuns = () => {
    var sandbox = {
        utools: utools,
        process: process,
        electron: electron,
        fs: fs,
        path: path,
        os: os,
        child_process: child_process,
        util: util,
        alert: alert,
        // Swal: Swal,
        $: {
            get: $.get,
            post: $.post,
            ajax: $.ajax
        }
    }
    QuickCommandActions.forEach(f => {
        sandbox[f.name] = f
    })
    return sandbox
}

runCodeInVm = (cmd, cb) => {
    const vm = new NodeVM({
        require: {
            external: true,
            builtin: ["*"],
        },
        console: 'redirect',
        env: process.env,
        sandbox: getSandboxFuns()
    });

    var parseItem = item => {
        if (typeof (item) == "object") {
            if (Buffer.isBuffer(item)) {
                var bufferString = `[Buffer ${item.slice(0, 50).toString('hex').match(/\w{1,2}/g).join(" ")}`
                if (item.length > 50) bufferString += `... ${(item.length/1000).toFixed(2)}kb`
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
    
    vm.on('console.log', stdout => {
        cb(parseItem(stdout), null)
    });

    vm.on('console.error', stderr => {
        cb(null, stderr.toString())
    });

    try {
        vm.run(`
            ${cmd}
            process.exitcode = 1
        `, path.join(__dirname, 'preload.js'));
    } catch (error) {
        cb(null, error.toString())
    }
}

// shell 以环境变量下命令作为代码提示
getShellCommand = () => {
    var bin = []
    if (!utools.isWindows()) {
        process.env.PATH.split(':').forEach(d => {
            try {
                bin = bin.concat(fs.readdirSync(d).filter(x => x[0] != "."))
            } catch (e) { }
        }) 
    }
    return bin
}

// cmd 以环境变量下命令作为代码提示
getCmdCommand = () => {
    var bin = []
    if (utools.isWindows()) {
        process.env.Path.split(';').forEach(d => {
            try {
                bin = bin.concat(fs.readdirSync(d).filter(x => x.length > 4 && x.slice(-4) == '.exe'))
            } catch (e) { }
        })  
        bin = bin.concat(bin).join("|").replace(/\.exe/g, '').split("|")
    }
    return bin
}

// NodeJs 代码提示
getNodeJsCommand = () => {
    var obj = getSandboxFuns()
    obj.Buffer = Buffer
    return obj
}

// isDev = /[a-zA-Z0-9\-]+\.asar/.test(__dirname) ? false : true
// readFile = fs.readFileSync
// writeFile = fs.writeFileSync
// dirname = __dirname;
// resolve = path.resolve;
// tmpdir = os.tmpdir(),
// exists = fs.existsSync;

htmlEncode = (value, raw) => {
    return raw ? String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;") : value
}

getQuickCommandScriptFile = ext => {
    return path.join(os.tmpdir(), `QuickCommandTempScript.${ext}`)
}

getBase64Ico = path => {
    return fs.readFileSync(path, 'base64');
}

openFileInDialog = (options, readfile) => {
    var file = utools.showOpenDialog(options)[0];
    if (!file) return false
    var information = {
        name: path.basename(file),
        path: file
    }
    if(readfile) information.data = fs.readFileSync(file)
    return information
}

saveFile = (options, content) => {
    var filename = utools.showSaveDialog(options)
    filename && fs.writeFile(filename, content, 'utf8', err => {
        err && console.log(err)
    })
}

// 保存剪贴板
storeClip = () => {
    var formats = electron.clipboard.availableFormats("clipboard");
    if (formats.includes("text/plain")) {
        return ['text', electron.clipboard.readText()]
    }
    if (formats.includes("image/png") || formats.includes("image/jpeg")) {
        return ['image', electron.clipboard.readImage()]
    }
    var file;
    if (utools.isWindows()) {
        file = electron.clipboard.readBuffer('FileNameW').toString('ucs2').replace(/\\/g, '/');
        file = file.replace(new RegExp(String.fromCharCode(0), 'g'), '');
    } else {
        file = electron.clipboard.read('public.file-url').replace('file://', '');
    }
    if (file) {
        return ['file', file]
    }
    return []
}

// 恢复剪贴板
restoreClip = historyData => {
    if (historyData[0] == 'text') {
        electron.clipboard.writeText(historyData[1]);
        return
    }
    if (historyData[0] == 'image') {
        electron.clipboard.writeImage(historyData[1]);
        return
    }
    if (historyData[0] == 'file') {
        utools.copyFile(historyData[1])
        return
    }
    electron.clipboard.writeText('')
}

getSelectText = () => {
    var historyData = storeClip();
    electron.clipboard.writeText('');
    simulateCopy();
    var selectText = electron.clipboard.readText()
    setTimeout(() => {
        restoreClip(historyData)
    }, 500);
    return selectText
}

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
    if (cmd.includes('{{SelectText}}')) {
        let repl = getSelectText();
        cmd = cmd.replace(/\{\{SelectText\}\}/mg, repl)
    }
    return cmd;
}

runCodeFile = (cmd, option, terminal, callback) => {
    var bin = option.bin,
        argv = option.argv,
        ext = option.ext;
    let script = getQuickCommandScriptFile(ext)
    // 批处理和 powershell 默认编码为 GBK, 解决批处理的换行问题
    if (ext == 'bat' || ext == 'ps1') cmd = iconv.encode(cmd.replace(/\n/g, '\r\n'), 'GBK');
    fs.writeFileSync(script, cmd);
    var argvs = [script]
    if (argv) {
        argvs = argv.split(' ')
        argvs.push(script);
    }
    var child;
    if (bin) {
        // 在终端中输出
        if (terminal) {
            if (utools.isWindows()) {
                child = child_process.spawn(`start cmd /k ${bin} ${argv} "${script}"`, { encoding: 'buffer', shell: true })
            } else if(utools.isMacOs()){
                var appleScript = `if application "Terminal" is running then 
                tell application "Terminal"   
                    # do script without "in window" will open a new window        
                    do script "clear;${bin} ${argv} ${script}"             
                    activate                          
                end tell                              
            else                                      
                tell application "Terminal"   
                    # window 1 is guaranteed to be recently opened window        
                    do script "clear;${bin} ${argv} ${script}" in window 1 
                    activate
                end tell
            end if`;
                child = child_process.spawn('osascript', ['-e', appleScript], { encoding: 'buffer' })
            } else {
                return message('Linux 不支持在终端输出')
            }
        } else {
            child = child_process.spawn(bin, argvs, { encoding: 'buffer' })            
        }
    } else {
        if (terminal) {
            child = child_process.spawn(`start cmd /k "${script}"`, { encoding: 'buffer', shell: true })
        } else {
            child = child_process.spawn(script, { encoding: 'buffer' })             
        }
    }
    // var chunks = [],
    //     err_chunks = [];
    child.stdout.on('data', chunk => {
        if (option.codec) chunk = iconv.decode(chunk, option.codec)
        callback(chunk, null)
        // chunks.push(chunk)
    })
    child.stderr.on('data', stderr => {
        if (option.codec) stderr = iconv.decode(stderr, option.codec)
        callback(null, stderr)
        // err_chunks.push(err_chunk)
    })
    // child.on('close', code => {
    //     let stdout = chunks.join("");
    //     let stderr = err_chunks.join("");
    //     callback(stdout, stderr)
    // })
}