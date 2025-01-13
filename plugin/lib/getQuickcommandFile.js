const fs = require("fs");
const path = require("path");
const os = require("os");

const getQuickcommandTempFile = (ext, name, dir = "quickcommandTempDir") => {
  if (!name) name = new Date().getTime() + (Math.random() * 10 ** 6).toFixed();
  let tempDir = path.join(os.tmpdir(), dir);
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  return path.join(tempDir, `${name}.${ext}`);
};

const getQuickcommandFolderFile = (name, ext) => {
  const folderPath = path.join(
    window.utools.getPath("userData"),
    "quickcommand"
  );
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  return path.join(folderPath, `${name}.${ext}`);
};

module.exports = { getQuickcommandTempFile, getQuickcommandFolderFile };
