export const encodeCommands = {
  label: "编码解码",
  icon: "code",
  defaultOpened: false,
  commands: [
    {
      value: "(text=>Buffer.from(text).toString('base64'))",
      label: "Base64编码",
      config: [
        {
          key: "text",
          label: "要编码的文本",
          type: "input",
          defaultValue: "",
          icon: "lock",
        },
      ],
    },
    {
      value: "(text=>Buffer.from(text,'base64').toString())",
      label: "Base64解码",
      config: [
        {
          key: "text",
          label: "要解码的Base64文本",
          type: "input",
          defaultValue: "",
          icon: "lock_open",
        },
      ],
    },
    {
      value: "(text=>Buffer.from(text).toString('hex'))",
      label: "十六进制编码",
      config: [
        {
          key: "text",
          label: "要编码的文本",
          type: "input",
          defaultValue: "",
          icon: "lock",
        },
      ],
    },
    {
      value: "(text=>Buffer.from(text,'hex').toString())",
      label: "十六进制解码",
      config: [
        {
          key: "text",
          label: "要解码的十六进制文本",
          type: "input",
          defaultValue: "",
          icon: "lock_open",
        },
      ],
    },
    {
      value: "encodeURIComponent",
      label: "URL编码",
      config: [
        {
          key: "text",
          label: "要编码的文本",
          type: "input",
          defaultValue: "",
          icon: "link",
        },
      ],
    },
    {
      value: "decodeURIComponent",
      label: "URL解码",
      config: [
        {
          key: "text",
          label: "要解码的URL编码文本",
          type: "input",
          defaultValue: "",
          icon: "link_off",
        },
      ],
    },
  ],
};
