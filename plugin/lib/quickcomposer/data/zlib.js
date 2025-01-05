const zlib = require("zlib");
const { promisify } = require("util");

// 压缩方法
const gzip = promisify(zlib.gzip);
const deflate = promisify(zlib.deflate);
const brotliCompress = promisify(zlib.brotliCompress);

// 解压方法
const gunzip = promisify(zlib.gunzip);
const inflate = promisify(zlib.inflate);
const brotliDecompress = promisify(zlib.brotliDecompress);

// 同步方法
const gzipSync = zlib.gzipSync;
const gunzipSync = zlib.gunzipSync;
const deflateSync = zlib.deflateSync;
const inflateSync = zlib.inflateSync;
const brotliCompressSync = zlib.brotliCompressSync;
const brotliDecompressSync = zlib.brotliDecompressSync;

// 压缩选项
const defaultGzipOptions = {
  level: zlib.constants.Z_DEFAULT_COMPRESSION,
  memLevel: zlib.constants.Z_DEFAULT_MEMLEVEL,
  strategy: zlib.constants.Z_DEFAULT_STRATEGY,
};

const defaultBrotliOptions = {
  params: {
    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_GENERIC,
    [zlib.constants.BROTLI_PARAM_QUALITY]:
      zlib.constants.BROTLI_DEFAULT_QUALITY,
    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: 0,
  },
};

// 异步压缩函数
async function compressData(data, method, options = {}) {
  try {
    const buffer = Buffer.from(data);
    switch (method) {
      case "gzip":
        return await gzip(buffer, { ...defaultGzipOptions, ...options });
      case "deflate":
        return await deflate(buffer, { ...defaultGzipOptions, ...options });
      case "brotli":
        return await brotliCompress(buffer, {
          ...defaultBrotliOptions,
          ...options,
        });
      default:
        throw new Error("不支持的压缩方法");
    }
  } catch (error) {
    throw new Error(`压缩失败: ${error.message}`);
  }
}

// 异步解压函数
async function decompressData(data, method, options = {}) {
  try {
    const buffer = Buffer.from(data);
    switch (method) {
      case "gzip":
        return await gunzip(buffer, options);
      case "deflate":
        return await inflate(buffer, options);
      case "brotli":
        return await brotliDecompress(buffer, options);
      default:
        throw new Error("不支持的解压方法");
    }
  } catch (error) {
    throw new Error(`解压失败: ${error.message}`);
  }
}

// 同步压缩函数
function compressDataSync(data, method, options = {}) {
  try {
    const buffer = Buffer.from(data);
    switch (method) {
      case "gzip":
        return gzipSync(buffer, { ...defaultGzipOptions, ...options });
      case "deflate":
        return deflateSync(buffer, { ...defaultGzipOptions, ...options });
      case "brotli":
        return brotliCompressSync(buffer, {
          ...defaultBrotliOptions,
          ...options,
        });
      default:
        throw new Error("不支持的压缩方法");
    }
  } catch (error) {
    throw new Error(`压缩失败: ${error.message}`);
  }
}

// 同步解压函数
function decompressDataSync(data, method, options = {}) {
  try {
    const buffer = Buffer.from(data);
    switch (method) {
      case "gzip":
        return gunzipSync(buffer, options);
      case "deflate":
        return inflateSync(buffer, options);
      case "brotli":
        return brotliDecompressSync(buffer, options);
      default:
        throw new Error("不支持的解压方法");
    }
  } catch (error) {
    throw new Error(`解压失败: ${error.message}`);
  }
}

module.exports = {
  compressData,
  decompressData,
  compressDataSync,
  decompressDataSync,
  constants: zlib.constants,
};
