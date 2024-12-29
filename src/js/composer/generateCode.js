export function generateCode(commandFlow) {
  // 检查是否包含异步函数
  const hasAsyncFunction = commandFlow.some((cmd) => cmd.isAsync);

  let code = hasAsyncFunction ? ["async function run() {"] : [];
  const indent = hasAsyncFunction ? "  " : "";

  commandFlow.forEach((cmd) => {
    let line = indent;

    if (cmd.outputVariable) {
      line += `let ${cmd.outputVariable} = `;
    }

    if (cmd.value === "ubrowser") {
      line += `await ${cmd.argv}`;
    } else if (cmd.value === "axios" || cmd.value === "fetch") {
      line += `await ${cmd.argv}`;
    } else {
      line += `${cmd.isAsync ? "await " : ""}${cmd.value}(${cmd.argv})`;
    }

    code.push(line);
  });

  if (hasAsyncFunction) {
    code.push("}"); // Close the async function
    code.push("run();"); // Call the function
  }

  return code.join("\n");
}
