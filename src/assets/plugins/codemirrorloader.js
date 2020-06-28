// All in One !!

main = "./assets/plugins/codemirror/lib/codemirror.js"

modes = [
    "./assets/plugins/codemirror/mode/shell/shell-modified.js",
    "./assets/plugins/codemirror/mode/cmd/cmd-additional.js",
    "./assets/plugins/codemirror/mode/applescript/applescript-additional.js",
    "./assets/plugins/codemirror/mode/powershell/powershell-modified.js",
    "./assets/plugins/codemirror/mode/python/python-modified.js",
    "./assets/plugins/codemirror/mode/javascript/javascript.js",
    "./assets/plugins/codemirror/mode/ruby/ruby.js",
    "./assets/plugins/codemirror/mode/php/php.js",
    "./assets/plugins/codemirror/mode/clike/clike.js",
    "./assets/plugins/codemirror/mode/xml/xml.js",
    "./assets/plugins/codemirror/mode/css/css.js",
    "./assets/plugins/codemirror/mode/htmlmixed/htmlmixed.js",
    "./assets/plugins/codemirror/mode/perl/perl.js",
    "./assets/plugins/codemirror/mode/lua/lua.js"
]

addons = [
    "./assets/plugins/codemirror/addon/display/placeholder.js",
    "./assets/plugins/codemirror/addon/comment/comment.js",
    "./assets/plugins/codemirror/addon/selection/active-line.js",
    "./assets/plugins/codemirror/addon/hint/show-hint-modified.js",
    "./assets/plugins/codemirror/addon/hint/anyword-hint-modified.js",
    "./assets/plugins/codemirror/addon/hint/javascript-hint-modified.js",
    "./assets/plugins/codemirror/addon/hint/python-hint-additional.js",
    "./assets/plugins/codemirror/addon/edit/matchbrackets.js",
    "./assets/plugins/codemirror/addon/edit/closebrackets.js",
    "./assets/plugins/codemirror/addon/search/search.js",
    "./assets/plugins/codemirror/addon/search/searchcursor.js",
    "./assets/plugins/codemirror/addon/dialog/dialog.js",
    "./assets/plugins/codemirror/keymap/sublime.js"

]

styles = [
    "./assets/plugins/codemirror/lib/codemirror.css",
    "./assets/plugins/codemirror/addon/hint/show-hint.css",
    "./assets/plugins/codemirror/addon/display/fullscreen.css",
    "./assets/plugins/codemirror/theme/mdn-like-modified.css",
    "./assets/plugins/codemirror/theme/material-darker-modified.css",
]

styles.forEach(s => {
    var styleTag = document.createElement('link')
    styleTag.setAttribute('rel', 'stylesheet')
    styleTag.setAttribute('href', s)
    document.head.appendChild(styleTag);
})


var mainScriptTag = document.createElement('script');
mainScriptTag.setAttribute('src', main);
document.head.appendChild(mainScriptTag);


mainScriptTag.onload = mainScriptTag.onreadystatechange = function () {
    if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
        modes.concat(addons).forEach(s => {
            var scriptTag = document.createElement('script');
            scriptTag.setAttribute('src', s);
            document.head.appendChild(scriptTag);      
        })
    }
}