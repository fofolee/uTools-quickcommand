/**
 * 生成 UBrowser 代码
 * @param {Object} configs UBrowser 配置对象
 * @param {Array} selectedActions 已选择的操作列表
 * @returns {string} 生成的代码
 */
import { defaultUBrowserConfigs } from "./ubrowserConfig";

export function generateUBrowserCode(configs, selectedActions) {
  let code = "utools.ubrowser";

  // 基础参数
  if (configs.useragent.value) {
    code += `\n  .useragent('${configs.useragent.value}')`;
  }

  if (configs.goto.url) {
    const gotoOptions = {};
    if (configs.goto.headers.Referer) {
      gotoOptions.headers = gotoOptions.headers || {};
      gotoOptions.headers.Referer = configs.goto.headers.Referer;
    }
    if (configs.goto.headers.userAgent) {
      gotoOptions.headers = gotoOptions.headers || {};
      gotoOptions.headers["User-Agent"] = configs.goto.headers.userAgent;
    }
    if (configs.goto.timeout !== 60000) {
      gotoOptions.timeout = configs.goto.timeout;
    }

    code += `\n  .goto('${configs.goto.url}'${
      Object.keys(gotoOptions).length
        ? `,\n${JSON.stringify(gotoOptions, null, 2).replace(/\n/g, "\n    ")}`
        : ""
    })`;
  }

  // 浏览器操作
  selectedActions.forEach((action) => {
    const config = configs[action.value];
    switch (action.value) {
      case "wait":
        if (config.type === "time" && config.time) {
          code += `\n  .wait(${config.time})`;
        } else if (config.type === "selector" && config.selector) {
          code += `\n  .wait('${config.selector}'${
            config.timeout !== 60000 ? `, ${config.timeout}` : ""
          })`;
        } else if (config.type === "function" && config.function) {
          const functionBody = config.function.trim();
          if (config.args?.length) {
            const params = config.args.map((arg) => arg.name).join(", ");
            const functionCode = `(${params}) => {\n ${functionBody} \n}`;
            const args = `, ${config.timeout || 60000}, ${config.args
              .map((arg) => JSON.stringify(arg.value))
              .join(", ")}`;
            code += `\n  .wait(${functionCode}${args})`;
          } else {
            const functionCode = `() => {\n ${functionBody} \n}`;
            code += `\n  .wait(${functionCode}${
              config.timeout !== 60000 ? `, ${config.timeout}` : ""
            })`;
          }
        }
        break;

      case "click":
        if (config.selector) {
          code += `\n  .click('${config.selector}')`;
        }
        break;

      case "css":
        if (config.value) {
          code += `\n  .css('${config.value}')`;
        }
        break;

      case "press":
        if (config.key) {
          const modifiers = config.modifiers.length
            ? `, ${JSON.stringify(config.modifiers)}`
            : "";
          code += `\n  .press('${config.key}'${modifiers})`;
        }
        break;

      case "paste":
        if (config.text) {
          code += `\n  .paste('${config.text}')`;
        }
        break;

      case "screenshot":
        if (config.selector || config.savePath) {
          const options = {};
          if (config.selector) options.selector = config.selector;
          if (config.rect.width && config.rect.height) {
            options.rect = config.rect;
          }
          code += `\n  .screenshot('${config.savePath}'${
            Object.keys(options).length ? `, ${JSON.stringify(options)}` : ""
          })`;
        }
        break;

      case "pdf":
        if (config.savePath) {
          code += `\n  .pdf('${config.savePath}'${
            config.options ? `, ${JSON.stringify(config.options)}` : ""
          })`;
        }
        break;

      case "device":
        if (config.type === "preset" && config.deviceName) {
          code += `\n  .device('${config.deviceName}')`;
        } else if (config.type === "custom") {
          const options = {
            size: config.size,
          };
          if (config.useragent) options.useragent = config.useragent;
          code += `\n  .device(${JSON.stringify(options, null, 2).replace(
            /\n/g,
            "\n    "
          )})`;
        }
        break;

      case "cookies":
        if (config.name) {
          code += `\n  .cookies('${config.name}')`;
        }
        break;

      case "setCookies":
        if (config.items?.length) {
          code += `\n  .setCookies(${JSON.stringify(config.items)})`;
        }
        break;

      case "removeCookies":
        if (config.name) {
          code += `\n  .removeCookies('${config.name}')`;
        }
        break;

      case "clearCookies":
        code += `\n  .clearCookies(${config.url ? `'${config.url}'` : ""})`;
        break;

      case "evaluate":
        if (config.function) {
          const functionBody = config.function.trim();
          if (config.args?.length) {
            const params = config.args.map((arg) => arg.name).join(", ");
            const functionCode = `(${params}) => {\n ${functionBody} \n}`;
            const args = `, ${config.args
              .map((arg) => JSON.stringify(arg.value))
              .join(", ")}`;
            code += `\n  .evaluate(${functionCode}${args})`;
          } else {
            const functionCode = `() => {\n ${functionBody} \n}`;
            code += `\n  .evaluate(${functionCode})`;
          }
        }
        break;

      case "when":
        if (config.condition) {
          code += `\n  .when('${config.condition}')`;
        }
        break;

      case "mousedown":
      case "mouseup":
        if (config.selector) {
          code += `\n  .${action.value}('${config.selector}')`;
        }
        break;

      case "file":
        if (config.selector && config.files?.length) {
          code += `\n  .file('${config.selector}', ${JSON.stringify(
            config.files
          )})`;
        }
        break;

      case "value":
        if (config.selector) {
          code += `\n  .value('${config.selector}', '${config.value}')`;
        }
        break;

      case "check":
        if (config.selector) {
          code += `\n  .check('${config.selector}'${
            config.checked !== undefined ? `, ${config.checked}` : ""
          })`;
        }
        break;

      case "focus":
        if (config.selector) {
          code += `\n  .focus('${config.selector}')`;
        }
        break;

      case "scroll":
        if (config.type === "element" && config.selector) {
          code += `\n  .scroll('${config.selector}')`;
        } else if (config.type === "position") {
          if (config.x !== undefined && config.y !== undefined) {
            code += `\n  .scroll(${config.x}, ${config.y})`;
          } else if (config.y !== undefined) {
            code += `\n  .scroll(${config.y})`;
          }
        }
        break;

      case "download":
        if (config.url) {
          code += `\n  .download('${config.url}'${
            config.savePath ? `, '${config.savePath}'` : ""
          })`;
        }
        break;

      case "hide":
      case "show":
        code += `\n  .${action.value}()`;
        break;

      case "devTools":
        if (config.mode) {
          code += `\n  .devTools('${config.mode}')`;
        } else {
          code += `\n  .devTools()`;
        }
        break;
    }
  });

  // 运行参数
  const runOptions = {};
  Object.entries(configs.run).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== defaultUBrowserConfigs.run[key]
    ) {
      runOptions[key] = value;
    }
  });

  code += `\n  .run(${
    Object.keys(runOptions).length
      ? `\n${JSON.stringify(runOptions, null, 2).replace(/\n/g, "\n    ")}`
      : ""
  })`;

  return code;
}
