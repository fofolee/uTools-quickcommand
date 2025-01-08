const string = require("./string");
const buffer = require("./buffer");
const zlib = require("./zlib");
const htmlParser = require("./htmlParser");

module.exports = {
  ...string,
  ...htmlParser,
  buffer,
  zlib,
};
