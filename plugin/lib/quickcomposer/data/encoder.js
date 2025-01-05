const { dataConv } = require("./utils");

const encoder = {
  // base64 编码
  base64Encode: function (text) {
    return dataConv(text, "utf8", "base64");
  },
  // base64 解码
  base64Decode: function (text) {
    return dataConv(text, "base64", "utf8");
  },
  // URL 编码
  urlEncode: function (text) {
    return encodeURIComponent(text);
  },
  // URL 解码
  urlDecode: function (text) {
    return decodeURIComponent(text);
  },
  // html 编码
  htmlEncode: function (text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },
  // html 解码
  htmlDecode: function (text) {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  },
  // 十六进制
  hexEncode: function (text) {
    return dataConv(text, "utf8", "hex");
  },
  // 十六进制解码
  hexDecode: function (text) {
    return dataConv(text, "hex", "utf8");
  },
};

module.exports = encoder;
