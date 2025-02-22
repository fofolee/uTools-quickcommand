const Text = [ "AppleScript", "false", "linefeed", "return", "pi", "quote", "result", "space", "tab", "true", ];
const Keyword = [ "about", "above", "after", "against", "and", "around", "as", "at", "back", "before", "beginning", "behind", "below", "beneath", "beside", "between", "but", "by", "considering", "contain", "contains", "continue", "copy", "div", "does", "eighth", "else", "end", "equal", "equals", "error", "every", "exit", "fifth", "first", "for", "fourth", "from", "front", "get", "given", "global", "if", "ignoring", "in", "into", "is", "it", "its", "last", "local", "me", "middle", "mod", "my", "ninth", "not", "of", "on", "onto", "or", "over", "prop", "property", "put", "ref", "reference", "repeat", "returning", "script", "second", "set", "seventh", "since", "sixth", "some", "tell", "tenth", "that", "the", "then", "third", "through", "thru", "timeout", "times", "to", "transaction", "try", "until", "where", "while", "whose", "with", "without", "alias", "application", "boolean", "class", "constant", "date", "file", "integer", "list", "number", "real", "record", "string", "text", "character", "characters", "contents", "day", "frontmost", "id", "item", "length", "month", "name", "paragraph", "paragraphs", "rest", "reverse", "running", "time", "version", "weekday", "word", "words", "year", ];
const Function = [ "activate", "beep", "count", "delay", "launch", "log", "offset", "read", "round", "run", "say", "summarize", "write", "clipboard info", "the clipboard", "info for", "list disks", "list folder", "mount volume", "path to", "close for access", "open for access", "get eof", "set eof", "current date", "do shell script", "get volume settings", "random number", "set volume", "system attribute", "system info", "time to GMT", "load script", "run script", "store script", "scripting components", "ASCII character", "ASCII number", "localized string", "folder", "from list", "remote application", "URL", "display alert", "display dialog", ];
const Operator = [ "=", "≠", "≤", "≥", "&", "+", "-", "*", "/", "div", "mod", "^", "contains", "equals", "is", "is not", "isnt", "less than", "greater than", "and", "or", "not", ];
const Symbol = /[=><!~?:&|+\-*\/\^%]+/;
const Tokenizer = {
  root: [
    [
      /[a-zA-Z_]\w*/,
      {
        cases: {
          "@keywords": "keyword",
          "@operators": "operator",
          "@default": "identifier",
        },
      },
    ],
    [/--.*$/, "comment"],
    [/"/, { token: "string.quote", next: "@string" }],
    [/\d+/, "number"],
    [/@symbols/, "operator"],
  ],

  string: [
    [/[^\"]+/, "string"],
    [/\"/, { token: "string.quote", next: "@pop" }],
  ],
};

export default {
  Keyword,
  Function,
  Text,
  Operator,
  Symbol,
  Tokenizer,
};
