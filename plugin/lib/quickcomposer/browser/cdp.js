const CDP = require("chrome-remote-interface");
const { getCurrentClientPort } = require("./client");

const initCDP = async (targetId) => {
  try {
    const port = await getCurrentClientPort();
    const client = await CDP({
      target: targetId,
      port,
    });

    const { Page, Runtime, Target, Network, Emulation, DOM } = client;
    await Promise.all([
      Page.enable(),
      Runtime.enable(),
      DOM.enable(),
    ]);

    return {
      client,
      Page,
      Runtime,
      Target,
      Network,
      Emulation,
      DOM,
    };
  } catch (err) {
    console.log(err);
    throw new Error(`连接到浏览器失败: ${err.message}`);
  }
};

const cleanupCDP = async (targetId) => {
  try {
    // 直接关闭传入的 client
    if (targetId?.client) {
      await targetId.client.close();
    }
  } catch (error) {
    console.log("关闭CDP连接失败:", error);
  }
};

module.exports = {
  initCDP,
  cleanupCDP,
};
