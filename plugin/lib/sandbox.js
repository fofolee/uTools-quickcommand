window._ = require("lodash")
window.utools = require("./utoolsLite")()
window.exit = () => {
    process.exit()
}
// 绕过限制
setTimeout(() => {
    Object.assign(window, {
        process,
        Buffer,
        require
    })
}, 100);
