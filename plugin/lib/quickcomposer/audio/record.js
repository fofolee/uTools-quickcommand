const fs = require("fs");

/**
 * 录制音频
 * @param {number} duration 录制时长(ms)
 * @param {string} savePath 保存路径
 */
async function record(duration = 5000, savePath) {
  const format = "audio/webm";

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream, { mimeType: format });
  const chunks = [];

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      try {
        const blob = new Blob(chunks, { type: format });
        if (savePath) {
          // 使用 FileReader 读取 blob 数据
          const reader = new FileReader();
          reader.onload = () => {
            const buffer = Buffer.from(reader.result);
            fs.writeFileSync(savePath, buffer);
          };
          reader.readAsArrayBuffer(blob);
        }
        stream.getTracks().forEach((track) => track.stop());
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    };
    mediaRecorder.onerror = reject;

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), duration);
  });
}

module.exports = {
  record,
};
