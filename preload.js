const fs = require('fs');
const os = require('os');
const { spawn, exec } = require("child_process")
const iconv = require('iconv-lite')
const { clipboard } = require('electron')
const robot = utools.robot
// const jschardet = require("jschardet")

const path = require("path")
const { dialog, BrowserWindow, nativeImage } = require('electron').remote
const { shell } = require('electron');

pluginInfo = JSON.parse(fs.readFileSync(path.join(__dirname, 'plugin.json')));
logo = nativeImage.createFromPath(path.join(__dirname, 'logo.png'));

// fix PATH
process.env.PATH += ':/usr/local/bin:/usr/local/sbin'

messageBox = options => {
    dialog.showMessageBox(BrowserWindow.getFocusedWindow(), options, index => {
        utools.showMainWindow()
    })
}

open = url => {
    shell.openExternal(url);
}
// ------------------------

isWin = os.platform() == 'win32' ? true : false;

isDev = /unsafe-\w+\.asar/.test(__dirname) ? false : true

basename = path.basename;

dirname = __dirname;

resolve = path.resolve;

exists = fs.existsSync;

getBase64Ico = path => {
    return fs.readFileSync(path, 'base64');
}

cacheIco = (b64, icon) => {
    var file = path.resolve(__dirname, icon),
        dir = path.dirname(file);
    !exists(dir) && fs.mkdirSync(dir);
    b64 && !exists(file) && fs.writeFileSync(file, b64, 'base64');
    return file;
}

openFolder = options => {
    return dialog.showOpenDialogSync(BrowserWindow.getFocusedWindow(), options);
}

saveFile = (options, content) => {
    dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), options, filename => {
        filename && fs.writeFile(filename, content, 'utf8', err => {
            err && console.log(err)
        })
    })
}

copy = () => {
    var ctlKey = isWin ? 'control' : 'command';
    robot.keyTap('c', ctlKey);
    robot.setKeyboardDelay(20);
}

copyTo = text => {
    clipboard.writeText(text)
}

paste = () => {
    var ctlKey = isWin ? 'control' : 'command';
    robot.keyTap('v', ctlKey);
}

// 保存剪贴板
storeClip = () => {
    var formats = clipboard.availableFormats("clipboard");
    if (formats.includes("text/plain")) {
        return ['text', clipboard.readText()]
    }
    if (formats.includes("image/png") || formats.includes("image/jpeg")) {
        return ['image', clipboard.readImage()]
    }
    var file;
    if (isWin) {
        file = clipboard.readBuffer('FileNameW').toString('ucs2').replace(/\\/g, '/');
        file = file.replace(new RegExp(String.fromCharCode(0), 'g'), '');
    } else {
        file = clipboard.read('public.file-url').replace('file://', '');
    }
    if (file) {
        return ['file', file]
    }
    return []
}

// 恢复剪贴板
restoreClip = historyData => {
    if (historyData[0] == 'text') {
        clipboard.writeText(historyData[1]);
        return
    }
    if (historyData[0] == 'image') {
        clipboard.writeImage(historyData[1]);
        return
    }
    if (historyData[0] == 'file') {
        utools.copyFile(historyData[1])
        return
    }
    clipboard.writeText('')
}

getSelectText = () => {
    var historyData = storeClip();
    clipboard.writeText('');
    copy();
    var selectText = clipboard.readText()
    restoreClip(historyData)
    return selectText
}

getSelectFile = () =>
    new Promise((reslove, reject) => {
        if (isWin) {
            GetForegroundWindow(hwnd => {
                var cmd = `powershell.exe -NoProfile "(New-Object -COM 'Shell.Application').Windows() | Where-Object { $_.HWND -eq ${hwnd} } | Select-Object -Expand Document | select @{ n='SelectItems'; e={$_.SelectedItems()} }  | select -Expand SelectItems | select -Expand Path "`;
                exec(cmd, { encoding: "buffer" }, (err, stdout, stderr) => {
                    if (err) reject(stderr)
                    reslove(iconv.decode(stdout, 'GBK').trim().replace(/\\/g, '/'));
                });
            })
        } else {
            var cmd = `osascript -e 'tell application "Finder" to set selectedItems to selection as alias list
            if selectedItems is {} then return
            set parentPath to do shell script "dirname " & quoted form of POSIX path of (item 1 of selectedItems)
            set pathData to ""
            repeat with theItem in selectedItems
                set pathData to pathData & POSIX path of theItem & linefeed
            end repeat
            set stdout to pathData
            '
            `
            exec(cmd, (err, stdout, stderr) => {
                if (err) reject(stderr)
                reslove(stdout.trim());
            });
        }
    })

GetBinPath = () => {
    if (isDev) {
        return path.join(__dirname.replace(/(unsafe-\w+\.asar)/,'$1.unpacked'), 'bin', 'GetForegroundWindow.exe')  
    } else {
        return path.join(__dirname, 'bin', 'GetForegroundWindow.exe')
    }
}

