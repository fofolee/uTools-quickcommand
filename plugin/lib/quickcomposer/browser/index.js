const browser = require("./browser");
const getSelector = require("./getSelector");
const execScript = require("./execScript");

module.exports = {
  ...browser,
  ...getSelector,
  ...execScript,
};
