const url = require("url");

// URL 解析
function parse(urlString) {
  try {
    return url.parse(urlString, false);
  } catch (error) {
    throw new Error(`URL解析失败: ${error.message}`);
  }
}

// 格式化 URL
function format(protocol, auth, hostname, port, pathname, search, hash) {
  try {
    const urlObject = {
      protocol,
      auth,
      hostname,
      port,
      pathname,
      search,
      hash,
    };
    return url.format(urlObject);
  } catch (error) {
    throw new Error(`URL格式化失败: ${error.message}`);
  }
}

// 解析查询字符串
function parseQuery(queryString) {
  try {
    const searchParams = new URLSearchParams(queryString);
    const result = {};
    for (const [key, value] of searchParams) {
      result[key] = value;
    }
    return result;
  } catch (error) {
    throw new Error(`查询字符串解析失败: ${error.message}`);
  }
}

// 格式化查询字符串
function formatQuery(queryParams) {
  try {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      searchParams.append(key, value);
    }
    return searchParams.toString();
  } catch (error) {
    throw new Error(`查询字符串格式化失败: ${error.message}`);
  }
}

// 解析 URL 参数
function getQueryParam(urlString, param) {
  const { query } = url.parse(urlString, true);
  return query[param];
}

// 添加 URL 参数
function addQueryParam(urlString, param, value) {
  const parsedUrl = url.parse(urlString, true);
  parsedUrl.query[param] = value;
  parsedUrl.search = null; // 清除 search，以便 format 时使用 query
  return url.format(parsedUrl);
}

// 移除 URL 参数
function removeQueryParam(urlString, param) {
  const parsedUrl = url.parse(urlString, true);
  delete parsedUrl.query[param];
  parsedUrl.search = null;
  return url.format(parsedUrl);
}

// 检查是否是绝对 URL
function isAbsolute(urlString) {
  return url.parse(urlString).protocol !== null;
}

module.exports = {
  parse,
  format,
  parseQuery,
  formatQuery,
  getQueryParam,
  addQueryParam,
  removeQueryParam,
  isAbsolute,
};
