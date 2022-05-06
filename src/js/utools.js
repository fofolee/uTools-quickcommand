/**
 * 阉割utools，同时返回一个满血版的UTOOLS
 * 防止输出html输出时，通过script标签调用utools执行危险函数
 */

// 禁用危险函数
let whole = window.utools

// 数据库前缀
const DBPRE = {
    QC: 'qc_', // 快捷命令
    CFG: 'cfg_', // 配置
    PAN: 'panel_', // 面板视图
    STATUS: 'st_', // 状态变量
    USR: 'usr_' // 用户数据
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

let setStorage = whole.dbStorage.setItem
let getStorage = whole.dbStorage.getItem

const nativeId = utools.getNativeId()

let userData = {
    put: function(value, id, isNative = true) {
        let userData = getDB(DBPRE.USR + id)
        if (isNative) {
            userData[nativeId] = value;
        } else {
            userData.common = value;
            delete userData[nativeId];
        }
        putDB(userData, DBPRE.USR + id);
    },
    get: function(id) {
        let userData = getDB(DBPRE.USR + id)
        return userData[nativeId] ? userData[nativeId] : userData.common
    },
    del: function(id) {
        delDB(DBPRE.USR + id)
    },
    all: function() {
        return getDocs(DBPRE.USR).map((item) => {
            let isNative = !!item.data[nativeId];
            return {
                id: item._id.replace(DBPRE.USR, ""),
                value: isNative ? item.data[nativeId] : item.data.common,
                isNative: isNative,
            };
        })
    }
}

export default {
    whole,
    getDB,
    putDB,
    delDB,
    setStorage,
    getStorage,
    userData,
    getDocs,
}