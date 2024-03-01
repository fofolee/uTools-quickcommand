const changeLog = [
  {
    version: "4.1.2",
    log: `一、功能调整、新增
① 现在会自动对特殊变量里的单、双、反引号、反斜杠、换行符等特殊符号进行转义。这意味用户不再需要手动处理这些特殊情况，比如在js中使用反引号(\`)或者在 python中 使用三引号(''')来解决换行的问题。
<b style="color: #e60012">【 ! ! ! 】</b>需要注意，如果之前在js中使用了 String.raw 或者在 python 中使用了 r 来对反斜杠进行处理的话，现在需要去掉这些符号，比如之前是 String.raw\`{{input}}\`,现在则需要改回 "{{input}}"
② 添加 quickcommand.runAppleScript 和 quickcommand.runPowerShell 两个方法
③ quickcommand.showConfirmBox 现在支持渲染html以及设置宽度
④ Mac下环境变量顺序调整为 /opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/local/sbin:$PATH
二、BUG 修复
① 修复某些情况下调整页面大小报错的 BUG
② 修复非 quickcommand 环境自动补全重复出现的 BUG
③ 修复 alt+z 无法换行的 BUG
④ 更新内置命令-网址二维码中 qrcode 的引用地址`,
  },
];

export default changeLog;
