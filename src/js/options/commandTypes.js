/**
 * 所有的匹配类型
 */
export default {
  key: {
    name: "key",
    label: "关键词",
    icon: "font_download",
    color: "blue",
    desc: "直接在主输入框输入对应关键字，最通用的一种模式，关键字可以设置多个",
  },
  regex: {
    name: "regex",
    label: "正则",
    icon: "rule",
    color: "cyan",
    desc: "匹配主输入框或超级面板选中的文本，可以获取输入框文本或选中文本作为变量",
    tempPayload: async () => {
      let [payload] = await quickcommand.showInputBox(["需要处理的文本"]);
      return payload;
    },
  },
  over: {
    name: "over",
    label: "所有文本",
    icon: "emergency",
    color: "light-green",
    desc: "匹配主输入框的所有文本，但只有在该文本未设置对应的插件或功能时才生效",
    tempPayload: async () => {
      let [payload] = await quickcommand.showInputBox(["需要处理的文本"]);
      return payload;
    },
  },
  window: {
    name: "window",
    label: "窗口",
    icon: "widgets",
    color: "indigo",
    desc: "匹配呼出uTools前或唤出超级面板时的活动窗口，可以获取窗口的信息或文件夹路径作为变量",
  },
  img: {
    name: "img",
    label: "图片",
    icon: "panorama",
    color: "deep-orange",
    desc: "匹配剪贴板的图片，并返回图片的 DataUrl",
    tempPayload: () =>
      window.resolveFileToBase64(
        utools.showOpenDialog({
          title: "需要处理的图片",
          filters: [
            {
              name: "Images",
              extensions: ["png", "jpg", "jpeg", "bmp", "gif"],
            },
          ],
        })[0]
      ),
  },
  files: {
    name: "files",
    label: "文件",
    icon: "description",
    color: "light-blue",
    desc: "匹配主输入框或超级面板选中的文件，可以获取复制及选中的文件信息作为变量",
    tempPayload: () =>
      window.convertFilePathToUtoolsPayload(
        utools.showOpenDialog({
          title: "需要处理的文件",
          properties: ["openFile", "multiSelections"],
        })
      ),
  },
};
