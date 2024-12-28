export function generateCode(commandFlow) {
  let code = [];

  commandFlow.forEach((cmd) => {
    let line = "";

    if (cmd.outputVariable) {
      line += `let ${cmd.outputVariable} = `;
    }

    if (cmd.value === "ubrowser") {
      line += cmd.argv;
    } else {
      line += `${cmd.value}(${cmd.argv})`;
    }

    code.push(line);
  });

  return code.join("\n");
}
