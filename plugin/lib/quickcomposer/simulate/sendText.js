const sendText = (text, simulateCopy = false) => {
  if (simulateCopy) {
    window.utools.copyText(text);
    quickcommand.sleep(200);
    quickcommand.simulatePaste();
  } else {
    window.utools.hideMainWindowTypeString(text);
  }
};

module.exports = sendText;
