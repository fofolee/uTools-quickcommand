const { initCDP, cleanupCDP } = require("./cdp");
const { searchTarget } = require("./tabs");

const setCookie = async (tab, cookies, options = {}) => {
  const target = await searchTarget(tab);
  const { Network, Page } = await initCDP(target.id);
  try {
    const { frameTree } = await Page.getFrameTree();
    const url = frameTree.frame.url;

    for (const cookie of cookies) {
      await Network.setCookie({
        name: cookie.name,
        value: cookie.value,
        domain: options.domain || url.split("/")[2],
        path: options.path || "/",
        secure: options.secure || false,
        expires: options.expires
          ? Math.floor(Date.now() / 1000) + options.expires * 3600
          : undefined,
      });
    }
  } finally {
    await cleanupCDP(target.id);
  }
};

const getCookie = async (tab, name) => {
  const target = await searchTarget(tab);
  const { Network } = await initCDP(target.id);
  const { cookies } = await Network.getCookies();
  await cleanupCDP(target.id);
  if (!name) return cookies;
  return cookies.find((cookie) => cookie.name === name);
};

module.exports = {
  setCookie,
  getCookie,
};
