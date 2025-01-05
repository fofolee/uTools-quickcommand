/**
 * 生成 UBrowser 代码
 * @param {Object} configs UBrowser 配置对象
 * @param {Array} selectedActions 已选择的操作列表
 * @returns {string} 生成的代码
 */
import { stringifyObject, stringifyWithType } from "./formatString";

// 生成 goto 参数字符串
function generateGotoArgs(goto) {
  const args = [];

  // URL
  const urlStr = stringifyWithType(goto.url);
  args.push(urlStr);

  // Headers
  if (goto.headers?.Referer?.value || goto.headers?.userAgent?.value) {
    const headers = {};
    if (goto.headers.Referer?.value) {
      headers.Referer = goto.headers.Referer;
    }
    if (goto.headers.userAgent?.value) {
      headers.userAgent = goto.headers.userAgent;
    }
    console.log("Headers:", JSON.stringify(headers, null, 2));
    args.push(stringifyObject(headers, true));
  }

  // Timeout
  if (goto.timeout !== 60000) {
    args.push(goto.timeout);
  }

  return args.join(", ");
}

// 生成 run 参数字符串
function generateRunArgs(run) {
  const options = {};
  const defaultValues = {
    show: true,
    center: true,
    alwaysOnTop: false,
    fullscreen: false,
    fullscreenable: true,
    resizable: true,
    movable: true,
    minimizable: true,
    maximizable: true,
    enableLargerThanScreen: false,
    opacity: 1,
  };

  // 窗口显示控制
  if (run.show !== undefined && run.show !== defaultValues.show)
    options.show = run.show;
  if (run.center !== undefined && run.center !== defaultValues.center)
    options.center = run.center;
  if (
    run.alwaysOnTop !== undefined &&
    run.alwaysOnTop !== defaultValues.alwaysOnTop
  )
    options.alwaysOnTop = run.alwaysOnTop;
  if (
    run.fullscreen !== undefined &&
    run.fullscreen !== defaultValues.fullscreen
  )
    options.fullscreen = run.fullscreen;
  if (
    run.fullscreenable !== undefined &&
    run.fullscreenable !== defaultValues.fullscreenable
  )
    options.fullscreenable = run.fullscreenable;

  // 窗口尺寸和位置 - 只有设置了值才添加
  if (run.width !== undefined && run.width > 0) options.width = run.width;
  if (run.height !== undefined && run.height > 0) options.height = run.height;
  if (run.x !== undefined && run.x !== 0) options.x = run.x;
  if (run.y !== undefined && run.y !== 0) options.y = run.y;

  // 最大最小尺寸 - 只有设置了值才添加
  if (run.minWidth !== undefined && run.minWidth > 0)
    options.minWidth = run.minWidth;
  if (run.minHeight !== undefined && run.minHeight > 0)
    options.minHeight = run.minHeight;
  if (run.maxWidth !== undefined && run.maxWidth > 0)
    options.maxWidth = run.maxWidth;
  if (run.maxHeight !== undefined && run.maxHeight > 0)
    options.maxHeight = run.maxHeight;

  // 窗口行为控制
  if (run.resizable !== undefined && run.resizable !== defaultValues.resizable)
    options.resizable = run.resizable;
  if (run.movable !== undefined && run.movable !== defaultValues.movable)
    options.movable = run.movable;
  if (
    run.minimizable !== undefined &&
    run.minimizable !== defaultValues.minimizable
  )
    options.minimizable = run.minimizable;
  if (
    run.maximizable !== undefined &&
    run.maximizable !== defaultValues.maximizable
  )
    options.maximizable = run.maximizable;
  if (
    run.enableLargerThanScreen !== undefined &&
    run.enableLargerThanScreen !== defaultValues.enableLargerThanScreen
  )
    options.enableLargerThanScreen = run.enableLargerThanScreen;

  // 透明度 - 只有不是1时才添加
  if (run.opacity !== undefined && run.opacity !== defaultValues.opacity)
    options.opacity = run.opacity;

  // 其他参数 - 只有设置了值才添加
  if (run.headless) options.headless = run.headless;
  if (run.devtools) options.devtools = run.devtools;
  if (run.timeout && run.timeout !== 60000) options.timeout = run.timeout;
  if (run.proxy) options.proxy = run.proxy;
  if (run.viewport) options.viewport = run.viewport;

  return Object.keys(options).length ? stringifyObject(options) : "";
}

