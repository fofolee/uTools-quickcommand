export const networkCommands = {
  label: "网络操作",
  icon: "language",
  defaultOpened: true,
  commands: [
    {
      value: "visit",
      label: "默认浏览器打开网址",
      config: [
        {
          key: "url",
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
    },
    {
      value: "quickcomposer.network.url",
      label: "URL操作",
      desc: "URL解析、格式化和参数处理",
      component: "UrlEditor",
      icon: "link",
    },
    {
      value: "quickcomposer.network.dns",
      label: "DNS操作",
      desc: "DNS解析和查询",
      component: "DnsEditor",
      icon: "dns",
      isAsync: true,
    },
  ],
};
