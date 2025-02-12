/**
 * 阉割utools，同时返回一个满血版的UTOOLS
 * 防止输出html输出时，通过script标签调用utools执行危险函数
 */

// 禁用危险函数
export const utoolsFull = window.utools;

// 数据库前缀
const DBPRE = {
  QC: "qc_", // 快捷命令
  CFG: "cfg_", // 配置
  PAN: "panel_", // 面板视图
  STATUS: "st_", // 状态变量
  USR: "usr_", // 用户数据
};

// 数据库函数封装
let getDB = (id) => {
  let db = utoolsFull.db.get(id);
  return db ? db.data : {};
};

let putDB = (value, id) => {
  let db = utoolsFull.db.get(id);
  return db
    ? utoolsFull.db.put({
        _id: id,
        data: value,
        _rev: db._rev,
      })
    : utoolsFull.db.put({
        _id: id,
        data: value,
      });
};

let delDB = (id) => {
  return utoolsFull.db.remove(id);
};

let getAll = (key) => {
  return utoolsFull.db.allDocs(key);
};

let delAll = (key) => {
  return getAll(key).forEach((x) => delDB(x._id));
};

let setStorage = utoolsFull.dbStorage.setItem;
let getStorage = utoolsFull.dbStorage.getItem;

const nativeId = utoolsFull.getNativeId();

let userData = {
  put: function (value, id, isNative = true) {
    let userData = getDB(DBPRE.USR + id);
    if (isNative) {
      userData[nativeId] = value;
    } else {
      userData.common = value;
      delete userData[nativeId];
    }
    let { ok } = putDB(userData, DBPRE.USR + id);
    return ok;
  },
  get: function (id) {
    let userData = getDB(DBPRE.USR + id);
    let nativeData = userData[nativeId];
    return nativeData ? nativeData : userData.common;
  },
  del: function (id) {
    let { ok } = delDB(DBPRE.USR + id);
    return ok;
  },
  all: function () {
    return getAll(DBPRE.USR).map((item) => {
      let isNative = !!item.data[nativeId];
      return {
        id: item._id.replace(DBPRE.USR, ""),
        value: isNative ? item.data[nativeId] : item.data.common,
        isNative: isNative,
      };
    });
  },
};

export const dbManager = {
  getDB,
  putDB,
  delDB,
  setStorage,
  getStorage,
  userData,
  getAll,
  delAll,
};
