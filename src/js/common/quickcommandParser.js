/**
 * 判断内容是否为 quickcommand 可导入格式
 */

// 是否含有 quickcommand 键值
let isJsonQc = (obj, strict = true) => {
    var keys = strict ? ["features", "program", "cmd", "output"] : ["program", "cmd"]
    if (keys.filter(x => typeof obj[x] == 'undefined').length) return false
    return true
}

// 判断是否为可导入的快捷命令
let qcparser = (json, strict = true) => {
    try {
        var qc = JSON.parse(json)
    } catch (error) {
        return false
    }
    if (isJsonQc(qc, strict)) return { single: true, qc: qc }
    else if (!Object.values(qc).filter(q => !isJsonQc(q, strict)).length) return { single: false, qc: qc }
    else return false
}

export default qcparser
