import { newVarInputVal } from "../varInputValManager";

export const networkCommands = {
  label: "网络操作",
  icon: "language",
  defaultOpened: false,
  commands: [
    {
      value: "utools.shellOpenExternal",
      label: "默认浏览器打开网址",
      config: [
        {
          key: "visit",
          label: "要访问的网址链接",
          component: "VariableInput",
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
          component: "VariableInput",
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
      value: "quickcomposer.network.url.parse",
      label: "URL操作",
      desc: "URL解析、格式化和参数处理",
      icon: "link",
      config: [],
      subCommands: [
        {
          value: "quickcomposer.network.url.parse",
          label: "解析URL",
          icon: "link_off",
        },
        {
          value: "quickcomposer.network.url.format",
          label: "格式化URL",
          icon: "link",
          config: [
            {
              label: "协议",
              component: "VariableInput",
              icon: "security",
              width: 6,
            },
            {
              label: "认证信息",
              component: "VariableInput",
              icon: "person",
              width: 6,
            },
            {
              label: "主机名",
              component: "VariableInput",
              icon: "dns",
              width: 6,
            },
            {
              label: "端口",
              component: "VariableInput",
              icon: "settings_ethernet",
              width: 6,
            },
            {
              label: "路径",
              component: "VariableInput",
              icon: "folder",
            },
            {
              label: "查询字符串",
              component: "VariableInput",
              icon: "search",
              width: 6,
            },
            {
              label: "锚点",
              component: "VariableInput",
              icon: "tag",
              width: 6,
            },
          ],
        },
        {
          value: "quickcomposer.network.url.parseQuery",
          label: "解析查询字符串",
          icon: "search",
          config: [
            {
              label: "查询字符串",
              component: "VariableInput",
              icon: "search",
            },
          ],
        },
        {
          value: "quickcomposer.network.url.formatQuery",
          label: "格式化查询字符串",
          icon: "edit",
          config: [
            {
              label: "参数",
              component: "DictEditor",
              icon: "edit",
            },
          ],
        },
        {
          value: "quickcomposer.network.url.parsePath",
          label: "解析路径",
          icon: "folder_open",
          config: [
            {
              label: "路径",
              component: "VariableInput",
              icon: "folder",
            },
          ],
        },
        {
          value: "quickcomposer.network.url.parseHost",
          label: "解析主机名",
          icon: "dns",
          config: [
            {
              label: "主机名",
              component: "VariableInput",
              icon: "dns",
            },
          ],
        },
        {
          value: "quickcomposer.network.url.getQueryParam",
          label: "获取参数",
          icon: "find_in_page",
          config: [
            {
              label: "URL",
              component: "VariableInput",
              icon: "link",
              width: "auto",
            },
            {
              label: "参数名",
              component: "VariableInput",
              icon: "key",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.network.url.addQueryParam",
          label: "添加参数",
          icon: "add_circle",
          config: [
            {
              label: "URL",
              component: "VariableInput",
              icon: "link",
              width: "auto",
            },
            {
              label: "参数名",
              component: "VariableInput",
              icon: "key",
              width: "auto",
            },
            {
              label: "参数值",
              component: "VariableInput",
              icon: "text_fields",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.network.url.removeQueryParam",
          label: "移除参数",
          icon: "remove_circle",
          config: [
            {
              label: "URL",
              component: "VariableInput",
              icon: "link",
              width: "auto",
            },
            {
              label: "参数名",
              component: "VariableInput",
              icon: "key",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.network.url.isAbsolute",
          label: "检查绝对URL",
          icon: "check_circle",
          config: [
            {
              label: "URL",
              component: "VariableInput",
              icon: "link",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.network.url.parseComponents",
          label: "解析组成部分",
          icon: "category",
          config: [
            {
              label: "URL",
              component: "VariableInput",
              icon: "link",
              width: "auto",
            },
          ],
        },
      ],
    },
    {
      value: "quickcomposer.network.dns.lookupHost",
      label: "DNS操作",
      desc: "DNS解析和查询",
      icon: "dns",
      isAsync: true,
      config: [],
      subCommands: [
        {
          label: "DNS查询",
          value: "quickcomposer.network.dns.lookupHost",
          icon: "search",
          config: [
            {
              label: "要查询的域名",
              icon: "dns",
              component: "VariableInput",
              width: "auto",
            },
            {
              label: "IP版本",
              icon: "settings_ethernet",
              component: "q-select",
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
              component: "CheckButton",
              defaultValue: false,
              width: 2.5,
            },
          ],
        },
        {
          value: "quickcomposer.network.dns.resolveAll",
          label: "解析所有记录",
          icon: "all_inclusive",
          config: [
            {
              label: "要查询的域名",
              icon: "dns",
              component: "VariableInput",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.network.dns.resolveIpv4",
          label: "解析IPv4",
          icon: "filter_4",
          config: [
            {
              label: "要查询的域名",
              icon: "dns",
              component: "VariableInput",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.network.dns.resolveIpv6",
          label: "解析IPv6",
          icon: "filter_6",
          config: [
            {
              label: "要查询的域名",
              icon: "dns",
              component: "VariableInput",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.network.dns.resolveMxRecords",
          label: "解析MX记录",
          icon: "mail",
          config: [
            {
              label: "要查询的域名",
              icon: "dns",
              component: "VariableInput",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.network.dns.resolveTxtRecords",
          label: "解析TXT记录",
          icon: "text_fields",
          config: [
            {
              label: "要查询的域名",
              icon: "dns",
              component: "VariableInput",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.network.dns.resolveNsRecords",
          label: "解析NS记录",
          icon: "dns",
          config: [
            {
              label: "要查询的域名",
              icon: "dns",
              component: "VariableInput",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.network.dns.resolveCnameRecords",
          label: "解析CNAME记录",
          icon: "link",
          config: [
            {
              label: "要查询的域名",
              icon: "dns",
              component: "VariableInput",
              width: "auto",
            },
          ],
        },
        {
          value: "quickcomposer.network.dns.reverseResolve",
          label: "反向解析",
          icon: "swap_horiz",
          config: [
            {
              label: "IP地址",
              icon: "router",
              component: "VariableInput",
            },
          ],
        },
      ],
    },
    {
      value: "quickcommand.downloadFile",
      label: "下载文件",
      desc: "下载文件",
      icon: "file_download",
      isAsync: true,
      config: [
        {
          label: "文件URL",
          component: "VariableInput",
          icon: "link",
          defaultValue: newVarInputVal("str", "https://"),
          width: 12,
        },
        {
          label: "保存路径",
          component: "VariableInput",
          icon: "folder",
          width: 12,
          placeholder: "留空则弹出对话框选择保存路径",
        },
      ],
    },
    {
      value: "quickcommand.uploadFile",
      label: "上传文件",
      desc: "上传文件",
      icon: "file_upload",
      isAsync: true,
      config: [
        {
          label: "上传接口地址",
          component: "VariableInput",
          icon: "link",
          defaultValue: newVarInputVal("str", "https://"),
          width: 12,
        },
        {
          label: "文件路径",
          component: "VariableInput",
          icon: "file_present",
          width: 12,
          placeholder: "留空则弹出对话框选择文件",
        },
        {
          label: "文件名",
          component: "VariableInput",
          icon: "text_fields",
          defaultValue: newVarInputVal("str", "file"),
          width: 12,
        },
        {
          label: "额外表单数据（可选）",
          component: "DictEditor",
          width: 12,
        },
      ],
    },
  ],
};
