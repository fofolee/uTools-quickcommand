module.exports = {
  // 获取当前地址
  getUrl: async function (browser = "Microsoft Edge") {
    const result = await quickcommand.runAppleScript(`
      tell application "${browser}"
        set currentTab to active tab of front window
        return URL of currentTab
      end tell
    `);
    return result;
  },

  // 设置当前地址
  setUrl: async function (browser = "Microsoft Edge", url) {
    return await quickcommand.runAppleScript(`
      tell application "${browser}"
        set URL of active tab of front window to "${url}"
      end tell
    `);
  },

  // 获取标签列表
  getTabs: async function (browser = "Microsoft Edge") {
    const result = await quickcommand.runAppleScript(`
      tell application "${browser}"
        set tabList to every tab of front window
        set json to "["
        repeat with i from 1 to count of tabList
          set currentTab to item i of tabList
          set json to json & "{"
          set json to json & "\\"title\\":\\"" & title of currentTab & "\\","
          set json to json & "\\"url\\":\\"" & URL of currentTab & "\\","
          set json to json & "\\"index\\":" & i & ","
          set json to json & "\\"loading\\":" & loading of currentTab
          set json to json & "}"
          if i < count of tabList then
            set json to json & ","
          end if
        end repeat
        set json to json & "]"
        return json
      end tell
    `);
    return JSON.parse(result);
  },

  // 切换标签
  activateTab: async function (browser = "Microsoft Edge", index) {
    return await quickcommand.runAppleScript(`
        tell application "${browser}"
          activate
          tell front window
            set active tab index to ${index}
          end tell
        end tell
      `);
  },

  // 执行脚本
  executeScript: async function (
    browser = "Microsoft Edge",
    script,
    newScope = true
  ) {
    try {
      // 默认在两边加上括号让脚本每次在新的作用域执行，防止变量污染
      if (newScope) script = "{" + script + "}";
      // 使用JSON.stringify处理转义
      const escapedScript = JSON.stringify(script);
      console.log(escapedScript);

      return await quickcommand.runAppleScript(`
        tell application "${browser}"
          tell front window
            tell active tab
              execute javascript ${escapedScript}
            end tell
          end tell
        end tell
      `);
    } catch (error) {
      quickcommand.showSystemMessageBox("执行失败", error.toString());
    }
  },

  // 点击元素
  clickElement: async function (browser = "Microsoft Edge", selector) {
    const script = `
      const element = document.querySelector('${selector}');
      if (element) {
        element.click();
        'success';
      } else {
        'element not found';
      }
    `;
    return await this.executeScript(browser, script);
  },

  // 输入文本
  inputText: async function (browser = "Microsoft Edge", selector, text) {
    const script = `
      const element = document.querySelector('${selector}');
      if (element) {
        element.value = '${text}';
        element.dispatchEvent(new Event('input'));
        element.dispatchEvent(new Event('change'));
        'success';
      } else {
        'element not found';
      }
    `;
    return await this.executeScript(browser, script);
  },

  // 获取文本
  getText: async function (browser = "Microsoft Edge", selector) {
    const script = `
      const element = document.querySelector('${selector}');
      element ? element.textContent : '';
    `;
    return await this.executeScript(browser, script);
  },

  // 获取HTML
  getHtml: async function (browser = "Microsoft Edge", selector) {
    const script = `
      const element = document.querySelector('${selector}');
      element ? element.innerHTML : '';
    `;
    return await this.executeScript(browser, script);
  },

  // 隐藏元素
  hideElement: async function (browser = "Microsoft Edge", selector) {
    const script = `
      const element = document.querySelector('${selector}');
      if (element) {
        element.style.display = 'none';
        'success';
      } else {
        'element not found';
      }
    `;
    return await this.executeScript(browser, script);
  },

  // 显示元素
  showElement: async function (browser = "Microsoft Edge", selector) {
    const script = `
      const element = document.querySelector('${selector}');
      if (element) {
        element.style.display = '';
        'success';
      } else {
        'element not found';
      }
    `;
    return await this.executeScript(browser, script);
  },

  // 注入CSS
  injectCSS: async function (browser = "Microsoft Edge", css) {
    const script = `
      const style = document.createElement('style');
      style.textContent = \`${css}\`;
      document.head.appendChild(style);
      'success';
    `;
    return await this.executeScript(browser, script);
  },

  // 设置Cookie
  setCookie: async function (
    browser = "Microsoft Edge",
    cookies,
    options = {}
  ) {
    // 在外部构建所有cookie的设置语句
    console.log(cookies, options);
    const cookieStatements = cookies
      .map((cookie) => {
        let cookieString = `${cookie.name}=${cookie.value}`;
        if (options.expires) cookieString += `;expires=${options.expires}`;
        if (options.path) cookieString += `;path=${options.path}`;
        if (options.domain) cookieString += `;domain=${options.domain}`;
        if (options.secure) cookieString += ";secure";
        if (options.sameSite) cookieString += `;samesite=${options.sameSite}`;
        return `document.cookie = ${JSON.stringify(cookieString)};`;
      })
      .join("\n");

    const script = `
      ${cookieStatements}
      'success';
    `;

    return await this.executeScript(browser, script);
  },

  // 获取Cookie
  getCookie: async function (browser = "Microsoft Edge", name) {
    const script = `
      const value = document.cookie
        .split('; ')
        .find(row => row.startsWith('${name}='))
        ?.split('=')[1];
      value || '';
    `;
    return await this.executeScript(browser, script);
  },

  // 删除Cookie
  deleteCookie: async function (
    browser = "Microsoft Edge",
    name,
    path = "/",
    domain = ""
  ) {
    const script = `
      document.cookie = '${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT' +
        (${domain ? `'; domain=${domain}'` : "''"}) +
        (${path ? `'; path=${path}'` : "''"});
      'success';
    `;
    return await this.executeScript(browser, script);
  },

  // 滚动到指定位置
  scrollTo: async function (browser = "Microsoft Edge", x, y) {
    const script = `
      window.scrollTo(${x}, ${y});
      'success';
    `;
    return await this.executeScript(browser, script);
  },

  // 滚动到元素位置
  scrollToElement: async function (browser = "Microsoft Edge", selector) {
    const script = `
      const element = document.querySelector('${selector}');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        'success';
      } else {
        'element not found';
      }
    `;
    return await this.executeScript(browser, script);
  },

  // 获取滚动位置
  getScrollPosition: async function (browser = "Microsoft Edge") {
    const script = `
      JSON.stringify({
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
      });
    `;
    return await this.executeScript(browser, script);
  },

  // 获取页面尺寸
  getPageSize: async function (browser = "Microsoft Edge") {
    const script = `
      JSON.stringify({
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
    return await this.executeScript(browser, script);
  },

  // 等待元素出现
  waitForElement: async function (
    browser = "Microsoft Edge",
    selector,
    timeout = 5000
  ) {
    const script = `
      new Promise((resolve, reject) => {
        const element = document.querySelector('${selector}');
        if (element) {
          resolve('found');
          return;
        }

        const observer = new MutationObserver((mutations, obs) => {
          const element = document.querySelector('${selector}');
          if (element) {
            obs.disconnect();
            resolve('found');
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        setTimeout(() => {
          observer.disconnect();
          reject('timeout');
        }, ${timeout});
      });
    `;
    return await this.executeScript(browser, script);
  },

  // 监听元素变化
  observeElement: async function (
    browser = "Microsoft Edge",
    selector,
    callback
  ) {
    const script = `
      const element = document.querySelector('${selector}');
      if (!element) return 'element not found';

      const observer = new MutationObserver((mutations) => {
        const data = mutations.map(mutation => ({
          type: mutation.type,
          target: mutation.target.outerHTML,
          addedNodes: Array.from(mutation.addedNodes).map(node => node.outerHTML),
          removedNodes: Array.from(mutation.removedNodes).map(node => node.outerHTML)
        }));
        window.webkit.messageHandlers.callback.postMessage(JSON.stringify(data));
      });

      observer.observe(element, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true
      });

      'success';
    `;
    return await this.executeScript(browser, script);
  },
};
