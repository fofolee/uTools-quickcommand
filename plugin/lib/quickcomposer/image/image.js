const fs = require("fs");
const exif = require("exif-reader");

/**
 * 加载图片
 * @param {string} file 图片文件路径
 * @returns {Promise<HTMLImageElement>} 图片元素
 */
async function loadImage(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`图片文件不存在: ${file}`);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `file://${file}`;
  });
}

/**
 * 读取EXIF信息
 * @param {string} file 图片文件路径
 * @returns {Promise<Object>} EXIF信息
 */
async function readExif(file) {
  try {
    const buffer = fs.readFileSync(file);

    // 检查是否是JPEG文件
    if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
      console.warn("不是JPEG文件");
      return null;
    }

    // 查找APP1段
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] === 0xff && buffer[offset + 1] === 0xe1) {
        // 获取段长度
        const segmentLength = buffer[offset + 2] * 256 + buffer[offset + 3];

        // 提取EXIF数据
        const exifData = buffer.slice(offset + 4, offset + 2 + segmentLength);

        // 检查是否是EXIF数据
        if (exifData.slice(0, 6).toString() === "Exif\0\0") {
          try {
            // 提取实际的EXIF数据（跳过Exif\0\0）
            const metadata = exif(exifData.slice(6));
            return metadata;
          } catch (e) {
            console.warn("解析EXIF数据失败:", e);
            return null;
          }
        }
      }
      offset++;
    }

    console.warn("未找到EXIF数据");
    return null;
  } catch (error) {
    console.warn("读取EXIF信息失败:", error);
    return null;
  }
}

/**
 * 获取图片颜色信息
 * @param {HTMLImageElement} img 图片元素
 * @returns {Object} 颜色信息
 */
function getColorInfo(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let r = 0,
    g = 0,
    b = 0,
    a = 0;

  // 计算平均颜色
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    a += data[i + 3];
  }

  const pixels = data.length / 4;
  return {
    averageColor: {
      r: Math.round(r / pixels),
      g: Math.round(g / pixels),
      b: Math.round(b / pixels),
      a: Math.round(a / pixels) / 255,
    },
    isTransparent: Math.round(a / pixels) < 255,
    hasAlphaChannel: true, // Canvas总是包含alpha通道
  };
}

/**
 * 分析图片信息
 * @param {string} file 图片文件路径
 * @returns {Promise<Object>} 图片信息
 */
