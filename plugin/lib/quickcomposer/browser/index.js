const getSelector = require("./getSelector");
const execScript = require("./execScript");
const browserManager = require("./client");
const tabs = require("./tabs");
const url = require("./url");
const cookie = require("./cookie");
const screenshot = require("./screenshot");

module.exports = {
  ...url,
  ...tabs,
  ...getSelector,
  ...execScript,
  ...browserManager,
  ...cookie,
  ...screenshot,
};
