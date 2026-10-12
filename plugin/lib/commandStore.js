/**
 * 快捷命令的读写与校验，供 MCP 工具使用（preload 环境，CommonJS）
 *
 * 逻辑对应 src/js/commandManager.js，那边是 webpack 模块，preload require 不到，
 * 只能把必需片段复制过来。改动其中一边时记得同步另一边。
 */
const utoolsFull = window.utools; // App.vue 初始化后 window.utools 会被替换成阉割版，必须在 preload 加载时捕获

const PROGRAMS = [
  "quickcommand",
  "quickcomposer",
  "html",
  "shell",
  "applescript",
  "cmd",
  "powershell",
  "python",
  "javascript",
  "ruby",
  "php",
  "c",
  "csharp",
  "lua",
  "perl",
  "custom",
];
const OUTPUTS = [
  "ignore",
  "nothing",
  "text",
  "html",
  "terminal",
  "clip",
  "send",
  "notice",
];
const PLATFORMS = ["win32", "darwin", "linux"];
const CMD_TYPES = [
  "key",
  "regex",
  "over",
  "img",
  "files",
  "window",
  "professional",
];
const ICON_MAX_LENGTH = 32 * 1024;

const getUniqueId = (options = {}) => {
  const { short = false } = options;
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return short ? uuid.substring(0, 8) : uuid;
};

const isDefaultCommand = (code) => String(code).slice(0, 8) === "default_";

const getCmdType = (cmds) => {
  const firstCmdType = cmds[0].type || "key";
  if (!cmds.find((x) => typeof x !== "string")) return "key";
  if (!cmds.find((x) => x.type !== firstCmdType)) return firstCmdType;
  return "professional";
};

const getFeatureCode = (cmds) => {
  return `${getCmdType(cmds)}_${getUniqueId({ short: true })}`;
};

const dbGet = (id) => {
  const db = utoolsFull.db.get(id);
  return db ? db.data : null;
};

const dbPut = (value, id) => {
  const db = utoolsFull.db.get(id);
  return db
    ? utoolsFull.db.put({ _id: id, data: value, _rev: db._rev })
    : utoolsFull.db.put({ _id: id, data: value });
};

const dbRemove = (id) => utoolsFull.db.remove(id);

const getActivatedCodes = () => utoolsFull.getFeatures().map((x) => x.code);

// 是否为不需要显示输入框的输出类型
const outPluginOutputs = ["ignore", "terminal", "clip", "send", "notice"];

const validateCmdRule = (rule, index, errors) => {
  const path = `features.cmds[${index}]`;
  if (typeof rule === "string") {
    if (!rule.trim())
      errors.push({ path, error: "关键词不能为空字符串" });
    return;
  }
  if (!rule || typeof rule !== "object") {
    errors.push({ path, got: rule, error: "只能是字符串（关键词）或匹配规则对象" });
    return;
  }
  if (!CMD_TYPES.includes(rule.type)) {
    errors.push({ path: `${path}.type`, got: rule.type, allow: CMD_TYPES });
    return;
  }
  if (rule.type === "regex" && typeof rule.match !== "string") {
    errors.push({ path: `${path}.match`, error: "正则匹配规则需要 match 字段，形如 \"/^https?:\\\\/\\\\//i\"" });
  }
  if (rule.type === "files" && rule.fileType && !["file", "directory"].includes(rule.fileType)) {
    errors.push({ path: `${path}.fileType`, got: rule.fileType, allow: ["file", "directory"] });
  }
  if (rule.type === "window" && (!rule.match || !Array.isArray(rule.match.app))) {
    errors.push({ path: `${path}.match.app`, error: "窗口匹配规则需要 match.app 数组，形如 [\"chrome.exe\"]" });
  }
};

