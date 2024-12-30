import { fileCommands } from "./fileCommands";
import { networkCommands } from "./networkCommands";
import { systemCommands } from "./systemCommands";
import { notifyCommands } from "./notifyCommands";
import { textProcessingCommands } from "./textProcessingCommands";
import { otherCommands } from "./otherCommands";
import { keyCommands } from "./keyCommands";

export const commandCategories = [
  fileCommands,
  networkCommands,
  systemCommands,
  notifyCommands,
  textProcessingCommands,
  otherCommands,
  keyCommands,
];
