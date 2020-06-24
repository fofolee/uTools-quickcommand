// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode('applescript', function() {

  var words = {};
  function define(style, dict) {
    for(var i = 0; i < dict.length; i++) {
      words[dict[i]] = style;
    }
  };

  var commonAtoms = ["AppleScript", "false", "linefeed", "return", "pi", "quote", "result", "space", "tab", "true"];
  var commonKeywords = ["about", "above", "after", "against", "and", "around", "as", "at", "back", "before", "beginning",
    "behind", "below", "beneath", "beside", "between", "but", "by", "considering", "contain", "contains", "continue",
    "copy", "div", "does", "eighth", "else", "end", "equal", "equals", "error", "every", "exit", "fifth", "first",
    "for", "fourth", "from", "front", "get", "given", "global", "if", "ignoring", "in", "into", "is", "it", "its",
    "last", "local", "me", "middle", "mod", "my", "ninth", "not", "of", "on", "onto", "or", "over", "prop", "property",
    "put", "ref", "reference", "repeat", "returning", "script", "second", "set", "seventh", "since", "sixth", "some",
    "tell", "tenth", "that", "the", "then", "third", "through", "thru", "timeout", "times", "to", "transaction", "try",
    "until", "where", "while", "whose", "with", "without", "alias", "application", "boolean", "class", "constant", "date",
    "file", "integer", "list", "number", "real", "record", "string", "text", "character", "characters", "contents", "day",
    "frontmost", "id", "item", "length", "month", "name", "paragraph", "paragraphs", "rest", "reverse", "running", "time",
    "version", "weekday", "word", "words", "year"];
  var commonCommands = ["activate", "beep", "count", "delay", "launch", "log", "offset", "read", "round", "run", "say",
      "summarize", "write", "clipboard info", "the clipboard", "info for", "list disks", "list folder", "mount volume",
      "path to", "close for access", "open for access", "get eof", "set eof", "current date", "do shell script",
      "get volume settings", "random number", "set volume", "system attribute", "system info", "time to GMT",
      "load script", "run script", "store script", "scripting components", "ASCII character", "ASCII number",
      "localized string", "folder", "from list", "remote application", "URL", "display alert", "display dialog"]

  CodeMirror.registerHelper("hintWords", "applescript", commonAtoms.concat(commonKeywords, commonCommands));

  define('atom', commonAtoms);
  define('keyword', commonKeywords);
  define('builtin', commonCommands);

  function tokenBase(stream, state) {
    if (stream.eatSpace()) return null;

    var sol = stream.sol();
    var ch = stream.next();

    // if (ch === '\\') {
    //   stream.next();
    //   return null;
    // }
    if (ch === '\'' || ch === '"' || ch === '`') {
      state.tokens.unshift(tokenString(ch, ch === "`" ? "quote" : "string"));
      return tokenize(stream, state);
    }
    if (ch === '-') {
    //   if (sol && stream.eat('!')) {
    //     stream.skipToEnd();
    //     return 'meta'; // 'comment'?
    //   }
      if (stream.eat('-')) {
          stream.skipToEnd();
          return 'comment';  
      }
    }
    // if (ch === '$') {
    //   state.tokens.unshift(tokenDollar);
    //   return tokenize(stream, state);
    // }
    if (ch === '+' || ch === '=') {
      return 'operator';
    }
    if (ch === '-') {
      stream.eat('-');
      stream.eatWhile(/\w/);
      return 'attribute';
    }
    if (/^[0-9\.]/.test(ch)) {
      stream.eatWhile(/\d/);
      if(stream.eol() || !/\w/.test(stream.peek())) {
        return 'number';
      }
    }
    stream.eatWhile(/[\w-]/);
    var cur = stream.current();
    if (stream.peek() === '=' && /\w+/.test(cur)) return 'def';
    return words.hasOwnProperty(cur) ? words[cur] : null;
  }

  function tokenString(quote, style) {
    var close = quote == "(" ? ")" : quote == "{" ? "}" : quote
    return function(stream, state) {
      var next, escaped = false;
      while ((next = stream.next()) != null) {
        if (next === close && !escaped) {
          state.tokens.shift();
          break;
        } else if (next === '$' && !escaped && quote !== "'" && stream.peek() != close) {
          escaped = true;
          stream.backUp(1);
          state.tokens.unshift(tokenDollar);
          break;
        } else if (!escaped && quote !== close && next === quote) {
          state.tokens.unshift(tokenString(quote, style))
          return tokenize(stream, state)
        } else if (!escaped && /['"]/.test(next) && !/['"]/.test(quote)) {
          state.tokens.unshift(tokenStringStart(next, "string"));
          stream.backUp(1);
          break;
        }
        escaped = !escaped && next === '\\';
      }
      return style;
    };
  };

  function tokenStringStart(quote, style) {
    return function(stream, state) {
      state.tokens[0] = tokenString(quote, style)
      stream.next()
      return tokenize(stream, state)
    }
  }

  var tokenDollar = function(stream, state) {
    if (state.tokens.length > 1) stream.eat('$');
    var ch = stream.next()
    if (/['"({]/.test(ch)) {
      state.tokens[0] = tokenString(ch, ch == "(" ? "quote" : ch == "{" ? "def" : "string");
      return tokenize(stream, state);
    }
    if (!/\d/.test(ch)) stream.eatWhile(/\w/);
    state.tokens.shift();
    return 'def';
  };

  function tokenize(stream, state) {
    return (state.tokens[0] || tokenBase) (stream, state);
  };

  return {
    startState: function() {return {tokens:[]};},
    token: function(stream, state) {
      return tokenize(stream, state);
    },
    closeBrackets: "()[]{}''\"\"``",
    lineComment: '--',
    fold: "brace"
  };
});

CodeMirror.defineMIME('text/x-sh', 'applescript');
// Apache uses a slightly different Media Type for applescript scripts
// http://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types
CodeMirror.defineMIME('application/x-sh', 'applescript');

});
