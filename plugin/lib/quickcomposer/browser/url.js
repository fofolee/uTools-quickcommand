const { initCDP, cleanupCDP } = require("./cdp");
const { searchTarget } = require("./tabs");

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
};

module.exports = {
  getUrl,
  setUrl,
};
