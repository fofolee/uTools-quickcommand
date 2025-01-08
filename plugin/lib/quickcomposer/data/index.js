const string = require("./string");
const buffer = require("./buffer");
const zlib = require("./zlib");

module.exports = {
  ...string,
  buffer,
  zlib,
};
