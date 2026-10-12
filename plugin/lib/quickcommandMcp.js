/**
 * 把快捷命令的增删改查注册成 uTools 的 MCP 工具，供外部 AI Agent 调用
 *
 * 工具声明在 plugin/plugin.json 的 tools 字段里，这里只负责运行时注册 handler。
 * 三档权限（读取/写入/运行）在 AI 配置界面里开关，存在本机 profile 的 mcpPermissions 字段。
 */
const store = require("./commandStore.js");
const schema = require("./commandSchema.js");

const utoolsFull = window.utools; // App.vue 初始化后 window.utools 会被替换成阉割版，必须在 preload 加载时捕获

const PROFILE_KEY = () => `cfg_${utoolsFull.getNativeId()}_profile`;
const DEFAULT_PERMISSIONS = { read: true, write: true, run: false };
const GROUP_LABELS = { read: "读取", write: "写入", run: "运行" };

const TOOL_GROUPS = {
  read: ["qc_list_commands", "qc_get_command", "qc_list_tags", "qc_get_schema"],
  write: [
    "qc_create_command",
    "qc_update_command",
    "qc_delete_command",
    "qc_set_enabled",
  ],
  run: ["qc_run_command"],
};

const getPermissions = () => {
  let saved = {};
  try {
    const profile = utoolsFull.db.get(PROFILE_KEY());
    saved = (profile && profile.data && profile.data.mcpPermissions) || {};
  } catch (e) {
    console.log("读取 MCP 权限配置失败", e);
  }
  return { ...DEFAULT_PERMISSIONS, ...saved };
};

const validationFailed = (errors) => ({
  ok: false,
  error: "参数校验没通过，按 errors 里的提示修正后重试",
  errors,
});

const HANDLERS = {
  qc_list_commands: (params) => ({ ok: true, ...store.list(params) }),
  qc_get_command: (params) => ({
    ok: true,
    command: store.get(params.code),
  }),
  qc_list_tags: () => ({ ok: true, tags: store.listTags() }),
  qc_get_schema: () => ({ ok: true, schema }),
  qc_create_command: (params) => {
    const result = store.create(params.command);
    if (result.errors) return validationFailed(result.errors);
    return {
      ok: true,
      code: result.command.features.code,
      command: result.command,
    };
  },
  qc_update_command: (params) => {
    const result = store.update(params.code, params.command);
    if (result.errors) return validationFailed(result.errors);
    return { ok: true, command: result.command };
  },
  qc_delete_command: (params) => ({
    ok: true,
    command: store.remove(params.code),
  }),
  qc_set_enabled: (params) => {
    if (!Array.isArray(params.codes) || !params.codes.length) {
      return validationFailed([
        { path: "codes", got: params.codes, error: "需要非空的 code 数组" },
      ]);
    }
    const changed = store.setEnabled(params.codes, params.enabled === true);
    if (!changed.length) {
      return {
        ok: false,
        error: "没有匹配到可操作的命令（内置命令不能启用/禁用，也可以先用 qc_list_commands 确认 code）",
      };
    }
    store.notifyUI();
    return { ok: true, changed };
  },
  qc_run_command: async (params) => {
    // 先确认命令真的存在，避免把空对象丢给界面侧的运行器
    store.get(params.code);
    // 运行要靠界面侧的命令运行器（需要窗口、输出面板配合），插件页面没加载时用不了
    if (!window.qcBridge || typeof window.qcBridge.runCommand !== "function") {
      return {
        ok: false,
        error:
          "运行命令需要 quickcommand 插件界面处于加载状态。请在 uTools 里打开一次「快捷命令」后重试，或改用界面上的运行按钮。",
      };
    }
    const output = await window.qcBridge.runCommand(
      params.code,
      params.input,
      params.timeout || 10000
    );
    return { ok: true, code: params.code, output };
  },
};

const groupOf = (name) =>
  Object.keys(TOOL_GROUPS).find((group) => TOOL_GROUPS[group].includes(name));

// handler 里再查一次权限：uTools 的 tools/list 只认 plugin.json 里的声明，
// 反注册拦不住调用，只会让 Agent 收到「未注册」这种没法行动的错，所以这里给出明确原因
const withPermissionCheck = (name) => {
  const group = groupOf(name);
  return async (params, ctx) => {
    if (!getPermissions()[group]) {
      return {
        ok: false,
        error: `用户在 quickcommand 的 AI 配置里关闭了 AI Agent 的「${GROUP_LABELS[group]}」权限，打开后重试`,
      };
    }
    try {
      return await HANDLERS[name](params || {}, ctx);
    } catch (e) {
      console.log("MCP 工具执行失败：" + name, e);
      return { ok: false, error: String((e && e.message) || e) };
    }
  };
};

const supported = () => typeof utoolsFull.registerTool === "function";

const applyPermissions = () => {
  if (!supported()) {
    console.log("当前 uTools 版本不支持 registerTool，跳过 MCP 工具注册");
    return getPermissions();
  }
  Object.keys(TOOL_GROUPS).forEach((group) => {
    TOOL_GROUPS[group].forEach((name) => {
      utoolsFull.registerTool(name, withPermissionCheck(name));
    });
  });
  return getPermissions();
};

// 权限在每次调用时从 profile 里读，所以不需要再暴露重注册的接口
applyPermissions();

module.exports = { applyPermissions, getPermissions, TOOL_GROUPS };
