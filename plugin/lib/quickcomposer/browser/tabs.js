const { initCDP, cleanupCDP } = require("./cdp");
const { getCurrentClientPort } = require("./client");
const CDP = require("chrome-remote-interface");

const getTargets = async () => {
  const port = await getCurrentClientPort();
  return await CDP.List({ port });
};

const searchTarget = async (tab) => {
  if (!tab || !tab.by || !tab.searchValue || tab.by === "active") {
    const currentTab = await getCurrentTab();
    return currentTab;
  }

  const targets = await getTargets();
  const target = targets.find((target) =>
    target[tab.by].includes(tab.searchValue)
  );
  if (!target) {
    throw new Error(`未找到目标标签页: ${tab.by} = ${tab.searchValue}`);
  }
  return target;
};

const getTabs = async () => {
  const targets = await getTargets();
  return targets
    .filter((target) => target.type === "page")
    .map((target) => ({
      url: target.url,
      title: target.title,
      id: target.id,
    }));
};

const getCurrentTab = async () => {
  const targets = await getTargets();
  const currentTarget = targets.find((target) => target.type === "page");

  if (!currentTarget) {
    throw new Error("未找到当前活动标签页");
  }

  return {
    url: currentTarget.url,
    title: currentTarget.title,
    id: currentTarget.id,
  };
};

const activateTab = async (tab) => {
  const target = await searchTarget(tab);
  const port = await getCurrentClientPort();
  await CDP.Activate({ id: target.id, port });
};

const createNewTab = async (url = "about:blank") => {
  const currentTab = await getCurrentTab();
  const { Target } = await initCDP(currentTab.id);
  const { targetId } = await Target.createTarget({ url });
  const { targetInfo } = await Target.getTargetInfo({ targetId });
  await cleanupCDP(currentTab.id);
  return {
    url: targetInfo.url,
    title: targetInfo.title,
    id: targetId,
  };
};

const closeTab = async (tab) => {
  const target = await searchTarget(tab);
  const port = await getCurrentClientPort();
  await cleanupCDP(target.id);
  await CDP.Close({ id: target.id, port });
};

module.exports = {
  getTabs,
  getCurrentTab,
  activateTab,
  createNewTab,
  closeTab,
  getTargets,
  searchTarget,
};
