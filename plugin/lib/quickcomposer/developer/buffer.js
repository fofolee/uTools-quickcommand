// 创建 Buffer
function from(data, encoding = "utf8") {
  try {
    return Buffer.from(data, encoding);
  } catch (error) {
    throw new Error(`创建Buffer失败: ${error.message}`);
  }
}

// 转换为字符串
function toString(buffer, encoding = "utf8", start = 0, end = buffer.length) {
  try {
    return buffer.toString(encoding, start, end);
  } catch (error) {
    throw new Error(`转换字符串失败: ${error.message}`);
  }
}

// 写入数据
function write(
  buffer,
  string,
  offset = 0,
  length = buffer.length,
  encoding = "utf8"
) {
  try {
    return buffer.write(string, offset, length, encoding);
  } catch (error) {
    throw new Error(`写入数据失败: ${error.message}`);
  }
}

// 填充数据
function fill(
  buffer,
  value,
  offset = 0,
  end = buffer.length,
  encoding = "utf8"
) {
  try {
    return buffer.fill(value, offset, end, encoding);
  } catch (error) {
    throw new Error(`填充数据失败: ${error.message}`);
  }
}

// 复制数据
function copy(
  source,
  target,
  targetStart = 0,
  sourceStart = 0,
  sourceEnd = source.length
) {
  try {
    return source.copy(target, targetStart, sourceStart, sourceEnd);
  } catch (error) {
    throw new Error(`复制数据失败: ${error.message}`);
  }
}

// 比较数据
function compare(buf1, buf2) {
  try {
    return Buffer.compare(buf1, buf2);
  } catch (error) {
    throw new Error(`比较数据失败: ${error.message}`);
  }
}

// 连接 Buffer
function concat(buffers, totalLength) {
  try {
    return Buffer.concat(buffers, totalLength);
  } catch (error) {
    throw new Error(`连接Buffer失败: ${error.message}`);
  }
}

// 查找数据
function indexOf(buffer, value, byteOffset = 0, encoding = "utf8") {
  try {
    return buffer.indexOf(value, byteOffset, encoding);
  } catch (error) {
    throw new Error(`查找数据失败: ${error.message}`);
  }
}

// 切片数据
function slice(buffer, start = 0, end = buffer.length) {
  try {
    return buffer.slice(start, end);
  } catch (error) {
    throw new Error(`切片数据失败: ${error.message}`);
  }
}

// 交换字节序
function swap(buffer, size) {
  try {
    switch (size) {
      case 16:
        return buffer.swap16();
      case 32:
        return buffer.swap32();
      case 64:
        return buffer.swap64();
      default:
        throw new Error("不支持的字节大小");
    }
  } catch (error) {
    throw new Error(`交换字节序失败: ${error.message}`);
  }
}

module.exports = {
  from,
  toString,
  write,
  fill,
  copy,
  compare,
  concat,
  indexOf,
  slice,
  swap,
  // 编码类型
  encodings: [
    "utf8",
    "utf16le",
    "latin1",
    "base64",
    "hex",
    "ascii",
    "binary",
    "ucs2",
  ],
};
