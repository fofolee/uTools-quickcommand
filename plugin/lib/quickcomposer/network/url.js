const url = require("url");

// URL 解析
function parse(urlString, parseQueryString = false) {
  return url.parse(urlString, parseQueryString);
}

// URL 格式化
function format(urlObject) {
  return url.format(urlObject);
}

// 解析查询字符串
function parseQuery(query) {
  const searchParams = new URLSearchParams(query);
  const result = {};
  for (const [key, value] of searchParams) {
    result[key] = value;
  }
  return result;
}

// 格式化查询字符串
function formatQuery(queryObject) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(queryObject)) {
    searchParams.append(key, value);
  }
  return searchParams.toString();
}

// 解析路径名
function parsePath(path) {
  return url.parse(path);
}

// 解析主机名
function parseHost(host) {
  const { hostname, port } = url.parse(`http://${host}`);
  return { hostname, port };
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

// 解析 URL 的各个部分
function parseComponents(urlString) {
  const { protocol, auth, hostname, port, pathname, search, hash } =
    url.parse(urlString);

  return {
    protocol: protocol?.replace(":", ""),
    auth,
    hostname,
    port,
    pathname,
    search: search?.replace("?", ""),
    hash: hash?.replace("#", ""),
  };
}

module.exports = {
  parse,
  format,
  parseQuery,
  formatQuery,
  parsePath,
  parseHost,
  getQueryParam,
  addQueryParam,
  removeQueryParam,
  isAbsolute,
  parseComponents,
};
