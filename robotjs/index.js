if(process.platform==='darwin'){
    module.exports = require('./darwin/robotjs.node')
}else if(process.platform==='win32'){
    module.exports = require(`./win32/${process.arch}/robotjs.node`)
}