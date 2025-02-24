import { newVarInputVal } from "js/composer/varInputValManager";
import { deviceName, userAgent, commonHeaders } from "js/options/httpOptions";

const tabConfig = {
  component: "OptionEditor",
  width: 12,
  options: {
    by: {
      component: "QSelect",
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
      placeholder: "选择当前标签页留空，URL/标题/ID支持模糊匹配",
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
      value: "quickcomposer.browser.startClient",
      label: "浏览器实例管理",
      icon: "launch",
      asyncMode: "await",
      config: [],
      subCommands: [
        {
          value: "quickcomposer.browser.startClient",
          label: "启动浏览器实例",
          icon: "launch",
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
                  placeholder:
                    "⚠️注意：不勾选时，会自动关闭所有已打开的浏览器；如需运行多实例必须勾选",
                  component: "CheckButton",
                  width: 3,
                },
                headless: {
                  label: "无头模式",
                  component: "CheckButton",
                  width: 3,
                },
                incognito: {
                  label: "隐身模式",
                  component: "CheckButton",
                  width: 3,
                },
                disableExtensions: {
                  label: "禁用扩展",
                  component: "CheckButton",
                  width: 3,
                },
                windowSize: {
                  label: "窗口尺寸(格式:宽,高)",
                  component: "VariableInput",
                  icon: "window",
                  width: 6,
                  placeholder: "如「1280,720」不设置则最大化",
                },
                windowPosition: {
                  label: "窗口位置(格式:x,y)",
                  component: "VariableInput",
                  icon: "location_on",
                  width: 6,
                  placeholder: "如「160,120」不设置为0,0",
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
                  width: 6,
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
                incognito: false,
              },
            },
          ],
          outputs: {
            label: "实例信息",
            suggestName: "browserInstance",
            structure: {
              pid: { label: "进程ID", suggestName: "instancePid" },
              port: { label: "端口", suggestName: "instancePort" },
            },
          },
        },
        {
          value: "quickcomposer.browser.destroyClientByPort",
          label: "关闭浏览器实例",
          icon: "close",
          config: [
            {
              label: "浏览器实例端口",
              component: "VariableInput",
              disableToggleType: true,
              defaultValue: newVarInputVal("var"),
              icon: "label",
              width: 12,
              placeholder: "留空关闭当前操控的实例",
            },
          ],
        },
        {
          value: "quickcomposer.browser.getClientPorts",
          label: "获取所有浏览器实例端口",
          icon: "list",
          outputs: {
            label: "实例端口列表",
            suggestName: "instancePorts",
            structure: [
              { label: "实例一端口", suggestName: "instancePort1" },
              { label: "实例二端口", suggestName: "instancePort2" },
              { label: "实例三端口", suggestName: "instancePort3" },
            ],
          },
        },
        {
          value: "quickcomposer.browser.getCurrentClientPort",
          label: "获取当前操控的实例端口",
          icon: "label",
          outputs: {
            label: "实例端口",
            suggestName: "currentInstancePort",
            typeName: "数字",
          },
        },
        {
          value: "quickcomposer.browser.switchClientByPort",
          label: "切换要操控的实例",
          icon: "switch_account",
          config: [
            {
              label: "浏览器实例端口",
              component: "VariableInput",
              icon: "label",
              width: 12,
              defaultValue: newVarInputVal("var"),
              disableToggleType: true,
            },
          ],
        },
      ],
    },
    {
      value: "quickcomposer.browser.getUrl",
      label: "获取/设置网址",
      icon: "link",
      asyncMode: "await",
      config: [tabConfig],
      subCommands: [
        {
          value: "quickcomposer.browser.getUrl",
          label: "获取当前地址",
          icon: "link",
          outputs: {
            label: "当前地址",
            suggestName: "currentUrl",
            typeName: "字符串",
          },
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
      asyncMode: "await",
      subCommands: [
        {
          value: "quickcomposer.browser.getTabs",
          label: "获取标签列表",
          icon: "tab",
          outputs: {
            label: "标签列表",
            suggestName: "tabList",
            structure: [
              {
                url: { label: "标签一网址", suggestName: "firstTabUrl" },
                title: { label: "标签一标题", suggestName: "firstTabTitle" },
                id: { label: "标签一ID", suggestName: "firstTabId" },
              },
            ],
          },
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
          outputs: {
            label: "当前标签页",
            suggestName: "currentTab",
            structure: {
              url: { label: "标签网址", suggestName: "currentTabUrl" },
              title: { label: "标签标题", suggestName: "currentTabTitle" },
              id: { label: "标签ID", suggestName: "currentTabId" },
            },
          },
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
          outputs: {
            label: "新标签页",
            suggestName: "newTab",
            structure: {
              url: { label: "新标签网址", suggestName: "newTabUrl" },
              title: { label: "新标签标题", suggestName: "newTabTitle" },
              id: { label: "新标签ID", suggestName: "newTabId" },
            },
          },
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
      asyncMode: "await",
      config: [
        tabConfig,
        {
          label: "选项",
          component: "OptionEditor",
          icon: "settings",
          width: 12,
          options: {
            quality: {
              label: "质量",
              component: "NumberInput",
              width: 2,
              min: 0,
              max: 100,
            },
            selector: {
              label: "指定元素（CSS选择器）",
              component: "VariableInput",
              icon: "code",
              width: 10,
              placeholder: "留空截取可视区域，截取整个页面可填body",
              options: {
                cssSelector: true,
              },
            },
            format: {
              label: "格式",
              component: "QSelect",
              width: 2,
              options: [
                { label: "PNG", value: "png" },
                { label: "JPEG", value: "jpeg" },
                { label: "WebP", value: "webp" },
              ],
            },
            savePath: {
              label: "保存路径",
              component: "VariableInput",
              icon: "folder",
              placeholder: "留空则不保存",
              width: 10,
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
      asyncMode: "await",
      config: [
        tabConfig,
        {
          label: "脚本内容",
          component: "CodeEditor",
          language: "webjavascript",
          icon: "code",
          width: 12,
          placeholder: "输入JavaScript代码，使用return返回结果",
        },
        {
          label: "要传递的参数",
          isCollapse: false,
          component: "DictEditor",
          icon: "data_array",
          width: 12,
        },
      ],
      outputs: {
        label: "执行结果",
        suggestName: "executeResult",
        typeName: "字符串",
      },
    },
    {
      value: "quickcomposer.browser.injectRemoteScript",
      label: "注入脚本/样式",
      icon: "style",
      asyncMode: "await",
      config: [tabConfig],
      subCommands: [
        {
          label: "注入CDN脚本",
          value: "quickcomposer.browser.injectRemoteScript",
          icon: "javascript",
          config: [
            {
              component: "VariableInput",
              icon: "link",
              width: 12,
              placeholder: "输入远程脚本URL",
            },
          ],
        },
        {
          label: "注入本地脚本",
          icon: "javascript",
          value: "quickcomposer.browser.injectLocalScript",
          config: [
            {
              component: "VariableInput",
              icon: "folder",
              width: 12,
              options: {
                dialog: {
                  type: "open",
                  options: {
                    title: "选择脚本",
                    filters: [
                      {
                        name: "JavaScript",
                        extensions: ["js"],
                      },
                      {
                        name: "all",
                        extensions: ["*"],
                      },
                    ],
                    properties: ["openFile"],
                  },
                },
              },
              placeholder: "输入本地脚本绝对路径",
            },
          ],
        },
        {
          label: "注入CSS",
          value: "quickcomposer.browser.injectCSS",
          icon: "style",
          config: [
            {
              component: "CodeEditor",
              language: "css",
              icon: "style",
              width: 12,
              placeholder: "输入CSS代码",
            },
          ],
        },
      ],
    },
    {
      value: "quickcomposer.browser.setCookie",
      label: "Cookie操作",
      icon: "cookie",
      asyncMode: "await",
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
          outputs: {
            label: "Cookie",
            suggestName: "cookie",
            structure: {
              name: { label: "名称", suggestName: "cookieName" },
              value: { label: "值", suggestName: "cookieValue" },
              domain: { label: "域名", suggestName: "cookieDomain" },
              path: { label: "路径", suggestName: "cookiePath" },
              expires: { label: "过期时间", suggestName: "cookieExpires" },
              size: { label: "大小", suggestName: "cookieSize" },
              httpOnly: { label: "HTTPOnly", suggestName: "isCookieHttpOnly" },
              secure: { label: "安全", suggestName: "isCookieSecure" },
              session: { label: "会话", suggestName: "isCookieSession" },
              sameSite: { label: "同站", suggestName: "isCookieSameSite" },
              priority: { label: "优先级", suggestName: "cookiePriority" },
              sameParty: { label: "同域", suggestName: "isCookieSameParty" },
              sourceScheme: {
                label: "来源协议",
                suggestName: "cookieSourceScheme",
              },
              sourcePort: {
                label: "来源端口",
                suggestName: "cookieSourcePort",
              },
            },
          },
        },
      ],
    },
    {
      value: "quickcomposer.browser.clickElement",
      label: "元素操作",
      icon: "web",
      asyncMode: "await",
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
          value: "quickcomposer.browser.submitForm",
          label: "提交表单",
          icon: "send",
          config: [
            {
              topLabel: "上方填要点击的提交按钮，下方添加要操作的输入框",
              component: "ArrayEditor",
              width: 12,
              columns: {
                selector: {
                  label: "输入框选择器",
                  options: {
                    cssSelector: true,
                  },
                },
                value: {
                  label: "要填入的值",
                },
              },
              isCollapse: false,
            },
          ],
        },
        {
          value: "quickcomposer.browser.getText",
          label: "获取元素文本",
          icon: "text_fields",
          outputs: {
            label: "元素文本",
            suggestName: "elementInnerText",
            typeName: "字符串",
          },
        },
        {
          value: "quickcomposer.browser.getHtml",
          label: "获取元素HTML",
          icon: "code",
          outputs: {
            label: "元素outerHTML",
            suggestName: "elementOuterHTML",
            typeName: "字符串",
          },
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
      asyncMode: "await",
      config: [tabConfig],
      subCommands: [
        {
          value: "quickcomposer.browser.scrollTo",
          label: "滚动到位置",
          icon: "open_in_full",
          config: [
            {
              label: "X坐标",
              component: "VariableInput",
              icon: "arrow_right",
              width: 12,
              defaultValue: newVarInputVal("var", "0"),
              disableToggleType: true,
            },
            {
              label: "Y坐标",
              component: "VariableInput",
              icon: "arrow_drop_down",
              width: 12,
              defaultValue: newVarInputVal("var", "0"),
              disableToggleType: true,
            },
          ],
        },
        {
          value: "quickcomposer.browser.getScrollPosition",
          label: "获取滚动位置",
          icon: "open_in_full",
          outputs: {
            label: "滚动位置",
            suggestName: "scrollPosition",
            structure: {
              x: { label: "X坐标", suggestName: "scrollPositionX" },
              y: { label: "Y坐标", suggestName: "scrollPositionY" },
            },
          },
        },
        {
          value: "quickcomposer.browser.getPageSize",
          label: "获取页面尺寸",
          icon: "open_in_full",
          outputs: {
            label: "页面尺寸",
            suggestName: "pageSize",
            structure: {
              width: { label: "宽度", suggestName: "pageWidth" },
              height: { label: "高度", suggestName: "pageHeight" },
            },
          },
        },
      ],
    },
    {
      value: "quickcomposer.browser.network.setRequestInterception",
      label: "修改请求/响应",
      icon: "network",
      asyncMode: "await",
      asyncMode: "await",
      subCommands: [
        {
          value: "quickcomposer.browser.network.setRequestInterception",
          label: "修改请求",
          icon: "upload",
          config: [
            tabConfig,
            {
              topLabel: "拦截规则",
              isCollapse: false,
              component: "ArrayEditor",
              icon: "rule",
              columns: {
                url: {
                  label: "要拦截的URL",
                  defaultValue: newVarInputVal("str"),
                  placeholder: "支持正则，如.*\\.baidu\\.com",
                  width: 12,
                },
                headerKey: {
                  label: "要修改的请求头",
                  component: "VariableInput",
                  options: {
                    items: commonHeaders,
                  },
                  width: 6,
                },
                headerValue: {
                  label: "要修改的请求头值",
                  component: "VariableInput",
                  defaultValue: newVarInputVal("str"),
                  width: 6,
                },
                pattern: {
                  label: "要修改的请求内容（body及url参数）",
                  defaultValue: newVarInputVal("str"),
                  width: 6,
                  placeholder: "支持正则，如(role: )[guest|user]",
                },
                replacement: {
                  label: "替换内容",
                  defaultValue: newVarInputVal("str"),
                  width: 6,
                  placeholder: "支持替换符，如$1admin",
                },
                redirectUrl: {
                  label: "重定向到指定URL",
                  defaultValue: newVarInputVal("str"),
                  width: 12,
                },
              },
            },
          ],
          outputs: {
            label: "设置结果",
            suggestName: "interceptRequestResult",
            structure: {
              success: {
                label: "是否成功",
                suggestName: "isInterceptRequestSuccess",
              },
              message: {
                label: "消息",
                suggestName: "interceptRequestMessage",
              },
            },
          },
        },
        {
          value: "quickcomposer.browser.network.setResponseInterception",
          label: "修改响应",
          icon: "download",
          config: [
            tabConfig,
            {
              topLabel: "拦截规则",
              isCollapse: false,
              component: "ArrayEditor",
              icon: "rule",
              width: 12,
              columns: {
                url: {
                  label: "要拦截的URL",
                  defaultValue: newVarInputVal("str"),
                  placeholder: "支持正则，如.*\\.baidu\\.com",
                  width: 9,
                },
                statusCode: {
                  label: "状态码",
                  component: "VariableInput",
                  defaultValue: 200,
                  options: {
                    items: [
                      { label: "200", value: 200 },
                      { label: "302", value: 302 },
                      { label: "401", value: 401 },
                      { label: "403", value: 403 },
                      { label: "404", value: 404 },
                      { label: "500", value: 500 },
                      { label: "502", value: 502 },
                      { label: "503", value: 503 },
                      { label: "504", value: 504 },
                    ],
                  },
                  defaultValue: newVarInputVal("var", ""),
                  width: 3,
                },
                pattern: {
                  label: "要修改的响应内容",
                  defaultValue: newVarInputVal("str"),
                  placeholder: "支持正则，如(role: )[guest|user]",
                  width: 6,
                },
                replacement: {
                  label: "替换内容",
                  defaultValue: newVarInputVal("str"),
                  placeholder: "支持替换符，如$1admin",
                  width: 6,
                },
              },
            },
          ],
          outputs: {
            label: "设置结果",
            suggestName: "interceptResponseResult",
            structure: {
              success: {
                label: "是否成功",
                suggestName: "isInterceptResponseSuccess",
              },
              message: {
                label: "消息",
                suggestName: "interceptResponseMessage",
              },
            },
          },
        },
        {
          value: "quickcomposer.browser.network.clearInterception",
          label: "清除所有拦截规则",
          icon: "clear",
          outputs: {
            label: "清除结果",
            suggestName: "clearInterceptionResult",
            structure: {
              success: {
                label: "是否成功",
                suggestName: "isClearInterceptionSuccess",
              },
              message: {
                label: "消息",
                suggestName: "clearInterceptionMessage",
              },
            },
          },
        },
      ],
    },
    {
      value: "quickcomposer.browser.device.setDevice",
      label: "设备模拟",
      icon: "devices",
      asyncMode: "await",
      config: [tabConfig],
      subCommands: [
        {
          value: "quickcomposer.browser.device.setDevice",
          label: "使用预设设备",
          icon: "smartphone",
          config: [
            {
              label: "设备",
              component: "QSelect",
              icon: "devices",
              width: 12,
              options: [
                ...deviceName,
                // 桌面设备
                { label: "Desktop", value: "Desktop" },
                { label: "MacBook Pro 16", value: "MacBook Pro 16" },
                { label: "4K Display", value: "4K Display" },
              ],
            },
          ],
        },
        {
          value: "quickcomposer.browser.device.setCustomDevice",
          label: "自定义设备",
          icon: "build",
          config: [
            {
              label: "设备配置",
              component: "OptionEditor",
              icon: "settings",
              width: 12,
              options: {
                width: {
                  label: "宽度",
                  component: "NumberInput",
                  width: 3,
                  defaultValue: 1920,
                  min: 0,
                },
                height: {
                  label: "高度",
                  component: "NumberInput",
                  width: 3,
                  defaultValue: 1080,
                  min: 0,
                },
                deviceScaleFactor: {
                  label: "设备像素比",
                  component: "NumberInput",
                  width: 3,
                  defaultValue: 1,
                  min: 1,
                  step: 0.1,
                },
                mobile: {
                  label: "移动设备",
                  component: "CheckButton",
                  width: 3,
                },
                hasTouch: {
                  label: "触摸屏",
                  component: "CheckButton",
                  width: 3,
                },
                isLandscape: {
                  label: "横屏",
                  component: "CheckButton",
                  width: 3,
                },
                userAgent: {
                  label: "User Agent",
                  component: "VariableInput",
                  icon: "code",
                  width: 6,
                  placeholder: "留空使用默认",
                  options: {
                    items: userAgent,
                  },
                },
              },
            },
          ],
        },
        {
          value: "quickcomposer.browser.device.clearDeviceEmulation",
          label: "清除设备模拟",
          icon: "clear",
        },
      ],
    },
  ],
};
