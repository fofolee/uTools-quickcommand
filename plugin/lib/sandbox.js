const nodeFns = require("./nodeFns")
window._ = require("lodash")
window.utools = require("./utoolsLite")()

Object.keys(nodeFns).forEach(key => {
    window[key] = nodeFns[key]
})
