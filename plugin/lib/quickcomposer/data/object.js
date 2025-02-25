const object = {
  // 获取对象属性值
  get: function (obj, key) {
    if (!obj || typeof obj !== "object") return undefined;
    return key.split(".").reduce((o, k) => o?.[k], obj);
  },

  // 设置对象属性值
  set: function (obj, key, value) {
    if (!obj || typeof obj !== "object") return obj;
    const keys = key.split(".");
    const lastKey = keys.pop();
    const target = keys.reduce((o, k) => {
      if (!o[k] || typeof o[k] !== "object") {
        o[k] = {};
      }
      return o[k];
    }, obj);
    target[lastKey] = value;
    return obj;
  },

  // 删除对象属性
  delete: function (obj, key) {
    if (!obj || typeof obj !== "object") return obj;
    const keys = key.split(".");
    const lastKey = keys.pop();
    const target = keys.reduce((o, k) => o?.[k], obj);
    if (target && typeof target === "object") {
      delete target[lastKey];
    }
    return obj;
  },

  // 合并对象
  merge: function (target, ...sources) {
    if (!target || typeof target !== "object") return target;
    return Object.assign(target, ...sources);
  },

  // 获取对象所有键
  keys: function (obj) {
    if (!obj || typeof obj !== "object") return [];
    return Object.keys(obj);
  },

  // 获取对象所有值
  values: function (obj) {
    if (!obj || typeof obj !== "object") return [];
    return Object.values(obj);
  },

  // 获取对象键值对
  entries: function (obj) {
    if (!obj || typeof obj !== "object") return [];
    return Object.entries(obj);
  },

  // 检查属性是否存在
  has: function (obj, key) {
    if (!obj || typeof obj !== "object") return false;
    return key.split(".").reduce((o, k) => o?.[k] !== undefined, true);
  },

  // 深拷贝对象
  clone: function (obj) {
    if (!obj || typeof obj !== "object") return obj;
    return JSON.parse(JSON.stringify(obj));
  },
};

module.exports = object;
