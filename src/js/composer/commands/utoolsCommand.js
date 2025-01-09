import { newVarInputVal } from "js/composer/varInputValManager";

export const utoolsCommands = {
  label: "uTools功能",
  icon: "insights",
  commands: [
    {
      value: "utools.hideMainWindow",
      label: "隐藏主窗口",
      desc: "隐藏主窗口",
      icon: "visibility_off",
    },
    {
      value: "quickcommand.wakeUtools",
      label: "唤醒uTools",
      desc: "唤醒uTools",
      icon: "visibility",
    },
    {
      value: "utools.setExpendHeight",
      label: "设置uTools高度",
      desc: "设置uTools高度",
      icon: "height",
      config: [
        {
          key: "height",
          label: "高度",
          type: "numInput",
          icon: "straighten",
          width: 12,
        },
      ],
    },
    {
      value: "utools.outPlugin",
      label: "退出插件",
      desc: "退出插件",
      icon: "exit_to_app",
      config: [
        {
          key: "isKill",
          type: "select",
          options: [
            { label: "杀死插件进程", value: true },
            { label: "插件隐藏到后台", value: false },
          ],
          defaultValue: false,
          icon: "logout",
        },
      ],
    },
    {
      value: "utools.isDarkColors",
      label: "是否深色模式",
      desc: "是否深色模式",
      icon: "dark_mode",
      outputVariable: "isDark",
      saveOutput: true,
    },
    {
      value: "utools.getUser",
      label: "获取用户信息",
      desc: "获取用户信息",
      icon: "person",
      outputVariable: "{avatar,nickname,type}",
      saveOutput: true,
    },
    {
      value: "utools.redirect",
      label: "转至指定插件",
      config: [
        {
          key: "pluginName",
          label: "要跳转至的插件名称",
          type: "varInput",
          icon: "alt_route",
          width: 6,
        },
        {
          key: "payload",
          label: "传递给插件的文本",
          type: "varInput",
          icon: "alt_route",
          width: 6,
        },
      ],
    },
    {
      value: "utools.findInPage",
      label: "插件内查找",
      desc: "插件内查找",
      icon: "search",
      subCommands: [
        {
          value: "utools.findInPage",
          label: "查找文本",
          desc: "查找文本",
          icon: "search",
          config: [
            {
              key: "text",
              label: "文本",
              type: "varInput",
              icon: "search",
              width: 12,
            },
            {
              key: "options",
              label: "选项",
              type: "dictEditor",
              icon: "settings",
              options: {
                disableAdd: true,
                fixedKeys: [
                  {
                    value: "forward",
                    label: "向前查找",
                  },
                  {
                    value: "findNext",
                    label: "查找下一个",
                  },
                  {
                    value: "matchCase",
                    label: "区分大小写",
                  },
                  {
                    value: "wordStart",
                    label: "单词开头",
                  },
                  {
                    value: "medialCapitalAsWordStart",
                    label: "中缀大写作为单词开头",
                  },
                ],
              },
              defaultValue: {
                forward: newVarInputVal("var", "true"),
                findNext: newVarInputVal("var", "false"),
                matchCase: newVarInputVal("var", "false"),
                wordStart: newVarInputVal("var", "false"),
                medialCapitalAsWordStart: newVarInputVal("var", "false"),
              },
              width: 12,
            },
          ],
        },
        {
          value: "utools.stopFindInPage",
          label: "停止查找",
          desc: "停止查找",
          icon: "stop",
          config: [
            {
              key: "action",
              label: "动作",
              type: "buttonGroup",
              icon: "settings",
              width: 12,
              options: [
                { label: "清除选择", value: "clearSelection" },
                { label: "保持选择", value: "keepSelection" },
                { label: "激活选择", value: "activateSelection" },
              ],
              defaultValue: "clearSelection",
            },
          ],
        },
      ],
    },
    {
      value: "utools.getWindowType",
      label: "获取当前窗口类型",
      desc: "获取当前窗口类型",
      icon: "window",
      outputVariable: "windowType",
      saveOutput: true,
    },
  ],
};
