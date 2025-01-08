const htmlParser = (html, selector = "", attr = "") => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  if (!selector) return doc;
  const elements = doc.querySelectorAll(selector);
  if (!attr) return elements;
  let result = Array.from(elements).map((element) => element[attr]);
  if (result.length === 1) return result[0];
  return result;
};

module.exports = {
  htmlParser,
};
