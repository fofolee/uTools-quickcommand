const fs = require("fs");
const path = require("path");
const os = require("os");

const getQuickcommandTempFile = (ext, name, dir = "quickcommandTempDir") => {
  if (!name) name = new Date().getTime() + (Math.random() * 10 ** 6).toFixed();
  let tempDir = path.join(os.tmpdir(), dir);
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  return path.join(tempDir, `${name}.${ext}`);
};

module.exports = getQuickcommandTempFile;
