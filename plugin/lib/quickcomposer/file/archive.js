const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

/**
 * 压缩文件和目录
 * @param {string} operation 操作类型 (compress/extract)
 * @param {string} format 归档格式 (zip/tar/gzip)
 * @param {string|Array<string>} source 源文件/文件夹路径
 * @param {string} destination 目标路径
 * @returns {Promise<void>}
 */
async function archive(
  operation = "compress",
  format = "zip",
  source,
  destination
) {
  // 处理参数
  const sources = Array.isArray(source) ? source : [source];
  const isWindows = os.platform() === "win32";

  // 验证必要参数
  if (!source || !destination) {
    throw new Error("源文件和目标路径不能为空");
  }

  return new Promise((resolve, reject) => {
    let command, args;

    if (operation === "compress") {
      if (format === "zip") {
        if (isWindows) {
          // Windows使用PowerShell的Compress-Archive
          command = "powershell.exe";
          const sourceList = sources.map((s) => `'${s}'`).join(",");
          args = [
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            `Compress-Archive -Path ${sourceList} -DestinationPath '${destination}' -Force`,
          ];
        } else {
          // Unix系统使用zip命令
          command = "zip";
          args = ["-r", destination, ...sources];
        }
      } else if (format === "tar") {
        if (isWindows) {
          reject(new Error("Windows系统不支持TAR格式"));
          return;
        }
        command = "tar";
        args = ["-czf", destination, ...sources];
      } else if (format === "gzip") {
        if (sources.length > 1) {
          reject(new Error("GZIP格式只支持单个文件"));
          return;
        }
        if (isWindows) {
          reject(new Error("Windows系统不支持GZIP格式"));
          return;
        }
        command = "gzip";
        args = ["-c", sources[0]];
      }
    } else if (operation === "extract") {
      if (format === "zip") {
        if (isWindows) {
          // Windows使用PowerShell的Expand-Archive
          command = "powershell.exe";
          args = [
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            `Expand-Archive -Path '${sources[0]}' -DestinationPath '${destination}' -Force`,
          ];
        } else {
          // Unix系统使用unzip命令
          command = "unzip";
          args = ["-o", sources[0], "-d", destination];
        }
      } else if (format === "tar") {
        if (isWindows) {
          reject(new Error("Windows系统不支持TAR格式"));
          return;
        }
        command = "tar";
        args = ["-xzf", sources[0], "-C", destination];
      } else if (format === "gzip") {
        if (isWindows) {
          reject(new Error("Windows系统不支持GZIP格式"));
          return;
        }
        command = "gunzip";
        args = ["-c", sources[0]];
      }
    }

    if (!command || !args) {
      reject(new Error(`不支持的操作或格式: ${operation} ${format}`));
      return;
    }

    const proc = spawn(command, args);

    proc.stdout.on("data", (data) => {
      console.log(`归档输出: ${data}`);
    });

    proc.stderr.on("data", (data) => {
      console.error(`归档错误: ${data}`);
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`归档操作失败，退出码: ${code}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`执行归档命令失败: ${err.message}`));
    });
  });
}

module.exports = archive;
