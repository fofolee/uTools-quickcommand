const keyboardTap = (keys, options = {}) => {
  const { repeatCount = 1, repeatInterval = 0, keyDelay = 0 } = options;

  // 执行重复操作
  const repeat = () => {
    for (let i = 0; i < repeatCount; i++) {
      // 执行按键操作
      window.utools.simulateKeyboardTap(...keys);

      // 如果有重复间隔且不是最后一次，则等待
      if (repeatInterval > 0 && i < repeatCount - 1) {
        quickcommand.sleep(repeatInterval);
      }
    }

    // 如果有按键后延迟，则等待
    if (keyDelay > 0) {
      quickcommand.sleep(keyDelay);
    }
  };

  return repeat();
};

const keySequence = (sequence, { interval = 100 } = {}) => {
  sequence.forEach((keys, index) => {
    keyboardTap(keys);
    if (index < sequence.length - 1) {
      quickcommand.sleep(interval);
    }
  });
};

module.exports = { keyboardTap, keySequence };
