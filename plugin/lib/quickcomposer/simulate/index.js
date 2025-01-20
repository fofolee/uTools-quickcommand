const { findImage } = require("./imageFinder");
const { keyboardTap, keySequence } = require("./keyboardTap");
const { screenColorPick } = require("./screenColorPick");
const screenCapture = require("./screenCapture");
const mouseClick = require("./mouseClick");

module.exports = {
  findImage,
  screenCapture,
  keyboardTap,
  keySequence,
  screenColorPick,
  mouseClick,
  ...screenCapture,
};
