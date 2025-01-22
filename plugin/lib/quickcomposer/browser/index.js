const browser = require("./browser");
const getSelector = require("./getSelector");

module.exports = {
  ...browser,
  ...getSelector,
};
