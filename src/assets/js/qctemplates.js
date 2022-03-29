let featurelist = {
    footer: `
    <div class="foot">
        <input id="searchFts" placeholder="🔍 click here to search">
        <div id="clear" class="footBtn danger"><img src="img/clear.svg"><span>清除数据</span></div>
        <div id="disableAll" class="footBtn danger"><img src="img/disable.svg"><span>禁用本页</span></div>
        <div id="enableAll" class="footBtn"><img src="img/enable.svg"><span>启用本页</span></div>
        <div id="viewHelps" class="footBtn"><img src="img/help.svg"><span>查看帮助</span></div>
        <div id="getShares" class="footBtn"><img src="img/share.svg"><span>分享中心</span></div>
        <div id="exportAll" class="footBtn"><img src="img/exportAll.svg"><span>全部导出</span></div>
        <div id="import" class="footBtn"><img src="img/import.svg"><span>导入命令</span></div>
        <div id="addToPanel" class="footBtn"><img src="img/panel.svg"><span>快捷面板</span></div>
        <div id="add" class="footBtn"><img src="img/add.svg"><span>新建命令</span></div>
    </div>`
}

let command = {
    commandEditor: `
    <div id="customize">
        <p><input type="text" id="code" style="display: none">
            <span class="word">匹&#12288;配</span>
            <select id="type"></select>
            <span class="word" id="ruleWord">关键字</span><input class="customize" type="text" id="rule" placeholder="例：mycommand,cs"><img id="expandBtn" src="./img/expand.svg"></p>
        <p><span class="word">说&#12288;明</span><input class="customize" type="text" id="desc" placeholder="命令功能的描述">
            <img id="icon" src="">
        </p>
        <p>
            <span class="word">环&#12288;境</span>
            <select id="program">
                <option value="quickcommand">quickcommand</option>
            </select>
            <span class="word">标&#12288;签</span>
            <select id="tags" multiple="multiple"></select>
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
                <option value="{{WindowInfo}}" disabled class="var window">当前窗口信息，JSON格式字符串</option>
                <option value="{{SelectFile}}" disabled class="var window">文件管理器选中的文件，不支持Linux</option>
                <option value="{{MatchedFiles}}" disabled class="var files">匹配的文件，JSON格式字符串</option>
                <option value="{{type}}">专业模式的type</option>
                <option value="{{payload}}">专业模式的payload，JSON格式字符串</option>
            </select>
            <span class="word">输&#12288;出</span>
            <select id="output">
                <option value="ignore">忽略输出并隐藏</option>
                <option value="nothing">忽略输出并保留窗口</option>
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
                <input type="text" id="customext" placeholder="后缀,不含.">
            </span>
            <span id="charset" class="robot">编码设置</span>
            <span class="quickactions">
                <span id="addAction" class="robot">﹢动作</span>
                <span id="addKey" class="robot">﹢按键</span>
                <span id="showHelp" class="robot">？文档</span>
                <span id="beautifyCode" class="robot">格式化</span>
            </span>
        </p>
        <textarea id="cmd" placeholder="◆基础◆\nquickcommand环境下，点击“﹢按键”来执行模拟按键的操作;点击“﹢动作”添加打开软件，访问网址等\n常用动作\n◆进阶◆\nquickcommand：可使用nodejs、electron、uTools、quickCommand的api，详情查看文档\n其他脚本：本机装了相应环境即可执行，可以直接拖放脚本文件至此处，可在脚本参数输入框处填写传递\n给脚本的参数\ncustom：可以手动设置解释器路径、参数及脚本后缀\n◆快捷键◆\n支持VSCode快捷键\nAlt+Enter 全屏\nCtrl+B 运行\nCtrl+F 搜索\nShift+Alt+F 格式化（仅JS/PY）"></textarea>
        <p class="bottom">
            <img id="win32" class="platform" src="./img/win32.svg">
            <img id="darwin" class="platform" src="./img/darwin.svg">
            <img id="linux" class="platform" src="./img/linux.svg">
            <button class="button cmdBtn save">保存</button>
            <button class="button cmdBtn run">运行</button>
            <button class="button cmdBtn cancel">取消</button>
        </p>
    </div>`,

    codeEditor: `
    <div id="customize">
        <select id="program"></select>
        <span class="customscript">
            <input type="text" id="custombin" placeholder="解释器路径">
            <input type="text" id="customarg" placeholder="解释器参数">
            <input type="text" id="customext" placeholder="后缀,不含.">
        </span>
        <span id="runCode" class="robot">运  行</span>
        <span id="charset" class="robot">编码设置</span>
        <input type="text" id="scptarg" placeholder="脚本参数">
        <span class="quickactions">
            <span id="beautifyCode" class="robot">格式化</span>
            <!--<span id="addAction" class="robot">﹢动作</span>
            <span id="addKey" class="robot">﹢按键</span>-->
            <span id="showHelp" class="robot">？文档</span>
        </span>
        <textarea id="cmd" placeholder="可以直接拖放脚本文件至此处, 支持VSCode快捷键\nCtrl+B 运行\nCtrl+F 搜索\nAlt+Enter 全屏\nShift+Alt+F 格式化（仅JS/PY）"></textarea>
    </div>`,

    setCharset: `
    脚本编码： <input id="scriptCode" class="swal2-input" placeholder="未出现乱码问题请留空">
    输出解码： <input id="outputCode" class="swal2-input" placeholder="未出现乱码问题请留空">`,

    addAction: `
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
        <option value="utools.redirect" args="要跳转至的插件名称">转至指定插件(自定义关键字)</option>
        <option value="quickcommand.sleep" args="延迟的毫秒数，不要勾选“加引号”">添加延时</option>
    </select>
    <input placeholder="文件、文件夹或软件的绝对路径" id="actionArgs" class="swal2-input" style="width: 80%; height: 3rem;">
    <input type="checkbox" checked id="isString" style="margin-left: 60%;">加引号`,

    setIcon: `
    <div id="iconpicker">
        <button id="localImg" class="swal2-confirm swal2-styled" style="width: 80%; height: 3rem; margin: 1em">选择本地图标</button>
        <select style="width: 80%" id="networkImg"></select>
        <input id="networkImgUrl" placeholder="使用网络图片" class="swal2-input" style="width: 80%; height: 3rem; text-align: center">
    </div>`
}

