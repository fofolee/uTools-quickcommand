const { clipboard } = require("electron");

/**
 * 获取当前选中的文本
 * @returns {Promise<string>} 选中的文本内容
 */
function text() {
  window.utools.hideMainWindow();
  // 保存当前剪贴板内容
  const originalText = clipboard.readText();

  // 模拟 Ctrl+C/Command+C 复制操作
  if (process.platform === "darwin") {
    utools.simulateKeyboardTap("c", "command");
  } else {
    utools.simulateKeyboardTap("c", "control");
  }

  // 等待一小段时间确保复制完成
  return new Promise((resolve) => {
    setTimeout(() => {
      // 获取选中的文本
      const selectedText = clipboard.readText();

      // 恢复原始剪贴板内容
      clipboard.writeText(originalText);

      resolve(selectedText);
    }, 100);
  });
}

/**
 * 获取当前选中的图片
 * @returns {Promise<string>} 选中的图片的base64数据
 */
function image() {
  window.utools.hideMainWindow();
  // 保存当前剪贴板内容
  const originalImage = clipboard.readImage();

  // 模拟 Ctrl+C/Command+C 复制操作
  if (process.platform === "darwin") {
    utools.simulateKeyboardTap("c", "command");
  } else {
    utools.simulateKeyboardTap("c", "control");
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // 获取剪贴板中的图片
        const image = clipboard.readImage();

        if (image.isEmpty()) {
          // 恢复原始剪贴板内容
          if (!originalImage.isEmpty()) {
            clipboard.writeImage(originalImage);
          }
          resolve(null);
          return;
        }

        // 将图片转换为 base64
        const base64 = image.toDataURL();

        // 恢复原始剪贴板内容
        if (!originalImage.isEmpty()) {
          clipboard.writeImage(originalImage);
        }

        resolve(base64);
      } catch (error) {
        reject(error);
      }
    }, 100);
  });
}

/**
 * 获取当前选中的文件
 * @returns {Promise<string[]>} 选中的文件路径数组
 */
function files() {
  window.utools.hideMainWindow();
  // 保存当前剪贴板内容
  const originalFiles = utools.getCopyedFiles();

  // 模拟 Ctrl+C/Command+C 复制操作
  if (process.platform === "darwin") {
    utools.simulateKeyboardTap("c", "command");
  } else {
    utools.simulateKeyboardTap("c", "control");
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      // 获取选中的文件
      const selectedFiles = utools.getCopyedFiles();

      // 恢复原始剪贴板内容
      if (originalFiles && originalFiles.length > 0) {
        utools.copyFile(originalFiles);
      }

      resolve(selectedFiles || []);
    }, 100);
  });
}

module.exports = {
  text,
  image,
  files,
};
