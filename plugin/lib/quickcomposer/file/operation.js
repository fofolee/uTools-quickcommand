const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");

/**
 * 文件读取操作
 * @param {Object} config 配置对象
 * @param {string} config.filePath 文件路径
 * @param {string} config.encoding 编码方式
 * @param {string} config.readMode 读取模式
 * @param {number} [config.start] 起始位置
 * @param {number} [config.length] 读取长度
 * @returns {Promise<string|Buffer>} 文件内容
 */
async function read(config) {
  const { filePath, encoding, readMode, start, length } = config;

  if (readMode === "all") {
    return await fs.readFile(filePath, { encoding });
  } else if (
    readMode === "start" &&
    typeof start === "number" &&
    typeof length === "number"
  ) {
    // 指定位置读取
    const fileHandle = await fs.open(filePath, "r");
    try {
      const buffer = Buffer.alloc(length);
      const { bytesRead } = await fileHandle.read(buffer, 0, length, start);
      await fileHandle.close();
      return encoding
        ? buffer.slice(0, bytesRead).toString(encoding)
        : buffer.slice(0, bytesRead);
    } catch (error) {
      await fileHandle.close();
      throw error;
    }
  } else if (readMode === "line") {
    // 按行读取，暂时使用全部读取然后分行的方式
    const content = await fs.readFile(filePath, {
      encoding: encoding || "utf8",
    });
    return content.split(/\r?\n/);
  } else {
    // 默认使用全部读取
    return await fs.readFile(filePath, { encoding });
  }
}

/**
 * 文件写入操作
 * @param {Object} config 配置对象
 * @param {string} config.filePath 文件路径
 * @param {string} config.content 写入内容
 * @param {string} config.encoding 编码方式
 * @param {string} config.flag 写入标志 ('w'=覆盖写入, 'a'=追加写入)
 * @param {string|number} config.mode 文件权限 (例如: '666', '644', '755')
 * @returns {Promise<void>}
 */
async function write(config) {
  const { filePath, content, encoding, flag = "w", mode } = config;

  try {
    // 确保目录存在
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // 写入文件
    const options = {
      encoding,
      flag,
      mode: mode ? parseInt(mode, 8) : undefined,
    };

    await fs.writeFile(filePath, content, options);
  } catch (error) {
    if (error.code === "EPERM") {
      throw new Error("没有写入权限");
    }
    throw error;
  }
}

/**
 * 文件删除操作
 */
async function remove(config) {
  const { filePath, recursive, force } = config;

  // 检查文件是否存在
  try {
    const stats = await fs.lstat(filePath);

    // 执行删除操作
    if (stats.isDirectory()) {
      await fs.rm(filePath, { recursive, force });
    } else {
      await fs.unlink(filePath);
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      if (!force) throw new Error("文件或目录不存在");
    } else {
      throw error;
    }
  }
}

/**
 * 文件权限操作
 */
async function permission(config) {
  const { filePath, operationType, mode, uid, gid, recursive } = config;

  try {
    // 检查文件是否存在
    const stats = await fs.lstat(filePath);

    if (operationType === "chmod") {
      if (recursive && stats.isDirectory()) {
        const walk = async (dir) => {
          const files = await fs.readdir(dir);
          for (const file of files) {
            const curPath = path.join(dir, file);
            const stat = await fs.lstat(curPath);
            await fs.chmod(curPath, parseInt(mode, 8));
            if (stat.isDirectory()) {
              await walk(curPath);
            }
          }
        };

        await fs.chmod(filePath, parseInt(mode, 8));
        await walk(filePath);
      } else {
        await fs.chmod(filePath, parseInt(mode, 8));
      }
    } else if (operationType === "chown") {
      if (recursive && stats.isDirectory()) {
        await fs.chown(filePath, uid, gid);
        const walk = async (dir) => {
          const files = await fs.readdir(dir);
          for (const file of files) {
            const curPath = path.join(dir, file);
            const stat = await fs.lstat(curPath);
            await fs.chown(curPath, uid, gid);
            if (stat.isDirectory()) {
              await walk(curPath);
            }
          }
        };

        await fs.chown(filePath, uid, gid);
        await walk(filePath);
      } else {
        await fs.chown(filePath, uid, gid);
      }
    } else {
      throw new Error(`不支持的操作类型: ${operationType}`);
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error("文件或目录不存在");
    }
    throw error;
  }
}

async function mkdir(targetDir) {
  // 在 Windows 上，在根目录上使用 fs.mkdir() （即使使用递归参数）也会导致错误
  // 所以还是要先检查目录是否存在
  if (fsSync.existsSync(targetDir)) return;
  await fs.mkdir(targetDir, { recursive: true });
}

