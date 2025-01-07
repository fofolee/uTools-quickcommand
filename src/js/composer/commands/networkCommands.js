export const networkCommands = {
  label: "网络操作",
  icon: "language",
  defaultOpened: true,
  commands: [
    {
      value: "utools.shellOpenExternal",
      label: "默认浏览器打开网址",
      config: [
        {
          key: "visit",
          label: "要访问的网址链接",
          type: "varInput",
          icon: "language",
        },
      ],
    },
    {
      value: "utools.ubrowser.goto",
      label: "ubrowser打开网址",
      config: [
        {
          key: "url",
          label: "要访问的网址链接",
          type: "varInput",
          icon: "public",
        },
      ],
      isAsync: true,
    },
    {
      value: "ubrowser",
      label: "ubrowser浏览器操作",
      config: [],
      component: "UBrowserEditor",
      isAsync: true,
      icon: "public",
    },
    {
      value: "axios",
      label: "HTTP请求(Axios)",
      config: [],
      component: "AxiosConfigEditor",
      isAsync: true,
      icon: "http",
      outputVariable: "{data}",
      saveOutput: true,
    },
    {
      value: "quickcomposer.network.url",
      label: "URL操作",
      desc: "URL解析、格式化和参数处理",
      component: "UrlEditor",
      icon: "link",
    },
    {
      value: "quickcomposer.network.dns.lookupHost",
      label: "DNS操作",
      desc: "DNS解析和查询",
      icon: "dns",
      isAsync: true,
      config: [
        {
          label: "要查询的域名",
          icon: "dns",
          type: "varInput",
          width: "auto",
        },
      ],
      functionSelector: [
        {
          label: "DNS查询",
          value: "quickcomposer.network.dns.lookupHost",
          icon: "search",
          config: [
            {
              label: "IP版本",
              icon: "settings_ethernet",
              type: "select",
              options: [
                { label: "自动", value: 0 },
                { label: "IPv4", value: 4 },
                { label: "IPv6", value: 6 },
              ],
              defaultValue: 0,
              width: 2.5,
            },
            {
              label: "返回所有地址",
              type: "checkbox",
              defaultValue: false,
              width: 2.5,
            },
          ],
        },
        {
          value: "quickcomposer.network.dns.resolveAll",
          label: "解析所有记录",
          icon: "all_inclusive",
        },
        {
          value: "quickcomposer.network.dns.resolveIpv4",
          label: "解析IPv4",
          icon: "filter_4",
        },
        {
          value: "quickcomposer.network.dns.resolveIpv6",
          label: "解析IPv6",
          icon: "filter_6",
        },
        {
          value: "quickcomposer.network.dns.resolveMxRecords",
          label: "解析MX记录",
          icon: "mail",
        },
        {
          value: "quickcomposer.network.dns.resolveTxtRecords",
          label: "解析TXT记录",
          icon: "text_fields",
        },
        {
          value: "quickcomposer.network.dns.resolveNsRecords",
          label: "解析NS记录",
          icon: "dns",
        },
        {
          value: "quickcomposer.network.dns.resolveCnameRecords",
          label: "解析CNAME记录",
          icon: "link",
        },
        {
          value: "quickcomposer.network.dns.reverseResolve",
          label: "反向解析",
          icon: "swap_horiz",
          excludeConfig: [0],
          config: [
            {
              label: "IP地址",
              icon: "router",
              type: "varInput",
            },
          ],
        },
      ],
    },
  ],
};
