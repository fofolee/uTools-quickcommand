import { newVarInputVal } from "js/composer/varInputValManager";

export const macosCommands = {
  label: "MacOS专区",
  icon: "laptop_mac",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.macos.app.getFrontmost",
      label: "应用管理",
      desc: "应用程序管理功能",
      icon: "apps",
      isAsync: true,
      subCommands: [
        {
          value: "quickcomposer.macos.app.getFrontmost",
          label: "获取前台应用",
          desc: "获取当前前台运行的应用信息",
          icon: "front_hand",
        },
        {
          value: "quickcomposer.macos.app.getRunningApps",
          label: "获取活动应用",
          desc: "获取所有正在运行的应用列表",
          icon: "list",
        },
        {
          value: "quickcomposer.macos.app.launch",
          label: "启动应用",
          desc: "启动指定的应用程序",
          icon: "launch",
          config: [
            {
              key: "appName",
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称",
            },
          ],
        },
        {
          value: "quickcomposer.macos.app.quit",
          label: "退出应用",
          desc: "退出指定的应用程序",
          icon: "close",
          config: [
            {
              key: "appName",
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称",
            },
          ],
        },
        {
          value: "quickcomposer.macos.app.hide",
          label: "隐藏应用",
          desc: "隐藏指定的应用程序",
          icon: "visibility_off",
          config: [
            {
              key: "appName",
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称",
            },
          ],
        },
        {
          value: "quickcomposer.macos.app.show",
          label: "显示应用",
          desc: "显示指定的应用程序",
          icon: "visibility",
          config: [
            {
              key: "appName",
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称",
            },
          ],
        },
        {
          value: "quickcomposer.macos.app.minimize",
          label: "最小化窗口",
          desc: "最小化指定应用的窗口",
          icon: "minimize",
          config: [
            {
              key: "appName",
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称",
            },
          ],
        },
        {
          value: "quickcomposer.macos.app.maximize",
          label: "最大化窗口",
          desc: "最大化指定应用的窗口",
          icon: "maximize",
          config: [
            {
              key: "appName",
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称",
            },
          ],
        },
        {
          value: "quickcomposer.macos.app.getWindows",
          label: "获取窗口信息",
          desc: "获取指定应用的所有窗口信息",
          icon: "window",
          config: [
            {
              key: "appName",
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称",
            },
          ],
        },
        {
          value: "quickcomposer.macos.app.getScriptDictionary",
          label: "获取应用脚本字典",
          desc: "获取应用程序的AppleScript字典内容",
          icon: "code",
          config: [
            {
              key: "appName",
              label: "应用名称",
              component: "VariableInput",
              icon: "apps",
              width: 12,
              placeholder: "输入应用名称",
            },
          ],
        },
      ],
    },
    {
      value: "quickcomposer.macos.system.setVolume",
      label: "系统管理",
      desc: "系统级别的控制功能",
      icon: "settings",
      isAsync: true,
      subCommands: [
        {
          value: "quickcomposer.macos.system.setVolume",
          label: "系统音量",
          desc: "调整系统音量",
          icon: "volume_up",
          config: [
            {
              key: "volume",
              label: "音量",
              component: "NumberInput",
              icon: "volume_up",
              min: 0,
              max: 100,
              step: 10,
              defaultValue: 50,
              width: 12,
            },
          ],
        },
        {
          value: "quickcomposer.macos.system.lockScreen",
          label: "锁定屏幕",
          desc: "锁定系统屏幕",
          icon: "lock",
        },
        {
          value: "quickcomposer.macos.system.sleep",
          label: "进入睡眠",
          desc: "使系统进入睡眠状态",
          icon: "bedtime",
        },
        {
          value: "quickcomposer.macos.system.setDockPosition",
          label: "设置Dock位置",
          desc: "设置Dock栏的显示位置",
          icon: "dock",
          config: [
            {
              key: "position",
              label: "位置",
              component: "ButtonGroup",
              defaultValue: "bottom",
              width: 12,
              options: [
                {
                  label: "底部",
                  value: "bottom",
                },
                {
                  label: "左侧",
                  value: "left",
                },
                {
                  label: "右侧",
                  value: "right",
                },
              ],
            },
          ],
        },
        {
          value: "quickcomposer.macos.system.setDockSize",
          label: "设置Dock大小",
          desc: "设置Dock栏的图标大小",
          icon: "dock",
          config: [
            {
              key: "size",
              label: "大小",
              component: "NumberInput",
              icon: "dock",
              min: 16,
              max: 128,
              defaultValue: 48,
              width: 12,
            },
          ],
        },
        {
          value: "quickcomposer.macos.system.toggleDockAutohide",
          label: "Dock自动隐藏",
          desc: "设置Dock栏是否自动隐藏",
          icon: "dock",
          config: [
            {
              key: "enabled",
              label: "启用",
              component: "CheckButton",
              defaultValue: false,
              icon: "dock",
              width: 12,
            },
          ],
        },
        {
          value: "quickcomposer.macos.system.toggleMenuBarAutohide",
          label: "菜单栏自动隐藏",
          desc: "设置菜单栏是否自动隐藏",
          icon: "menu",
          config: [
            {
              key: "enabled",
              label: "启用",
              component: "CheckButton",
              defaultValue: false,
              icon: "menu",
              width: 12,
            },
          ],
        },
        {
          value: "quickcomposer.macos.system.toggleDarkMode",
          label: "深色模式",
          desc: "切换系统深色模式",
          icon: "dark_mode",
          config: [
            {
              key: "enabled",
              label: "启用",
              component: "CheckButton",
              defaultValue: true,
              icon: "dark_mode",
              width: 12,
            },
          ],
        },
      ],
    },
    {
      value: "quickcomposer.macos.finder.getSelection",
      label: "访达管理",
      desc: "访达操作和文件管理功能",
      icon: "folder",
      isAsync: true,
      subCommands: [
        {
          value: "quickcomposer.macos.finder.getSelection",
          label: "获取选中项",
          icon: "select_all",
        },
        {
          value: "quickcomposer.macos.finder.getCurrentFolder",
          label: "获取打开的路径",
          icon: "folder_open",
        },
        {
          value: "quickcomposer.macos.finder.setShowHiddenFiles",
          label: "显示隐藏文件",
          icon: "visibility",
          config: [
            {
              key: "show",
              label: "显示",
              component: "CheckButton",
              width: 12,
              defaultValue: false,
            },
          ],
        },
        {
          value: "quickcomposer.macos.finder.getWindows",
          label: "获取窗口列表",
          desc: "获取所有访达窗口信息",
          icon: "window",
        },
        {
          value: "quickcomposer.macos.finder.activateWindow",
          label: "激活窗口",
          desc: "激活指定的访达窗口",
          icon: "open_in_new",
          config: [
            {
              key: "index",
              label: "窗口索引",
              component: "NumberInput",
              icon: "window",
              min: 1,
              defaultValue: 1,
              width: 12,
            },
          ],
        },
      ],
    },
    {
      value: "quickcomposer.macos.browser.getUrl",
      label: "浏览器管理",
      desc: "浏览器管理功能",
      icon: "web",
      isAsync: true,
      subCommands: [
        {
          value: "quickcomposer.macos.browser.getUrl",
          label: "获取当前地址",
          desc: "获取当前标签页的URL地址",
          icon: "link",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.setUrl",
          label: "设置当前地址",
          desc: "设置当前标签页的URL地址",
          icon: "link",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
            {
              key: "url",
              label: "网址",
              component: "VariableInput",
              icon: "link",
              width: 12,
              placeholder: "输入网址",
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.getTabs",
          label: "获取标签列表",
          desc: "获取所有打开的标签页信息",
          icon: "tab",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.activateTab",
          label: "切换标签",
          desc: "切换到指定的标签页",
          icon: "tab_unselected",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
            {
              key: "index",
              label: "标签索引",
              component: "NumberInput",
              icon: "tab",
              min: 1,
              defaultValue: 1,
              width: 12,
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.executeScript",
          label: "执行脚本",
          desc: "在当前标签页执行JavaScript脚本",
          icon: "code",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
            {
              key: "script",
              label: "脚本内容",
              component: "CodeEditor",
              icon: "code",
              width: 12,
              placeholder: "输入JavaScript代码",
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.clickElement",
          label: "点击元素",
          desc: "点击指定的页面元素",
          icon: "mouse",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
            {
              key: "selector",
              label: "选择器",
              component: "VariableInput",
              icon: "code",
              width: 12,
              placeholder: "输入CSS选择器",
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.inputText",
          label: "输入文本",
          desc: "在指定输入框中输入文本",
          icon: "edit",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
            {
              key: "selector",
              label: "选择器",
              component: "VariableInput",
              icon: "code",
              width: 12,
              placeholder: "输入CSS选择器",
            },
            {
              key: "text",
              label: "文本内容",
              component: "VariableInput",
              icon: "edit",
              width: 12,
              placeholder: "输入要填写的文本",
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.getText",
          label: "获取文本",
          desc: "获取指定元素的文本内容",
          icon: "text_fields",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
            {
              key: "selector",
              label: "选择器",
              component: "VariableInput",
              icon: "code",
              width: 12,
              placeholder: "输入CSS选择器",
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.hideElement",
          label: "隐藏元素",
          desc: "隐藏指定的页面元素",
          icon: "visibility_off",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
            {
              key: "selector",
              label: "选择器",
              component: "VariableInput",
              icon: "code",
              width: 12,
              placeholder: "输入CSS选择器",
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.showElement",
          label: "显示元素",
          desc: "显示指定的页面元素",
          icon: "visibility",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
            {
              key: "selector",
              label: "选择器",
              component: "VariableInput",
              icon: "code",
              width: 12,
              placeholder: "输入CSS选择器",
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.injectCSS",
          label: "注入CSS",
          desc: "向页面注入CSS样式",
          icon: "style",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
            {
              key: "css",
              label: "CSS内容",
              component: "CodeEditor",
              icon: "style",
              width: 12,
              placeholder: "输入CSS代码",
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.setCookie",
          label: "设置Cookie",
          desc: "设置浏览器Cookie",
          icon: "cookie",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
            {
              label: "Cookie",
              component: "ArrayEditor",
              icon: "cookie",
              width: 12,
              columns: {
                name: {
                  label: "名称",
                  defaultValue: newVarInputVal("str"),
                },
                value: {
                  label: "值",
                  defaultValue: newVarInputVal("str"),
                },
              },
            },
            {
              label: "选项",
              component: "DictEditor",
              icon: "settings",
              width: 12,
              options: {
                optionKeys: ["expires", "path", "domain", "secure", "sameSite"],
              },
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.getCookie",
          label: "获取Cookie",
          desc: "获取指定的Cookie值",
          icon: "cookie",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
            {
              key: "name",
              label: "名称",
              component: "VariableInput",
              icon: "label",
              width: 12,
              placeholder: "输入Cookie名称",
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.scrollTo",
          label: "滚动到位置",
          desc: "滚动到指定坐标位置",
          icon: "open_in_full",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
            {
              key: "x",
              label: "X坐标",
              component: "NumberInput",
              icon: "arrow_right",
              width: 12,
              defaultValue: 0,
            },
            {
              key: "y",
              label: "Y坐标",
              component: "NumberInput",
              icon: "arrow_drop_down",
              width: 12,
              defaultValue: 0,
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.scrollToElement",
          label: "滚动到元素",
          desc: "滚动到指定元素位置",
          icon: "open_in_full",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
            {
              key: "selector",
              label: "选择器",
              component: "VariableInput",
              icon: "code",
              width: 12,
              placeholder: "输入CSS选择器",
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.waitForElement",
          label: "等待元素",
          desc: "等待指定元素出现",
          icon: "hourglass_empty",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
            {
              key: "selector",
              label: "选择器",
              component: "VariableInput",
              icon: "code",
              width: 12,
              placeholder: "输入CSS选择器",
            },
            {
              key: "timeout",
              label: "超时时间",
              component: "NumberInput",
              icon: "timer",
              width: 12,
              defaultValue: 5000,
              min: 1000,
              step: 1000,
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.observeElement",
          label: "监听元素",
          desc: "监听指定元素的变化",
          icon: "visibility",
          config: [
            {
              key: "browser",
              component: "ButtonGroup",
              defaultValue: "Microsoft Edge",
              options: [
                {
                  label: "Edge 浏览器",
                  value: "Microsoft Edge",
                },
                {
                  label: "Chrome 浏览器",
                  value: "Google Chrome",
                },
              ],
              width: 12,
            },
            {
              key: "selector",
              label: "选择器",
              component: "VariableInput",
              icon: "code",
              width: 12,
              placeholder: "输入CSS选择器",
            },
            {
              key: "callback",
              label: "回调函数",
              component: "CodeEditor",
              icon: "code",
              width: 12,
              placeholder: "输入回调函数代码",
            },
          ],
        },
      ],
    },
  ],
};
