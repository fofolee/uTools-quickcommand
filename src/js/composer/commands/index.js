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

const platformCommands = {
  win32: [windowsCommands],
  darwin: [macosCommands],
  linux: [],
};

export const commandCategories = [
  fileCommands,
  networkCommands,
  systemCommands,
  audioCommands,
  imageCommands,
  utoolsCommands,
  ...platformCommands[window.processPlatform],
  dataCommands,
  codingCommands,
  controlCommands,
  scriptCommands,
  uiCommands,
  simulateCommands,
  statusCommands,
  mathCommands,
  userdataCommands,
  screenCommands,
  notifyCommands,
  otherCommands,
];
