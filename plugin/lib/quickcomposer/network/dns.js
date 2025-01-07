const dns = require("dns");
const { promisify } = require("util");

// 将回调函数转换为 Promise
const lookup = promisify(dns.lookup);
const resolve = promisify(dns.resolve);
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);
const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);
const resolveNs = promisify(dns.resolveNs);
const resolveCname = promisify(dns.resolveCname);
const reverse = promisify(dns.reverse);

// 解析主机名
async function lookupHost(hostname, family = 0, all = false) {
  try {
    return await lookup(hostname, { family, all });
  } catch (error) {
    throw new Error(`DNS查询失败: ${error.message}`);
  }
}

// 解析所有记录
async function resolveAll(hostname) {
  try {
    return await resolve(hostname);
  } catch (error) {
    throw new Error(`DNS解析失败: ${error.message}`);
  }
}

// 解析 IPv4 地址
async function resolveIpv4(hostname) {
  try {
    return await resolve4(hostname);
  } catch (error) {
    throw new Error(`IPv4解析失败: ${error.message}`);
  }
}

// 解析 IPv6 地址
async function resolveIpv6(hostname) {
  try {
    return await resolve6(hostname);
  } catch (error) {
    throw new Error(`IPv6解析失败: ${error.message}`);
  }
}

// 解析 MX 记录
async function resolveMxRecords(hostname) {
  try {
    return await resolveMx(hostname);
  } catch (error) {
    throw new Error(`MX记录解析失败: ${error.message}`);
  }
}

// 解析 TXT 记录
async function resolveTxtRecords(hostname) {
  try {
    return await resolveTxt(hostname);
  } catch (error) {
    throw new Error(`TXT记录解析失败: ${error.message}`);
  }
}

// 解析 NS 记录
async function resolveNsRecords(hostname) {
  try {
    return await resolveNs(hostname);
  } catch (error) {
    throw new Error(`NS记录解析失败: ${error.message}`);
  }
}

// 解析 CNAME 记录
async function resolveCnameRecords(hostname) {
  try {
    return await resolveCname(hostname);
  } catch (error) {
    throw new Error(`CNAME记录解析失败: ${error.message}`);
  }
}

// 反向解析 IP 地址
async function reverseResolve(ip) {
  try {
    return await reverse(ip);
  } catch (error) {
    throw new Error(`反向解析失败: ${error.message}`);
  }
}

module.exports = {
  lookupHost,
  resolveAll,
  resolveIpv4,
  resolveIpv6,
  resolveMxRecords,
  resolveTxtRecords,
  resolveNsRecords,
  resolveCnameRecords,
  reverseResolve,
};
