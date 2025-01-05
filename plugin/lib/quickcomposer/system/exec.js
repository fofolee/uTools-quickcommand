const { exec: execAsync } = require("child_process");
const iconv = require("iconv-lite");
const os = require("os");
const util = require("util");

// 将 exec 转换为 Promise 版本
const execPromise = util.promisify(execAsync);

function getSystemEncoding() {
  // Windows 默认使用 GBK/GB2312，其他系统默认 UTF-8
  return os.platform() === "win32" ? "gbk" : "utf8";
}

async function exec(command, options = {}) {
  try {
    const {
      autoEncoding = true,
      encoding = "buffer",
      windowsHide = true,
      ...execOptions
    } = options;

    // 执行命令，总是使用 buffer 获取原始输出
    const { stdout: output } = await execPromise(command, {
      ...execOptions,
      encoding: "buffer",
      windowsHide,
    });

    // 如果设置了自动编码，根据系统编码解码
    if (autoEncoding) {
      return iconv.decode(output, getSystemEncoding());
    }

    // 如果手动设置了编码且不是 buffer，则按指定编码解码
    if (encoding !== "buffer") {
      return iconv.decode(output, encoding);
    }

    // 返回原始 buffer
    return output;
  } catch (error) {
    // 如果是执行错误，尝试解码错误信息
    if (error.stderr) {
      const stderr = iconv.decode(error.stderr, getSystemEncoding());
      error.message = stderr;
    }
    throw error;
  }
}

module.exports = exec;
