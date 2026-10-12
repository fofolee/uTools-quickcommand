/**
 * commandStore 的自检脚本（不依赖 uTools，用假 db 跑一遍增删改查）
 * 运行：node test/commandStore.test.js
 */
const assert = require("assert");

const db = new Map();
const features = new Map();

global.window = {
  lodashM: { cloneDeep: (x) => JSON.parse(JSON.stringify(x)) },
  dispatchEvent: () => true,
  utools: {
    db: {
      get: (id) => (db.has(id) ? { _id: id, _rev: "1-x", data: db.get(id) } : undefined),
      put: (doc) => (db.set(doc._id, doc.data), { ok: true }),
      remove: (id) => (db.delete(id), { ok: true }),
      allDocs: (prefix) =>
        [...db.entries()]
          .filter(([id]) => id.startsWith(prefix))
          .map(([id, data]) => ({ _id: id, data })),
    },
    getFeatures: () => [...features.values()],
    setFeature: (feature) => (features.set(feature.code, feature), true),
    removeFeature: (code) => features.delete(code),
  },
};
global.localStorage = { length: 0, key: () => null, removeItem: () => {} };

const store = require("../plugin/lib/commandStore.js");

const draft = {
  program: "quickcommand",
  cmd: "console.log(1)",
  features: { explain: "测试命令", cmds: ["测试命令"] },
  output: "text",
  tags: ["测试"],
};

// 建
const created = store.create(draft);
assert.deepStrictEqual(created.errors, undefined);
const command = created.command;
const code = command.features.code;
assert.match(code, /^key_[0-9a-f]{8}$/);
assert.strictEqual(command.features.cmds[0], "测试命令");
assert.strictEqual(command.features.mainHide, false);
assert.ok(db.has("qc_" + code));
assert.ok(features.has(code));

// 参数不合法时不落库
const before = db.size;
assert.ok(store.create({ ...draft, program: "python3" }).errors.length);
assert.ok(store.create({ ...draft, features: { explain: "", cmds: [] } }).errors.length);
assert.strictEqual(db.size, before);

// 查
assert.strictEqual(store.list({}).total, 1);
assert.strictEqual(store.list({ tag: "测试" }).total, 1);
assert.strictEqual(store.list({ tag: "不存在" }).total, 0);
assert.strictEqual(store.list({ keyword: "测试" }).total, 1);
assert.strictEqual(store.list({ enabled: true }).total, 1);
assert.strictEqual(store.list({ enabled: false }).total, 0);
assert.deepStrictEqual(store.listTags(), [{ tag: "测试", count: 1 }]);
assert.strictEqual(store.get(code).cmd, "console.log(1)");

// 改
const updated = store.update(code, {
  ...command,
  cmd: "console.log(2)",
  features: { ...command.features, explain: "改名了" },
});
assert.strictEqual(updated.command.features.code, code);
assert.strictEqual(updated.command.features.explain, "改名了");
assert.strictEqual(db.get("qc_" + code).cmd, "console.log(2)");
// 字符串形式的触发方式是关键词，不派生 label；对象形式的匹配规则 label 跟随 explain
assert.strictEqual(db.get("qc_" + code).features.cmds[0], "测试命令");
const withRule = store.create({
  ...draft,
  features: { explain: "正则命令", cmds: [{ type: "regex", match: "/^\\d+$/i" }] },
}).command;
assert.strictEqual(withRule.features.cmds[0].label, "正则命令");
assert.ok(store.update(code, { ...command, tags: "不是数组" }).errors.length);
assert.ok(store.update(code, { ...command, features: { ...command.features, icon: "x".repeat(40000) } }).errors.length);

// 启用/禁用
assert.deepStrictEqual(store.setEnabled([code], false), [{ code, enabled: false }]);
assert.ok(!features.has(code));
assert.strictEqual(store.list({ enabled: false }).total, 1);
store.setEnabled([code], true);
assert.ok(features.has(code));

// 内置命令一律只读
assert.throws(() => store.get("default_textReplacer"), /内置/);
assert.throws(() => store.remove("default_textReplacer"), /内置/);
assert.throws(() => store.update("default_textReplacer", draft), /内置/);
assert.notDeepStrictEqual(store.create({ ...draft, features: { ...draft.features, code: "default_x" } }).command.features.code, "default_x");

// 删
const removed = store.remove(code);
assert.strictEqual(removed.features.code, code);
assert.ok(!db.has("qc_" + code));
assert.ok(!features.has(code));
assert.throws(() => store.get(code), /没有找到/);

console.log("commandStore 自检通过");
