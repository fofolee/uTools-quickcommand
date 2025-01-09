const showSaveDialog = (
  title,
  defaultPath,
  buttonLabel,
  message,
  extensions,
  properties
) => {
  return window.utools.showSaveDialog({
    title,
    defaultPath,
    buttonLabel,
    message,
    properties,
    filters: [
      {
        name: "文件",
        extensions,
      },
    ],
  });
};

const showOpenDialog = (
  title,
  defaultPath,
  buttonLabel,
  message,
  extensions,
  properties
) => {
  return window.utools.showOpenDialog({
    title,
    defaultPath,
    buttonLabel,
    message,
    properties,
    filters: [
      {
        name: "文件",
        extensions,
      },
    ],
  });
};

module.exports = {
  showSaveDialog,
  showOpenDialog,
};
