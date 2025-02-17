const { nativeImage } = require("electron");
const { captureScreen } = require("./screenCapture");

// 获取显示器缩放比例
function getDisplayScale() {
  // MacOS 上要考虑缩放比例
  if (process.platform === "darwin") {
    const primaryDisplay = utools.getPrimaryDisplay();
    const { scaleFactor } = primaryDisplay;
    return scaleFactor;
  }
  return 1;
}

// 在屏幕上查找图片
async function findImage(subDataURL, options = {}) {
  const mainDataURL = await captureScreen();
  if (!mainDataURL) return null;
  // 解析主图和子图
  const mainImg = nativeImage.createFromDataURL(mainDataURL);
  const subImg = nativeImage.createFromDataURL(subDataURL);

  // 获取图像基本信息
  const mainSize = mainImg.getSize();
  const subSize = subImg.getSize();

  // 获取像素数据（返回Buffer，RGBA格式）
  const mainPixels = mainImg.getBitmap();
  const subPixels = subImg.getBitmap();

  // 边界检查
  if (subSize.width > mainSize.width || subSize.height > mainSize.height) {
    throw new Error("要查找图片尺寸大于屏幕");
  }

  // 预提取子图首像素值（优化点）
  const firstSubPixel = [
    subPixels[0], // R
    subPixels[1], // G
    subPixels[2], // B
    subPixels[3], // A
  ];

  // 主图遍历边界
  const maxX = mainSize.width - subSize.width;
  const maxY = mainSize.height - subSize.height;

  // 遍历主图每个可能的位置
  for (let y = 0; y <= maxY; y++) {
    for (let x = 0; x <= maxX; x++) {
      // 快速检查首像素（性能优化关键）
      const mainOffset = (y * mainSize.width + x) * 4;
      if (
        mainPixels[mainOffset] !== firstSubPixel[0] ||
        mainPixels[mainOffset + 1] !== firstSubPixel[1] ||
        mainPixels[mainOffset + 2] !== firstSubPixel[2] ||
        mainPixels[mainOffset + 3] !== firstSubPixel[3]
      ) {
        continue;
      }

      // 完整像素比对
      let match = true;
      for (let subY = 0; subY < subSize.height; subY++) {
        for (let subX = 0; subX < subSize.width; subX++) {
          // 计算像素位置
          const mainPixelPos = ((y + subY) * mainSize.width + (x + subX)) * 4;
          const subPixelPos = (subY * subSize.width + subX) * 4;

          // 精确匹配每个通道
          if (
            mainPixels[mainPixelPos] !== subPixels[subPixelPos] ||
            mainPixels[mainPixelPos + 1] !== subPixels[subPixelPos + 1] ||
            mainPixels[mainPixelPos + 2] !== subPixels[subPixelPos + 2] ||
            mainPixels[mainPixelPos + 3] !== subPixels[subPixelPos + 3]
          ) {
            match = false;
            break;
          }
        }
        if (!match) break;
      }

      if (match) {
        const displayScale = getDisplayScale();
        const position = {
          x: Math.round(x / displayScale),
          y: Math.round(y / displayScale),
          width: Math.round(subSize.width / displayScale),
          height: Math.round(subSize.height / displayScale),
        };
        clickImage(position, options.mouseAction);
        return position;
      }
    }
  }

  return null;
}

const clickImage = (position, mouseAction) => {
  const centerX = Math.round(position.x + position.width / 2);
  const centerY = Math.round(position.y + position.height / 2);

  // 根据配置执行鼠标动作
  switch (mouseAction) {
    case "none":
      break;
    case "click":
      window.utools.simulateMouseClick(centerX, centerY);
      break;
    case "dblclick":
      window.utools.simulateMouseDoubleClick(centerX, centerY);
      break;
    case "rightclick":
      window.utools.simulateMouseRightClick(centerX, centerY);
      break;
  }
};

module.exports = { findImage };
