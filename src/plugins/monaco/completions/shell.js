var Keyword = ["if", "then", "do", "else", "elif", "while", "until", "for", "in", "esac", "fi", "fin", "fil", "done", "exit", "set", "unset", "export", "function", ];
var Function = "ab|awk|bash|beep|cat|cc|cd|chown|chmod|chroot|clear|cp|curl|cut|diff|echo|find|gawk|gcc|get|git|grep|hg|kill|killall|ln|ls|make|mkdir|openssl|mv|nc|nl|node|npm|ping|ps|restart|rm|rmdir|sed|service|sh|shopt|shred|source|sort|sleep|ssh|start|stop|su|sudo|svn|tee|telnet|top|touch|vi|vim|wall|wc|wget|who|write|yes|zsh".split("|");
var Text = ["true", "false"];
export default {
    Keyword,
    Function,
    Text,
};