/**
 * 格式化速度显示
 * @param {number} bytesPerSecond 每秒字节数
 * @returns {string} 格式化后的速度字符串
 */
function formatSpeed(bytesPerSecond) {
  if (bytesPerSecond >= 1024 * 1024) {
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`;
  } else if (bytesPerSecond >= 1024) {
    return `${(bytesPerSecond / 1024).toFixed(2)} KB/s`;
  }
  return `${bytesPerSecond.toFixed(2)} B/s`;
}

/**
 * 获取目录下所有文件的总大小和文件数
 * @param {string} dir 目录路径
 * @returns {Promise<{totalSize: number, fileCount: number}>}
 */
async function getDirStats(dir) {
  let totalSize = 0;
  let fileCount = 0;

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir);
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = await fs.lstat(fullPath);
      if (stat.isDirectory()) {
        await walk(fullPath);
      } else {
        totalSize += stat.size;
        fileCount++;
      }
    }
  }

  await walk(dir);
  return { totalSize, fileCount };
}

/**
 * 使用流复制文件，支持进度显示
 * @param {string} src 源文件路径
 * @param {string} dest 目标文件路径
 * @param {Object} progressInfo 进度信息
 * @returns {Promise<void>}
 */
async function copyFileWithProgress(src, dest, progressInfo) {
  const {
    processBar,
    totalSize,
    fileCount,
    processedFiles,
    startTime,
    signal, // AbortController 的 signal
  } = progressInfo;

  return new Promise(async (resolve, reject) => {
    try {
      let currentCopiedSize = 0;
      let lastUpdate = Date.now();
      let lastCopiedSize = 0;

      const readStream = fsSync.createReadStream(src);
      const writeStream = fsSync.createWriteStream(dest);

      // 监听中止信号
      signal.addEventListener("abort", () => {
        readStream.destroy();
        writeStream.destroy();
        fs.unlink(dest).catch(() => {});
        reject(new Error("操作已取消"));
      });

      readStream.on("data", (chunk) => {
        currentCopiedSize += chunk.length;
        progressInfo.copiedSize += chunk.length;
        const now = Date.now();

        if (now - lastUpdate >= 100) {
          const progress = Math.round(
            (progressInfo.copiedSize / totalSize) * 100
          );
          const timeSpent = (now - lastUpdate) / 1000;
          const bytesCopied = currentCopiedSize - lastCopiedSize;
          const speed = bytesCopied / timeSpent;

          quickcommand.updateProcessBar(
            {
              value: progress,
              text:
                `[${processedFiles}/${fileCount}][${formatBytes(
                  progressInfo.copiedSize
                )}/${formatBytes(totalSize)}] ${formatSpeed(speed)}<br/>` +
                `${path.basename(src)}`,
            },
            processBar
          );

          lastUpdate = now;
          lastCopiedSize = currentCopiedSize;
        }
      });

      writeStream.on("finish", () => {
        progressInfo.processedFiles++;
        resolve();
      });

      writeStream.on("error", reject);
      readStream.on("error", reject);

      readStream.pipe(writeStream);
    } catch (error) {
      reject(error);
    }
  });
}

async function copyDirWithProcess(src, dest, progressInfo) {
  await mkdir(dest);
  const entries = await fs.readdir(src);

  for (const entry of entries) {
    // 检查是否已中止
    if (progressInfo.signal.aborted) {
      throw new Error("操作已取消");
    }

    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const entryStat = await fs.lstat(srcPath);

    if (entryStat.isDirectory()) {
      await copyDirWithProcess(srcPath, destPath, progressInfo);
    } else {
      await copyFileWithProgress(srcPath, destPath, progressInfo);
    }
  }
}

async function copy(filePath, newPath) {
  const controller = new AbortController();
  let isCompleted = false; // 添加完成标志

  const processBar = await quickcommand.showProcessBar({
    text: "正在计算文件大小...",
    value: 0,
    onClose: () => {
      // 只有在未完成时才触发取消
      if (!isCompleted) {
        controller.abort();
      }
    },
  });

  try {
    let totalSize = 0;
    let fileCount = 0;
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      const stats = await getDirStats(filePath);
      totalSize = stats.totalSize;
      fileCount = stats.fileCount;
    } else {
      totalSize = stat.size;
      fileCount = 1;
    }

    const progressInfo = {
      processBar,
      totalSize,
      copiedSize: 0,
      fileCount,
      processedFiles: 0,
      startTime: Date.now(),
      signal: controller.signal,
    };

    if (stat.isDirectory()) {
      await copyDirWithProcess(filePath, newPath, progressInfo);
    } else {
      await copyFileWithProgress(filePath, newPath, progressInfo);
    }

    const totalTime = (Date.now() - progressInfo.startTime) / 1000;
    const averageSpeed = totalSize / totalTime;

    isCompleted = true; // 标记为已完成
    quickcommand.updateProcessBar(
      {
        value: 100,
        text:
          `总大小: ${formatBytes(totalSize)} - 文件数: ${fileCount} <br/>` +
          `平均速度: ${formatSpeed(averageSpeed)} - 用时: ${totalTime.toFixed(
            1
          )}s`,
        complete: true,
      },
      processBar
    );
  } catch (error) {
    if (error.message === "操作已取消") {
      // 清理目标文件/目录
      fs.rm(newPath, { recursive: true }).catch(() => {});
    }
    throw error;
  }
}

async function move(filePath, newPath) {
  try {
    // rename 不支持跨驱动器
    await fs.rename(filePath, newPath);
  } catch (error) {
    try {
      await copy(filePath, newPath);
      if (!fsSync.existsSync(newPath)) return;
      await fs.rm(filePath, { recursive: true });
    } catch (error) {
      throw error;
    }
  }
}

/**
 * 文件复制移动操作
 */
async function transfer(config) {
  const { filePath, transferOperation, newPath } = config;

  // 检查文件是否存在
  if (!fsSync.existsSync(filePath)) throw "文件或目录不存在!";
  // 确保目标目录存在
  await mkdir(path.dirname(newPath));
  if (transferOperation === "copy") {
    await copy(filePath, newPath);
  } else if (transferOperation === "rename") {
    await move(filePath, newPath);
  } else {
    throw new Error(`不支持的操作类型: ${transferOperation}`);
  }
}

/**
 * 列出目录内容
 * @param {Object} config 配置对象
 * @param {string} config.filePath 目录路径
 * @param {boolean} config.recursive 是否递归列出子目录
 * @param {boolean} config.showHidden 是否显示隐藏文件
 * @returns {Promise<Array>} 文件列表
 */
async function list(config) {
  const { filePath, recursive, showHidden } = config;

  if (recursive) {
    const result = [];
    const walk = async (dir) => {
      const files = await fs.readdir(dir);
      for (const file of files) {
        if (!showHidden && file.startsWith(".")) continue;
        const curPath = path.join(dir, file);
        const stat = await fs.lstat(curPath);
        result.push({
          path: curPath,
          isDirectory: stat.isDirectory(),
          isFile: stat.isFile(),
          isSymbolicLink: stat.isSymbolicLink(),
        });
        if (stat.isDirectory()) {
          await walk(curPath);
        }
      }
    };
    await walk(filePath);
    return result;
  } else {
    const files = await fs.readdir(filePath);
    return Promise.all(
      files
        .filter((file) => showHidden || !file.startsWith("."))
        .map(async (file) => {
          const curPath = path.join(filePath, file);
          const stat = await fs.lstat(curPath);
          return {
            path: curPath,
            isDirectory: stat.isDirectory(),
            isFile: stat.isFile(),
            isSymbolicLink: stat.isSymbolicLink(),
          };
        })
    );
  }
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的文件大小
 */
function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  while (bytes >= 1024 && unitIndex < units.length - 1) {
    bytes /= 1024;
    unitIndex++;
  }
  return `${bytes.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * 获取文件或目录状态
 * @param {Object} config 配置对象
 * @param {string} config.filePath 路径
 * @param {boolean} [config.followSymlinks] 是否跟随符号链接
 * @returns {Promise<Object>} 状态信息
 */
async function stat(config) {
  const { filePath, followSymlinks } = config;

  try {
    const statFn = followSymlinks ? fs.stat : fs.lstat;
    const stats = await statFn(filePath);

    return {
      exists: true,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      isSymbolicLink: stats.isSymbolicLink(),
      humanReadSize: formatBytes(stats.size),
      ...stats,
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        exists: false,
        isFile: false,
        isDirectory: false,
      };
    }
    throw error;
  }
}

/**
 * 统一的文件操作入口
 */
async function operation(config) {
  const { operation: op } = config;

  switch (op) {
    case "read":
      return await read(config);
    case "write":
      return await write(config);
    case "list":
      return await list(config);
    case "delete":
      return await remove(config);
    case "stat":
      return await stat(config);
    case "permission":
      return await permission(config);
    case "transfer":
      return await transfer(config);
    default:
      throw new Error(`不支持的操作类型: ${op}`);
  }
}

module.exports = {
  operation,
};
