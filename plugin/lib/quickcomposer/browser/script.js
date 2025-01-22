const { executeScript } = require("./browser");

const clickElement = async (selector) => {
  return await executeScript(`document.querySelector('${selector}').click()`);
};

const inputText = async (selector, text) => {
  return await executeScript(
    `
      const el = document.querySelector('${selector}');
      el.value = '${text}';
      el.dispatchEvent(new Event('input'));
      el.dispatchEvent(new Event('change'));
    `
  );
};

const getText = async (selector) => {
  return await executeScript(
    `document.querySelector('${selector}')?.textContent || ''`
  );
};

const getHtml = async (selector) => {
  return await executeScript(
    `const element = document.querySelector('${selector}');
      return element ? element.innerHTML : '';`
  );
};

const hideElement = async (selector) => {
  return await executeScript(
    `document.querySelector('${selector}').style.display = 'none'`
  );
};

const showElement = async (selector) => {
  return await executeScript(
    `document.querySelector('${selector}').style.display = ''`
  );
};

const scrollTo = async (x, y) => {
  return await executeScript(`window.scrollTo(${x}, ${y})`);
};

const scrollToElement = async (selector) => {
  return await executeScript(
    `document.querySelector('${selector}').scrollIntoView()`
  );
};

const getScrollPosition = async () => {
  return await executeScript(`
      return JSON.stringify({
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
      });
    `);
};

const getPageSize = async () => {
  return await executeScript(`
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
    `);
};

const waitForElement = async (selector, timeout = 5000) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const result = await executeScript(
      `!!document.querySelector('${selector}')`
    );
    if (result) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`等待元素 ${selector} 超时`);
};

const injectCSS = async (css) => {
  return await executeScript(
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
