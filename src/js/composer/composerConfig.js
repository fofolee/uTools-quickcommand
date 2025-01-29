import { commandCategories } from "./commands";

let availableCommands = [];
let commandValueMap = {};

// 从commandCategories中提取所有命令
commandCategories.forEach((category) => {
  category.commands.forEach((cmd) => {
    availableCommands.push({
      type: category.label,
      ...cmd,
    });
    commandValueMap[cmd.value] = cmd;
  });
});

const findCommandByValue = (value) => {
  return commandValueMap[value];
};

export { availableCommands, commandCategories, findCommandByValue };