// 生成操作参数字符串
function generateActionArgs(action, config) {
  console.log(
    "Generating args for action:",
    action,
    "config:",
    JSON.stringify(config, null, 2)
  );
  if (!config) return "";

  let result;
  switch (action) {
    case "wait":
      result = generateWaitArgs(config);
      break;
    case "click":
    case "mousedown":
    case "mouseup":
    case "focus":
      result = stringifyWithType(config.selector);
      break;
    case "css":
    case "paste":
      result = stringifyWithType(config.value);
      break;
    case "press":
      result = generatePressArgs(config);
      break;
    case "screenshot":
      result = generateScreenshotArgs(config);
      break;
    case "pdf":
      result = generatePdfArgs(config);
      break;
    case "device":
      result = generateDeviceArgs(config);
      break;
    case "cookies":
    case "removeCookies":
      result = stringifyWithType(config.name);
      break;
    case "setCookies":
      result = generateSetCookiesArgs(config);
      break;
    case "evaluate":
      result = generateEvaluateArgs(config);
      break;
    case "when":
      result = generateWhenArgs(config);
      break;
    case "file":
      result = generateFileArgs(config);
      break;
    case "value":
      result = generateValueArgs(config);
      break;
    case "check":
      result = generateCheckArgs(config);
      break;
    case "scroll":
      result = generateScrollArgs(config);
      break;
    case "download":
      result = generateDownloadArgs(config);
      break;
    case "devTools":
      result = stringifyWithType(config.mode);
      break;
    default:
      result = "";
  }
  console.log(
    "Generated args for action:",
    action,
    "result:",
    JSON.stringify(result)
  );
  return result;
}

// 生成 wait 参数字符串
function generateWaitArgs(config) {
  switch (config.type) {
    case "selector":
      return stringifyWithType(config.selector);
    case "function":
      return config.function;
    case "time":
      return config.time;
    default:
      return "";
  }
}

// 生成 press 参数字符串
function generatePressArgs(config) {
  const args = [stringifyWithType(config.key)];
  if (config.modifiers?.length) {
    args.push(JSON.stringify(config.modifiers));
  }
  return args.join(", ");
}

// 生成 screenshot 参数字符串
function generateScreenshotArgs(config) {
  const args = [];
  if (config.rect) {
    args.push(stringifyObject(config.rect));
  } else if (config.selector) {
    args.push(stringifyWithType(config.selector));
  }
  if (config.savePath) {
    args.push(stringifyWithType(config.savePath));
  }
  return args.join(", ");
}

// 生成 pdf 参数字符串
function generatePdfArgs(config) {
  const args = [];
  if (config.savePath) {
    args.push(stringifyWithType(config.savePath));
  }
  if (config.options) {
    args.push(stringifyObject(config.options));
  }
  return args.join(", ");
}

// 生成 device 参数字符串
function generateDeviceArgs(config) {
  if (config.type === "preset") {
    return stringifyWithType(config.deviceName);
  } else {
    const options = {};
    if (config.size) options.size = config.size;
    if (config.useragent) options.userAgent = config.useragent;
    return stringifyObject(options);
  }
}

// 生成 setCookies 参数字符串
function generateSetCookiesArgs(config) {
  if (!config.items?.length) return "[]";
  return stringifyObject(config.items);
}

// 生成 evaluate 参数字符串
function generateEvaluateArgs(config) {
  const args = [config.function];
  if (config.args?.length) {
    args.push(...config.args.map(stringifyWithType));
  }
  return args.join(", ");
}

// 生成 when 参数字符串
function generateWhenArgs(config) {
  if (config.type === "function") {
    return config.function;
  } else {
    return stringifyWithType(config.selector);
  }
}

// 生成 file 参数字符串
function generateFileArgs(config) {
  const args = [stringifyWithType(config.selector)];
  if (config.files) {
    args.push(stringifyObject(config.files));
  }
  return args.join(", ");
}

// 生成 value 参数字符串
function generateValueArgs(config) {
  return `${stringifyWithType(config.selector)}, ${stringifyWithType(
    config.value
  )}`;
}

// 生成 check 参数字符串
function generateCheckArgs(config) {
  return `${stringifyWithType(config.selector)}, ${config.checked}`;
}

// 生成 scroll 参数字符串
function generateScrollArgs(config) {
  if (config.type === "element") {
    return stringifyWithType(config.selector);
  } else {
    if (config.x !== undefined) {
      return `${config.x}, ${config.y}`;
    } else {
      return String(config.y);
    }
  }
}

// 生成 download 参数字符串
function generateDownloadArgs(config) {
  const args = [stringifyWithType(config.url)];
  if (config.savePath) {
    args.push(stringifyWithType(config.savePath));
  }
  return args.join(", ");
}

// 生成完整的 ubrowser 代码
export function generateUBrowserCode(configs, selectedActions) {
  const lines = [];
  const indent = "  ";

  // 添加 goto 参数
  if (configs.goto) {
    const gotoArgs = generateGotoArgs(configs.goto);
    lines.push(`${indent}goto(${gotoArgs}),`);
  }

  // 添加选中的操作
  if (selectedActions?.length) {
    selectedActions.forEach((action) => {
      const args = generateActionArgs(action.value, configs[action.value]);
      lines.push(`${indent}${action.value}(${args}),`);
    });
  }

  // 添加 run 参数
  const runArgs = generateRunArgs(configs.run || {});
  const runLine = runArgs ? `${indent}run(${runArgs})` : `${indent}run()`;
  lines.push(runLine);

  // 生成最终代码
  return `utools.ubrowser\n${lines.join("\n")}`;
}
