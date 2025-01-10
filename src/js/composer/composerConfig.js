export {
  ubrowserOperationConfigs,
  defaultUBrowserConfigs,
} from "./ubrowserConfig";

import { commandCategories as categories } from "./commands";

// 从commandCategories中提取所有命令
export const availableCommands = categories.reduce((commands, category) => {
  return commands.concat(
    category.commands.map((cmd) => ({
      type: category.label,
      ...cmd,
    }))
  );
}, []);

export const findCommandByValue = (value) => {
  return availableCommands.find(
    (cmd) =>
      cmd.value === value ||
      cmd.subCommands?.find((subCmd) => subCmd.value === value)
  );
};

export const commandCategories = categories;
