const speech = require("./speech");
const media = require("./media");
const record = require("./record");

module.exports = {
  speech,
  media,
  ...record,
};
