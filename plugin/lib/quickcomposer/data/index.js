const string = require("./string");
const buffer = require("./buffer");
const zlib = require("./zlib");
const { htmlParser } = require("./htmlParser");
const array = require("./array");
const object = require("./object");
const type = require("./type");
const time = require("./time");
const { regexTransform } = require("./regexTransform");

module.exports = {
  htmlParser,
  string,
  buffer,
  zlib,
  array,
  object,
  time,
  type,
  regexTransform,
};