async function analyze(file) {
  const img = await loadImage(file);
  const stats = fs.statSync(file);
  const ext = file.split(".").pop().toLowerCase();
  const exifData = await readExif(file);
  const colorInfo = getColorInfo(img);

  // 计算图片大小的可读格式
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // 获取图片类型
  const getImageType = (ext) => {
    const types = {
      jpg: "JPEG图片",
      jpeg: "JPEG图片",
      png: "PNG图片",
      webp: "WebP图片",
      gif: "GIF图片",
      bmp: "BMP图片",
    };
    return types[ext] || "未知类型";
  };

  // 格式化EXIF信息
  const formatExif = (exif) => {
    if (!exif) return null;
    return {
      相机信息: {
        制造商: exif.Image?.Make,
        型号: exif.Image?.Model,
        软件: exif.Image?.Software,
        方向: exif.Image?.Orientation,
        分辨率: {
          X: exif.Image?.XResolution,
          Y: exif.Image?.YResolution,
          单位: exif.Image?.ResolutionUnit,
        },
      },
      拍摄信息: {
        拍摄时间: exif.Photo?.DateTimeOriginal,
        曝光时间: exif.Photo?.ExposureTime,
        光圈值: exif.Photo?.FNumber,
        ISO感光度: exif.Photo?.ISOSpeedRatings,
        焦距: exif.Photo?.FocalLength,
        焦距35mm: exif.Photo?.FocalLengthIn35mmFilm,
        闪光灯: exif.Photo?.Flash,
        白平衡: exif.Photo?.WhiteBalance,
        曝光程序: exif.Photo?.ExposureProgram,
        曝光补偿: exif.Photo?.ExposureBiasValue,
        测光模式: exif.Photo?.MeteringMode,
        亮度值: exif.Photo?.BrightnessValue,
        场景类型: exif.Photo?.SceneCaptureType,
        镜头信息: {
          制造商: exif.Photo?.LensMake,
          型号: exif.Photo?.LensModel,
        },
      },
      GPS信息: exif.GPSInfo
        ? {
            纬度: {
              参考: exif.GPSInfo.GPSLatitudeRef,
              值: exif.GPSInfo.GPSLatitude,
            },
            经度: {
              参考: exif.GPSInfo.GPSLongitudeRef,
              值: exif.GPSInfo.GPSLongitude,
            },
            海拔: {
              参考: exif.GPSInfo.GPSAltitudeRef,
              值: exif.GPSInfo.GPSAltitude,
            },
            时间戳: exif.GPSInfo.GPSTimeStamp,
            日期戳: exif.GPSInfo.GPSDateStamp,
            方向: {
              参考: exif.GPSInfo.GPSImgDirectionRef,
              值: exif.GPSInfo.GPSImgDirection,
            },
          }
        : null,
      缩略图信息: exif.Thumbnail
        ? {
            宽度: exif.Thumbnail.ImageWidth,
            高度: exif.Thumbnail.ImageLength,
            压缩: exif.Thumbnail.Compression,
            方向: exif.Thumbnail.Orientation,
            分辨率: {
              X: exif.Thumbnail.XResolution,
              Y: exif.Thumbnail.YResolution,
              单位: exif.Thumbnail.ResolutionUnit,
            },
          }
        : null,
      其他信息: {
        描述: exif.Image?.ImageDescription,
        作者: exif.Image?.Artist,
        版权: exif.Image?.Copyright,
        创建时间: exif.Photo?.DateTimeDigitized,
        修改时间: exif.Image?.DateTime,
        色彩空间: exif.Photo?.ColorSpace,
        图像处理: exif.Photo?.CustomRendered,
        对比度: exif.Photo?.Contrast,
        饱和度: exif.Photo?.Saturation,
        锐度: exif.Photo?.Sharpness,
      },
    };
  };

  return {
    // 基本信息
    width: img.width, // 宽度(像素)
    height: img.height, // 高度(像素)
    aspectRatio: img.width / img.height, // 宽高比
    resolution: img.width * img.height, // 分辨率(总像素)

    // 文件信息
    type: getImageType(ext), // 图片类型
    format: ext.toUpperCase(), // 文件格式
    size: formatSize(stats.size), // 文件大小
    bytes: stats.size, // 字节数

    // 时间信息
    createTime: stats.birthtime, // 创建时间
    modifyTime: stats.mtime, // 修改时间
    accessTime: stats.atime, // 访问时间

    // 路径信息
    path: file, // 完整路径
    filename: file.split("/").pop(), // 文件名

    // 颜色信息
    colorInfo: {
      averageColor: colorInfo.averageColor, // 平均颜色
      isTransparent: colorInfo.isTransparent, // 是否包含透明
      hasAlphaChannel: colorInfo.hasAlphaChannel, // 是否有Alpha通道
    },

    // EXIF信息
    exif: formatExif(exifData),
    rawExif: exifData, // 原始EXIF数据

    // 其他信息
    naturalWidth: img.naturalWidth, // 原始宽度
    naturalHeight: img.naturalHeight, // 原始高度
  };
}

/**
 * 调整图片大小
 * @param {string} inputFile 输入文件路径
 * @param {string} outputFile 输出文件路径
 * @param {number} width 宽度
 * @param {number} height 高度
 * @param {boolean} keepAspectRatio 保持宽高比
 * @param {number} quality 图片质量 (0-1)
 */
async function resize(
  inputFile,
  outputFile,
  width = null,
  height = null,
  keepAspectRatio = true,
  quality = 0.92
) {
  const img = await loadImage(inputFile);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (keepAspectRatio) {
    if (width && !height) {
      height = width * (img.height / img.width);
    } else if (height && !width) {
      width = height * (img.width / img.height);
    }
  }

  canvas.width = width || img.width;
  canvas.height = height || img.height;

  // 绘制调整大小后的图片
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // 获取图片数据
  const format = outputFile.split(".").pop() || "jpeg";
  const dataURL = canvas.toDataURL(`image/${format}`, quality);

  // 保存文件
  const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
  fs.writeFileSync(outputFile, Buffer.from(base64Data, "base64"));
}

