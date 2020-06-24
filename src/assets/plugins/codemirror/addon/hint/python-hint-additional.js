// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE
// python-hints by fofolee

(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    var Pos = CodeMirror.Pos;

    function scriptHint(editor, getToken, options) {
        // Find the token at the cursor
        var cur = editor.getCursor(),
            token = getToken(editor, cur);
        if (/\b(?:string|comment)\b/.test(token.type)) return;
        var innerMode = CodeMirror.innerMode(editor.getMode(), token.state);
        if (innerMode.mode.helperType === "json") return;
        token.state = innerMode.state;
        // If it's not a 'word-style' token, ignore the token.
        if (!/^[\w$_]*$/.test(token.string)) {
            token = {
                start: cur.ch,
                end: cur.ch,
                string: "",
                state: token.state,
                type: token.string == "." ? "property" : null
            };
        } else if (token.end > cur.ch) {
            token.end = cur.ch;
            token.string = token.string.slice(0, cur.ch - token.start);
        }
        var hints = [],
            lineText = editor.getLine(cur.line)
        if (token.type == "property") {
            // 已导入模块的属性（方法）提示
            mod = getToken(editor, Pos(cur.line, token.start - 1)).string;
            if (editor.loadedPyModes && editor.loadedPyModes[mod]) {
                var context = editor.loadedPyModes[mod]
                hints = token.string ? context.filter(x => x.slice(0, token.string.length) == token.string) : context
            }
        } else if (token.string == "") {
            if (!token.end && editor.loadedPyModes && editor.loadedPyModes.loading && cur.line) {
                // 获取已导入的模块
                var lastline = editor.getLine(cur.line - 1)
                mods = lastline.replace('import', '').trim().split(',').map(x => x.trim())
                mods.forEach(mod => {
                    dirPythonMod(mod, items => {
                        editor.loadedPyModes[mod] = items
                    })
                })
                editor.loadedPyModes.loading = false
            }
        } else if (/^import/.test(lineText)) {
            // 已安装模块提示
            hints = JSON.parse(localStorage['pyModules']).filter(x => x.slice(0, token.string.length) == token.string)
            editor.loadedPyModes || (editor.loadedPyModes = {})
            editor.loadedPyModes.loading = true
        } else {
            // 关键字提示
            hints = getCommonHints().filter(x => x.slice(0, token.string.length) == token.string)
            // 特殊变量提示
            var specialVars = localStorage['specialVars']
            if (specialVars) specialVars.split(',').forEach(s => {
                if (s.toUpperCase().slice(2, token.string.length + 2) == token.string.toUpperCase()) hints.push(s)
            })
            // 本地单词提示
            var anyword = CodeMirror.hint.anyword(editor, options).list
            anyword.forEach(a => {
                if (!hints.includes(a)) hints.push(a)
            })
        }
        return {
            list: hints,
            from: Pos(cur.line, token.start),
            to: Pos(cur.line, token.end)
        };
    }

    function pythonHint(editor, options) {
        return scriptHint(editor, function(e, cur) { return e.getTokenAt(cur); }, options);
    };
    CodeMirror.registerHelper("hint", "python", pythonHint);

    function getCommonHints(py3) {
        var wordOperators = ["and", "or", "not", "is"]
        var commonKeywords = ["as", "assert", "break", "class", "continue",
            "def", "del", "elif", "else", "except", "finally",
            "for", "from", "global", "if", "import",
            "lambda", "pass", "raise", "return",
            "try", "while", "with", "yield", "in"
        ];
        var commonBuiltins = ["abs", "all", "any", "bin", "bool", "bytearray", "callable", "chr",
            "classmethod", "compile", "complex", "delattr", "dict", "dir", "divmod",
            "enumerate", "eval", "filter", "float", "format", "frozenset",
            "getattr", "globals", "hasattr", "hash", "help", "hex", "id",
            "input", "int", "isinstance", "issubclass", "iter", "len",
            "list", "locals", "map", "max", "memoryview", "min", "next",
            "object", "oct", "open", "ord", "pow", "property", "range",
            "repr", "reversed", "round", "set", "setattr", "slice",
            "sorted", "staticmethod", "str", "sum", "super", "tuple",
            "type", "vars", "zip", "__import__", "NotImplemented",
            "Ellipsis", "__debug__"
        ];
        var myKeywords, myBuiltins
        if (py3) {
            myKeywords = ["nonlocal", "False", "True", "None", "async", "await"]
            myBuiltins = ["ascii", "bytes", "exec", "print"]
        } else {
            myKeywords = ["exec", "print"]
            myBuiltins = ["apply", "basestring", "buffer", "cmp", "coerce", "execfile",
                "file", "intern", "long", "raw_input", "reduce", "reload",
                "unichr", "unicode", "xrange", "False", "True", "None"
            ]
        }
        return wordOperators.concat(commonKeywords, commonBuiltins, myKeywords, myBuiltins)
    }
});