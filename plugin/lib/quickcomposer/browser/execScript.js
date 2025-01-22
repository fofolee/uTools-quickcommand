const { executeScript } = require("./browser");

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

const getText = async (tab, selector) => {
  return await executeScript(
    tab,
    `document.querySelector('${selector}')?.textContent || ''`
  );
};

const getHtml = async (tab, selector) => {
  return await executeScript(
    tab,
    `const element = document.querySelector('${selector}');
      return element ? element.innerHTML : '';`
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
  return await executeScript(
    tab,
    `
      return JSON.stringify({
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
      });
    `
  );
};

const getPageSize = async (tab) => {
  return await executeScript(
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
      style.textContent = \`${css}\`;
      document.head.appendChild(style);
    `
  );
};

module.exports = {
  clickElement,
  inputText,
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
};