const validateCommand = (command) => {
  const errors = [];
  if (!command || typeof command !== "object" || Array.isArray(command)) {
    return [{ path: "", error: "命令必须是一个对象" }];
  }
  if (!PROGRAMS.includes(command.program)) {
    errors.push({ path: "program", got: command.program, allow: PROGRAMS });
  }
  const features = command.features;
  if (!features || typeof features !== "object") {
    errors.push({ path: "features", error: "缺少 features 对象" });
    return errors;
  }
  if (typeof features.explain !== "string" || !features.explain.trim()) {
    errors.push({ path: "features.explain", error: "名称不能为空，它是命令在 uTools 搜索框里显示的名字" });
  }
  if (!Array.isArray(features.cmds) || !features.cmds.length) {
    errors.push({ path: "features.cmds", error: "至少需要一个触发方式（关键词字符串或匹配规则对象）" });
  } else {
    features.cmds.forEach((rule, i) => validateCmdRule(rule, i, errors));
  }
  if (features.platform !== undefined) {
    if (
      !Array.isArray(features.platform) ||
      !features.platform.length ||
      features.platform.some((p) => !PLATFORMS.includes(p))
    ) {
      errors.push({ path: "features.platform", got: features.platform, allow: PLATFORMS });
    }
  }
  if (features.mainPush !== undefined && typeof features.mainPush !== "boolean") {
    errors.push({ path: "features.mainPush", got: features.mainPush, error: "需要布尔值" });
  }
  if (typeof features.icon === "string" && features.icon.length > ICON_MAX_LENGTH) {
    errors.push({
      path: "features.icon",
      error: `图标过大（${features.icon.length} 字符，上限 ${ICON_MAX_LENGTH}），请留空让用户自己在界面里设置`,
    });
  }
  if (command.output !== undefined && !OUTPUTS.includes(command.output)) {
    errors.push({ path: "output", got: command.output, allow: OUTPUTS });
  }
  if (command.tags !== undefined && !Array.isArray(command.tags)) {
    errors.push({ path: "tags", got: command.tags, error: "需要字符串数组，如 [\"日常\"]" });
  }
  if (command.program === "quickcomposer") {
    if (command.flows !== undefined && !Array.isArray(command.flows)) {
      errors.push({ path: "flows", got: command.flows, error: "需要数组" });
    }
  } else if (typeof command.cmd !== "string") {
    errors.push({ path: "cmd", got: command.cmd, error: "脚本内容必须是字符串" });
  }
  return errors;
};

// 补齐派生字段，等价于 commandManager 里的 getValidCommand
const normalizeCommand = (command) => {
  const normalized = JSON.parse(JSON.stringify(command));
  const { cmds, explain } = normalized.features;
  normalized.features.cmds = cmds.map((cmd) =>
    typeof cmd === "string" ? cmd : { ...cmd, label: explain }
  );
  normalized.features.mainHide = outPluginOutputs.includes(normalized.output);
  normalized.features.code =
    normalized.features.code || getFeatureCode(normalized.features.cmds);
  if (!Array.isArray(normalized.tags)) normalized.tags = [];
  if (normalized.output === undefined) normalized.output = "text";
  return normalized;
};

const getDbCommands = () => {
  return utoolsFull.db
    .allDocs("qc_")
    .map((x) => x.data)
    // 打包进插件里的默认命令不落库，这条只是兜底
    .filter((x) => x && x.features && !String(x.features.code).includes("default_"));
};

const summarize = (command, activatedCodes) => ({
  code: command.features.code,
  explain: command.features.explain,
  cmds: command.features.cmds,
  program: command.program,
  output: command.output,
  tags: command.tags || [],
  enabled: activatedCodes.includes(command.features.code),
});

