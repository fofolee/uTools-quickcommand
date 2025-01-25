export function generateCode(flow) {
  const { commands, name, label, customVariables = [] } = flow;

  const params = customVariables.filter((v) => v.type === "param") || [];
  const manualVars = customVariables.filter((v) => v.type === "var") || [];
  // 检查是否包含异步函数
  const hasAsyncFunction = commands.some((cmd) => cmd.isAsync);

  let code = [];
  const funcName = name || "func_" + new Date().getTime();

  code.push(`// ${label}`);
  // 生成函数声明
  code.push(
    `${hasAsyncFunction ? "async " : ""}function ${funcName}(${params
      .map((p) => p.name)
      .join(", ")}) {`
  );

  code.push(manualVars.map((v) => `  let ${v.name} = ${v.value};`).join("\n"));
  const indent = "  ";

  commands.forEach((cmd) => {
    // 跳过禁用的命令
    if (cmd.disabled) return;
    if (!cmd.code) return;

    let cmdCode = cmd.code;
    // 处理输出变量
    if (cmd.outputVariable) {
      const { name, details } = cmd.outputVariable;
      if (cmd.isAsync) {
        if (cmd.callbackFunc) {
          // 使用回调函数模式
          cmdCode = `${cmdCode}.then(${cmd.callbackFunc})`;
        } else {
          // 使用 await 模式
          cmdCode = `const ${name} = await ${cmdCode}`;
          code.push(indent + cmdCode);
          // 处理详细变量
          if (details) {
            Object.entries(details).forEach(([path, varName]) => {
              code.push(`${indent}let ${varName} = ${name}.${path};`);
            });
          }
          return;
        }
      } else {
        cmdCode = `const ${name} = ${cmdCode}`;
        code.push(indent + cmdCode);
        // 处理详细变量
        if (details) {
          Object.entries(details).forEach(([path, varName]) => {
            code.push(`${indent}let ${varName} = ${name}.${path};`);
          });
        }
        return;
      }
    }

    code.push(indent + cmdCode);
  });

  code.push("}"); // Close the function

  // 如果是主函数，则自动执行
  if (funcName === "main") {
    code.push("\nmain();"); // Call the main function
  }

  return code.join("\n");
}
