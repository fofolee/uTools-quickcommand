const regexTransform = (text, regex, replacement) => {
  if (replacement) {
    return text.replace(regex, replacement);
  } else {
    return text.match(regex);
  }
};

module.exports = { regexTransform };
