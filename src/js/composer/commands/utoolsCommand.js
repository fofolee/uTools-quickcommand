import { newVarInputVal } from "js/composer/varInputValManager";

export const utoolsCommands = {
  label: "uTools功能",
  icon: "insights",
  commands: [
    {
      value: "utools.hideMainWindow",
      label: "隐藏主窗口",
      icon: "visibility_off",
      outputs: {
        label: "是否隐藏成功",
        typeName: "布尔值",
        suggestName: "isHideMainWindowSuccess",
      },
    },
    {
      value: "quickcommand.wakeUtools",
      label: "唤醒uTools",
      neverHasOutput: true,
      icon: "visibility",
    },
    {
      value: "utools.setExpendHeight",
      label: "设置uTools高度",
      neverHasOutput: true,
      icon: "height",
      config: [
        {
          label: "高度",
          component: "VariableInput",
          disableToggleType: true,
          defaultValue: newVarInputVal("var", "100"),
          icon: "straighten",
          width: 12,
        },
      ],
    },
    {
      value: "utools.outPlugin",
      label: "退出插件",
      neverHasOutput: true,
      icon: "exit_to_app",
      config: [
        {
          component: "QSelect",
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
      icon: "dark_mode",
      outputs: {
        label: "是否深色模式",
        suggestName: "isDarkColors",
        typeName: "布尔值",
      },
    },
    {
      value: "utools.getUser",
      label: "获取用户信息",
      icon: "person",
      outputs: {
        label: "用户信息",
        suggestName: "userInfo",
        structure: {
          avatar: { label: "头像", suggestName: "userAvatar" },
          nickname: { label: "昵称", suggestName: "userNickname" },
          type: { label: "类型", suggestName: "userType" },
        },
      },
    },
    {
      value: "utools.redirect",
      label: "转至指定插件",
      neverHasOutput: true,
      config: [
        {
          label: "要跳转至的插件名称",
          component: "VariableInput",
          icon: "alt_route",
          width: 6,
        },
        {
          label: "传递给插件的文本",
          component: "VariableInput",
          icon: "alt_route",
          width: 6,
        },
      ],
    },
    {
      value: "utools.findInPage",
      label: "插件内查找",
      neverHasOutput: true,
      icon: "search",
      subCommands: [
        {
          value: "utools.findInPage",
          label: "查找文本",
          icon: "search",
          config: [
            {
              label: "文本",
              component: "VariableInput",
              icon: "search",
              width: 12,
            },
            {
              label: "选项",
              component: "OptionEditor",
              icon: "settings",
              options: {
                forward: {
                  label: "向前查找",
                  icon: "arrow_right",
                  width: 2.4,
                  component: "CheckButton",
                },
                findNext: {
                  label: "查找下一个",
                  icon: "arrow_down",
                  width: 2.4,
                  component: "CheckButton",
                },
                matchCase: {
                  label: "区分大小写",
                  icon: "arrow_up",
                  width: 2.4,
                  component: "CheckButton",
                },
                wordStart: {
                  label: "单词开头",
                  icon: "arrow_right",
                  width: 2.4,
                  component: "CheckButton",
                },
                medialCapitalAsWordStart: {
                  label: "中缀大写开头",
                  icon: "arrow_right",
                  width: 2.4,
                  component: "CheckButton",
                },
              },
              defaultValue: {
                forward: true,
                findNext: false,
                matchCase: false,
                wordStart: false,
                medialCapitalAsWordStart: false,
              },
              width: 12,
            },
          ],
        },
        {
          value: "utools.stopFindInPage",
          label: "停止查找",
          neverHasOutput: true,
          icon: "stop",
          config: [
            {
              label: "动作",
              component: "ButtonGroup",
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
      icon: "window",
      outputs: {
        label: "窗口类型",
        suggestName: "windowType",
        typeName: "字符串",
      },
    },
    {
      value: "utools.getNativeId",
      label: "获取本地ID",
      outputs: {
        label: "本地ID",
        suggestName: "nativeId",
        typeName: "字符串",
      },
    },
    {
      value: "utools.getAppVersion",
      label: "获取uTools版本",
      outputs: {
        label: "uTools版本",
        suggestName: "appVersion",
        typeName: "字符串",
      },
    },
  ],
};
