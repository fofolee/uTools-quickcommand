import { newVarInputVal } from "js/composer/varInputValManager";

const tabConfig = {
  component: "OptionEditor",
  width: 12,
  options: {
    by: {
      component: "QSelect",
      label: "标签",
      width: 3,
      options: [
        { label: "当前标签页", value: "active" },
        { label: "通过URL", value: "url" },
        { label: "通过标题", value: "title" },
        { label: "通过ID", value: "id" },
      ],
    },
    searchValue: {
      component: "VariableInput",
      icon: "tab",
      width: 9,
      placeholder: "当前标签页留空，其他支持模糊匹配",
    },
  },
  defaultValue: {
    by: "active",
  },
};

export const browserCommands = {
  label: "浏览器控制",
  icon: "web",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.browser.launchBrowser",
      label: "启动浏览器",
      icon: "launch",
      isAsync: true,
      config: [
        {
          component: "OptionEditor",
          icon: "settings",
          width: 12,
          options: {
            browserType: {
              component: "ButtonGroup",
              defaultValue: "msedge",
              options: [
                { label: "Edge", value: "msedge" },
                { label: "Chrome", value: "chrome" },
              ],
              width: 12,
            },
            useSingleUserDataDir: {
              label: "使用独立用户数据目录",
              component: "CheckButton",
              width: 6,
            },
            headless: {
              label: "启用无头模式",
              component: "CheckButton",
              width: 6,
            },
            windowSize: {
              label: "窗口尺寸",
              component: "VariableInput",
              icon: "window",
              width: 6,
              placeholder: "如1920x1080，不设置则最大化",
            },
            proxy: {
              label: "代理",
              component: "VariableInput",
              icon: "vpn_lock",
              width: 6,
              placeholder: "如 socks5://127.0.0.1:7890",
            },
            browserPath: {
              label: "浏览器路径",
              component: "VariableInput",
              icon: "folder",
              width: 12,
              options: {
                dialog: {
                  type: "open",
                  options: {
                    title: "选择浏览器",
                    properties: ["openFile"],
                  },
                },
              },
              placeholder: "二进制绝对路径，留空则自动查找",
            },
          },
          defaultValue: {
            browserType: "msedge",
            useSingleUserDataDir: true,
            headless: false,
          },
        },
      ],
    },
    {
      value: "quickcomposer.browser.getUrl",
      label: "获取/设置网址",
      icon: "link",
      isAsync: true,
      config: [tabConfig],
      subCommands: [
        {
          value: "quickcomposer.browser.getUrl",
          label: "获取当前地址",
          icon: "link",
        },
        {
          value: "quickcomposer.browser.setUrl",
          label: "设置当前地址",
          icon: "link",
          config: [
            {
              label: "网址",
              component: "VariableInput",
              icon: "link",
              width: 12,
              placeholder: "输入网址",
            },
          ],
        },
      ],
    },
    {
      value: "quickcomposer.browser.getTabs",
      label: "标签操作",
      icon: "tab",
      isAsync: true,
      subCommands: [
        {
          value: "quickcomposer.browser.getTabs",
          label: "获取标签列表",
          icon: "tab",
        },
        {
          value: "quickcomposer.browser.activateTab",
          label: "切换标签",
          icon: "tab_unselected",
          config: [tabConfig],
        },
        {
          value: "quickcomposer.browser.getCurrentTab",
          label: "获取当前标签页",
          icon: "tab",
        },
        {
          value: "quickcomposer.browser.createNewTab",
          label: "创建新标签页",
          icon: "tab",
          config: [
            {
              label: "网址",
              component: "VariableInput",
              icon: "link",
              width: 12,
              placeholder: "留空则打开about:blank",
            },
          ],
        },
        {
          value: "quickcomposer.browser.closeTab",
          label: "关闭标签页",
          icon: "tab",
          config: [tabConfig],
        },
      ],
    },
    {
      value: "quickcomposer.browser.captureScreenshot",
      label: "捕获截图",
      icon: "screenshot",
      config: [
        tabConfig,
        {
          label: "选项",
          component: "OptionEditor",
          icon: "settings",
          width: 12,
          options: {
            format: {
              label: "格式",
              component: "QSelect",
              icon: "format",
              width: 4,
              options: [
                { label: "PNG", value: "png" },
                { label: "JPEG", value: "jpeg" },
                { label: "WebP", value: "webp" },
              ],
            },
            quality: {
              label: "质量",
              component: "NumberInput",
              icon: "quality",
              width: 4,
              min: 0,
              max: 100,
            },
            fullPage: {
              label: "全屏截图",
              component: "CheckButton",
              icon: "fullscreen",
              width: 4,
            },
            savePath: {
              label: "保存路径",
              component: "VariableInput",
              icon: "folder",
              placeholder: "留空则不保存",
              width: 12,
              options: {
                dialog: {
                  type: "save",
                  options: {
                    title: "保存截图",
                    properties: ["saveFile"],
                  },
                },
              },
            },
          },
          defaultValue: {
            format: "png",
            quality: 100,
            fullPage: false,
          },
        },
      ],
    },
    {
      value: "quickcomposer.browser.executeScript",
      label: "执行脚本",
      icon: "code",
      isAsync: true,
      config: [
        tabConfig,
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
      value: "quickcomposer.browser.setCookie",
      label: "Cookie操作",
      icon: "cookie",
      isAsync: true,
      config: [tabConfig],
      subCommands: [
        {
          value: "quickcomposer.browser.setCookie",
          label: "设置Cookie",
          icon: "cookie",
          config: [
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
                  component: "QSelect",
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
          value: "quickcomposer.browser.getCookie",
          label: "获取Cookie",
          icon: "cookie",
          config: [
            {
              label: "名称",
              component: "VariableInput",
              icon: "label",
              width: 12,
              placeholder: "输入Cookie名称，留空则获取所有",
            },
          ],
        },
      ],
    },
    {
      value: "quickcomposer.browser.injectCSS",
      label: "注入CSS",
      icon: "style",
      isAsync: true,
      config: [
        tabConfig,
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
      value: "quickcomposer.browser.clickElement",
      label: "元素操作",
      icon: "web",
      isAsync: true,
      config: [
        tabConfig,
        {
          label: "选择器",
          component: "VariableInput",
          icon: "code",
          width: 12,
          placeholder: "输入CSS选择器",
          options: {
            cssSelector: true,
          },
        },
      ],
      subCommands: [
        {
          value: "quickcomposer.browser.clickElement",
          label: "点击元素",
          icon: "mouse",
        },
        {
          value: "quickcomposer.browser.inputText",
          label: "输入文本",
          icon: "edit",
          config: [
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
          value: "quickcomposer.browser.getText",
          label: "获取文本",
          icon: "text_fields",
        },
        {
          value: "quickcomposer.browser.getHtml",
          label: "获取HTML",
          icon: "code",
        },
        {
          value: "quickcomposer.browser.hideElement",
          label: "隐藏元素",
          icon: "visibility_off",
        },
        {
          value: "quickcomposer.browser.showElement",
          label: "显示元素",
          icon: "visibility",
        },
        {
          value: "quickcomposer.browser.scrollToElement",
          label: "滚动到元素",
          icon: "open_in_full",
        },
        {
          value: "quickcomposer.browser.waitForElement",
          label: "等待元素",
          icon: "hourglass_empty",
          config: [
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
    {
      value: "quickcomposer.browser.scrollTo",
      label: "滚动及页面尺寸",
      icon: "open_in_full",
      isAsync: true,
      config: [tabConfig],
      subCommands: [
        {
          value: "quickcomposer.browser.scrollTo",
          label: "滚动到位置",
          icon: "open_in_full",
          config: [
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
          value: "quickcomposer.browser.getScrollPosition",
          label: "获取滚动位置",
          icon: "open_in_full",
        },
        {
          value: "quickcomposer.browser.getPageSize",
          label: "获取页面尺寸",
          icon: "open_in_full",
        },
      ],
    },
  ],
};