let panel = {
    conf: `
    <div id="panelConf">
        <p>
            关键字： <input id="panelWord" placeholder="多个关键字逗号隔开">
            描述： <input id="panelDesc" placeholder="快捷面板的功能描述">
        </p>
        <p>
            图&#12288;标：
            <select style="width: 160px" id="networkImg"></select>
            <input id="networkImgUrl" placeholder="填入网络地址或点击右边选择本地图标">
            <img id="icon" src="logo/quickpanel.png">
        </p>
        <p>
            平&#12288;台：
            <span style="margin-right: 75px;"><img id="win32" class="platform" src="./img/win32.svg">
            <img id="darwin" class="platform" src="./img/darwin.svg">
            <img id="linux" class="platform" src="./img/linux.svg"></span>
            自动分离：<label class="switch-btn">
            <input class="checked-switch" type="checkbox" checked>
            <span class="text-switch"></span>
            <span class="toggle-btn"></span>
        </label>
        </p>
        <p style="display:none">
            搜索框：<textarea id="cmd" placeholder="激活面板的搜索框，并执行命令, 留空则不使用搜索框。\n和 quickcommand 环境下使用 {{subinput}} 的方法一样。\n如 visit('https://www.baidu.com/s?wd={{subinput}}')"></textarea>
        </p>
        <p style="text-align: center"><br>
            <button class="button enable">启用</button>
            <button class="button modify">修改</button>
            <button class="button disable">禁用</button>
            <button class="button cancel">取消</button>
        </p>
    </div>
    `
}

export default {
    featurelist,
    command,
    panel
}
