const fs = require("fs").promises;
const path = require("path");

/**
 * 文件读取操作
 * @param {Object} config 配置对象
 * @param {string} config.filePath 文件路径
 * @param {string} config.encoding 编码方式
 * @param {string} config.readMode 读取模式
 * @param {string} config.flag 读取标志
 * @param {number} [config.start] 起始位置
 * @param {number} [config.length] 读取长度
 * @returns {Promise<string|Buffer>} 文件内容
 */
async function read(config) {
  const { filePath, encoding, readMode, flag, start, length } = config;

  if (readMode === "all") {
    return await fs.readFile(filePath, { encoding, flag });
  } else {
    // 指定位置读取
    const fileHandle = await fs.open(filePath, flag);
    try {
      const buffer = Buffer.alloc(length);
      await fileHandle.read(buffer, 0, length, start);
      await fileHandle.close();
      return encoding ? buffer.toString(encoding) : buffer;
    } catch (error) {
      await fileHandle.close();
      throw error;
    }
  }
}

/**
 * 文件写入操作
 * @param {Object} config 配置对象
 * @param {string} config.filePath 文件路径
 * @param {string} config.content 写入内容
 * @param {string} config.encoding 编码方式
 * @param {string} config.flag 写入标志
 * @param {string|number} config.mode 文件权限
 * @returns {Promise<void>}
 */
async function write(config) {
  const { filePath, content, encoding, flag, mode } = config;

  // 确保目录存在
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  // 将字符串模式转换为八进制数字
  const modeNum = parseInt(mode, 8);
  await fs.writeFile(filePath, content, { encoding, flag, mode: modeNum });
}

/**
 * 文件删除操作
 */
async function delete_(config) {
  const { filePath, recursive, force, targetType } = config;

  // 检查文件是否存在
  try {
    const stats = await fs.lstat(filePath);

    // 检查目标类型
    if (targetType === "file" && !stats.isFile()) {
      throw new Error("目标不是文件");
    }
    if (targetType === "directory" && !stats.isDirectory()) {
      throw new Error("目标不是目录");
    }

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
 * 文件管理操作
 */
async function manage(config) {
  const {
    filePath,
    manageOperation,
    newPath,
    mode,
    uid,
    gid,
    recursive,
    targetType,
  } = config;

  // 检查文件是否存在
  const stats = await fs.lstat(filePath);

  // 检查目标类型
  if (targetType === "file" && !stats.isFile()) {
    throw new Error("目标不是文件");
  }
  if (targetType === "directory" && !stats.isDirectory()) {
    throw new Error("目标不是目录");
  }

  switch (manageOperation) {
    case "rename":
      // 确保目标目录存在
      await fs.mkdir(path.dirname(newPath), { recursive: true });
      await fs.rename(filePath, newPath);
      break;

    case "chmod":
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
      break;

    case "chown":
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
      break;

    default:
      throw new Error(`不支持的操作类型: ${manageOperation}`);
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
 * 获取文件或目录状态
 * @param {Object} config 配置对象
 * @param {string} config.filePath 路径
 * @param {string} config.targetType 目标类型
 * @param {string} config.statMode 检查类型
 * @param {boolean} [config.followSymlinks] 是否跟随符号链接
 * @returns {Promise<Object>} 状态信息
 */
async function stat(config) {
  const { filePath, targetType, statMode, followSymlinks } = config;

  try {
    const statFn = followSymlinks ? fs.stat : fs.lstat;
    const stats = await statFn(filePath);

    // 检查目标类型是否匹配
    if (targetType === "file" && !stats.isFile()) {
      throw new Error("目标不是文件");
    }
    if (targetType === "directory" && !stats.isDirectory()) {
      throw new Error("目标不是目录");
    }

    // 根据检查类型返回不同的信息
    if (statMode === "exists") {
      return {
        exists: true,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    }

    return {
      exists: true,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      isSymbolicLink: stats.isSymbolicLink(),
      size: stats.size,
      mode: stats.mode,
      uid: stats.uid,
      gid: stats.gid,
      accessTime: stats.atime,
      modifyTime: stats.mtime,
      changeTime: stats.ctime,
      birthTime: stats.birthtime,
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        exists: false,
        ...(statMode === "exists" && {
          isFile: false,
          isDirectory: false,
        }),
      };
    }
    throw error;
  }
}

/**
 * 统一的文件操作入口
 */
async function operation(config) {
  if (!config || typeof config !== "object") {
    throw new Error("配置参数必须是一个对象");
  }

  const { operation } = config;
  if (!operation) {
    throw new Error("缺少必要的 operation 参数");
  }

  switch (operation) {
    case "read":
      return await read(config);
    case "write":
      return await write(config);
    case "list":
      return await list(config);
    case "stat":
      return await stat(config);
    case "delete":
      return await delete_(config);
    case "manage":
      return await manage(config);
    default:
      throw new Error(`不支持的操作类型: ${operation}`);
  }
}

module.exports = {
  read,
  write,
  list,
  stat,
  delete: delete_,
  manage,
  operation,
};
