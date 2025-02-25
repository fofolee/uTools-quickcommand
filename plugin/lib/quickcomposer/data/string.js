const string = {
  // 字符串反转
  reverse: function (text) {
    return text.split("").reverse().join("");
  },

  // 字符串替换
  replace: function (text, oldStr, newStr) {
    return text.replaceAll(oldStr, newStr);
  },

  // 字符串截取
  substring: function (text, start, end) {
    return text.substring(start, end);
  },

  // 去除空白
  trim: function (text, mode = "both") {
    switch (mode) {
      case "start":
        return text.trimStart();
      case "end":
        return text.trimEnd();
      default:
        return text.trim();
    }
  },

  // 大小写转换
  changeCase: function (text, mode = "upper") {
    switch (mode) {
      case "upper":
        return text.toUpperCase();
      case "lower":
        return text.toLowerCase();
      case "capitalize":
        return text
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      case "camel":
        return text
          .toLowerCase()
          .split(/[^a-zA-Z0-9]+/)
          .map((word, index) =>
            index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
          )
          .join("");
      case "snake":
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, "_")
          .replace(/([A-Z])/g, "_$1")
          .replace(/^_/, "");
      case "kebab":
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, "-")
          .replace(/([A-Z])/g, "-$1")
          .replace(/^-/, "");
      case "constant":
        return text
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "_")
          .replace(/^_/, "");
      default:
        return text;
    }
  },

  // 字符串填充
  pad: function (text, length, padString = " ", mode = "end") {
    const totalPadding = Math.max(0, length - text.length);
    switch (mode) {
      case "start":
        return text.padStart(length, padString);
      case "end":
        return text.padEnd(length, padString);
      case "both":
        const leftPadding = Math.floor(totalPadding / 2);
        const rightPadding = totalPadding - leftPadding;
        return text
          .padStart(text.length + leftPadding, padString)
          .padEnd(length, padString);
      default:
        return text;
    }
  },

  // 字符串分割
  split: function (text, separator = ",") {
    return text.split(separator);
  },

  // 字符串重复
  repeat: function (text, count = 1) {
    return text.repeat(Math.max(0, count));
  },

  // 提取字符
  extract: function (text, mode = "number") {
    const patterns = {
      number: /\d+/g,
      letter: /[a-zA-Z]+/g,
      chinese: /[\u4e00-\u9fa5]+/g,
      punctuation: /[^\w\s\u4e00-\u9fa5]+/g,
      whitespace: /\s+/g,
    };
    const matches = text.match(patterns[mode] || patterns.number);
    return matches ? matches : [];
  },

  // 字符统计
  count: function (text, mode = "char") {
    switch (mode) {
      case "char":
        return text.length;
      case "word":
        return text.trim().split(/\s+/).length;
      case "line":
        return text.split(/\r\n|\r|\n/).length;
      case "number":
        return (text.match(/\d/g) || []).length;
      case "letter":
        return (text.match(/[a-zA-Z]/g) || []).length;
      case "chinese":
        return (text.match(/[\u4e00-\u9fa5]/g) || []).length;
      case "whitespace":
        return (text.match(/\s/g) || []).length;
      default:
        return 0;
    }
  },

  // 文本换行
  wrap: function (text, width = 80) {
    const words = text.split(/(\s+)/);
    let line = "";
    let result = "";

    for (const word of words) {
      if (line.length + word.length > width) {
        result += line.trimEnd() + "\n";
        line = "";
      }
      line += word;
    }

    return result + line.trimEnd();
  },

  // 文本对齐
  align: function (text, mode = "left", width = 80) {
    const lines = text.split("\n");
    return lines
      .map((line) => {
        const spaces = width - line.length;
        if (spaces <= 0) return line;

        switch (mode) {
          case "right":
            return " ".repeat(spaces) + line;
          case "center":
            const leftSpaces = Math.floor(spaces / 2);
            return (
              " ".repeat(leftSpaces) + line + " ".repeat(spaces - leftSpaces)
            );
          case "justify":
            if (line.trim() === "") return line;
            const words = line.trim().split(/\s+/);
            if (words.length === 1) return line;
            const totalSpaces = width - words.join("").length;
            const spaceBetween = Math.floor(totalSpaces / (words.length - 1));
            const extraSpaces = totalSpaces % (words.length - 1);
            return words
              .map((word, i) =>
                i < words.length - 1
                  ? word + " ".repeat(spaceBetween + (i < extraSpaces ? 1 : 0))
                  : word
              )
              .join("");
          default:
            return line;
        }
      })
      .join("\n");
  },
};

module.exports = string;
