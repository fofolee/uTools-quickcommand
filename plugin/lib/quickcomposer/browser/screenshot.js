const { initCDP, cleanupCDP } = require("./cdp");
const { searchTarget } = require("./tabs");
const fs = require("fs");

// 捕获标签页截图
const captureScreenshot = async (tab, options = {}) => {
  const target = await searchTarget(tab);
  const { format = "png", quality = 100, savePath, selector = null } = options;

  try {
    const { Page, DOM } = await initCDP(target.id);
    await DOM.enable();

    let clip = null;
    if (selector) {
      // 获取DOM节点
      const { root } = await DOM.getDocument();
      const { nodeId } = await DOM.querySelector({
        nodeId: root.nodeId,
        selector: selector,
      });

      if (!nodeId) {
        throw new Error(`未找到元素: ${selector}`);
      }

      // 获取元素的精确四边形坐标
      const { quads } = await DOM.getContentQuads({ nodeId });
      if (!quads || quads.length === 0) {
        throw new Error("无法获取元素位置信息");
      }

      // 获取布局指标
      const { visualViewport } = await Page.getLayoutMetrics();
      const { pageX, pageY } = visualViewport;

      // 计算边界框
      const quad = quads[0];
      const x = Math.min(quad[0], quad[2], quad[4], quad[6]);
      const y = Math.min(quad[1], quad[3], quad[5], quad[7]);
      const width = Math.max(quad[0], quad[2], quad[4], quad[6]) - x;
      const height = Math.max(quad[1], quad[3], quad[5], quad[7]) - y;

      clip = {
        x: Math.round(x - pageX),
        y: Math.round(y - pageY),
        width: Math.round(width),
        height: Math.round(height),
        scale: 1,
      };

      // 确保尺寸不为0
      if (clip.width === 0) clip.width = 1;
      if (clip.height === 0) clip.height = 1;
    }

    const screenshotParams = {
      format,
      quality: format === "jpeg" ? quality : undefined,
      fromSurface: true,
      captureBeyondViewport: !!selector,
    };

    if (clip) {
      screenshotParams.clip = clip;
    }

    const { data } = await Page.captureScreenshot(screenshotParams);

    await DOM.disable();

    if (savePath) {
      fs.writeFileSync(savePath, data, "base64");
    }

    return data;
  } finally {
    await cleanupCDP(target.id);
  }
};

module.exports = {
  captureScreenshot,
};
