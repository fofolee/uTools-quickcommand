const browser = require("./browser");
const tabs = require("./tabs");
const getSelector = require("./getSelector");
const script = require("./script");

module.exports = {
  ...browser,
  ...getSelector,
  ...tabs,
  ...script,
};
