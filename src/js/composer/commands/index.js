import { fileCommands } from "./fileCommands";
import { networkCommands } from "./networkCommands";
import { systemCommands } from "./systemCommands";
import { notifyCommands } from "./notifyCommands";
import { encodeCommands } from "./encodeCommands";
import { otherCommands } from "./otherCommands";
import { keyCommands } from "./keyCommands";

export const commandCategories = [
  fileCommands,
  networkCommands,
  systemCommands,
  notifyCommands,
  encodeCommands,
  otherCommands,
  keyCommands,
];
