import { newVarInputVal } from "js/composer/varInputValManager";

export const macosCommands = {
  label: "Mac自动化",
  icon: "laptop_mac",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.macos.app.getFrontmost",
      label: "应用及窗口控制",
      icon: "apps",
      isAsync: true,
      subCommands: [
        {
          value: "quickcomposer.macos.app.getFrontmost",
          label: "获取前台应用",
          icon: "front_hand",
        },
        {
          value: "quickcomposer.macos.app.getRunningApps",
          label: "获取活动应用",
          icon: "list",
        },
        {
          value: "quickcomposer.macos.app.launch",
          label: "启动应用",
          icon: "launch",
          config: [
            {
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
          icon: "close",
          config: [
            {
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
          icon: "visibility_off",
          config: [
            {
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
          icon: "visibility",
          config: [
            {
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
          icon: "minimize",
          config: [
            {
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
          icon: "maximize",
          config: [
            {
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
          icon: "window",
          config: [
            {
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
          icon: "code",
          config: [
            {
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
      icon: "settings",
      isAsync: true,
      subCommands: [
        {
          value: "quickcomposer.macos.system.setVolume",
          label: "系统音量",
          icon: "volume_up",
          config: [
            {
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
          icon: "lock",
        },
        {
          value: "quickcomposer.macos.system.sleep",
          label: "进入睡眠",
          icon: "bedtime",
        },
        {
          value: "quickcomposer.macos.system.setDockPosition",
          label: "设置Dock位置",
          icon: "dock",
          config: [
            {
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
          icon: "dock",
          config: [
            {
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
          icon: "dock",
          config: [
            {
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
          icon: "menu",
          config: [
            {
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
          icon: "dark_mode",
          config: [
            {
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
          icon: "window",
        },
        {
          value: "quickcomposer.macos.finder.activateWindow",
          label: "激活窗口",
          icon: "open_in_new",
          config: [
            {
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
      label: "浏览器控制",
      icon: "web",
      isAsync: true,
      subCommands: [
        {
          value: "quickcomposer.macos.browser.getUrl",
          label: "获取当前地址",
          icon: "link",
          config: [
            {
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
          icon: "link",
          config: [
            {
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
          icon: "tab",
          config: [
            {
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
          icon: "tab_unselected",
          config: [
            {
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
          icon: "code",
          config: [
            {
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
              label: "脚本内容",
              component: "CodeEditor",
              icon: "code",
              width: 12,
              placeholder: "输入JavaScript代码",
            },
            {
              topLabel: "要传递的参数",
              component: "DictEditor",
              icon: "data_array",
              width: 12,
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.clickElement",
          label: "点击元素",
          icon: "mouse",
          config: [
            {
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
          icon: "edit",
          config: [
            {
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
              label: "选择器",
              component: "VariableInput",
              icon: "code",
              width: 12,
              placeholder: "输入CSS选择器",
            },
            {
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
          icon: "text_fields",
          config: [
            {
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
          icon: "visibility_off",
          config: [
            {
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
          icon: "visibility",
          config: [
            {
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
          icon: "style",
          config: [
            {
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
          icon: "cookie",
          config: [
            {
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
              component: "OptionEditor",
              icon: "settings",
              width: 12,
              options: {
                expires: {
                  label: "过期时间",
                  component: "q-select",
                  icon: "timer",
                  width: 6,
                  options: [
                    { label: "关闭浏览器失效", value: false },
                    { label: "1小时", value: 1 },
                    { label: "1天", value: 24 },
                    { label: "1年", value: 24 * 365 },
                  ],
                },
                path: {
                  label: "路径",
                  component: "VariableInput",
                  icon: "folder",
                  width: 6,
                },
                domain: {
                  label: "域名",
                  component: "VariableInput",
                  icon: "domain",
                  width: 6,
                },
                secure: {
                  label: "安全",
                  component: "CheckButton",
                  icon: "lock",
                  width: 6,
                },
              },
              defaultValue: {
                expires: false,
                path: newVarInputVal("str", "/"),
                domain: newVarInputVal("str", ""),
                secure: false,
              },
            },
          ],
        },
        {
          value: "quickcomposer.macos.browser.getCookie",
          label: "获取Cookie",
          icon: "cookie",
          config: [
            {
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
          icon: "open_in_full",
          config: [
            {
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
              label: "X坐标",
              component: "NumberInput",
              icon: "arrow_right",
              width: 12,
              defaultValue: 0,
            },
            {
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
          icon: "open_in_full",
          config: [
            {
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
          icon: "hourglass_empty",
          config: [
            {
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
              label: "选择器",
              component: "VariableInput",
              icon: "code",
              width: 12,
              placeholder: "输入CSS选择器",
            },
            {
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
      ],
    },
  ],
};
