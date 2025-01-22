const CDP = require("chrome-remote-interface");
const { executeScript } = require("./browser");

let client = null;
let Page = null;
let Runtime = null;
let Target = null;

const initCDP = async (port) => {
  if (!client) {
    try {
      client = await CDP({ port });
      ({ Page, Runtime, Target } = client);
      await Promise.all([Page.enable(), Runtime.enable()]);
    } catch (err) {
      console.log(err);
      throw new Error(`请先通过浏览器控制中的"启动浏览器"打开浏览器`);
    }
  }
  return { Page, Runtime, Target };
};

// 获取所有标签页
const getTabs = async () => {
  const targets = await CDP.List();
  return targets
    .filter((target) => target.type === "page")
    .map((target) => ({
      url: target.url,
      title: target.title,
      id: target.id,
    }));
};

const searchTarget = async (searchProperty, searchValue) => {
  const targets = await CDP.List();
  const target = targets.find((target) =>
    target[searchProperty].includes(searchValue)
  );
  if (!target) {
    throw new Error(`未找到目标: ${searchProperty} = ${searchValue}`);
  }
  return target;
};

// 激活指定标签页
const activateTab = async (searchProperty, searchValue) => {
  const target = await searchTarget(searchProperty, searchValue);
  await CDP.Activate({ id: target.id });
};

// 创建新标签页
const createNewTab = async (url = "about:blank") => {
  const { Target } = await initCDP();
  const { targetId } = await Target.createTarget({ url });
  const { targetInfo } = await Target.getTargetInfo({ targetId });
  return {
    url: targetInfo.url,
    title: targetInfo.title,
    id: targetId,
  };
};

// 关闭标签页
const closeTab = async (searchProperty, searchValue) => {
  const target = await searchTarget(searchProperty, searchValue);
  await CDP.Close({ id: target.id });
};


module.exports = {
  getTabs,
  activateTab,
  createNewTab,
  closeTab,
};
