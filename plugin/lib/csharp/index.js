const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");
const child_process = require("child_process");
const { getQuickcommandFolderFile } = require("../getQuickcommandFile");
const getCsharpFeatureCs = (feature) => {
  return path.join(__dirname, feature + ".cs");
};

const getCsharpFeatureExe = async (feature, alwaysBuildNewExe = false) => {
  const exePath = getQuickcommandFolderFile(feature, "exe");
  if (!fs.existsSync(exePath) || alwaysBuildNewExe) {
    await buildCsharpFeature(feature);
  }
  return exePath;
};

const buildCsharpFeature = async (feature) => {
  return new Promise((resolve, reject) => {
    const exePath = getQuickcommandFolderFile(feature, "exe");
    const srcCsPath = getCsharpFeatureCs(feature);
    const destCsPath = getQuickcommandFolderFile(feature, "cs");
    const cscPath = getCscPath();
    fs.copyFile(srcCsPath, destCsPath, (err) => {
      if (err) return reject(err.toString());
      child_process.exec(
        `${cscPath} /nologo /out:${exePath} ${destCsPath}`,
        { encoding: null },
        (err, stdout) => {
          if (err) return reject(iconv.decode(stdout, "gbk"));
          else resolve(iconv.decode(stdout, "gbk"));
          fs.unlink(destCsPath, () => {});
        }
      );
    });
  });
};

const getCscPath = () => {
  const cscPath = path.join(
    process.env.WINDIR,
    "Microsoft.NET",
    "Framework",
    "v4.0.30319",
    "csc.exe"
  );
  if (!fs.existsSync(cscPath)) {
    cscPath = path.join(
      process.env.WINDIR,
      "Microsoft.NET",
      "Framework",
      "v3.5",
      "csc.exe"
    );
  }
  if (!fs.existsSync(cscPath)) {
    throw new Error("未安装.NET Framework");
  }
  return cscPath;
};

/**
 * 运行C#插件
 * @param {string} feature - 插件名称
 * @param {string[]} args - 参数
 * @param {object} options - 选项
 * @param {boolean} options.alwaysBuildNewExe - 是否总是构建新的可执行文件
 * @returns {Promise<string>} - 返回结果
 */
const runCsharpFeature = async (feature, args = [], options = {}) => {
  return new Promise(async (reslove, reject) => {
    const { alwaysBuildNewExe = false } = options;
    try {
      const featureExePath = await getCsharpFeatureExe(feature, alwaysBuildNewExe);
      child_process.execFile(
        featureExePath,
        args,
        {
          encoding: null,
        },
        (err, stdout) => {
          console.log(iconv.decode(stdout, "gbk"));
          if (err) reject(iconv.decode(stdout, "gbk"));
          else reslove(iconv.decode(stdout, "gbk"));
        }
      );
    } catch (error) {
      return reject(error.toString());
    }
  });
};

module.exports = { runCsharpFeature };
