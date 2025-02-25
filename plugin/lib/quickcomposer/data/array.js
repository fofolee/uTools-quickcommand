const array = {
  // 安全的条件解析器
  _parseCondition: function (item, condition) {
    // 支持的操作符
    const operators = {
      "===": (a, b) => a === b,
      "!==": (a, b) => a !== b,
      ">=": (a, b) => a >= b,
      "<=": (a, b) => a <= b,
      ">": (a, b) => a > b,
      "<": (a, b) => a < b,
      "&&": (a, b) => a && b,
      "||": (a, b) => a || b,
      includes: (a, b) => String(a).includes(b),
      startsWith: (a, b) => String(a).startsWith(b),
      endsWith: (a, b) => String(a).endsWith(b),
    };

    try {
      // 简单属性访问
      if (/^[a-zA-Z0-9_]+$/.test(condition)) {
        return item[condition];
      }

      // 解析复杂条件
      for (const [op, func] of Object.entries(operators)) {
        if (condition.includes(op)) {
          const [left, right] = condition.split(op).map((s) => s.trim());
          const leftValue = left.includes(".")
            ? left.split(".").reduce((obj, key) => obj[key], item)
            : /^[a-zA-Z0-9_]+$/.test(left)
            ? item[left]
            : this._parseValue(left);
          const rightValue = right.includes(".")
            ? right.split(".").reduce((obj, key) => obj[key], item)
            : /^[a-zA-Z0-9_]+$/.test(right)
            ? item[right]
            : this._parseValue(right);
          return func(leftValue, rightValue);
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  // 解析值
  _parseValue: function (value) {
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "null") return null;
    if (value === "undefined") return undefined;
    if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
    if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
    if (!isNaN(value)) return Number(value);
    return value;
  },

  // 数组过滤
  filter: function (array, condition) {
    if (!Array.isArray(array)) return [];
    return array.filter((item) => this._parseCondition(item, condition));
  },

  // 查找元素
  find: function (array, condition) {
    if (!Array.isArray(array)) return null;
    return array.find((item) => this._parseCondition(item, condition));
  },

  // 数组映射
  map: function (array, transform) {
    if (!Array.isArray(array)) return [];
    return array.map((item) => {
      if (/^[a-zA-Z0-9_.]+$/.test(transform)) {
        return transform.split(".").reduce((obj, key) => obj?.[key], item);
      }
      return item;
    });
  },

  // 数组排序
  sort: function (array, order = "asc", key) {
    if (!Array.isArray(array)) return [];
    if (order === "shuffle") return this.shuffle(array);
    return [...array].sort((a, b) => {
      const valueA = key ? a[key] : a;
      const valueB = key ? b[key] : b;

      if (typeof valueA === "string" && typeof valueB === "string") {
        return order === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return order === "asc" ? valueA - valueB : valueB - valueA;
    });
  },

  // 数组去重
  unique: function (array) {
    if (!Array.isArray(array)) return [];
    return [...new Set(array)];
  },

  // 数组切片
  slice: function (array, start, end) {
    if (!Array.isArray(array)) return [];
    return array.slice(start, end);
  },

  // 数组扁平化
  flatten: function (array, depth = 1) {
    if (!Array.isArray(array)) return [];
    return array.flat(depth);
  },

  // 数组随机排序
  shuffle: function (array) {
    if (!Array.isArray(array)) return [];
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  // 数组添加元素
  push: function (array, element, index) {
    if (!Array.isArray(array)) return [];
    if (index === undefined) {
      array.push(element);
    } else {
      if (typeof index !== "number" || index < 0 || index > array.length) {
        throw new Error("位置参数错误");
      }
      array.splice(index, 0, element);
    }
    return array;
  },

  // 数组删除元素
  splice: function (array, start, deleteCount) {
    if (!Array.isArray(array)) return [];
    array.splice(start, deleteCount);
    return array;
  },

  // 数组连接
  join: function (array, separator) {
    if (!Array.isArray(array)) return "";
    return array.join(separator);
  },

  // 数组设置元素
  set: function (array, index, value) {
    if (!Array.isArray(array)) return [];
    array[index] = value;
    return array;
  },

  // 获取数组长度
  length: function (array) {
    if (!Array.isArray(array)) return 0;
    return array.length;
  },
};

module.exports = array;
