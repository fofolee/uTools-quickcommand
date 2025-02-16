const { initCDP, cleanupCDP } = require("./cdp");
const { searchTarget } = require("./tabs");
const CDP = require("chrome-remote-interface");


const getUrl = async (tab) => {
  const target = await searchTarget(tab);
  const { Page } = await initCDP(target.id);
  const { frameTree } = await Page.getFrameTree();
  await cleanupCDP(target.id);
  return frameTree.frame.url;
};

const setUrl = async (tab, url) => {
  const target = await searchTarget(tab);
  const { Page } = await initCDP(target.id);
  await Page.navigate({ url });
  await Page.loadEventFired();
  await cleanupCDP(target.id);
  // let client;
  // try {
  //   // 连接到浏览器实例（默认端口 9222）
  //   client = await CDP();
  //   const { Page } = client;

  //   // 启用 Page 域的监听
  //   await Page.enable();

  //   // 导航到指定 URL
  //   await Page.navigate({ url });

  //   // 等待页面加载完成（可选）
  //   await new Promise((resolve) => Page.loadEventFired(resolve));
  //   console.log("页面加载完成");
  // } catch (err) {
  //   console.error("发生错误:", err);
  // } finally {
  //   if (client) await client.close();
  // }
};

module.exports = {
  getUrl,
  setUrl,
};
