const { nativeImage } = require("electron");
const { captureScreen } = require("./screenCapture");

// 将颜色值映射到8个区间
function mapColorValue(val) {
  if (val > 223) return 7; // [224 ~ 255]
  if (val > 191) return 6; // [192 ~ 223]
  if (val > 159) return 5; // [160 ~ 191]
  if (val > 127) return 4; // [128 ~ 159]
  if (val > 95) return 3; // [96 ~ 127]
  if (val > 63) return 2; // [64 ~ 95]
  if (val > 31) return 1; // [32 ~ 63]
  return 0; // [0 ~ 31]
}

// 计算图像特征向量
function calculateFeatureVector(
  buffer,
  width,
  height,
  startX = 0,
  startY = 0,
  w = width,
  h = height
) {
  // 8^4 = 4096 维向量，表示RGBA各8个区间的组合
  const vector = new Array(8 * 8 * 8 * 8).fill(0);

  for (let y = startY; y < startY + h; y++) {
    for (let x = startX; x < startX + w; x++) {
      const idx = (y * width + x) * 4;
      // 计算四个通道的量化值
      const r = mapColorValue(buffer[idx]);
      const g = mapColorValue(buffer[idx + 1]);
      const b = mapColorValue(buffer[idx + 2]);
      const a = mapColorValue(buffer[idx + 3]);

      // 计算在向量中的位置
      const vectorIdx = r * 512 + g * 64 + b * 8 + a;
      vector[vectorIdx]++;
    }
  }

  return vector;
}

// 计算余弦相似度
function calculateCosineSimilarity(v1, v2) {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    norm1 += v1[i] * v1[i];
    norm2 += v2[i] * v2[i];
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// 获取显示器缩放比例
function getDisplayScale() {
  if (process.platform === "darwin") {
    // 在 macOS 上，通过比较实际分辨率和报告的分辨率来计算缩放比例
    const primaryDisplay = utools.getPrimaryDisplay();
    const { scaleFactor } = primaryDisplay;
    return scaleFactor;
  }
  return 1;
}

// 在屏幕上查找图片
async function findImage(targetImageData, options = {}) {
  try {
    // 获取屏幕截图
    const screenDataUrl = await captureScreen();
    if (!screenDataUrl) return null;

    // 获取显示器缩放比例
    const scale = getDisplayScale();

    // 读取屏幕截图
    const screenImage = nativeImage.createFromDataURL(screenDataUrl);
    const screenBuffer = screenImage.toBitmap();
    const { width: actualWidth, height: actualHeight } = screenImage.getSize();

    // 计算缩放后的实际尺寸
    const screenWidth = Math.round(actualWidth / scale);
    const screenHeight = Math.round(actualHeight / scale);

    // 从 base64 字符串创建目标图片
    const targetImage = nativeImage.createFromDataURL(targetImageData);
    const targetBuffer = targetImage.toBitmap();
    const { width: targetWidth, height: targetHeight } = targetImage.getSize();

    // 计算目标图片的特征向量
    const targetVector = calculateFeatureVector(
      targetBuffer,
      targetWidth,
      targetHeight
    );

    // 设置匹配阈值
    const threshold = options.threshold || 0.9;

    let bestMatch = null;
    let bestSimilarity = 0;

    // 使用滑动窗口搜索
    const stepSize = Math.round(8 * scale); // 根据缩放比例调整步长
    for (let y = 0; y <= actualHeight - targetHeight; y += stepSize) {
      for (let x = 0; x <= actualWidth - targetWidth; x += stepSize) {
        // 计算当前区域的特征向量
        const regionVector = calculateFeatureVector(
          screenBuffer,
          actualWidth,
          actualHeight,
          x,
          y,
          targetWidth,
          targetHeight
        );

        // 计算相似度
        const similarity = calculateCosineSimilarity(
          targetVector,
          regionVector
        );

        // 更新最佳匹配
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = { x: Math.round(x / scale), y: Math.round(y / scale) };

          // 如果相似度已经很高，进行精确搜索
          if (similarity >= threshold) {
            // 在周围进行精确搜索，注意搜索范围也要考虑缩放
            const searchRange = Math.round(4 * scale);
            for (let dy = -searchRange; dy <= searchRange; dy++) {
              for (let dx = -searchRange; dx <= searchRange; dx++) {
                const newX = x + dx;
                const newY = y + dy;

                if (
                  newX < 0 ||
                  newY < 0 ||
                  newX > actualWidth - targetWidth ||
                  newY > actualHeight - targetHeight
                ) {
                  continue;
                }

                const preciseVector = calculateFeatureVector(
                  screenBuffer,
                  actualWidth,
                  actualHeight,
                  newX,
                  newY,
                  targetWidth,
                  targetHeight
                );

                const preciseSimilarity = calculateCosineSimilarity(
                  targetVector,
                  preciseVector
                );
                if (preciseSimilarity > bestSimilarity) {
                  bestSimilarity = preciseSimilarity;
                  bestMatch = {
                    x: Math.round(newX / scale),
                    y: Math.round(newY / scale),
                  };
                }
              }
            }
          }
        }

        // 如果找到足够好的匹配，提前返回
        if (bestSimilarity >= threshold) {
          const position = {
            x: bestMatch.x,
            y: bestMatch.y,
            width: Math.round(targetWidth / scale),
            height: Math.round(targetHeight / scale),
            confidence: bestSimilarity,
          };

          clickImage(position, options.mouseAction);

          return position;
        }
      }
    }

    // 如果没有找到足够好的匹配，但有最佳匹配且相似度不太低，也返回
    if (bestMatch && bestSimilarity > threshold * 0.8) {
      const position = {
        x: bestMatch.x,
        y: bestMatch.y,
        width: Math.round(targetWidth / scale),
        height: Math.round(targetHeight / scale),
        confidence: bestSimilarity,
      };
      clickImage(position, options.mouseAction);
      return position;
    }

    return null;
  } catch (error) {
    console.error("查找图片失败:", error);
    return null;
  }
}

const clickImage = (position, mouseAction) => {
  // 计算中心点
  const centerX = position.x + position.width / 2;
  const centerY = position.y + position.height / 2;

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
