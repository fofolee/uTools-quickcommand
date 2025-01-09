const { findImage } = require("./imageFinder");
const { keyboardTap, keySequence } = require("./keyboardTap");
const { screenColorPick } = require("./screenColorPick");
const screenCapture = require("./screenCapture");

module.exports = {
  findImage,
  screenCapture,
  keyboardTap,
  keySequence,
  screenColorPick,
  ...screenCapture,
};
