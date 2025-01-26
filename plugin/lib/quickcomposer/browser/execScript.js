const fs = require("fs");
const { initCDP, cleanupCDP } = require("./cdp");
const { searchTarget } = require("./tabs");

const executeScript = async (tab, script, args = {}) => {
  const target = await searchTarget(tab);
  try {
    const { Runtime } = await initCDP(target.id);
    const argNames = Object.keys(args);
    const argValues = Object.values(args).map((v) => JSON.stringify(v));

    const wrappedScript = `
      (async function(${argNames.join(", ")}) {
        ${script}
      })(${argValues.join(", ")})
    `;

    const { result } = await Runtime.evaluate({
      expression: wrappedScript,
      returnByValue: true,
      awaitPromise: true,
    });

    await cleanupCDP(target.id);
    return result.value;
  } catch (e) {
    console.log(e);
    throw new Error("执行脚本失败");
  }
};

const clickElement = async (tab, selector) => {
  return await executeScript(
    tab,
    `document.querySelector('${selector}').click()`
  );
};

const inputText = async (tab, selector, text) => {
  return await executeScript(
    tab,
    `
      const el = document.querySelector('${selector}');
      el.value = '${text}';
      el.dispatchEvent(new Event('input'));
      el.dispatchEvent(new Event('change'));
    `
  );
};

const submitForm = async (tab, buttonSelector, inputSelectors) => {
  return await executeScript(
    tab,
    `
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let el = null;
    ${inputSelectors
      .map(
        (i) =>
          `el = document.querySelector('${i.selector}');
          el.value = '${i.value}';
          el.dispatchEvent(new Event('input'));
          el.dispatchEvent(new Event('change'));`
      )
      .join("await sleep(200);")}
      await sleep(200);
      document.querySelector('${buttonSelector}').click();
    `
  );
};

const getText = async (tab, selector) => {
  return await executeScript(
    tab,
    `const element = document.querySelector('${selector}');
      return element?.textContent || element?.innerText || '';`
  );
};

const getHtml = async (tab, selector) => {
  return await executeScript(
    tab,
    `const element = document.querySelector('${selector}');
      return element?.outerHTML || '';`
  );
};

const hideElement = async (tab, selector) => {
  return await executeScript(
    tab,
    `document.querySelector('${selector}').style.display = 'none'`
  );
};

const showElement = async (tab, selector) => {
  return await executeScript(
    tab,
    `document.querySelector('${selector}').style.display = ''`
  );
};

const scrollTo = async (tab, x, y) => {
  return await executeScript(tab, `window.scrollTo(${x}, ${y})`);
};

const scrollToElement = async (tab, selector) => {
  return await executeScript(
    tab,
    `document.querySelector('${selector}').scrollIntoView()`
  );
};

const getScrollPosition = async (tab) => {
  const result = await executeScript(
    tab,
    `
      return JSON.stringify({
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
      });
    `
  );
  return JSON.parse(result);
};

const getPageSize = async (tab) => {
  const result = await executeScript(
    tab,
    `
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
    `
  );
  return JSON.parse(result);
};

const waitForElement = async (tab, selector, timeout = 5000) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const result = await executeScript(
      tab,
      `!!document.querySelector('${selector}')`
    );
    if (result) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`等待元素 ${selector} 超时`);
};

const injectCSS = async (tab, css) => {
  return await executeScript(
    tab,
    `
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    `,
    { css }
  );
};

const injectRemoteScript = async (tab, url) => {
  return await executeScript(
    tab,
    `
      return await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.type = 'text/javascript';
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load script: ' + url));
        document.head.appendChild(script);
      });
    `,
    { url }
  );
};

const injectLocalScript = async (tab, filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf8");

    return await executeScript(
      tab,
      `
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.textContent = content;
        document.head.appendChild(script);
        return true;
      `,
      { content }
    );
  } catch (error) {
    throw new Error(`注入本地脚本失败: ${error.message}`);
  }
};

module.exports = {
  executeScript,
  clickElement,
  inputText,
  submitForm,
  getText,
  getHtml,
  hideElement,
  showElement,
  scrollTo,
  scrollToElement,
  getScrollPosition,
  getPageSize,
  waitForElement,
  injectCSS,
  injectRemoteScript,
  injectLocalScript,
};
