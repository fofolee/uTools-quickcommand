export const userAgent = [
  {
    label: "Chrome (Windows)",
    value:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  },
  {
    label: "Chrome (macOS)",
    value:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  },
  {
    label: "Chrome (Linux)",
    value:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  },
  {
    label: "IE 11",
    value:
      "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
  },
  {
    label: "微信 (Android)",
    value:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/UQ1A.240205.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/122.0.6261.64 Mobile Safari/537.36 XWEB/1160027 MMWEBSDK/20231202 MMWEBID/2308 MicroMessenger/8.0.47.2560(0x28002F35) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
  },
  {
    label: "微信 (iOS)",
    value:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.47(0x18002f2c) NetType/WIFI Language/zh_CN",
  },
  {
    label: "iPhone",
    value:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  },
  {
    label: "iPad",
    value:
      "Mozilla/5.0 (iPad; CPU OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  },
  {
    label: "Android Phone",
    value:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
  },
  {
    label: "Android Tablet",
    value:
      "Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  },
];

export const commonHeaders = [
  { label: "Content-Type", value: "Content-Type" },
  { label: "Authorization", value: "Authorization" },
  { label: "User-Agent", value: "User-Agent" },
  { label: "Cookie", value: "Cookie" },
  { label: "Accept", value: "Accept" },
  { label: "Accept-Language", value: "Accept-Language" },
  { label: "Accept-Encoding", value: "Accept-Encoding" },
  { label: "Origin", value: "Origin" },
  { label: "Referer", value: "Referer" },
  { label: "X-Requested-With", value: "X-Requested-With" },
  { label: "X-Forwarded-For", value: "X-Forwarded-For" },
  { label: "X-Real-IP", value: "X-Real-IP" },
];

export const deviceName = [
  { label: "iPhone X", value: "iPhone X" },
  { label: "iPhone 12 Pro", value: "iPhone 12 Pro" },
  { label: "iPhone 14 Pro Max", value: "iPhone 14 Pro Max" },
  { label: "iPad Pro", value: "iPad Pro" },
  { label: "iPad Mini", value: "iPad Mini" },
  { label: "Pixel 5", value: "Pixel 5" },
  { label: "Pixel 7", value: "Pixel 7" },
  {
    label: "Samsung Galaxy S20 Ultra",
    value: "Samsung Galaxy S20 Ultra",
  },
  {
    label: "Samsung Galaxy Tab S7",
    value: "Samsung Galaxy Tab S7",
  },
  { label: "Xiaomi 12 Pro", value: "Xiaomi 12 Pro" },
  { label: "HUAWEI Mate30 Pro", value: "HUAWEI Mate30 Pro" },
];

export const contentTypes = [
  {
    label: "application/json",
    value: "application/json",
  },
  {
    label: "application/x-www-form-urlencoded",
    value: "application/x-www-form-urlencoded",
  },
  {
    label: "multipart/form-data",
    value: "multipart/form-data",
  },
  {
    label: "text/plain",
    value: "text/plain",
  },
  {
    label: "text/html",
    value: "text/html",
  },
  {
    label: "text/xml",
    value: "text/xml",
  },
  {
    label: "application/xml",
    value: "application/xml",
  },
  {
    label: "application/octet-stream",
    value: "application/octet-stream",
  },
];

export const methods = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "HEAD",
  "OPTIONS",
];

export const responseTypes = ["json", "text", "blob", "arraybuffer"];
