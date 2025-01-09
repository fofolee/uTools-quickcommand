// 存储当前朗读实例
let currentSpeech = null;

/**
 * 朗读文本
 * @param {string} text 要朗读的文本
 * @param {Object} options 朗读选项
 * @param {number} options.rate 语速 (0.1-10)
 * @param {number} options.pitch 音调 (0-2)
 * @param {number} options.volume 音量 (0-1)
 * @param {string} options.lang 语言
 */
async function speak(text, options = {}) {
  // 停止当前朗读
  stop();

  // 创建新的语音合成实例
  const speech = new window.SpeechSynthesisUtterance();
  speech.text = text;
  speech.rate = parseFloat(options.rate) || 1;
  speech.pitch = parseFloat(options.pitch) || 1;
  speech.volume = parseFloat(options.volume) || 1;
  speech.lang = options.lang || "zh-CN";

  // 保存当前实例
  currentSpeech = speech;

  // 开始朗读
  window.speechSynthesis.speak(speech);

  // 返回 Promise，在朗读结束时 resolve
  return new Promise((resolve, reject) => {
    speech.onend = () => {
      currentSpeech = null;
      resolve();
    };
    speech.onerror = (error) => {
      currentSpeech = null;
      reject(error);
    };
  });
}

/**
 * 停止文本朗读
 */
function stop() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (currentSpeech) {
    currentSpeech = null;
  }
}

module.exports = {
  speak,
  stop,
};
