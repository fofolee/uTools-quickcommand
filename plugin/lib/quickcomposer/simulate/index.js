const { findImage } = require("./imageFinder");
const { captureScreen } = require("./screenCapture");
const sendText = require("./sendText");
const { keyboardTap, keySequence } = require("./keyboardTap");

module.exports = {
  findImage,
  captureScreen,
  sendText,
  keyboardTap,
  keySequence,
};
