const string = {
  // 字符串反转
  reverseString: function (text) {
    return text.split("").reverse().join("");
  },
  // 字符串替换
  replaceString: function (text, oldStr, newStr) {
    return text.replaceAll(oldStr, newStr);
  },
  // 字符串截取
  substring: function (text, start, end) {
    return text.substring(start, end);
  },
  // 正则处理
  regexTransform: function (text, regex, replace) {
    try {
      if (replace === undefined) return text.match(regex);
      return text.replace(regex, replace);
    } catch (e) {
      throw "正则表达式格式错误";
    }
  },
};

module.exports = string;
