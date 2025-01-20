const mouseClick = (mouseAction = "Click", options) => {
  const { x, y, count = 1, interval = 0 } = options;
  let mouseActionFn = () => {};
  if (x !== undefined && y !== undefined) {
    mouseActionFn = () => utools["simulateMouse" + mouseAction](x, y);
  } else {
    mouseActionFn = () => utools["simulateMouse" + mouseAction]();
  }
  
  for (let i = 0; i < count; i++) {
    mouseActionFn();
    if (interval > 0 && i < count - 1) {
      quickcommand.sleep(interval);
    }
  }
};

module.exports = mouseClick;
