/**
 * 判断内容是否为 quickcommand 可导入格式
 */

// 是否含有 quickcommand 键值
let isJsonQc = (obj, strict = true) => {
  const keys = strict ? ["features", "program", "output"] : ["program"];
  if (keys.find((x) => !obj[x])) return false;
  return true;
};

let payloadParser = async (payload) => {
  const [, format, value] = payload.split("/");
  if (format === "base64") return window.base64Decode(value);
  else if (format === "id") return await window.getSharedQcById(value);
  else throw new Error("不支持的格式");
};

// 判断是否为可导入的快捷命令
let quickcommandParser = async (payload, strict = true) => {
  try {
    if (payload.slice(0, 3) === "qc/") {
      payload = await payloadParser(payload);
    }
    const qc = JSON.parse(payload);
    if (isJsonQc(qc, strict)) {
      return { single: true, qc };
    } else if (!Object.values(qc).find((q) => !isJsonQc(q, strict))) {
      return { single: false, qc };
    }
  } catch (_) {}
  return false;
};

export default quickcommandParser;
