const runUbrowser = (path) => {
  window.utools.ubrowser
    .goto(path)
    .css(
      `
        .ant-modal-content,
        .ant-modal-mask,
        [class*='index-module_contentWrapper'],
        [class*='index-module_reward'],
        [class*='ReaderLayout-module_asideWrapper'],
        [class*='CornerBubble-module_cornerBubble'],
        [class*='DocReader-module_comment'],
        #header,
        #footer {
          display: none
        }`
    )
    .run({
      width: 980,
      height: 750,
    });
};

const docsRepoUrl = "https://www.yuque.com/fofolee/qcdocs3";

const showUb = {
  help: function (path = "") {
    runUbrowser(docsRepoUrl + "/bg31vl" + path);
  },
  docs: function (path = "") {
    runUbrowser(docsRepoUrl + "/pt589p" + path);
  },
  changelog: function (path = "") {
    runUbrowser(docsRepoUrl + "/ucnd2o" + path);
  },
};

module.exports = showUb;
