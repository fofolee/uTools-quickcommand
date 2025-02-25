const get = (value) => {
  return typeof value;
};

const check = (value, type) => {
  return typeof value === type;
};

module.exports = {
  get,
  check,
};
