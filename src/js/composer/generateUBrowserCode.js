/**
 * 生成 UBrowser 代码
 * @param {Object} argvs UBrowser 配置对象
 * @returns {string} 生成的代码
 */
import { stringifyVarInputVal } from "./varInputValManager";
import { stringifyArgv } from "./formatString";

// ubrowser 默认运行配置
const defaultRunConfigs = {
  show: true,
  width: 800,
  height: 600,
  center: true,
  minWidth: 0,
  minHeight: 0,
  resizable: true,
  movable: true,
  minimizable: true,
  maximizable: true,
  alwaysOnTop: false,
  fullscreen: false,
  fullscreenable: true,
  enableLargerThanScreen: false,
  opacity: 1,
};

// 生成完整的 ubrowser 代码
export function generateUBrowserCode(argvs) {
  const lines = ["utools.ubrowser"];

  // 首先添加 goto 操作
  if (argvs.goto) {
    const args = [];
    // url
    if (argvs.goto.url) {
      args.push(stringifyVarInputVal(argvs.goto.url));
    }

    // headers
    const headers = {};
    // 处理标准headers
    Object.entries(argvs.goto.headers || {}).forEach(([key, value]) => {
      if (value?.value) {
        headers[key] = value.value;
      }
    });
    // 处理其他headers
    Object.entries(argvs.goto.otherHeaders || {}).forEach(([key, value]) => {
      if (value?.value) {
        headers[key] = value.value;
      }
    });

    if (Object.keys(headers).length > 0) {
      args.push(stringifyArgv(headers));
    }

    // timeout
    if (argvs.goto.timeout) {
      if (args.length === 1) {
        args.push("undefined");
      }
      args.push(argvs.goto.timeout);
    }

    lines[0] += `.goto(${args.join(", ")})`;
  }

  // 添加其他操作
  if (argvs.operations?.length) {
    argvs.operations.forEach(({ value, args }) => {
      const stringifiedArgs = args
        .map((arg) => stringifyArgv(arg))
        .filter(Boolean);

      lines.push(`  .${value}(${stringifiedArgs.join(", ")})`);
    });
  }

  // 最后添加 run 配置（只包含非默认值）
  if (argvs.run) {
    const runOptions = {};
    Object.entries(argvs.run).forEach(([key, value]) => {
      if (value !== defaultRunConfigs[key]) {
        runOptions[key] = value;
      }
    });

    if (Object.keys(runOptions).length > 0) {
      lines.push(
        `  .run(${JSON.stringify(runOptions, null, 2).replace(/\n/g, "\n  ")})`
      );
    } else {
      lines.push("  .run()");
    }
  }

  return lines.join("\n");
}