// 获取前台窗口句柄
GetForegroundWindow = callback => 
        exec(`"${GetBinPath()}"`, (error, stdout, stderr) => {
            callback(stdout);
          });
    

pwd = () =>
    new Promise((reslove, reject) => {
        if (isWin) {
            GetForegroundWindow(hwnd => {
                var cmd = `powershell.exe -NoProfile "((New-Object -COM 'Shell.Application').Windows() | Where-Object { $_.HWND -eq (${hwnd}) } | Select-Object -Expand LocationURL).replace('file:///','')"`;
                exec(cmd, { encoding: "buffer" }, (err, stdout, stderr) => {
                    if (err) {
                        console.log(iconv.decode(stderr, 'GBK'));
                        reslove(`${os.homedir().replace(/\\/g, '/')}/Desktop`)
                    } else {
                        reslove(decodeURIComponent(iconv.decode(stdout, 'GBK').trim()));
                    }
                });
            })
        } else {
            var cmd = `osascript -l JavaScript -e '
            const frontmost_app_name = Application("System Events").applicationProcesses.where({ frontmost: true }).name()[0]
            if (frontmost_app_name === "Finder") {
              unescape(Application("Finder").insertionLocation().url()).slice(7).slice(0, -1)
            } else if(frontmost_app_name === "Path Finder") {
              unescape(Application("Path Finder").finderWindows[0].target.url()).slice(7).slice(0, -1)
            } else {
              unescape(Application("Finder").desktop.url()).slice(7).slice(0, -1)
            }
          '`
            exec(cmd, (err, stdout, stderr) => {
                if (err) reject(stderr)
                reslove(stdout.trim());
            });
        }
    });

special = async cmd => {
    // 判断是否 windows 系统
    if (cmd.includes('{{isWin}}')) {
        let repl = isWin ? 1 : 0;
        cmd = cmd.replace(/\{\{isWin\}\}/mg, repl)
    }

    // 获取电脑名
    if (cmd.includes('{{HostName}}')) {
        let repl = os.hostname();
        cmd = cmd.replace(/\{\{HostName\}\}/mg, repl)
    }

    // 获取资源管理器或访达当前目录
    if (cmd.includes('{{pwd}}')) {
        let repl = await pwd();
        cmd = cmd.replace(/\{\{pwd\}\}/mg, repl)
    }
    // 获取 Chrome 当前链接
    if (cmd.includes('{{BrowserUrl}}')) {
        let repl = utools.getCurrentBrowserUrl();
        cmd = cmd.replace(/\{\{BrowserUrl\}\}/mg, repl)
    }
    // 获取剪切板的文本
    if (cmd.includes('{{ClipText}}')) {
        let repl = clipboard.readText();
        cmd = cmd.replace(/\{\{ClipText\}\}/mg, repl)
    }
    // 获取选中的文本
    if (cmd.includes('{{SelectText}}')) {
        let repl = getSelectText();
        cmd = cmd.replace(/\{\{SelectText\}\}/mg, repl)
    }
    // 获取选中的文件
    if (cmd.includes('{{SelectFile}}')) {
        let repl = await getSelectFile();
        cmd = cmd.replace(/\{\{SelectFile\}\}/mg, repl)
    }
    return cmd;
}

run = async (cmd, option, codec, terminal, callback) => {
    var tmp = os.tmpdir(),
        bin = option.bin,
        argv = option.argv,
        ext = option.ext;
    cmd = await special(cmd);
    let script = path.join(tmp, `QuickCommandTempScript.${ext}`)
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
            if (isWin) {
                child = spawn('cmd', ['/c', 'start', 'cmd', '/k', bin].concat(argvs), { encoding: 'buffer' })
            } else {
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
                child = spawn('osascript', ['-e', appleScript], { encoding: 'buffer' })
            }
        } else {
            child = spawn(bin, argvs, { encoding: 'buffer' })            
        }
    } else {
        if (terminal) {
            child = spawn('cmd', ['/c', 'start', 'cmd', '/k', script], { encoding: 'buffer' })
        } else {
            child = spawn(script, { encoding: 'buffer' })             
        }
    }
    var chunks = [],
        err_chunks = [];
    child.stdout.on('data', chunk => {
        if (ext == 'bat' || ext == 'ps1') chunk = iconv.decode(chunk, 'GBK')
        chunks.push(chunk)
    })
    child.stderr.on('data', err_chunk => {
        if (ext == 'bat' || ext == 'ps1') err_chunk = iconv.decode(err_chunk, 'GBK')
        err_chunks.push(err_chunk)
    })
    child.on('close', code => {
        let stdout = chunks.join("");
        let stderr = err_chunks.join("");
        callback(stdout, stderr)
    })
}