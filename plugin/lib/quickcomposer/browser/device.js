const { initCDP, cleanupCDP } = require("./cdp");
const { searchTarget } = require("./tabs");

// 预定义的设备列表
const devices = {
  // iOS 设备
  "iPhone X": {
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 375,
      height: 812,
      deviceScaleFactor: 3,
      mobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  "iPhone 12 Pro": {
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  "iPhone 14 Pro Max": {
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 430,
      height: 932,
      deviceScaleFactor: 3,
      mobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  "iPad Pro": {
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 1024,
      height: 1366,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  "iPad Mini": {
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },

  // Android 设备
  "Pixel 5": {
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
    viewport: {
      width: 393,
      height: 851,
      deviceScaleFactor: 2.75,
      mobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  "Pixel 7": {
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
    viewport: {
      width: 412,
      height: 915,
      deviceScaleFactor: 2.625,
      mobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  "Samsung Galaxy S20 Ultra": {
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
    viewport: {
      width: 412,
      height: 915,
      deviceScaleFactor: 3.5,
      mobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  "Samsung Galaxy Tab S7": {
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: {
      width: 1600,
      height: 2560,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  "Xiaomi 12 Pro": {
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
    viewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  "HUAWEI Mate30 Pro": {
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
    viewport: {
      width: 392,
      height: 835,
      deviceScaleFactor: 3,
      mobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },

  // 桌面设备
  Desktop: {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false,
      hasTouch: false,
      isLandscape: false,
    },
  },
  "MacBook Pro 16": {
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: {
      width: 1728,
      height: 1117,
      deviceScaleFactor: 2,
      mobile: false,
      hasTouch: false,
      isLandscape: false,
    },
  },
  "4K Display": {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: {
      width: 3840,
      height: 2160,
      deviceScaleFactor: 2,
      mobile: false,
      hasTouch: false,
      isLandscape: false,
    },
  },
};

// 设置设备模拟
const setDevice = async (tab, deviceName) => {
  const target = await searchTarget(tab);
  const { Network, Emulation } = await initCDP(target.id);

  try {
    const device = devices[deviceName];
    if (!device) {
      throw new Error(`未找到设备配置: ${deviceName}`);
    }

    // 设置 User Agent
    await Network.setUserAgentOverride({
      userAgent: device.userAgent,
    });

    // 设置视口
    await Emulation.setDeviceMetricsOverride({
      ...device.viewport,
      screenWidth: device.viewport.width,
      screenHeight: device.viewport.height,
    });

    // 设置触摸事件模拟
    if (device.viewport.hasTouch) {
      await Emulation.setTouchEmulationEnabled({
        enabled: true,
        maxTouchPoints: 5,
      });
    }
  } finally {
    await cleanupCDP(target.id);
  }
};

// 自定义设备模拟
const setCustomDevice = async (tab, options) => {
  const target = await searchTarget(tab);
  const { Network, Emulation } = await initCDP(target.id);

  try {
    const {
      userAgent,
      width = 1920,
      height = 1080,
      deviceScaleFactor = 1,
      mobile = false,
      hasTouch = false,
      isLandscape = false,
    } = options;

    // 设置 User Agent
    if (userAgent) {
      await Network.setUserAgentOverride({
        userAgent,
      });
    }

    // 设置视口
    await Emulation.setDeviceMetricsOverride({
      width,
      height,
      deviceScaleFactor,
      mobile,
      isLandscape,
      screenWidth: width,
      screenHeight: height,
    });

    // 设置触摸事件模拟
    if (hasTouch) {
      await Emulation.setTouchEmulationEnabled({
        enabled: true,
        maxTouchPoints: 5,
      });
    }
  } finally {
    await cleanupCDP(target.id);
  }
};

// 清除设备模拟
const clearDeviceEmulation = async (tab) => {
  const target = await searchTarget(tab);
  const { Network, Emulation } = await initCDP(target.id);

  try {
    // 先禁用触摸事件模拟
    await Emulation.setTouchEmulationEnabled({
      enabled: false,
    });

    // 清除 User Agent 覆盖
    await Network.setUserAgentOverride({
      userAgent: "",
    });

    // 重置设备指标
    await Emulation.setDeviceMetricsOverride({
      width: 0,
      height: 0,
      deviceScaleFactor: 0,
      mobile: false,
      screenWidth: 0,
      screenHeight: 0,
    });

    // 清除设备指标覆盖
    await Emulation.clearDeviceMetricsOverride();
  } catch (error) {
    console.error("清除设备模拟失败:", error);
  } finally {
    await cleanupCDP(target.id);
  }
};

module.exports = {
  setDevice,
  setCustomDevice,
  clearDeviceEmulation,
};
