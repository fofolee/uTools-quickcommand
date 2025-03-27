import { newVarInputVal } from "../varInputValManager";

export const networkCommands = {
  label: "网络操作",
  icon: "language",
  defaultOpened: false,
  commands: [
    {
      value: "utools.shellOpenExternal",
      label: "默认浏览器打开网址",
      neverHasOutput: true,
      config: [
        {
          label: "要访问的网址链接",
          component: "VariableInput",
          icon: "language",
        },
      ],
    },
    {
      value: "axios",
      label: "HTTP请求(Axios)",
      config: [],
      component: "AxiosConfigEditor",
      asyncMode: "await",
      icon: "http",
      outputs: {
        label: "HTTP请求结果",
        suggestName: "responseResult",
        structure: {
          data: { label: "响应数据", suggestName: "responseData" },
          status: { label: "HTTP状态码", suggestName: "responseStatus" },
          statusText: {
            label: "HTTP状态信息",
            suggestName: "responseStatusText",
          },
          headers: { label: "服务器响应头", suggestName: "responseHeaders" },
          config: { label: "请求配置信息", suggestName: "requestConfig" },
          request: { label: "发送的请求", suggestName: "request" },
        },
      },
    },
    {
      value: "ubrowser",
      label: "ubrowser控制",
      config: [],
      component: "UBrowserEditor",
      asyncMode: "await",
      icon: "public",
    },
    {
      value: "quickcomposer.network.url.parse",
      label: "URL操作",
      icon: "link",
      config: [],
      subCommands: [
        {
          value: "quickcomposer.network.url.parse",
          label: "解析URL",
          icon: "link_off",
          config: [
            {
              label: "URL",
              component: "VariableInput",
              icon: "link",
              width: 12,
            },
          ],
          outputs: {
            label: "URL解析结果",
            suggestName: "urlParseResult",
            structure: {
              protocol: { label: "协议", suggestName: "protocol" },
              slashes: { label: "是否包含斜杠", suggestName: "slashes" },
              auth: { label: "认证信息", suggestName: "auth" },
              host: { label: "主机", suggestName: "host" },
              port: { label: "端口", suggestName: "port" },
              hostname: { label: "主机名", suggestName: "hostname" },
              hash: { label: "锚点", suggestName: "hash" },
              search: { label: "查询字符串", suggestName: "search" },
              query: { label: "查询参数", suggestName: "query" },
              pathname: { label: "路径", suggestName: "pathname" },
              path: { label: "路径", suggestName: "path" },
              href: { label: "完整URL", suggestName: "href" },
            },
          },
        },
        {
          value: "quickcomposer.network.url.format",
          label: "格式化URL",
          icon: "link",
          config: [
            {
              label: "URL",
              component: "VariableInput",
              icon: "link",
              width: 12,
            },
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
          outputs: {
            label: "URL格式化结果",
            suggestName: "urlFormatResult",
          },
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
          outputs: {
            label: "解析结果",
            suggestName: "queryParseResult",
          },
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
          outputs: {
            label: "格式化结果",
            suggestName: "queryFormatResult",
          },
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
          outputs: {
            label: "参数值",
            suggestName: "paramValue",
          },
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
          outputs: {
            label: "处理后URL",
            suggestName: "urlAfterAddParam",
          },
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
          outputs: {
            label: "处理后URL",
            suggestName: "urlAfterRemoveParam",
          },
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
          outputs: {
            label: "是否是绝对URL",
            typeName: "布尔值",
            suggestName: "isAbsoluteUrl",
          },
        },
      ],
    },
    {
      value: "quickcomposer.network.dns.lookupHost",
      label: "DNS操作",
      icon: "dns",
      asyncMode: "await",
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
              component: "QSelect",
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
          outputs: {
            label: "解析结果",
            suggestName: "dnsLookupResult",
            structure: {
              address: { label: "IP地址", suggestName: "address" },
              family: { label: "IP版本", suggestName: "family" },
            },
          },
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
          outputs: {
            label: "解析地址列表",
            suggestName: "dnsResolveIpList",
          },
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
          outputs: {
            label: "IPv4地址列表",
            suggestName: "ipv4AddressList",
          },
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
          outputs: {
            label: "IPv6地址列表",
            suggestName: "ipv6AddressList",
          },
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
          outputs: {
            label: "MX记录列表",
            suggestName: "mxRecordList",
          },
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
          outputs: {
            label: "TXT记录列表",
            suggestName: "txtRecordList",
          },
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
          outputs: {
            label: "NS记录列表",
            suggestName: "nsRecordList",
          },
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
          outputs: {
            label: "CNAME记录列表",
            suggestName: "cnameRecordList",
          },
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
          outputs: {
            label: "解析域名列表",
            suggestName: "reverseResolveDomainList",
          },
        },
      ],
    },
    {
      value: "quickcommand.downloadFile",
      label: "下载文件",
      icon: "file_download",
      asyncMode: "await",
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
      icon: "file_upload",
      asyncMode: "await",
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