/**
 * 旋转图片
 * @param {string} inputFile 输入文件路径
 * @param {string} outputFile 输出文件路径
 * @param {number} angle 旋转角度
 * @param {number} quality 图片质量
 */
async function rotate(inputFile, outputFile, angle = 90, quality = 0.92) {
  const img = await loadImage(inputFile);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const angleRad = (angle * Math.PI) / 180;
  const sin = Math.abs(Math.sin(angleRad));
  const cos = Math.abs(Math.cos(angleRad));

  // 计算旋转后的画布大小
  canvas.width = img.width * cos + img.height * sin;
  canvas.height = img.width * sin + img.height * cos;

  // 移动到画布中心并旋转
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(angleRad);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  // 保存文件
  const format = outputFile.split(".").pop() || "jpeg";
  const dataURL = canvas.toDataURL(`image/${format}`, quality);

  const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
  fs.writeFileSync(outputFile, Buffer.from(base64Data, "base64"));
}

/**
 * 裁剪图片
 * @param {string} inputFile 输入文件路径
 * @param {string} outputFile 输出文件路径
 * @param {number} x 起始X坐标
 * @param {number} y 起始Y坐标
 * @param {number} width 裁剪宽度
 * @param {number} height 裁剪高度
 * @param {number} quality 图片质量
 */
async function crop(
  inputFile,
  outputFile,
  x = 0,
  y = 0,
  width = null,
  height = null,
  quality = 0.92
) {
  const img = await loadImage(inputFile);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  width = width || img.width;
  height = height || img.height;

  canvas.width = width;
  canvas.height = height;

  // 绘制裁剪区域
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

  // 保存文件
  const format = outputFile.split(".").pop() || "jpeg";
  const dataURL = canvas.toDataURL(`image/${format}`, quality);

  const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
  fs.writeFileSync(outputFile, Buffer.from(base64Data, "base64"));
}

/**
 * 添加水印
 * @param {string} inputFile 输入文件路径
 * @param {string} outputFile 输出文件路径
 * @param {string} text 水印文字
 * @param {string} font 字体设置
 * @param {string} color 文字颜色
 * @param {string} position 位置(topLeft/topRight/bottomLeft/bottomRight/center)
 * @param {number} margin 边距
 * @param {number} opacity 不透明度
 * @param {number} quality 图片质量
 */
async function watermark(
  inputFile,
  outputFile,
  text = "水印文字",
  font = "24px Arial",
  color = "rgba(255, 255, 255, 0.5)",
  position = "bottomRight",
  margin = 20,
  opacity = 0.5,
  quality = 0.92
) {
  const img = await loadImage(inputFile);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;

  // 绘制原图
  ctx.drawImage(img, 0, 0);

  // 设置水印样式
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;

  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = parseInt(ctx.font); // 近似值

  // 计算水印位置
  let x, y;
  switch (position) {
    case "topLeft":
      x = margin;
      y = margin + textHeight;
      break;
    case "topRight":
      x = canvas.width - textWidth - margin;
      y = margin + textHeight;
      break;
    case "bottomLeft":
      x = margin;
      y = canvas.height - margin;
      break;
    case "bottomRight":
      x = canvas.width - textWidth - margin;
      y = canvas.height - margin;
      break;
    case "center":
    default:
      x = (canvas.width - textWidth) / 2;
      y = (canvas.height + textHeight) / 2;
  }

  // 绘制水印
  ctx.fillText(text, x, y);

  // 保存文件
  const format = outputFile.split(".").pop() || "jpeg";
  const dataURL = canvas.toDataURL(`image/${format}`, quality);

  const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
  fs.writeFileSync(outputFile, Buffer.from(base64Data, "base64"));
}

/**
 * 转换图片格式
 * @param {string} inputFile 输入文件路径
 * @param {string} outputFile 输出文件路径
 * @param {string} format 输出格式
 * @param {number} quality 图片质量
 */
async function convert(inputFile, outputFile, format = "jpeg", quality = 0.92) {
  const img = await loadImage(inputFile);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;

  // 绘制图片
  ctx.drawImage(img, 0, 0);

  // 保存为新格式
  const dataURL = canvas.toDataURL(`image/${format}`, quality);

  const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
  fs.writeFileSync(outputFile, Buffer.from(base64Data, "base64"));
}

module.exports = {
  analyze,
  resize,
  rotate,
  crop,
  watermark,
  convert,
};
