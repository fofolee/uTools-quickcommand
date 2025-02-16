const fs = require("fs");
const path = require("path");
const os = require("os");

const pluginInfo = () => {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "..", "plugin.json"))
  );
};

const getUtoolsPlugins = () => {
  let root = window.utools.isMacOs()
    ? path.join(os.homedir(), "Library/Application Support/uTools/plugins/")
    : window.utools.isWindows()
    ? path.join(os.homedir(), "AppData/Roaming/uTools/plugins")
    : path.join(os.homedir(), ".config/uTools/plugins");
  let plugins = {};
  let files = fs.readdirSync(root);
  let deleted = path.join(root, "deleted");
  let deletedList = fs.existsSync(deleted)
    ? fs.readFileSync(path.join(root, "deleted"), "utf8").split("|")
    : [];
  files.forEach((file) => {
    if (/[a-zA-Z0-9\-]+\.asar$/.test(file) && !deletedList.includes(file)) {
      let pluginInfo = JSON.parse(
        fs.readFileSync(path.join(root, file, "plugin.json"))
      );
      pluginInfo.logoPath = path.join(root, file, pluginInfo.logo);
      let keyWordFeatures = [];
      pluginInfo.features.forEach((f) => {
        f.cmds.some((c) => {
          c.length && keyWordFeatures.push(c);
          return true;
        });
      });
      if (!window.lodashM.isEmpty(keyWordFeatures)) {
        pluginInfo["keyWordFeatures"] = keyWordFeatures;
        plugins[pluginInfo.pluginName] = pluginInfo;
      }
    }
  });
  return plugins;
};

module.exports = {
  pluginInfo,
  getUtoolsPlugins,
};
