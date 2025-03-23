const fs = require("fs").promises;
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

/**
 * 文件复制移动操作
 */
async function transfer(config) {
  const { filePath, transferOperation, newPath } = config;

  // 检查文件是否存在
  try {
    const stats = await fs.lstat(filePath);

    // 确保目标目录存在
    await fs.mkdir(path.dirname(newPath), { recursive: true });
    if (transferOperation === "copy") {
      const processBar = await quickcommand.showProcessBar({
        text: "复制中...",
      });
      if (stats.isDirectory()) {
        // 复制目录
        const copyDir = async (src, dest) => {
          await fs.mkdir(dest, { recursive: true });
          const entries = await fs.readdir(src);
          for (const entry of entries) {
            const srcPath = path.join(src, entry);
            const destPath = path.join(dest, entry);
            const entryStat = await fs.lstat(srcPath);
            if (entryStat.isDirectory()) {
              await copyDir(srcPath, destPath);
            } else {
              await fs.copyFile(srcPath, destPath);
            }
            quickcommand.updateProcessBar({ text: entry }, processBar);
          }
        };
        await copyDir(filePath, newPath);
      } else {
        // 复制文件
        await fs.copyFile(filePath, newPath);
      }
      processBar.close();
    } else if (transferOperation === "rename") {
      const processBar = await quickcommand.showProcessBar({
        text: "处理中...",
      });
      await fs.rename(filePath, newPath);
      processBar.close();
    } else {
      throw new Error(`不支持的操作类型: ${transferOperation}`);
    }
  } catch (error) {
    processBar?.close();
    if (error.code === "ENOENT") {
      throw new Error("文件或目录不存在");
    }
    throw error;
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
