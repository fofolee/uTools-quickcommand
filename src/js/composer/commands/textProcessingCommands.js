export const textProcessingCommands = {
  label: "文本处理",
  icon: "code",
  defaultOpened: false,
  commands: [
    {
      value: "quickcomposer.textProcessing.base64Encode",
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
      value: "quickcomposer.textProcessing.base64Decode",
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
      value: "quickcomposer.textProcessing.hexEncode",
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
      value: "quickcomposer.textProcessing.hexDecode",
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
      value: "quickcomposer.textProcessing.urlEncode",
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
      value: "quickcomposer.textProcessing.urlDecode",
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
    {
      value: "quickcomposer.textProcessing.htmlEncode",
      label: "HTML编码",
      config: [
        {
          key: "text",
          label: "要编码的文本",
          type: "input",
          defaultValue: "",
          icon: "code",
        },
      ],
    },
    {
      value: "quickcomposer.textProcessing.htmlDecode",
      label: "HTML解码",
      config: [
        {
          key: "text",
          label: "要解码的HTML文本",
          type: "input",
          defaultValue: "",
          icon: "code_off",
        },
      ],
    },
    {
      value: "quickcomposer.textProcessing.reverseString",
      label: "字符串反转",
      config: [
        {
          key: "text",
          label: "要反转的文本",
          type: "input",
          defaultValue: "",
          icon: "swap_horiz",
        },
      ],
    },
    {
      value: "quickcomposer.textProcessing.replaceString",
      label: "字符串替换",
      config: [
        {
          key: "text",
          label: "原始文本",
          type: "input",
          defaultValue: "",
          icon: "text_fields",
        },
        {
          key: "oldStr",
          label: "要替换的文本",
          type: "input",
          defaultValue: "",
          icon: "find_replace",
        },
        {
          key: "newStr",
          label: "替换为",
          type: "input",
          defaultValue: "",
          icon: "text_fields",
        },
      ],
    },
    {
      value: "quickcomposer.textProcessing.substring",
      label: "字符串截取",
      config: [
        {
          key: "text",
          label: "原始文本",
          type: "input",
          defaultValue: "",
          icon: "text_fields",
        },
        {
          key: "start",
          label: "起始位置",
          type: "input",
          inputType: "number",
          defaultValue: "0",
          icon: "first_page",
        },
        {
          key: "end",
          label: "结束位置",
          type: "input",
          inputType: "number",
          defaultValue: "",
          icon: "last_page",
        },
      ],
    },
    {
      value: "quickcomposer.textProcessing.regexExtract",
      label: "正则提取",
      config: [
        {
          key: "text",
          label: "原始文本",
          type: "input",
          defaultValue: "",
          icon: "text_fields",
        },
        {
          key: "regex",
          label: "正则表达式",
          type: "input",
          defaultValue: "",
          icon: "regex",
        },
      ],
    },
    {
      value: "quickcomposer.textProcessing.symmetricCrypto",
      label: "对称加解密",
      component: "SymmetricCryptoEditor",
    },
    {
      value: "quickcomposer.textProcessing.asymmetricCrypto",
      label: "非对称加解密",
      component: "AsymmetricCryptoEditor",
    },
    {
      value: "quickcomposer.textProcessing.md5Hash",
      label: "MD5哈希",
      config: [
        {
          key: "text",
          label: "要哈希的文本",
          type: "input",
          defaultValue: "",
          icon: "enhanced_encryption",
        },
      ],
    },
    {
      value: "quickcomposer.textProcessing.sha256Hash",
      label: "SHA256哈希",
      config: [
        {
          key: "text",
          label: "要哈希的文本",
          type: "input",
          defaultValue: "",
          icon: "enhanced_encryption",
        },
      ],
    },
    {
      value: "quickcomposer.textProcessing.sm3Hash",
      label: "SM3哈希",
      config: [
        {
          key: "text",
          label: "要哈希的文本",
          type: "input",
          defaultValue: "",
          icon: "enhanced_encryption",
        },
      ],
    },
  ],
};
