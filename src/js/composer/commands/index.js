import { fileCommands } from "./fileCommands";
import { networkCommands } from "./networkCommands";
import { systemCommands } from "./systemCommands";
import { notifyCommands } from "./notifyCommands";
import { dataCommands } from "./dataCommands";
import { otherCommands } from "./otherCommands";
import { simulateCommands } from "./simulateCommands";
import { controlCommands } from "./controlCommands";
import { uiCommands } from "./uiCommands";
import { codingCommands } from "./codingCommand";
import { mathCommands } from "./mathCommands";
import { userdataCommands } from "./userdataCommands";
import { utoolsCommands } from "./utoolsCommand";
import { screenCommands } from "./screenCommands";
import { audioCommands } from "./audioCommands";
import { imageCommands } from "./imageCommands";
import { windowsCommands } from "./windowsCommands";
import { statusCommands } from "./statusCommands";
import { macosCommands } from "./macosCommands";
import { scriptCommands } from "./scriptCommands";
let commands = [
  fileCommands,
  networkCommands,
  systemCommands,
  statusCommands,
  audioCommands,
  imageCommands,
  notifyCommands,
  utoolsCommands,
  dataCommands,
  codingCommands,
  controlCommands,
  scriptCommands,
  uiCommands,
  simulateCommands,
  mathCommands,
  userdataCommands,
  screenCommands,
];

if (window.utools.isWindows()) {
  commands.push(windowsCommands);
}

if (window.utools.isMacOS()) {
  commands.push(macosCommands);
}

commands.push(otherCommands);

export const commandCategories = commands;
