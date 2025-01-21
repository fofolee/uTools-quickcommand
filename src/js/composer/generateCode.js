export function generateCode(commandFlow, functionName = null) {
  // 检查是否包含异步函数
  const hasAsyncFunction = commandFlow.some((cmd) => cmd.isAsync);

  let code = [];
  const funcName = functionName || "run";

  // 生成函数声明
  code.push(`${hasAsyncFunction ? "async " : ""}function ${funcName}() {`);

  const indent = "  ";

  commandFlow.forEach((cmd) => {
    // 跳过禁用的命令
    if (cmd.disabled) return;
    if (!cmd.code) return;
    let line = indent;

    if (cmd.outputVariable) {
      line += `let ${cmd.outputVariable} = `;
    }

    let awaitCmd = cmd.isAsync ? "await " : "";
    line += `${awaitCmd} ${cmd.code}`;
    code.push(line);
  });

  code.push("}"); // Close the function

  // 如果是主函数，则自动执行
  if (functionName === "main") {
    code.push("\nmain();"); // Call the main function
  }

  return code.join("\n");
}
