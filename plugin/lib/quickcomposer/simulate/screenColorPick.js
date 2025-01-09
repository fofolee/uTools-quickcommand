const screenColorPick = () => {
  return new Promise((resolve) => {
    utools.screenColorPick((color) => {
      resolve(color);
    });
  });
};

module.exports = {
  screenColorPick,
};
