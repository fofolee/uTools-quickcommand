const { executeScript } = require("./execScript");
const fs = require("fs");
const path = require("path");

const getOptimalSelector = () => {
  return `
  // 获取最优选择器
  function getOptimalSelector_secondary(element) {
    if (!element || element === document.body) return 'body';

    // 尝试使用id
    if (element.id) {
      return '#' + element.id;
    }

    // 构建当前元素的选择器
    let currentSelector = element.tagName.toLowerCase();
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\\s+/);
      if (classes.length) {
        currentSelector += '.' + classes.join('.');
      }
    }

    // 1. 尝试仅使用类名组合
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\\s+/);
      if (classes.length) {
        const classSelector = '.' + classes.join('.');
        if (document.querySelectorAll(classSelector).length === 1) {
          return classSelector;
        }
      }
    }

    // 2. 尝试仅使用标签名和类名组合
    if (document.querySelectorAll(currentSelector).length === 1) {
      return currentSelector;
    }

    // 3. 如果需要使用 nth-child，先尝试简单组合
    const siblings = Array.from(element.parentElement?.children || []);
    const index = siblings.indexOf(element);
    if (index !== -1) {
      const nthSelector = currentSelector + ':nth-child(' + (index + 1) + ')';
      if (document.querySelectorAll(nthSelector).length === 1) {
        return nthSelector;
      }
    }

    // 4. 向上查找最近的有id的祖先元素
    let ancestor = element;
    let foundSelectors = [];

    while (ancestor && ancestor !== document.body) {
      if (ancestor.id) {
        foundSelectors.push({
          selector: '#' + ancestor.id,
          element: ancestor
        });
      }

      // 收集所有可能有用的类名组合
      if (ancestor.className && typeof ancestor.className === 'string') {
        const classes = ancestor.className.trim().split(/\\s+/);
        if (classes.length) {
          const classSelector = ancestor.tagName.toLowerCase() + '.' + classes.join('.');
          if (document.querySelectorAll(classSelector).length < 10) { // 只收集相对独特的选择器
            foundSelectors.push({
              selector: classSelector,
              element: ancestor
            });
          }
        }
      }

      ancestor = ancestor.parentElement;
    }

    // 5. 尝试各种组合，找到最短的唯一选择器
    for (const {selector: anchorSelector} of foundSelectors) {
      // 尝试直接组合
      const simpleSelector = anchorSelector + ' ' + currentSelector;
      if (document.querySelectorAll(simpleSelector).length === 1) {
        return simpleSelector;
      }

      // 如果直接组合不唯一，尝试加上 nth-child
      if (index !== -1) {
        const nthSelector = anchorSelector + ' ' + currentSelector + ':nth-child(' + (index + 1) + ')';
        if (document.querySelectorAll(nthSelector).length === 1) {
          return nthSelector;
        }
      }
    }

    // 6. 如果还是找不到唯一选择器，使用两层有特征的选择器组合
    for (let i = 0; i < foundSelectors.length - 1; i++) {
      for (let j = i + 1; j < foundSelectors.length; j++) {
        const combinedSelector = foundSelectors[i].selector + ' ' + foundSelectors[j].selector + ' ' + currentSelector;
        if (document.querySelectorAll(combinedSelector).length === 1) {
          return combinedSelector;
        }
      }
    }

    // 7. 最后的后备方案：使用完整的父子选择器
    const parent = element.parentElement;
    if (!parent) return null;

    const parentSelector = getOptimalSelector(parent);
    if (!parentSelector) return null;

    return parentSelector + ' ' + currentSelector + (index !== -1 ? ':nth-child(' + (index + 1) + ')' : '');
  }
  `;
};

const getSelector = async (tab) => {
  return await executeScript(
    tab,
    `
    return new Promise((resolve) => {
      // 创建高亮元素
      const highlight = document.createElement('div');
      highlight.style.cssText = 'position: fixed; pointer-events: none; z-index: 10000; background: rgba(130, 180, 230, 0.4); border: 2px solid rgba(130, 180, 230, 0.8); transition: all 0.2s;';
      document.body.appendChild(highlight);

      if (typeof OptimalSelect === 'undefined') {
        ${fs.readFileSync(path.join(__dirname, "optimalSelect.js"), "utf-8")}
      }

      function getOptimalSelector(element) {
        return OptimalSelect.select(element)
      }

      ${getOptimalSelector()}

      // 处理鼠标移动
      function handleMouseMove(e) {
        const target = e.target;
        if (!target || target === highlight) return;

        const rect = target.getBoundingClientRect();
        highlight.style.left = rect.left + 'px';
        highlight.style.top = rect.top + 'px';
        highlight.style.width = rect.width + 'px';
        highlight.style.height = rect.height + 'px';
      }

      // 处理点击
      function handleClick(e) {
        e.preventDefault();
        e.stopPropagation();

        const target = e.target;
        if (!target || target === highlight) return;
        let selector = null;
        try {
          selector = getOptimalSelector(target);
        } catch (e) {
          selector = getOptimalSelector_secondary(target);
        }

        // 清理
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleClick, true);
        highlight.remove();

        resolve(selector);
        return false;
      }

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleClick, true);
    });
  `
  );
};

module.exports = {
  getSelector,
};
