const CryptoJS = require("crypto-js");

// 数据编码转换
const dataConv = (str, fromCodec, toCodec) => {
  // 特殊处理 PEM 格式
  if (fromCodec.toLowerCase() === "pem") {
    const pemContent = str
      .replace(/-----(BEGIN|END)[^-]+-----/g, "")
      .replace(/[\r\n]/g, "");
    return Buffer.from(pemContent, "base64").toString(toCodec.toLowerCase());
  }
  // 其他格式直接转换
  return Buffer.from(str, fromCodec.toLowerCase()).toString(
    toCodec.toLowerCase()
  );
};

// 处理密钥和IV
const processSecret = (key, codec, len) => {
  // 转换成 hex 并填充到指定长度
  const hexStr = dataConv(key, codec, "hex")
    .padEnd(len * 2, "0")
    .slice(0, len * 2);
  return CryptoJS.enc.Hex.parse(hexStr);
};

module.exports = {
  dataConv,
  processSecret,
};
