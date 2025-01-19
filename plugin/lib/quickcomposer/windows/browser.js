const { runCsharpFeature } = require("../../csharp");

const addressBarName = "地址和搜索栏";
const addressBarXpath =
  "/Pane[3]/Pane/Pane[1]/Pane[2]/Pane[1]/ToolBar/Pane/Group/Edit";

const runBrowserAutomation = async (params) => {
  const { value, browser = "msedge" } = params;
  const baseArgs = ["-method", "process", "-window", browser];

  if (value) {
    baseArgs.push("-type", "setvalue", "-value", value, "-sendenter");
  } else {
    baseArgs.push("-type", "getvalue");
  }

  try {
    return await runCsharpFeature("automation", [
      ...baseArgs,
      "-name",
      addressBarName,
    ]);
  } catch (error) {
    console.log(error);
    try {
      return await runCsharpFeature("automation", [
        ...baseArgs,
        "-xpath",
        addressBarXpath,
      ]);
    } catch (error) {
      console.log(error);
      throw "获取浏览器地址栏失败";
    }
  }
};

const setUrl = async (browser = "msedge", url) => {
  return await runBrowserAutomation({ value: url, browser });
};

const getUrl = async (browser = "msedge") => {
  return await runBrowserAutomation({ browser });
};

const executeScript = async (browser = "msedge", script, args = {}) => {
  // 构建参数列表
  const argNames = Object.keys(args);
  const argValues = Object.values(args).map((v) => JSON.stringify(v));

  const wrapperScript = `
        (function(${argNames.join(", ")}) {
          ${script}
        })(${argValues.join(", ")})
      `;
  return await runBrowserAutomation({
    value: `javascript:${encodeURIComponent(wrapperScript)}`,
    browser,
  });
};

// 点击元素
const clickElement = async (browser = "msedge", selector) => {
  const script = `
      const element = document.querySelector('${selector}');
      if (element) {
        element.click();
        return '##execute_script_success##';
      } else {
        return '##execute_script_failed##';
      }
    `;
  return await executeScript(browser, script);
};

// 输入文本
const inputText = async (browser = "msedge", selector, text) => {
  const script = `
      const element = document.querySelector('${selector}');
      if (element) {
        element.value = '${text}';
        element.dispatchEvent(new Event('input'));
        element.dispatchEvent(new Event('change'));
        return '##execute_script_success##';
      } else {
        return '##execute_script_failed##';
      }
    `;
  return await executeScript(browser, script);
};

// 获取文本
const getText = async (browser = "msedge", selector) => {
  const script = `
      const element = document.querySelector('${selector}');
      return element ? element.textContent : '';
    `;
  return await executeScript(browser, script);
};

// 获取HTML
const getHtml = async (browser = "msedge", selector) => {
  const script = `
      const element = document.querySelector('${selector}');
      return element ? element.innerHTML : '';
    `;
  return await executeScript(browser, script);
};

// 隐藏元素
const hideElement = async (browser = "msedge", selector) => {
  const script = `
      const element = document.querySelector('${selector}');
      if (element) {
        element.style.display = 'none';
        return '##execute_script_success##';
      } else {
        return '##execute_script_failed##';
      }
    `;
  return await executeScript(browser, script);
};

// 显示元素
const showElement = async (browser = "msedge", selector) => {
  const script = `
      const element = document.querySelector('${selector}');
      if (element) {
        element.style.display = '';
        return '##execute_script_success##';
      } else {
        return '##execute_script_failed##';
      }
    `;
  return await executeScript(browser, script);
};

// 注入CSS
const injectCSS = async (browser = "msedge", css) => {
  const script = `
      const style = document.createElement('style');
      style.textContent = \`${css}\`;
      document.head.appendChild(style);
      return '##execute_script_success##';
    `;
  return await executeScript(browser, script);
};

// 设置Cookie
const setCookie = async (browser = "msedge", cookies, options = {}) => {
  const cookieStatements = cookies
    .map((cookie) => {
      let cookieString = `${cookie.name}=${cookie.value}`;
      if (options.expires) {
        const expiresDate = new Date(
          Date.now() + options.expires * 60 * 60 * 1000
        );
        cookieString += `;expires=${expiresDate.toUTCString()}`;
      }
      if (options.path) cookieString += `;path=${options.path}`;
      if (options.domain) cookieString += `;domain=${options.domain}`;
      if (options.secure) cookieString += ";secure";
      return `document.cookie = ${JSON.stringify(cookieString)};`;
    })
    .join("\n");

  const script = `
      ${cookieStatements}
      return '##execute_script_success##';
    `;

  return await this.executeScript(browser, script);
};

// 获取Cookie
const getCookie = async (browser = "msedge", name) => {
  const script = `
      const value = document.cookie
        .split('; ')
        .find(row => row.startsWith('${name}='))
        ?.split('=')[1];
      return value || '';
    `;
  return await executeScript(browser, script);
};

// 删除Cookie
const deleteCookie = async (
  browser = "msedge",
  name,
  path = "/",
  domain = ""
) => {
  const script = `
      document.cookie = '${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT' +
        (${domain ? `'; domain=${domain}'` : "''"}) +
        (${path ? `'; path=${path}'` : "''"});
      return '##execute_script_success##';
    `;
  return await executeScript(browser, script);
};

// 滚动到指定位置
const scrollTo = async (browser = "msedge", x, y) => {
  const script = `
      window.scrollTo(${x}, ${y});
      return '##execute_script_success##';
    `;
  return await executeScript(browser, script);
};

// 滚动到元素位置
const scrollToElement = async (browser = "msedge", selector) => {
  const script = `
      const element = document.querySelector('${selector}');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return '##execute_script_success##';
      } else {
        return '##execute_script_failed##';
      }
    `;
  return await executeScript(browser, script);
};

// 获取滚动位置
const getScrollPosition = async (browser = "msedge") => {
  const script = `
      return JSON.stringify({
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
      });
    `;
  return await executeScript(browser, script);
};

// 获取页面尺寸
const getPageSize = async (browser = "msedge") => {
  const script = `
      return JSON.stringify({
        width: Math.max(
          document.documentElement.scrollWidth,
          document.documentElement.clientWidth
        ),
        height: Math.max(
          document.documentElement.scrollHeight,
          document.documentElement.clientHeight
        )
      });
    `;
  return await executeScript(browser, script);
};

// 等待元素出现
const waitForElement = async (browser = "msedge", selector, timeout = 5000) => {
  const startTime = Date.now();

  // 检查元素是否存在的函数
  const checkScript = `
      const element = document.querySelector('${selector}');
      return element ? '##execute_script_success##' : '##execute_script_failed##';
    `;

  // 轮询检查元素
  while (Date.now() - startTime < timeout) {
    const result = await executeScript(browser, checkScript);
    if (result === true) {
      return true;
    }
    // 等待100ms再次检查
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return false;
};

module.exports = {
  getUrl,
  setUrl,
  executeScript,
  clickElement,
  inputText,
  getText,
  getHtml,
  hideElement,
  showElement,
  injectCSS,
  setCookie,
  getCookie,
  deleteCookie,
  scrollTo,
  scrollToElement,
  getScrollPosition,
  getPageSize,
  waitForElement,
};
