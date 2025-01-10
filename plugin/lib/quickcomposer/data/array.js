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
  sort: function (array, key, order = "asc") {
    if (!Array.isArray(array)) return [];
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

  // 数组分组
  group: function (array, key) {
    if (!Array.isArray(array) || !key) return {};
    return array.reduce((groups, item) => {
      const value = key.split(".").reduce((obj, k) => obj?.[k], item);
      if (value !== undefined) {
        if (!groups[value]) {
          groups[value] = [];
        }
        groups[value].push(item);
      }
      return groups;
    }, {});
  },

  // 数组去重
  unique: function (array, key) {
    if (!Array.isArray(array)) return [];
    if (!key) {
      return [...new Set(array)];
    }
    const seen = new Set();
    return array.filter((item) => {
      const value = key.split(".").reduce((obj, k) => obj?.[k], item);
      if (value === undefined || seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  },

  // 数组聚合
  aggregate: function (array, operation, key) {
    if (!Array.isArray(array)) return null;
    const values = key
      ? array.map((item) => key.split(".").reduce((obj, k) => obj?.[k], item))
      : array;
    const validNumbers = values.filter((v) => !isNaN(v));

    switch (operation) {
      case "sum":
        return validNumbers.reduce((sum, val) => sum + val, 0);
      case "avg":
        return validNumbers.length
          ? validNumbers.reduce((sum, val) => sum + val, 0) /
              validNumbers.length
          : 0;
      case "max":
        return validNumbers.length ? Math.max(...validNumbers) : null;
      case "min":
        return validNumbers.length ? Math.min(...validNumbers) : null;
      case "count":
        return array.length;
      default:
        return null;
    }
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

  // 数组差集
  diff: function (array1, array2, key) {
    if (!Array.isArray(array1) || !Array.isArray(array2)) return [];
    if (!key) {
      return array1.filter((item) => !array2.includes(item));
    }
    const set2 = new Set(
      array2.map((item) => key.split(".").reduce((obj, k) => obj?.[k], item))
    );
    return array1.filter(
      (item) => !set2.has(key.split(".").reduce((obj, k) => obj?.[k], item))
    );
  },

  // 数组交集
  intersect: function (array1, array2, key) {
    if (!Array.isArray(array1) || !Array.isArray(array2)) return [];
    if (!key) {
      return array1.filter((item) => array2.includes(item));
    }
    const set2 = new Set(
      array2.map((item) => key.split(".").reduce((obj, k) => obj?.[k], item))
    );
    return array1.filter((item) =>
      set2.has(key.split(".").reduce((obj, k) => obj?.[k], item))
    );
  },

  // 数组并集
  union: function (array1, array2, key) {
    if (!Array.isArray(array1) || !Array.isArray(array2)) return [];
    if (!key) {
      return [...new Set([...array1, ...array2])];
    }
    const seen = new Set();
    return [...array1, ...array2].filter((item) => {
      const value = key.split(".").reduce((obj, k) => obj?.[k], item);
      if (value === undefined || seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  },

  // 数组分块
  chunk: function (array, size = 1) {
    if (!Array.isArray(array) || size < 1) return [];
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
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
};

module.exports = array;
