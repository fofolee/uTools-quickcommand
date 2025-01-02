import { fileCommands } from "./fileCommands";
import { networkCommands } from "./networkCommands";
import { systemCommands } from "./systemCommands";
import { notifyCommands } from "./notifyCommands";
import { textProcessingCommands } from "./textProcessingCommands";
import { otherCommands } from "./otherCommands";
import { simulateCommands } from "./simulateCommands";
import { controlCommands } from "./controlCommands";

export const commandCategories = [
  fileCommands,
  networkCommands,
  systemCommands,
  notifyCommands,
  textProcessingCommands,
  controlCommands,
  otherCommands,
  simulateCommands,
];
