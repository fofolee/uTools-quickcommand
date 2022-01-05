// 禁用危险函数
let whole = window.utools
if (!utools.isDev()) window.utools = window.getuToolsLite()

// 数据库前缀
const DBPRE = {
    QC: 'qc_',
    CFG: 'cfg_',
    PAN: 'pan_'
}

// 数据库函数封装
let getDB = id => {
    let db = whole.db.get(id)
    return db ? db.data : {}
}

let putDB = (value, id) => {
    let db = whole.db.get(id);
    if (db) whole.db.put({
        _id: id,
        data: value,
        _rev: db._rev
    })
    else whole.db.put({
        _id: id,
        data: value
    });
}

let delDB = id => {
    return whole.db.remove(id)
}

let getDocs = key => {
    return whole.db.allDocs(key)
}

export default {
    whole,
    getDB,
    putDB,
    delDB,
    getDocs,
    DBPRE
}
