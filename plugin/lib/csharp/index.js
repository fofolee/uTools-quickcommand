const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");
const child_process = require("child_process");
const { getQuickcommandFolderFile } = require("../getQuickcommandFile");

let currentChild = null;

const getAssemblyPath = (assembly) => {
  const { version } = getCscPath();
  const is64bit = process.arch === "x64";

  const paths = [
    // v4.0 路径
    path.join(
      process.env.WINDIR,
      "Microsoft.NET",
      "assembly",
      "GAC_MSIL",
      assembly,
      "v4.0_4.0.0.0__31bf3856ad364e35",
      assembly + ".dll"
    ),
    path.join(
      process.env.WINDIR,
      "Microsoft.NET",
      is64bit ? "Framework64" : "Framework",
      "v4.0.30319",
      assembly + ".dll"
    ),
    path.join(
      process.env.WINDIR,
      "Microsoft.NET",
      is64bit ? "Framework64" : "Framework",
      "v4.0.30319",
      "WPF",
      assembly + ".dll"
    ),

    // v3.0/v3.5 路径
    path.join(
      process.arch === "x64"
        ? process.env.ProgramFiles
        : process.env["ProgramFiles(x86)"],
      "Reference Assemblies",
      "Microsoft",
      "Framework",
      "v3.0",
      assembly + ".dll"
    ),
    path.join(
      process.env.WINDIR,
      "assembly",
      "GAC_MSIL",
      assembly,
      "3.0.0.0__31bf3856ad364e35",
      assembly + ".dll"
    ),
  ];

  // 根据csc版本筛选合适的路径
  const filteredPaths = paths.filter((p) => {
    if (version === "v4.0") return true; // v4.0可以使用所有版本
    return !p.includes("v4.0"); // v3.5只使用v3.0及以下版本
  });

  for (const p of filteredPaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

const getFeatureReferences = (feature) => {
  let references = "";
  if (feature === "automation") {
    const automationDll = getAssemblyPath("UIAutomationClient");
    const formsDll = getAssemblyPath("System.Windows.Forms");
    const typesDll = getAssemblyPath("UIAutomationTypes");
    const baseDll = getAssemblyPath("WindowsBase");
    const drawingDll = getAssemblyPath("System.Drawing");
    if (!automationDll) throw new Error("找不到UIAutomationClient.dll");
    if (!formsDll) throw new Error("找不到System.Windows.Forms.dll");
    if (!typesDll) throw new Error("找不到UIAutomationTypes.dll");
    if (!baseDll) throw new Error("找不到WindowsBase.dll");
    if (!drawingDll) throw new Error("找不到System.Drawing.dll");
    references =
      `/reference:"${automationDll}" /reference:"${formsDll}" ` +
      `/reference:"${typesDll}" /reference:"${baseDll}" ` +
      `/reference:"${drawingDll}" `;
  }
  return references;
};

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
    const { path: cscPath } = getCscPath();
    const references = getFeatureReferences(feature);

    fs.copyFile(srcCsPath, destCsPath, (err) => {
      if (err) return reject(err.toString());
      const command = `${cscPath} /nologo ${references}/out:"${exePath}" "${destCsPath}"`;
      console.log(command);
      child_process.exec(command, { encoding: null }, (err, stdout) => {
        if (err) return reject(iconv.decode(stdout, "gbk"));
        else resolve(iconv.decode(stdout, "gbk"));
        fs.unlink(destCsPath, () => {});
      });
    });
  });
};

const getCscPath = () => {
  const is64bit = process.arch === "x64";
  let cscPath = path.join(
    process.env.WINDIR,
    "Microsoft.NET",
    is64bit ? "Framework64" : "Framework",
    "v4.0.30319",
    "csc.exe"
  );
  let version = "v4.0";

  if (!fs.existsSync(cscPath)) {
    cscPath = path.join(
      process.env.WINDIR,
      "Microsoft.NET",
      is64bit ? "Framework64" : "Framework",
      "v3.5",
      "csc.exe"
    );
    version = "v3.5";
  }
  if (!fs.existsSync(cscPath)) {
    throw new Error("未安装.NET Framework");
  }
  return { path: cscPath, version };
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
    const { alwaysBuildNewExe = window.utools.isDev(), killPrevious = true } =
      options;
    try {
      if (killPrevious && currentChild) {
        currentChild.kill();
      }
      const featureExePath = await getCsharpFeatureExe(
        feature,
        alwaysBuildNewExe
      );
      console.log(featureExePath, args.join(" "));
      currentChild = child_process.spawn(featureExePath, args, {
        encoding: null,
      });

      let stdoutData = Buffer.from([]);
      let stderrData = Buffer.from([]);

      currentChild.stdout.on("data", (data) => {
        stdoutData = Buffer.concat([stdoutData, data]);
      });

      currentChild.stderr.on("data", (data) => {
        stderrData = Buffer.concat([stderrData, data]);
      });

      currentChild.on("error", (err) => {
        reject(err.toString());
      });

      currentChild.on("close", (code) => {
        if (code !== 0 || stderrData.length > 0) {
          reject(
            iconv.decode(stderrData.length ? stderrData : stdoutData, "gbk")
          );
        } else {
          reslove(iconv.decode(stdoutData, "gbk"));
        }
      });
    } catch (error) {
      return reject(error.toString());
    }
  });
};

module.exports = { runCsharpFeature };
