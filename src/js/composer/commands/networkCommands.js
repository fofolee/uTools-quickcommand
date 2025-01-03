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
          type: "input",
          defaultValue: "",
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
          type: "input",
          defaultValue: "",
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
  ],
};
