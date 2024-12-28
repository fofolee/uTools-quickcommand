const Jimp = require("jimp");

const imageProcessor = async (imagePath) => {
  try {
    // 读取图片
    const image = await Jimp.read(imagePath);

    // 获取原始尺寸
    const originalWidth = image.getWidth();
    const originalHeight = image.getHeight();
    const ratio = originalWidth / originalHeight;

    // 设置目标尺寸
    let targetWidth = 1280;
    let targetHeight = 720;

    if (ratio > 16 / 9) {
      targetHeight = Math.min(720, Math.round(targetWidth / ratio));
    } else {
      targetWidth = Math.min(1280, Math.round(targetHeight * ratio));
    }

    // 调整大小并压缩
    await image
      .resize(targetWidth, targetHeight, Jimp.RESIZE_BICUBIC)
      .quality(80);

    // 转换为 base64
    const base64 = await image.getBase64Async(Jimp.MIME_JPEG);

    return base64;
  } catch (error) {
    console.error("处理图片失败:", error);
    return null;
  }
};

module.exports = imageProcessor;
