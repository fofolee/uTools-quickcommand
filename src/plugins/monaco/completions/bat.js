var Text = ["true", "false"];
var Keyword = "goto|call|exit|break|exist|defined|errorlevel|cmdextversion|if|else|for|EQU|NEQ|LSS|LEQ|GTR|GEQ".split("|");
var Function = "assoc|bcdedit|cd|chcp|chdir|cls|color|copy|date|del|dir|echo|endlocal|erase|format|ftype|graftabl|md|mkdir|mklink|mode|more|move|path|pause|popd|prompt|pushd|rd|rem|ren|rename|rmdir|robocopy|set|setlocal|shift|start|time|title|tree|type|ver|verify|vol|wmic".split("|");
export default {
    Text,
    Keyword,
    Function,
};
