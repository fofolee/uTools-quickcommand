/**
 * uTools MCP 服务的端到端自检：打一遍 initialize / tools/list / 增删改查
 *
 * 用法：node test/mcp-smoke.mjs http://127.0.0.1:3501/mcp <x-mcp-key>
 * 端口和 key 在 uTools 设置 → MCP 服务 里。
 */
const [url, key] = process.argv.slice(2);
if (!url || !key) {
  console.error("用法：node test/mcp-smoke.mjs <mcp-url> <x-mcp-key>");
  process.exit(1);
}

let sessionId = null;
let nextId = 1;
let allTools = [];

const call = async (method, params) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "x-mcp-key": key,
      ...(sessionId ? { "mcp-session-id": sessionId } : {}),
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
  });
  const newSession = res.headers.get("mcp-session-id");
  if (newSession) sessionId = newSession;
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} HTTP ${res.status}: ${text.slice(0, 200)}`);
  const payload = text
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .join("");
  const parsed = JSON.parse(payload || text);
  if (parsed.error) throw new Error(`${method} 返回错误：${JSON.stringify(parsed.error)}`);
  return parsed.result;
};

const callTool = async (bareName, args = {}) => {
  // uTools 会给工具名加上插件前缀，tools/call 必须用完整名字
  const tool = allTools.find((t) => t.name === bareName || t.name.endsWith("_" + bareName));
  const result = await call("tools/call", { name: tool ? tool.name : bareName, arguments: args });
  const text = (result.content || []).map((c) => c.text || "").join("");
  try {
    return JSON.parse(text);
  } catch (e) {
    return { raw: text, isError: result.isError };
  }
};

const check = (label, condition, detail) => {
  console.log(`${condition ? "✅" : "❌"} ${label}${detail ? " — " + detail : ""}`);
  if (!condition) process.exitCode = 1;
};

await call("initialize", {
  protocolVersion: "2025-06-18",
  capabilities: {},
  clientInfo: { name: "quickcommand-smoke", version: "1" },
});
await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "x-mcp-key": key,
    "mcp-session-id": sessionId,
  },
  body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
});
console.log("✅ initialize");

const { tools } = await call("tools/list");
allTools = tools;
const ours = tools.map((t) => t.name).filter((n) => n.includes("qc_"));
check("tools/list 里有 quickcommand 的工具", ours.length > 0, ours.join(", ") || "一个都没有");
if (!ours.length) {
  console.log(
    "提示：确认 uTools 的 MCP 设置里没有禁用 quickcommand，且插件已重新加载过 plugin.json"
  );
  process.exit(1);
}

const schema = await callTool("qc_get_schema");
check("qc_get_schema", schema.ok === true && schema.schema.length > 500);

const before = await callTool("qc_list_commands");
check("qc_list_commands", before.ok === true, `当前 ${before.total} 条用户命令`);

const created = await callTool("qc_create_command", {
  command: {
    program: "quickcommand",
    cmd: "console.log('hello from mcp')",
    features: { explain: "MCP 自检命令", cmds: ["mcp自检"] },
    output: "text",
    tags: ["自检"],
  },
});
check("qc_create_command", created.ok === true && /^key_/.test(created.code || ""), created.code);
if (!created.ok) {
  console.log(JSON.stringify(created, null, 2));
  process.exit(1);
}
const code = created.code;

// 故意写错，确认返回可读的校验错误
const bad = await callTool("qc_create_command", {
  command: { program: "python3", features: { explain: "", cmds: [{ type: "regexp" }] } },
});
check("参数不合法时返回 errors", bad.ok === false && Array.isArray(bad.errors), `${(bad.errors || []).length} 条`);

const one = await callTool("qc_get_command", { code });
check("qc_get_command", one.ok === true && one.command.cmd.includes("hello from mcp"));

const listed = await callTool("qc_list_commands", { keyword: "自检" });
check("qc_list_commands 能按关键词搜到", (listed.commands || []).some((c) => c.code === code));

const updated = await callTool("qc_update_command", {
  code,
  command: { ...one.command, cmd: "console.log('updated')" },
});
check("qc_update_command", updated.ok === true && updated.command.cmd.includes("updated"));

const disabled = await callTool("qc_set_enabled", { codes: [code], enabled: false });
const offList = await callTool("qc_list_commands", { enabled: false });
check(
  "qc_set_enabled 禁用后列表可见",
  disabled.ok === true && offList.commands.some((c) => c.code === code)
);
await callTool("qc_set_enabled", { codes: [code], enabled: true });

const tags = await callTool("qc_list_tags");
check("qc_list_tags", tags.ok === true && tags.tags.some((t) => t.tag === "自检"));

const run = await callTool("qc_run_command", { code });
// 运行档默认关：工具会被反注册，uTools 仍会列出它但调用报「未注册」
const runBlocked = run.ok !== true;
check(
  "qc_run_command 的运行权限按开关生效",
  runBlocked ? /未注册|权限/.test(run.raw || run.error || "") : run.ok === true,
  runBlocked ? "运行档关闭（默认），工具未注册" : JSON.stringify(run.output)
);

const removed = await callTool("qc_delete_command", { code });
check("qc_delete_command", removed.ok === true && removed.command.features.code === code);

const builtin = await callTool("qc_delete_command", { code: "default_textReplacer" });
check("内置命令拒写", builtin.ok === false, builtin.error);

console.log(process.exitCode ? "有失败项" : "全部通过");
