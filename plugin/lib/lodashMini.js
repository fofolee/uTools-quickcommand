// 主要函数实现
const lodashMini = {
  /**
   * 创建一个新数组，将array与任何数组或值连接在一起
   * @param {Array} array - 要连接的第一个数组
   * @param {...*} values - 要连接的其他值
   * @returns {Array} 返回连接后的新数组
   * @example
   * concat([1], 2, [3], [[4]]) => [1, 2, 3, [4]]
   */
  concat: function (array, ...values) {
    return [].concat(array || [], ...values);
  },

  /**
   * 深拷贝一个值，支持大多数内置类型
   * @param {*} value - 要深拷贝的值
   * @returns {*} 返回深拷贝后的值
   * @example
   * cloneDeep([{ a: [1] }]) => [{ a: [1] }]
   */
  cloneDeep: function (value) {
    if (!this.isObject(value)) {
      return value;
    }

    if (this.isArray(value)) {
      return value.map((item) => this.cloneDeep(item));
    }

    if (this.isBuffer(value)) {
      const result = Buffer.allocUnsafe(value.length);
      value.copy(result);
      return result;
    }

    if (value instanceof Date) return new Date(value);
    if (value instanceof RegExp) return new RegExp(value.source, value.flags);
    if (value instanceof Set) {
      return new Set([...value].map((item) => this.cloneDeep(item)));
    }
    if (value instanceof Map) {
      return new Map(
        [...value].map(([k, v]) => [this.cloneDeep(k), this.cloneDeep(v)])
      );
    }
    if (typeof value === "function") {
      return value;
    }

    const result = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = this.cloneDeep(value[key]);
      }
    }
    return result;
  },

  /**
   * 遍历集合中的元素，返回所有通过断言检查的元素组成的数组
   * @param {Array|Object} collection - 要遍历的集合
   * @param {Function|String|Array|Object} predicate - 每次迭代调用的断言函数
   * @returns {Array} 返回过滤后的新数组
   * @example
   * filter([1, 2, 3], n => n > 1) => [2, 3]
   * filter([{ a: 1 }, { a: 2 }], 'a') => [{ a: 1 }, { a: 2 }]
   * filter([{ a: 1 }, { a: 2 }], ['a', 1]) => [{ a: 1 }]
   */
  filter: function (collection, predicate) {
    if (collection == null) return [];

    const iteratee =
      typeof predicate === "function"
        ? predicate
        : function (obj) {
            if (this.isArray(predicate)) {
              return predicate.length
                ? obj[predicate[0]] === predicate[1]
                : true;
            }
            if (typeof predicate === "object" && !this.isArray(predicate)) {
              for (const key in predicate) {
                if (!(key in obj) || obj[key] !== predicate[key]) {
                  return false;
                }
              }
              return true;
            }
            return obj[predicate];
          }.bind(this);

    return Array.isArray(collection)
      ? collection.filter((value, index) => iteratee(value, index, collection))
      : Object.entries(Object(collection))
          .filter(([key, value]) => iteratee(value, key, collection))
          .map(([_, value]) => value);
  },

  /**
   * 遍历对象的自身和继承的可枚举属性
   * @param {Object} object - 要遍历的对象
   * @param {Function} iteratee - 每次迭代调用的函数
   * @returns {Object} 返回对象本身
   * @example
   * forIn({ a: 1 }, (value, key) => console.log(key)) => 输出 'a'
   */
  forIn: function (object, iteratee) {
    if (object == null) return object;
    object = Object(object);
    for (const key in object) {
      if (iteratee(object[key], key, object) === false) {
        break;
      }
    }
    return object;
  },

  /**
   * 检查值是否为 Array 对象
   * @param {*} value - 要检查的值
   * @returns {boolean} 如果值为数组返回 true，否则返回 false
   * @example
   * isArray([1, 2, 3]) => true
   * isArray('abc') => false
   */
  isArray: function (value) {
    return Array.isArray(value);
  },

  /**
   * 检查值是否为 Buffer 对象
   * @param {*} value - 要检查的值
   * @returns {boolean} 如果值为 Buffer 返回 true，否则返回 false
   * @example
   * isBuffer(new Buffer(2)) => true
   * isBuffer(new Uint8Array(2)) => false
   */
  isBuffer: function (value) {
    return value instanceof Buffer;
  },

  /**
   * 检查值是否为空
   * @param {*} value - 要检查的值
   * @returns {boolean} 如果值为空返回 true，否则返回 false
   * @example
   * isEmpty(null) => true
   * isEmpty([1, 2, 3]) => false
   * isEmpty('') => true
   */
  isEmpty: function (value) {
    if (value == null) return true;

    if (
      this.isArray(value) ||
      typeof value === "string" ||
      this.isBuffer(value) ||
      value instanceof ArrayBuffer ||
      (typeof value === "object" && "length" in value)
    ) {
      return !value.length;
    }

    if (value instanceof Map || value instanceof Set) {
      return !value.size;
    }

    if (value instanceof ArrayBuffer) {
      return !value.byteLength;
    }

    if (typeof value === "object") {
      return !Object.keys(Object(value)).length;
    }

    return true;
  },

  /**
   * 检查值是否为 null 或 undefined
   * @param {*} value - 要检查的值
   * @returns {boolean} 如果值为 null 或 undefined 返回 true，否则返回 false
   * @example
   * isNil(null) => true
   * isNil(undefined) => true
   * isNil(0) => false
   */
  isNil: function (value) {
    return value == null;
  },

  /**
   * 检查值是否为对象
   * @param {*} value - 要检查的值
   * @returns {boolean} 如果值为对象返回 true，否则返回 false
   * @example
   * isObject({}) => true
   * isObject([1, 2, 3]) => true
   * isObject(null) => false
   */
  isObject: function (value) {
    return value != null && typeof value === "object";
  },

  /**
   * 创建一个对象，过滤掉不满足断言检查的属性
   * @param {Object} object - 来源对象
   * @param {Function} predicate - 断言函数，调用时传入 (value, key)
   * @returns {Object} 返回过滤后的新对象
   * @example
   * omitBy({ a: 1, b: '2' }, value => typeof value === 'number') => { b: '2' }
   */
  omitBy: function (object, predicate) {
    if (object == null) return {};
    object = Object(object);
    const result = {};
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        const value = object[key];
        if (!predicate(value, key)) {
          result[key] = value;
        }
      }
    }
    return result;
  },

  /**
   * 从对象中选取指定的属性
   * @param {Object} object - 来源对象
   * @param {...(string|string[])} paths - 要获取的属性路径
   * @returns {Object} 返回新对象
   * @example
   * pick({ a: 1, b: '2', c: 3 }, ['a', 'c']) => { a: 1, c: 3 }
   */
  pick: function (object, ...paths) {
    if (object == null) return {};
    object = Object(object);

    return (Array.isArray(paths[0]) ? paths[0] : paths).reduce(
      (result, path) => {
        if (path != null && object[path] !== undefined) {
          result[path] = object[path];
        }
        return result;
      },
      {}
    );
  },

  /**
   * 截断字符串
   * @param {string} [string=''] - 要截断的字符串
   * @param {Object} [options={}] - 选项对象
   * @param {number} [options.length=30] - 允许的最大长度
   * @param {string} [options.omission='...'] - 省略符号
   * @param {RegExp|string} [options.separator] - 截断点
   * @returns {string} 返回截断后的字符串
   * @example
   * truncate('hi-diddly-ho there, neighborino') => 'hi-diddly-ho there, neighbo...'
   */
  truncate: function (string = "", options = {}) {
    const { length = 30, omission = "...", separator } = options;

    if (string.length <= length) return string;

    const strLength = length - omission.length;
    if (strLength < 1) return omission;

    let result = string.slice(0, strLength);
    if (separator) {
      const lastIndex =
        typeof separator === "string"
          ? result.lastIndexOf(separator)
          : result.split("").reverse().join("").search(separator);
      if (lastIndex > -1) {
        result = result.slice(0, lastIndex);
      }
    }
    return result + omission;
  },

  /**
   * 创建一个去重后的数组
   * @param {...Array} arrays - 要合并的数组
   * @returns {Array} 返回新的去重数组
   * @example
   * union([2], [1, 2]) => [2, 1]
   */
  union: function (...arrays) {
    return [
      ...new Set(
        arrays.reduce((result, arr) => {
          if (Array.isArray(arr)) {
            result.push(...arr);
          }
          return result;
        }, [])
      ),
    ];
  },

  /**
   * 获取对象的所有值
   * @param {Object} object - 要获取值的对象
   * @returns {Array} 返回对象值的数组
   * @example
   * values({ a: 1, b: 2 }) => [1, 2]
   */
  values: function (object) {
    if (object == null) return [];
    return Object.values(Object(object));
  },

  /**
   * 创建一个不包含指定值的数组
   * @param {Array} array - 要检查的数组
   * @param {...*} values - 要排除的值
   * @returns {Array} 返回过滤后的新数组
   * @example
   * without([2, 1, 2, 3], 1, 2) => [3]
   */
  without: function (array, ...values) {
    return array == null
      ? []
      : array.filter((value) => !values.includes(value));
  },
};

module.exports = lodashMini;
