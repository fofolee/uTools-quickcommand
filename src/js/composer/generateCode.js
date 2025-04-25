export function generateCode(flow) {
  let usedVarNames = [];

  // 获取变量赋值代码，如果变量已经存在，则直接赋值，否则声明并赋值
  const getVarAssignCode = (varName, varValue) => {
    if (usedVarNames.includes(varName)) {
      return `${varName} = ${varValue}`;
    }
    usedVarNames.push(varName);
    if (!varValue) {
      return `let ${varName}`;
    }
    return `let ${varName} = ${varValue}`;
  };

  const getVarByPath = (name, path) => {
    return `${name}${path.startsWith("[") ? "" : "."}${path}`;
  };

  const { commands, name, label, customVariables = [] } = flow;

  const params = customVariables.filter((v) => v.type === "param") || [];
  const manualVars = customVariables.filter((v) => v.type === "var") || [];
  // 检查是否包含异步函数
  const hasAsyncFunction = commands.some((cmd) => cmd.asyncMode);

  let code = [];
  const funcName = name || "func_" + new Date().getTime();

  code.push(`// ${label}`);
  // 生成函数声明
  code.push(
    `${hasAsyncFunction ? "async " : ""}function ${funcName}(${params
      .map((p) => p.name)
      .join(", ")}) {`
  );

  const indent = "  ";
  const comma = ";";

  // 局部变量赋值
  manualVars.forEach((v) => {
    code.push(indent + getVarAssignCode(v.name, v.value) + comma);
  });

  commands.forEach((cmd) => {
    // 跳过禁用的命令
    if (cmd.disabled) return;
    if (!cmd.code) return;

    let cmdCode = cmd.code;
    // 处理输出变量
    const outputVariable = cmd.outputVariable || {};
    const { name, details } = outputVariable;
    if (name || !window.lodashM.isEmpty(details)) {
      if (cmd.asyncMode === "then") {
        // 使用回调函数模式
        if (cmd.callbackFunc) {
          // 如果回调函数存在，则使用回调函数模式，否则保持原样
          if (!details) {
            cmdCode = `${cmdCode}.then(${cmd.callbackFunc})`;
          } else {
            // 如果输出变量有详细变量，则需要为每个变量赋值
            const promiseName = name || "__result";

            const extractVarCode = Object.entries(details)
              .map(
                ([path, varName]) =>
                  `let ${varName} = ${getVarByPath(promiseName, path)};`
              )
              .join("\n");

            const funcName = cmd.callbackFunc;

            const funcParams =
              (name ? `${name},` : "") + Object.values(details).join(",");

            cmdCode = `${cmdCode}.then((${promiseName})=>{
              ${extractVarCode}
              ${funcName}(${funcParams})
              })`;
          }
        }
        code.push(indent + cmdCode + comma);
      } else if (cmd.asyncMode === "await") {
        // 使用 await 模式
        const promiseName = name || "__result";
        cmdCode = getVarAssignCode(promiseName, `await ${cmdCode}`);
        code.push(indent + cmdCode + comma);
        // 处理详细变量
        if (details) {
          Object.entries(details).forEach(([path, varName]) => {
            code.push(
              indent +
                `${getVarAssignCode(
                  varName,
                  getVarByPath(promiseName, path)
                )}` +
                comma
            );
          });
        }
      } else {
        // 非Async命令
        const resultVarName = name || "__result";
        cmdCode = getVarAssignCode(resultVarName, `${cmdCode}`);
        code.push(indent + cmdCode + comma);
        // 处理详细变量
        if (details) {
          Object.entries(details).forEach(([path, varName]) => {
            code.push(
              indent +
                `${getVarAssignCode(
                  varName,
                  getVarByPath(resultVarName, path)
                )}` +
                comma
            );
          });
        }
        return;
      }
    } else {
      if (cmd.asyncMode === "await") {
        cmdCode = `await ${cmdCode}`;
      }
      code.push(indent + cmdCode + (cmd.isControlFlow ? "" : comma));
    }
  });

  code.push("};"); // Close the function

  // 如果是主函数，则自动执行
  if (funcName === "main") {
    code.push("\nmain();"); // Call the main function
  }

  const finalCode = code.join("\n");

  return finalCode;
}

export function generateFlowsCode(flows) {
  const [mainFlow, ...subFlows] = flows;
  return [...subFlows, mainFlow].map((flow) => generateCode(flow)).join("\n\n");
}