const list = (params = {}) => {
  const activatedCodes = getActivatedCodes();
  let commands = getDbCommands();
  if (params.tag) commands = commands.filter((x) => (x.tags || []).includes(params.tag));
  if (params.program) commands = commands.filter((x) => x.program === params.program);
  if (typeof params.enabled === "boolean") {
    commands = commands.filter((x) => activatedCodes.includes(x.features.code) === params.enabled);
  }
  if (params.keyword) {
    const kw = String(params.keyword).toLowerCase();
    commands = commands.filter((x) => {
      const haystack = [
        x.features.code,
        x.features.explain,
        JSON.stringify(x.features.cmds),
        (x.tags || []).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(kw);
    });
  }
  return {
    total: commands.length,
    commands: commands.map((x) => summarize(x, activatedCodes)),
  };
};

const get = (code) => {
  if (!code) throw new Error("缺少 code 参数");
  if (isDefaultCommand(code)) {
    throw new Error(
      `${code} 是插件内置的默认命令，不落库也没有对应的数据，MCP 无法读取。内置命令一律只读，需要类似功能请用 qc_create_command 新建一条。`
    );
  }
  const command = dbGet("qc_" + code);
  if (!command) throw new Error(`没有找到 ${code} 这条命令，先用 qc_list_commands 查一下`);
  return command;
};

const create = (command) => {
  const errors = validateCommand(command);
  if (errors.length) return { errors };
  const normalized = normalizeCommand(command);
  if (isDefaultCommand(normalized.features.code)) {
    normalized.features.code = getFeatureCode(normalized.features.cmds);
  }
  return { command: persist(normalized) };
};

const update = (code, command) => {
  if (!code) throw new Error("缺少 code 参数");
  if (isDefaultCommand(code)) {
    throw new Error(`${code} 是插件内置的默认命令，不能修改。要改请用 qc_create_command 新建一条自己的命令。`);
  }
  const current = dbGet("qc_" + code);
  if (!current) throw new Error(`没有找到 ${code} 这条命令，先用 qc_list_commands 查一下`);
  const errors = validateCommand(command);
  if (errors.length) return { errors };
  const normalized = normalizeCommand({ ...command, features: { ...command.features, code } });
  return { command: persist(normalized) };
};

const remove = (code) => {
  if (!code) throw new Error("缺少 code 参数");
  if (isDefaultCommand(code)) {
    throw new Error(`${code} 是插件内置的默认命令，不能删除。`);
  }
  const command = dbGet("qc_" + code);
  if (!command) throw new Error(`没有找到 ${code} 这条命令，先用 qc_list_commands 查一下`);
  dbRemove("qc_" + code);
  utoolsFull.removeFeature(code);
  // 历史记录一并清掉，等价于界面上的删除
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("editor_history_" + code)) localStorage.removeItem(key);
  }
  return command;
};

const setEnabled = (codes, enabled) => {
  const changed = [];
  codes.forEach((code) => {
    if (isDefaultCommand(code)) return;
    const command = dbGet("qc_" + code);
    if (!command) return;
    utoolsFull.removeFeature(code);
    if (enabled) utoolsFull.setFeature(window.lodashM.cloneDeep(command.features));
    changed.push({ code, enabled });
  });
  return changed;
};

const listTags = () => {
  const counts = {};
  getDbCommands().forEach((x) => {
    const tags = x.tags && x.tags.length ? x.tags : ["未分类"];
    tags.forEach((t) => (counts[t] = (counts[t] || 0) + 1));
  });
  return Object.keys(counts).map((tag) => ({ tag, count: counts[tag] }));
};

// 落库 + 注册 feature，等价于界面保存
const persist = (command) => {
  const code = command.features.code;
  dbPut(command, "qc_" + code);
  utoolsFull.removeFeature(code);
  utoolsFull.setFeature(window.lodashM.cloneDeep(command.features));
  notifyUI();
  return command;
};

// 通知页面刷新列表，页面没打开时没人监听，忽略即可
const notifyUI = () => {
  try {
    window.dispatchEvent(new CustomEvent("qc:mcp-changed"));
  } catch (e) {
    console.log("notifyUI failed", e);
  }
};

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  setEnabled,
  listTags,
  notifyUI,
};
